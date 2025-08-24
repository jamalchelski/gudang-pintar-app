
'use server';
/**
 * @fileOverview An AI flow for analyzing warehouse inventory stock.
 *
 * - analyzeStock - A function that takes inventory data and returns a stock analysis.
 * - StockAnalysis - The return type for the analyzeStock function.
 */

import { ai } from '@/ai/genkit';
import { InventoryItem, RetrievalLog } from '@/lib/types';
import { z } from 'zod';

// Define the input schema, which is an array of inventory items and retrieval logs.
const StockAnalysisInputSchema = z.object({
    inventory: z.array(z.object({
        id: z.string(),
        name: z.string(),
        brand: z.string(),
        category: z.string(),
        unit: z.string(),
        quantity: z.number(),
        min_stock: z.number(),
        max_stock: z.number(),
        last_updated: z.string().describe("ISO 8601 date string for the last time the item was updated."),
        image: z.string(),
    })),
    retrievalLogs: z.array(z.object({
        itemId: z.string(),
        quantityRetrieved: z.number(),
        timestamp: z.string(),
    }))
});

// Define the output schema for a structured response from the AI.
const StockAnalysisOutputSchema = z.object({
    executiveSummary: z.string().describe("Ringkasan eksekutif singkat dan tingkat tinggi tentang kesehatan stok secara keseluruhan, termasuk wawasan dari data pengambilan."),
    overstockedItems: z.array(z.object({
        id: z.string(),
        name: z.string(),
        quantity: z.number(),
        max_stock: z.number(),
    })).describe("Daftar item di mana kuantitas saat ini secara signifikan lebih tinggi dari tingkat max_stock."),
    understockedItems: z.array(z.object({
        id: z.string(),
        name: z.string(),
        quantity: z.number(),
        min_stock: z.number(),
    })).describe("Daftar item di mana kuantitas saat ini di bawah tingkat min_stock."),
    fastMovingItems: z.array(z.object({
        id: z.string(),
        name: z.string(),
        totalRetrieved: z.number(),
    })).describe("Daftar item yang paling sering diambil dari gudang, menunjukkan permintaan tinggi. Urutkan dari yang paling banyak diambil."),
    deadStock: z.array(z.object({
        id: z.string(),
        name: z.string(),
        last_updated: z.string(),
    })).describe("Daftar item yang sudah lama tidak diupdate atau tidak ada pergerakan, yang menunjukkan kemungkinan stok mati. Tanggal hari ini adalah " + new Date().toDateString()),
    recommendations: z.array(z.string()).describe("Daftar rekomendasi yang dapat ditindaklanjuti untuk meningkatkan manajemen inventaris. Prioritaskan pemesanan ulang untuk item yang stoknya kurang DAN pergerakannya cepat."),
});

export type StockAnalysis = z.infer<typeof StockAnalysisOutputSchema>;
export type StockAnalysisInput = z.infer<typeof StockAnalysisInputSchema>;


// Export a wrapper function to be called from the client component.
export async function analyzeStock(input: StockAnalysisInput): Promise<StockAnalysis> {
  return analyzeStockFlow(input);
}

// Define the AI prompt.
const stockAnalysisPrompt = ai.definePrompt({
    name: 'stockAnalysisPrompt',
    input: { schema: StockAnalysisInputSchema },
    output: { schema: StockAnalysisOutputSchema },
    prompt: `Anda adalah seorang analis manajemen inventaris ahli untuk gudang suku cadang.
    Analisis data inventaris berikut DAN data riwayat pengambilan barang untuk memberikan analisis komprehensif dalam Bahasa Indonesia.
    
    Tanggal hari ini adalah: ${new Date().toISOString()}

    Analisis Anda harus mencakup:
    1.  Ringkasan eksekutif dari kondisi stok secara keseluruhan, dengan mempertimbangkan data permintaan dari log pengambilan.
    2.  Daftar item yang stoknya berlebih (kuantitas > stok_maks).
    3.  Daftar item yang stoknya kurang (kuantitas < stok_min).
    4.  Analisis riwayat pengambilan untuk mengidentifikasi item yang paling sering digunakan (fast-moving items). Hitung total pengambilan untuk setiap item.
    5.  Daftar potensi stok mati (item yang tidak ada pembaruan atau pengambilan selama lebih dari 6 bulan).
    6.  Rekomendasi yang dapat ditindaklanjuti untuk perbaikan. Berikan secara spesifik. Misalnya, alih-alih "pesan ulang item", sarankan item *mana* yang harus dipesan ulang, dan berikan prioritas tertinggi pada item yang stoknya kurang DAN juga merupakan item yang bergerak cepat.

    Data Inventaris:
    \`\`\`json
    {{{json inventory}}}
    \`\`\`

    Data Riwayat Pengambilan Barang (Barang Keluar):
    \`\`\`json
    {{{json retrievalLogs}}}
    \`\`\`
    `,
});


// Define the main flow.
const analyzeStockFlow = ai.defineFlow(
    {
        name: 'analyzeStockFlow',
        inputSchema: StockAnalysisInputSchema,
        outputSchema: StockAnalysisOutputSchema,
    },
    async (input) => {
        const { output } = await stockAnalysisPrompt(input);
        if (!output) {
            throw new Error("The AI model did not return a valid analysis.");
        }
        return output;
    }
);

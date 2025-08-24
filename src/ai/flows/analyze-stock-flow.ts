
'use server';
/**
 * @fileOverview An AI flow for analyzing warehouse inventory stock.
 *
 * - analyzeStock - A function that takes inventory data and returns a stock analysis.
 * - StockAnalysis - The return type for the analyzeStock function.
 */

import { ai } from '@/ai/genkit';
import { InventoryItem } from '@/lib/types';
import { z } from 'zod';

// Define the input schema, which is an array of inventory items.
// We pass the full item details to allow for rich analysis.
const StockAnalysisInputSchema = z.array(z.object({
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
}));

// Define the output schema for a structured response from the AI.
const StockAnalysisOutputSchema = z.object({
    executiveSummary: z.string().describe("A brief, high-level overview of the overall stock health."),
    overstockedItems: z.array(z.object({
        id: z.string(),
        name: z.string(),
        quantity: z.number(),
        max_stock: z.number(),
    })).describe("A list of items where the current quantity is significantly higher than the max_stock level."),
    understockedItems: z.array(z.object({
        id: z.string(),
        name: z.string(),
        quantity: z.number(),
        min_stock: z.number(),
    })).describe("A list of items where the current quantity is below the min_stock level."),
    deadStock: z.array(z.object({
        id: z.string(),
        name: z.string(),
        last_updated: z.string(),
    })).describe("A list of items that have not been updated or had movement in a long time (e.g., > 6 months), suggesting they might be dead stock. The current date is " + new Date().toDateString()),
    recommendations: z.array(z.string()).describe("A list of actionable recommendations to improve inventory management, such as items to reorder, items to potentially discount, or adjustments to stock levels."),
});

export type StockAnalysis = z.infer<typeof StockAnalysisOutputSchema>;

// Export a wrapper function to be called from the client component.
export async function analyzeStock(inventory: InventoryItem[]): Promise<StockAnalysis> {
  return analyzeStockFlow(inventory);
}

// Define the AI prompt.
const stockAnalysisPrompt = ai.definePrompt({
    name: 'stockAnalysisPrompt',
    input: { schema: StockAnalysisInputSchema },
    output: { schema: StockAnalysisOutputSchema },
    prompt: `You are an expert inventory management analyst for a spare parts warehouse.
    Analyze the following inventory data and provide a detailed analysis.
    
    Today's date is: ${new Date().toISOString()}

    Your analysis should include:
    1.  An executive summary of the overall stock condition.
    2.  A list of overstocked items (quantity > max_stock).
    3.  A list of understocked items (quantity < min_stock).
    4.  A list of potential dead stock (items with no updates for over 6 months).
    5.  Actionable recommendations for improvement. Be specific. For example, instead of "reorder items", suggest *which* items to reorder.

    Inventory Data:
    \`\`\`json
    {{{json input}}}
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
    async (inventory) => {
        const { output } = await stockAnalysisPrompt(inventory);
        if (!output) {
            throw new Error("The AI model did not return a valid analysis.");
        }
        return output;
    }
);

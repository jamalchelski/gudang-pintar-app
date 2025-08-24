
'use client';

import { useState, useContext } from 'react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Download, CheckCircle, Loader2 } from 'lucide-react';
import { StockTakeTable } from '@/components/inventory/stock-take-table';
import { AppContext } from '@/contexts/app-provider';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"


export default function StockTakePage() {
    const { inventory, submitStockTake, loading } = useContext(AppContext);
    const [counts, setCounts] = useState<Record<string, number | string>>({});
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleExportReport = () => {
        if (inventory.length === 0) {
            toast({ title: 'No Data to Export', variant: 'destructive'});
            return;
        }

        const reportData = inventory.map(item => {
            const countedQty = counts[item.id] !== undefined && counts[item.id] !== '' ? Number(counts[item.id]) : null;
            const variance = countedQty !== null ? countedQty - item.quantity : null;
            return {
                'SKU': item.id,
                'Item Name': item.name,
                'Brand': item.brand,
                'Category': item.category,
                'Unit': item.unit,
                'System Quantity': item.quantity,
                'Counted Quantity': countedQty ?? 'N/A',
                'Variance': variance ?? 'N/A'
            };
        });

        const worksheet = XLSX.utils.json_to_sheet(reportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'StockTakeReport');
        XLSX.writeFile(workbook, `stock_take_report_${new Date().toISOString().split('T')[0]}.csv`);
    };

    const handleSubmit = async () => {
        const countedItems = Object.entries(counts).filter(([, value]) => value !== '' && !isNaN(Number(value)));

        if (countedItems.length === 0) {
            toast({ title: 'Tidak ada data hitungan', description: 'Silakan masukkan setidaknya satu kuantitas hitungan.', variant: 'destructive' });
            return;
        }
        
        setIsSubmitting(true);
        const success = await submitStockTake(Object.fromEntries(countedItems.map(([id, value]) => [id, Number(value)])));
        
        if (success) {
            toast({ title: 'Sukses', description: 'Stok telah berhasil diperbarui.' });
            setCounts({}); // Reset counts after successful submission
        }
        setIsSubmitting(false);
    }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Stock Take">
        <Button variant="outline" onClick={handleExportReport} disabled={isSubmitting}>
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
         <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button disabled={isSubmitting || loading}>
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                    Submit Counts
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action will permanently update the inventory stock levels with your counted quantities. This cannot be undone.
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleSubmit}>Continue</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
      </PageHeader>
      <p className="text-muted-foreground">
        Perform a physical inventory count. Enter the counted quantity for each item and submit to update stock levels.
      </p>
      <StockTakeTable counts={counts} setCounts={setCounts} />
    </div>
  );
}

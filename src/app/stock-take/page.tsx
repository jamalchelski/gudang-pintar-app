
'use client';

import { useState, useContext, useMemo } from 'react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2 } from 'lucide-react';
import { StockTakeTable } from '@/components/inventory/stock-take-table';
import { AppContext } from '@/contexts/app-provider';
import { useToast } from '@/hooks/use-toast';
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';


export default function StockTakePage() {
    const { inventory, submitStockTake, loading, role } = useContext(AppContext);
    const [counts, setCounts] = useState<Record<string, number | string>>({});
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const hasCounts = useMemo(() => {
        return Object.values(counts).some(value => value !== '' && !isNaN(Number(value)));
    }, [counts]);

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

    if (role !== 'admin' && role !== 'helpdesk') {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Access Denied</AlertTitle>
                <AlertDescription>You do not have permission to view this page.</AlertDescription>
            </Alert>
        )
    }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Stock Take">
         <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button disabled={isSubmitting || loading || !hasCounts}>
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


'use client';

import { useContext, useMemo } from 'react';
import { PageHeader } from '@/components/page-header';
import { InventoryTable } from '@/components/inventory/inventory-table';
import { AppContext } from '@/contexts/app-provider';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function ReorderPage() {
  const { inventory, role } = useContext(AppContext);
  const { toast } = useToast();

  const reorderItems = useMemo(() => {
    return inventory.filter(item => item.quantity < item.min_stock);
  }, [inventory]);

  const handleExport = () => {
    if (reorderItems.length === 0) {
      toast({
        title: 'Tidak Ada Data untuk Diekspor',
        description: 'Tidak ada item dalam daftar pemesanan ulang.',
        variant: 'destructive',
      });
      return;
    }
    const worksheet = XLSX.utils.json_to_sheet(reorderItems);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'ReorderList');
    XLSX.writeFile(workbook, `reorder_list.csv`);
  };

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
      <PageHeader title="Reorder List">
        <Button onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          Export List
        </Button>
      </PageHeader>
      <p className="text-muted-foreground">
        This list shows all items where the current quantity is below the minimum stock level.
      </p>
      <InventoryTable data={reorderItems} />
    </div>
  );
}

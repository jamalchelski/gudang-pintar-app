'use client';

import { useContext, useMemo } from 'react';
import { PageHeader } from '@/components/page-header';
import { InventoryTable } from '@/components/inventory/inventory-table';
import { AppContext } from '@/contexts/app-provider';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

export default function ReorderPage() {
  const { inventory } = useContext(AppContext);

  const reorderItems = useMemo(() => {
    return inventory.filter(item => item.quantity < item.min_stock);
  }, [inventory]);

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Reorder List">
        <Button>
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

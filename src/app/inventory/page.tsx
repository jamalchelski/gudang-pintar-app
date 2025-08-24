'use client';

import { useContext } from 'react';
import { PageHeader } from '@/components/page-header';
import { InventoryTable } from '@/components/inventory/inventory-table';
import { AppContext } from '@/contexts/app-provider';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

export default function InventoryPage() {
  const { inventory, role } = useContext(AppContext);

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Inventory">
        {role === 'admin' && (
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        )}
      </PageHeader>
      <InventoryTable data={inventory} />
    </div>
  );
}


'use client';

import { useContext, useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { InventoryTable } from '@/components/inventory/inventory-table';
import { AppContext } from '@/contexts/app-provider';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { AddItemDialog } from '@/components/inventory/add-item-dialog';

export default function InventoryPage() {
  const { inventory, role, addItem } = useContext(AppContext);
  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Inventory">
        {role === 'admin' && (
          <Button onClick={() => setIsAddItemDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        )}
      </PageHeader>
      <InventoryTable data={inventory} />
      <AddItemDialog
        isOpen={isAddItemDialogOpen}
        setIsOpen={setIsAddItemDialogOpen}
        onItemAdded={addItem}
      />
    </div>
  );
}

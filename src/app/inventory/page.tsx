
'use client';

import { useContext, useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { InventoryTable } from '@/components/inventory/inventory-table';
import { AppContext } from '@/contexts/app-provider';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { AddItemDialog } from '@/components/inventory/add-item-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CategoryManagement } from '@/components/inventory/category-management';
import { UnitManagement } from '@/components/inventory/unit-management';

export default function InventoryPage() {
  const { inventory, role, addItem } = useContext(AppContext);
  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Inventory Management">
        {role === 'admin' && (
          <Button onClick={() => setIsAddItemDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        )}
      </PageHeader>
      
      <Tabs defaultValue="inventory">
        <TabsList>
          <TabsTrigger value="inventory">Inventory List</TabsTrigger>
          {role === 'admin' && <TabsTrigger value="categories">Category Management</TabsTrigger>}
          {role === 'admin' && <TabsTrigger value="units">Unit Management</TabsTrigger>}
        </TabsList>
        <TabsContent value="inventory" className="mt-4">
          <InventoryTable data={inventory} />
        </TabsContent>
        {role === 'admin' && (
          <TabsContent value="categories" className="mt-4">
            <CategoryManagement />
          </TabsContent>
        )}
        {role === 'admin' && (
          <TabsContent value="units" className="mt-4">
            <UnitManagement />
          </TabsContent>
        )}
      </Tabs>
      
      {role === 'admin' && (
        <AddItemDialog
            isOpen={isAddItemDialogOpen}
            setIsOpen={setIsAddItemDialogOpen}
            onItemAdded={addItem}
        />
      )}
    </div>
  );
}

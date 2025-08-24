'use client';

import { useContext } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Archive, AlertTriangle, Boxes, PackageCheck } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { AppContext } from '@/contexts/app-provider';
import { InventoryTable } from '@/components/inventory/inventory-table';
import { Skeleton } from '@/components/ui/skeleton';

export default function Dashboard() {
  const { inventory, loading } = useContext(AppContext);

  const totalItems = inventory.length;
  const totalQuantity = inventory.reduce((sum, item) => sum + item.quantity, 0);
  const lowStockItems = inventory.filter(item => item.quantity < item.min_stock);
  const outOfStockItems = inventory.filter(item => item.quantity === 0);

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <PageHeader title="Dashboard" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-4">Low Stock Items</h2>
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Dashboard" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total SKU</CardTitle>
            <Boxes className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
            <p className="text-xs text-muted-foreground">Unique items in inventory</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Quantity</CardTitle>
            <PackageCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalQuantity}</div>
            <p className="text-xs text-muted-foreground">Total of all items in stock</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowStockItems.length}</div>
            <p className="text-xs text-muted-foreground">Items below minimum stock level</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <Archive className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{outOfStockItems.length}</div>
            <p className="text-xs text-muted-foreground">Items with zero quantity</p>
          </CardContent>
        </Card>
      </div>
      <div>
        <h2 className="text-xl font-semibold mb-4">Low Stock Items</h2>
        <InventoryTable data={lowStockItems} />
      </div>
    </div>
  );
}

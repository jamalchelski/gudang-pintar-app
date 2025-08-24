
'use client';

import React, { useState, useContext, useMemo } from 'react';
import Image from 'next/image';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { InventoryItem } from '@/lib/types';
import { AppContext } from '@/contexts/app-provider';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ReduceStockDialog } from './reduce-stock-dialog';
import { EditItemDialog } from './edit-item-dialog';

interface InventoryTableProps {
  data: InventoryItem[];
}

export function InventoryTable({ data }: InventoryTableProps) {
  const [filter, setFilter] = useState('');
  const { role } = useContext(AppContext);
  const [reduceStockDialogOpen, setReduceStockDialogOpen] = useState(false);
  const [editItemDialogOpen, setEditItemDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  const filteredData = useMemo(() => {
    if (!filter) return data;
    return data.filter(
      item =>
        item.name.toLowerCase().includes(filter.toLowerCase()) ||
        item.brand.toLowerCase().includes(filter.toLowerCase()) ||
        item.category.toLowerCase().includes(filter.toLowerCase()) ||
        item.id.toLowerCase().includes(filter.toLowerCase())
    );
  }, [data, filter]);

  const handleActionClick = (item: InventoryItem, action: 'reduce' | 'edit' | 'delete') => {
    setSelectedItem(item);
    if (action === 'reduce') {
      setReduceStockDialogOpen(true);
    } else if (action === 'edit') {
      setEditItemDialogOpen(true);
    } else {
        // TODO: Implement delete
    }
  };

  const getStockStatus = (item: InventoryItem) => {
    if (item.quantity === 0) return <Badge variant="destructive">Out of Stock</Badge>;
    if (item.quantity < item.min_stock) return <Badge variant="secondary" className="bg-amber-100 text-amber-800">Low Stock</Badge>;
    return <Badge variant="secondary">In Stock</Badge>;
  };

  return (
    <div className="bg-card rounded-lg shadow-sm">
      <div className="p-4">
        <Input
          placeholder="Search items by name, brand, category, or SKU..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="max-w-sm"
        />
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Image</TableHead>
              <TableHead>Item Name</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length > 0 ? (
              filteredData.map(item => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={40}
                      height={40}
                      className="rounded-md object-cover"
                      data-ai-hint="spare part"
                    />
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-muted-foreground">{item.brand}</div>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{item.id}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell className="text-right">
                    <span className="font-bold">{item.quantity}</span>
                    <span className="text-muted-foreground"> {item.unit}</span>
                  </TableCell>
                  <TableCell>{getStockStatus(item)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleActionClick(item, 'reduce')}>
                          Reduce Stock
                        </DropdownMenuItem>
                        {role === 'admin' && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleActionClick(item, 'edit')}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit Item
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => handleActionClick(item, 'delete')}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Item
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {selectedItem && (
        <ReduceStockDialog
          isOpen={reduceStockDialogOpen}
          setIsOpen={setReduceStockDialogOpen}
          item={selectedItem}
        />
      )}
       {selectedItem && role === 'admin' && (
        <EditItemDialog
          isOpen={editItemDialogOpen}
          setIsOpen={setEditItemDialogOpen}
          item={selectedItem}
        />
      )}
    </div>
  );
}

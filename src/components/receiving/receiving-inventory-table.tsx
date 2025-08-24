
'use client';

import React, { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { InventoryItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ArchiveRestore } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { AppContext } from '@/contexts/app-provider';
import { ReceiveStockDialog } from './receive-stock-dialog';

export function ReceivingInventoryTable() {
  const { inventory } = React.useContext(AppContext);
  const [filter, setFilter] = useState('');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredData = useMemo(() => {
    if (!filter) return inventory;
    return inventory.filter(
      item =>
        item.name.toLowerCase().includes(filter.toLowerCase()) ||
        item.brand.toLowerCase().includes(filter.toLowerCase()) ||
        item.category.toLowerCase().includes(filter.toLowerCase()) ||
        item.id.toLowerCase().includes(filter.toLowerCase())
    );
  }, [inventory, filter]);

  const handleReceiveClick = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsDialogOpen(true);
  }

  return (
    <>
    <div className="bg-card rounded-lg shadow-sm">
      <div className="p-4">
        <Input
          placeholder="Cari item berdasarkan nama, merek, kategori, atau SKU..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="max-w-sm"
        />
      </div>
      <ScrollArea className="h-[70vh]">
        <Table>
          <TableHeader className="sticky top-0 bg-card z-10">
            <TableRow>
              <TableHead>Nama Item</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead className="text-right">Stok Saat Ini</TableHead>
              <TableHead>
                <span className="sr-only">Aksi</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length > 0 ? (
              filteredData.map(item => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-muted-foreground">{item.brand}</div>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{item.id}</TableCell>
                  <TableCell className="text-right">
                    <span className="font-bold">{item.quantity}</span>
                    <span className="text-muted-foreground"> {item.unit}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleReceiveClick(item)}
                    >
                      <ArchiveRestore className="mr-2 h-4 w-4" />
                      Terima Stok
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  Tidak ada item ditemukan.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
     {selectedItem && (
        <ReceiveStockDialog
            isOpen={isDialogOpen}
            setIsOpen={setIsDialogOpen}
            item={selectedItem}
        />
    )}
    </>
  );
}

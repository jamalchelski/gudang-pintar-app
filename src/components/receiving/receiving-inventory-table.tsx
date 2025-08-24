
'use client';

import React, { useState, useMemo, useContext } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { InventoryItem, ReceivingItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { AppContext } from '@/contexts/app-provider';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import { Label } from '../ui/label';


interface ReceivingInventoryTableProps {
    onAddItem: (item: ReceivingItem) => void;
}

export function ReceivingInventoryTable({ onAddItem }: ReceivingInventoryTableProps) {
  const { inventory } = useContext(AppContext);
  const { toast } = useToast();
  const [filter, setFilter] = useState('');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [quantity, setQuantity] = useState(1);
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

  const handleAddClick = (item: InventoryItem) => {
    setSelectedItem(item);
    setQuantity(1);
    setIsDialogOpen(true);
  }

  const handleConfirmAdd = () => {
    if (!selectedItem || quantity <= 0) {
        toast({
            title: 'Jumlah tidak valid',
            description: 'Jumlah harus lebih besar dari nol.',
            variant: 'destructive'
        })
        return;
    };
    onAddItem({ ...selectedItem, quantity });
    toast({
        title: 'Item Ditambahkan',
        description: `${quantity} x ${selectedItem.name} ditambahkan ke daftar penerimaan.`
    })
    setIsDialogOpen(false);
  }

  return (
    <>
    <div className="bg-card rounded-lg shadow-sm">
      <div className="p-4">
        <Input
          placeholder="Cari item untuk ditambahkan..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="max-w-sm"
        />
      </div>
      <ScrollArea className="h-[60vh]">
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
                      onClick={() => handleAddClick(item)}
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Tambah
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
     <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Masukkan Jumlah untuk: {selectedItem?.name}</DialogTitle>
                <DialogDescription>
                    Masukkan jumlah barang yang diterima untuk item ini.
                </DialogDescription>
            </DialogHeader>
            <div className="py-4">
                <Label htmlFor="quantity">Jumlah Diterima</Label>
                <Input 
                    id="quantity"
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    min="1"
                    className="mt-2"
                />
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Batal</Button>
                <Button onClick={handleConfirmAdd}>Tambah ke Daftar</Button>
            </DialogFooter>
        </DialogContent>
     </Dialog>
    </>
  );
}

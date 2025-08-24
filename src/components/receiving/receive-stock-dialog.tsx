
'use client';

import React, { useState, useContext } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InventoryItem } from '@/lib/types';
import { AppContext } from '@/contexts/app-provider';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface ReceiveStockDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  item: InventoryItem;
}

export function ReceiveStockDialog({ isOpen, setIsOpen, item }: ReceiveStockDialogProps) {
  const { editItem } = useContext(AppContext);
  const { toast } = useToast();
  const [amount, setAmount] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount === '' || Number(amount) <= 0) {
      toast({ title: 'Error', description: 'Jumlah harus lebih besar dari 0.', variant: 'destructive' });
      return;
    }
    
    setLoading(true);
    const newQuantity = item.quantity + Number(amount);
    const updatedItem = { ...item, quantity: newQuantity };

    const success = await editItem(updatedItem, item.quantity);
    
    if (success) {
      toast({
        title: 'Stok Diterima',
        description: `Stok untuk ${item.name} telah diperbarui menjadi ${newQuantity}.`,
      });
      setIsOpen(false);
      setAmount('');
    }
    setLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Terima Stok: {item.name}</DialogTitle>
            <DialogDescription>
                Stok saat ini: {item.quantity} {item.unit}. Masukkan jumlah barang yang diterima.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Jumlah
              </Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                className="col-span-3"
                min="1"
                placeholder="Masukkan jumlah"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={loading}>
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Konfirmasi'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

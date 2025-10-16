
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
import { Textarea } from '../ui/textarea';

interface ReduceStockDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  item: InventoryItem;
  onClose?: () => void;
}

export function ReduceStockDialog({ isOpen, setIsOpen, item, onClose }: ReduceStockDialogProps) {
  const { reduceStock } = useContext(AppContext);
  const [amount, setAmount] = useState<number>(1);
  const [reference, setReference] = useState('');
  const { toast } = useToast();

  const handleClose = () => {
    setIsOpen(false);
    if(onClose) {
        onClose();
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount > 0 && amount <= item.quantity) {
      reduceStock(item.id, amount, reference);
      setAmount(1);
      setReference('');
      handleClose();
    } else {
        toast({ title: "Error", description: "Jumlah tidak valid.", variant: "destructive" });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {if (!open) handleClose()}}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Kurangi Stok: {item.name}</DialogTitle>
            <DialogDescription>
              Stok saat ini: {item.quantity} {item.unit}. Masukkan jumlah yang akan dikurangi.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="reference" className="text-right">
                Keterangan
              </Label>
               <Textarea
                id="reference"
                value={reference}
                onChange={e => setReference(e.target.value)}
                className="col-span-3"
                placeholder="cth: Dipakai untuk perbaikan unit A-10"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Jumlah
              </Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={e => setAmount(Number(e.target.value))}
                className="col-span-3"
                min="1"
                max={item.quantity}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Batal
            </Button>
            <Button type="submit">Konfirmasi Pengurangan</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

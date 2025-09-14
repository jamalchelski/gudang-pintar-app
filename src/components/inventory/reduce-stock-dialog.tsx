
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

interface ReduceStockDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  item: InventoryItem;
  onClose?: () => void;
}

export function ReduceStockDialog({ isOpen, setIsOpen, item, onClose }: ReduceStockDialogProps) {
  const { reduceStock } = useContext(AppContext);
  const [amount, setAmount] = useState<number>(1);
  const [poNumber, setPoNumber] = useState('');
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
      reduceStock(item.id, amount, poNumber);
      setAmount(1);
      setPoNumber('');
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
            <DialogTitle>Reduce Stock: {item.name}</DialogTitle>
            <DialogDescription>
              Current quantity: {item.quantity} {item.unit}. Enter the amount to reduce.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="po-number" className="text-right">
                No. PO/Ref
              </Label>
              <Input
                id="po-number"
                value={poNumber}
                onChange={e => setPoNumber(e.target.value)}
                className="col-span-3"
                placeholder="(Opsional)"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Amount
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
              Cancel
            </Button>
            <Button type="submit">Confirm Reduction</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

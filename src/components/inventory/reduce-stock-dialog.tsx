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

interface ReduceStockDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  item: InventoryItem;
}

export function ReduceStockDialog({ isOpen, setIsOpen, item }: ReduceStockDialogProps) {
  const { reduceStock } = useContext(AppContext);
  const [amount, setAmount] = useState<number>(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount > 0 && amount <= item.quantity) {
      reduceStock(item.id, amount);
      setIsOpen(false);
      setAmount(1);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Confirm Reduction</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

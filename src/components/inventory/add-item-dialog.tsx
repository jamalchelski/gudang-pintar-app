
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
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { InventoryItem } from '@/lib/types';
import { AppContext } from '@/contexts/app-provider';

type OmitOnAdded = Omit<InventoryItem, 'last_updated' | 'image'>;

interface AddItemDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onItemAdded: (item: OmitOnAdded) => Promise<boolean>;
}

export function AddItemDialog({ isOpen, setIsOpen, onItemAdded }: AddItemDialogProps) {
  const { toast } = useToast();
  const { categories, units } = useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
      id: '',
      name: '',
      brand: '',
      category: '',
      unit: '',
      quantity: 0,
      min_stock: 0,
      max_stock: 0,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({...prev, [id]: id === 'quantity' || id === 'min_stock' || id === 'max_stock' ? Number(value) : value }));
  }

  const handleSelectChange = (id: 'category' | 'unit', value: string) => {
    setFormData(prev => ({...prev, [id]: value }));
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (Object.values(formData).some(val => val === '' || val === null)) {
        toast({
            title: 'Error',
            description: 'Please fill all fields.',
            variant: 'destructive',
        });
        setLoading(false);
        return;
    }

    const newItem: OmitOnAdded = {
        ...formData,
        quantity: Number(formData.quantity),
        min_stock: Number(formData.min_stock),
        max_stock: Number(formData.max_stock)
    };
    
    const success = await onItemAdded(newItem);
    
    if (success) {
      toast({
        title: 'Item Added',
        description: `Item ${formData.name} has been successfully added.`,
      });
      setIsOpen(false);
      // Reset form
      setFormData({
        id: '',
        name: '',
        brand: '',
        category: '',
        unit: '',
        quantity: 0,
        min_stock: 0,
        max_stock: 0,
      });
    }
    // Error toast is handled in the context
    setLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Inventory Item</DialogTitle>
            <DialogDescription>
              Fill in the details below to add a new item to the inventory.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4 max-h-[60vh] overflow-y-auto pr-4">
            <div className="space-y-2">
              <Label htmlFor="id">SKU / Item ID</Label>
              <Input id="id" value={formData.id} onChange={handleChange} placeholder="e.g., SKU-009" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Item Name</Label>
              <Input id="name" value={formData.name} onChange={handleChange} placeholder="e.g., Air Filter" />
            </div>
             <div className="space-y-2">
              <Label htmlFor="brand">Brand</Label>
              <Input id="brand" value={formData.brand} onChange={handleChange} placeholder="e.g., Sakura" />
            </div>
             <div className="space-y-2 col-span-2">
              <Label htmlFor="category">Category</Label>
               <Select value={formData.category} onValueChange={(value) => handleSelectChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
             <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input id="quantity" type="number" value={formData.quantity} onChange={handleChange} />
            </div>
             <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
               <Select value={formData.unit} onValueChange={(value) => handleSelectChange('unit', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a unit" />
                </SelectTrigger>
                <SelectContent>
                   {units.map((unit) => (
                    <SelectItem key={unit.id} value={unit.name}>{unit.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="min_stock">Min Stock</Label>
              <Input id="min_stock" type="number" value={formData.min_stock} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max_stock">Max Stock</Label>
              <Input id="max_stock" type="number" value={formData.max_stock} onChange={handleChange} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
                {loading ? 'Adding...' : 'Add Item'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

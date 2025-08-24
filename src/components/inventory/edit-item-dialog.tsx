
'use client';

import React, { useState, useContext, useEffect } from 'react';
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

interface EditItemDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  item: InventoryItem;
}

export function EditItemDialog({ isOpen, setIsOpen, item }: EditItemDialogProps) {
  const { toast } = useToast();
  const { categories, units, editItem } = useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<InventoryItem>(item);

  useEffect(() => {
    setFormData(item);
  }, [item]);

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

    const success = await editItem(formData);
    
    if (success) {
      toast({
        title: 'Item Updated',
        description: `Item ${formData.name} has been successfully updated.`,
      });
      setIsOpen(false);
    }
    setLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit: {item.name}</DialogTitle>
            <DialogDescription>
              Update the details for this inventory item. SKU cannot be changed.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4 max-h-[60vh] overflow-y-auto pr-4">
            <div className="space-y-2">
              <Label htmlFor="id">SKU / Item ID</Label>
              <Input id="id" value={formData.id} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Item Name</Label>
              <Input id="name" value={formData.name} onChange={handleChange} />
            </div>
             <div className="space-y-2">
              <Label htmlFor="brand">Brand</Label>
              <Input id="brand" value={formData.brand} onChange={handleChange} />
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
                {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

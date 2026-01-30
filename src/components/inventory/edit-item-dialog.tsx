

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
import { InventoryItem, UserRole } from '@/lib/types';
import { AppContext } from '@/contexts/app-provider';
import { Checkbox } from '../ui/checkbox';

interface EditItemDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  item: InventoryItem;
  onClose?: () => void;
}

const ROLES_TO_ASSIGN: UserRole[] = ['teknisi', 'cleaning', 'ipm'];

export function EditItemDialog({ isOpen, setIsOpen, item, onClose }: EditItemDialogProps) {
  const { toast } = useToast();
  const { categories, units, editItem } = useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<InventoryItem>(item);
  const [originalQuantity, setOriginalQuantity] = useState<number>(item.quantity);

  useEffect(() => {
    setFormData({...item, allowedRoles: item.allowedRoles || []});
    setOriginalQuantity(item.quantity);
  }, [item]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({...prev, [id]: id === 'quantity' || id === 'min_stock' || id === 'max_stock' ? Number(value) : value }));
  }

  const handleSelectChange = (id: 'category' | 'unit', value: string) => {
    setFormData(prev => ({...prev, [id]: value }));
  }
  
  const handleRolesChange = (role: UserRole, isChecked: boolean) => {
    setFormData(prev => {
        const currentRoles = prev.allowedRoles || [];
        if (isChecked) {
            return { ...prev, allowedRoles: [...currentRoles, role] };
        } else {
            return { ...prev, allowedRoles: currentRoles.filter(r => r !== role) };
        }
    });
};

  const handleClose = () => {
    setIsOpen(false);
    if (onClose) {
        onClose();
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const success = await editItem(formData, originalQuantity);
    
    if (success) {
      toast({
        title: 'Item Diperbarui',
        description: `Item ${formData.name} telah berhasil diperbarui.`,
      });
      handleClose();
    }
    setLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {if(!open) handleClose()}}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit: {item.name}</DialogTitle>
            <DialogDescription>
              Perbarui detail untuk item inventaris ini. SKU tidak dapat diubah.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 max-h-[60vh] overflow-y-auto pr-4">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="id">SKU / Item ID</Label>
              <Input id="id" value={formData.id} disabled />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="name">Nama Item</Label>
              <Input id="name" value={formData.name} onChange={handleChange} />
            </div>
             <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="brand">Merek</Label>
              <Input id="brand" value={formData.brand} onChange={handleChange} />
            </div>
             <div className="space-y-2 col-span-2">
              <Label htmlFor="category">Kategori</Label>
               <Select value={formData.category} onValueChange={(value) => handleSelectChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
             <div className="space-y-2">
              <Label htmlFor="quantity">Kuantitas</Label>
              <Input id="quantity" type="number" value={formData.quantity} onChange={handleChange} />
            </div>
             <div className="space-y-2">
              <Label htmlFor="unit">Satuan</Label>
               <Select value={formData.unit} onValueChange={(value) => handleSelectChange('unit', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih satuan" />
                </SelectTrigger>
                <SelectContent>
                   {units.map((unit) => (
                    <SelectItem key={unit.id} value={unit.name}>{unit.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="min_stock">Stok Min</Label>
              <Input id="min_stock" type="number" value={formData.min_stock} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max_stock">Stok Maks</Label>
              <Input id="max_stock" type="number" value={formData.max_stock} onChange={handleChange} />
            </div>
             <div className="space-y-2 sm:col-span-2">
                <Label>Allowed Roles</Label>
                <div className="flex flex-wrap gap-x-6 gap-y-2 p-2 border rounded-md">
                    {ROLES_TO_ASSIGN.map((role) => (
                    <div key={role} className="flex items-center space-x-2">
                        <Checkbox
                        id={`edit-role-${role}`}
                        checked={formData.allowedRoles?.includes(role)}
                        onCheckedChange={(checked) => {
                            handleRolesChange(role, checked as boolean);
                        }}
                        />
                        <Label htmlFor={`edit-role-${role}`} className="capitalize font-normal text-sm">{role}</Label>
                    </div>
                    ))}
                </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
                {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

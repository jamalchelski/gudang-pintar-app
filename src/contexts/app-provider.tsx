'use client';

import React, { createContext, useState, ReactNode } from 'react';
import { InventoryItem, UserRole } from '@/lib/types';
import { MOCK_INVENTORY } from '@/lib/mock-data';
import { useToast } from '@/hooks/use-toast';

interface AppContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  inventory: InventoryItem[];
  reduceStock: (itemId: string, amount: number) => void;
  updateStock: (itemId: string, newQuantity: number) => void;
}

export const AppContext = createContext<AppContextType>({
  role: 'admin',
  setRole: () => {},
  inventory: [],
  reduceStock: () => {},
  updateStock: () => {},
});

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  const [role, setRole] = useState<UserRole>('admin');
  const [inventory, setInventory] = useState<InventoryItem[]>(MOCK_INVENTORY);

  const reduceStock = (itemId: string, amount: number) => {
    setInventory(prevInventory =>
      prevInventory.map(item => {
        if (item.id === itemId) {
          const newQuantity = Math.max(0, item.quantity - amount);
          if (newQuantity < item.min_stock) {
            toast({
              title: 'Low Stock Warning',
              description: `${item.name} quantity is now ${newQuantity}, which is below the minimum stock of ${item.min_stock}.`,
              variant: 'destructive',
            });
          }
          return { ...item, quantity: newQuantity, last_updated: new Date().toISOString() };
        }
        return item;
      })
    );
     toast({
        title: 'Stock Reduced',
        description: `Reduced stock for item ${itemId} by ${amount}.`,
    });
  };

  const updateStock = (itemId: string, newQuantity: number) => {
    setInventory(prevInventory =>
      prevInventory.map(item => {
        if (item.id === itemId) {
          if (newQuantity < item.min_stock) {
            toast({
              title: 'Low Stock Warning',
              description: `${item.name} quantity is now ${newQuantity}, which is below the minimum stock of ${item.min_stock}.`,
            });
          }
          return { ...item, quantity: newQuantity, last_updated: new Date().toISOString() };
        }
        return item;
      })
    );
    toast({
        title: 'Stock Updated',
        description: `Updated stock for item ${itemId} to ${newQuantity}.`,
    });
  };

  return (
    <AppContext.Provider value={{ role, setRole, inventory, reduceStock, updateStock }}>
      {children}
    </AppContext.Provider>
  );
};

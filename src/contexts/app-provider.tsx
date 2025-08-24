
'use client';

import React, { createContext, useState, ReactNode, useEffect } from 'react';
import { InventoryItem, UserRole } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { collection, doc, getDocs, updateDoc, writeBatch } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { MOCK_INVENTORY } from '@/lib/mock-data';
import { User, onAuthStateChanged } from 'firebase/auth';
import { usePathname, useRouter } from 'next/navigation';

interface AppContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  inventory: InventoryItem[];
  reduceStock: (itemId: string, amount: number) => void;
  updateStock: (itemId: string, newQuantity: number) => void;
  loading: boolean;
  user: User | null;
}

export const AppContext = createContext<AppContextType>({
  role: 'user',
  setRole: () => {},
  inventory: [],
  reduceStock: () => {},
  updateStock: () => {},
  loading: true,
  user: null,
});

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  const [role, setRole] = useState<UserRole>('user');
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setLoading(true);
      if (currentUser) {
        setUser(currentUser);
        // This is a simplified role-check.
        const userRole = currentUser.email?.startsWith('admin') ? 'admin' : 'user';
        setRole(userRole);
        if (pathname === '/login') {
          router.push('/');
        }
      } else {
        setUser(null);
        setRole('user'); // default role
        if (pathname !== '/login') {
          router.push('/login');
        }
      }
      // Initial loading is done after auth check
       setTimeout(() => setLoading(false), 200);
    });
    return () => unsubscribe();
  }, [router, pathname]);


  useEffect(() => {
    if (!user) return; // Don't fetch if no user

    const fetchInventory = async () => {
      setLoading(true);
      try {
        const inventoryCollection = collection(db, 'inventory');
        const snapshot = await getDocs(inventoryCollection);
        if (snapshot.empty) {
          // Seed data if the collection is empty
          const batch = writeBatch(db);
          MOCK_INVENTORY.forEach(item => {
            const docRef = doc(inventoryCollection, item.id);
            batch.set(docRef, item);
          });
          await batch.commit();
          setInventory(MOCK_INVENTORY);
          toast({
            title: 'Database Initialized',
            description: 'Mock inventory data has been added to Firestore.',
          });
        } else {
          const inventoryData = snapshot.docs.map(
            doc =>
              ({
                id: doc.id,
                ...doc.data(),
              } as InventoryItem)
          );
          setInventory(inventoryData);
        }
      } catch (error) {
        console.error('Error fetching inventory:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch inventory data from Firestore.',
          variant: 'destructive',
        });
      }
      setLoading(false);
    };

    fetchInventory();
  }, [toast, user]);

  const reduceStock = async (itemId: string, amount: number) => {
    const item = inventory.find(i => i.id === itemId);
    if (!item) return;

    const newQuantity = Math.max(0, item.quantity - amount);
    
    try {
      const itemDoc = doc(db, 'inventory', itemId);
      await updateDoc(itemDoc, { quantity: newQuantity, last_updated: new Date().toISOString() });
      
      setInventory(prevInventory =>
        prevInventory.map(i =>
          i.id === itemId ? { ...i, quantity: newQuantity, last_updated: new Date().toISOString() } : i
        )
      );

      toast({
        title: 'Stock Reduced',
        description: `Reduced stock for item ${itemId} by ${amount}.`,
      });

      if (newQuantity < item.min_stock) {
        toast({
          title: 'Low Stock Warning',
          description: `${item.name} quantity is now ${newQuantity}, which is below the minimum stock of ${item.min_stock}.`,
          variant: 'destructive',
        });
      }
    } catch (error) {
       console.error('Error reducing stock:', error);
       toast({
          title: 'Error',
          description: 'Failed to update stock in Firestore.',
          variant: 'destructive',
        });
    }
  };

  const updateStock = async (itemId: string, newQuantity: number) => {
     const item = inventory.find(i => i.id === itemId);
     if (!item) return;

    try {
      const itemDoc = doc(db, 'inventory', itemId);
      await updateDoc(itemDoc, { quantity: newQuantity, last_updated: new Date().toISOString() });
      
      setInventory(prevInventory =>
        prevInventory.map(i =>
          i.id === itemId ? { ...i, quantity: newQuantity, last_updated: new Date().toISOString() } : i
        )
      );
      
      toast({
        title: 'Stock Updated',
        description: `Updated stock for item ${itemId} to ${newQuantity}.`,
      });

      if (newQuantity < item.min_stock) {
        toast({
          title: 'Low Stock Warning',
          description: `${item.name} quantity is now ${newQuantity}, which is below the minimum stock of ${item.min_stock}.`,
        });
      }
    } catch (error) {
       console.error('Error updating stock:', error);
       toast({
          title: 'Error',
          description: 'Failed to update stock in Firestore.',
          variant: 'destructive',
        });
    }
  };

  const value = {
    role,
    setRole,
    inventory,
    reduceStock,
    updateStock,
    loading,
    user,
  };
  
  // Render children only when not on the login page or when auth is determined
  const isLoginPage = pathname === '/login';
  if (loading && !isLoginPage) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }
  
  if (!user && !isLoginPage) {
    return null; // Don't render protected pages if not logged in
  }

  if(user && isLoginPage) {
    return null; // Don't render login page if logged in
  }


  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

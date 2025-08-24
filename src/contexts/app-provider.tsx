
'use client';

import React, { createContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { InventoryItem, UserRole, Category, Unit, PickingListItem } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { collection, doc, getDocs, updateDoc, writeBatch, setDoc, getDoc, deleteDoc, addDoc, runTransaction, DocumentSnapshot, DocumentReference } from 'firebase/firestore';
import { db, auth, seedAuth } from '@/lib/firebase';
import { MOCK_INVENTORY, MOCK_CATEGORIES, MOCK_UNITS } from '@/lib/mock-data';
import { User, onAuthStateChanged } from 'firebase/auth';
import { usePathname, useRouter } from 'next/navigation';

type OmitOnAdd = Omit<InventoryItem, 'last_updated' | 'image'>;


interface AppContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  inventory: InventoryItem[];
  categories: Category[];
  units: Unit[];
  pickingList: PickingListItem[];
  addItem: (item: OmitOnAdd) => Promise<boolean>;
  editItem: (item: InventoryItem) => Promise<boolean>;
  reduceStock: (itemId: string, amount: number) => void;
  updateStock: (itemId: string, newQuantity: number) => void;
  addCategory: (name: string) => Promise<boolean>;
  deleteCategory: (id: string) => Promise<boolean>;
  addUnit: (name: string) => Promise<boolean>;
  deleteUnit: (id: string) => Promise<boolean>;
  addItemToPickingList: (item: InventoryItem) => void;
  removeItemFromPickingList: (itemId: string) => void;
  updatePickingListQuantity: (itemId: string, quantity: number) => void;
  processPickingList: () => Promise<void>;
  loading: boolean;
  user: User | null;
}

export const AppContext = createContext<AppContextType>({
  role: 'user',
  setRole: () => {},
  inventory: [],
  categories: [],
  units: [],
  pickingList: [],
  addItem: async () => false,
  editItem: async () => false,
  reduceStock: () => {},
  updateStock: () => {},
  addCategory: async () => false,
  deleteCategory: async () => false,
  addUnit: async () => false,
  deleteUnit: async () => false,
  addItemToPickingList: () => {},
  removeItemFromPickingList: () => {},
  updatePickingListQuantity: () => {},
  processPickingList: async () => {},
  loading: true,
  user: null,
});

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  const [role, setRole] = useState<UserRole>('user');
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [pickingList, setPickingList] = useState<PickingListItem[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  
  const router = useRouter();
  const pathname = usePathname();

   useEffect(() => {
    const initialize = async () => {
      await seedAuth();
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setLoading(true);
        if (currentUser) {
          setUser(currentUser);
          const userRole = currentUser.email?.startsWith('admin') ? 'admin' : 'user';
          setRole(userRole);
          if (pathname === '/login') {
            router.push('/');
          }
        } else {
          setUser(null);
          setRole('user');
          if (pathname !== '/login') {
            router.push('/login');
          }
        }
        setTimeout(() => setLoading(false), 200);
      });
       setInitialized(true);
      return () => unsubscribe();
    };
    if (!initialized) {
        initialize();
    }
  }, [router, pathname, initialized]);


  const fetchCollection = useCallback(
    async <T extends {id: string}>(
      collectionName: string,
      setter: React.Dispatch<React.SetStateAction<T[]>>,
      mockData: T[],
      shouldSeed: boolean,
    ) => {
    try {
      const collectionRef = collection(db, collectionName);
      let snapshot = await getDocs(collectionRef);

      if (snapshot.empty && shouldSeed) {
        const batch = writeBatch(db);
        mockData.forEach(item => {
          const docRef = doc(collectionRef, item.id);
          batch.set(docRef, item);
        });
        await batch.commit();
         snapshot = await getDocs(collectionRef);
      }
      
      const data = snapshot.docs.map(
        doc =>
          ({
            id: doc.id,
            ...doc.data(),
          } as T)
      );
      setter(data.sort((a: any, b: any) => a.name?.localeCompare(b.name)));

      return snapshot.empty && shouldSeed;

    } catch (error) {
      console.error(`Error fetching ${collectionName}:`, error);
      toast({
        title: 'Error',
        description: `Failed to fetch ${collectionName} data. Check Firestore rules.`,
        variant: 'destructive',
      });
      return false;
    }
  }, [toast]);

  useEffect(() => {
    if (!user) return;

    const fetchAllData = async () => {
      setLoading(true);
      const inventorySnapshot = await getDocs(collection(db, 'inventory'));
      const shouldSeed = inventorySnapshot.empty;
      
      const seeded = await fetchCollection('inventory', setInventory, MOCK_INVENTORY, shouldSeed);
      await fetchCollection('categories', setCategories, MOCK_CATEGORIES, shouldSeed);
      await fetchCollection('units', setUnits, MOCK_UNITS, shouldSeed);

      if(seeded) {
        toast({
            title: 'Database Initialized',
            description: 'Mock data has been added to Firestore.',
          });
      }

      setLoading(false);
    };

    fetchAllData();
  }, [toast, user, fetchCollection]);

  const addItem = async (itemData: OmitOnAdd): Promise<boolean> => {
    try {
      const itemDocRef = doc(db, 'inventory', itemData.id);

      const docSnap = await getDoc(itemDocRef);
      if (docSnap.exists()) {
        toast({
            title: 'Error',
            description: `Item with SKU ${itemData.id} already exists.`,
            variant: 'destructive',
        });
        return false;
      }

      const newItem: InventoryItem = {
        ...itemData,
        image: 'https://placehold.co/400x400.png',
        last_updated: new Date().toISOString(),
      };
      await setDoc(itemDocRef, newItem);
      
      setInventory(prev => [...prev, newItem].sort((a, b) => a.name.localeCompare(b.name)));
      return true;

    } catch(error) {
      console.error('Error adding item:', error);
      toast({
          title: 'Error',
          description: 'Failed to add new item. Admins only.',
          variant: 'destructive',
      });
      return false;
    }
  }

  const editItem = async (itemData: InventoryItem): Promise<boolean> => {
    try {
        const itemDocRef = doc(db, 'inventory', itemData.id);
        const updatedItem = {
            ...itemData,
            last_updated: new Date().toISOString(),
        };
        await updateDoc(itemDocRef, updatedItem);
        setInventory(prev => prev.map(item => item.id === itemData.id ? updatedItem : item).sort((a, b) => a.name.localeCompare(b.name)));
        return true;
    } catch (error) {
        console.error('Error editing item:', error);
        toast({
            title: 'Error',
            description: 'Failed to edit item. Admins only.',
            variant: 'destructive',
        });
        return false;
    }
  }

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

  const addCategory = async (name: string): Promise<boolean> => {
    try {
        const docRef = await addDoc(collection(db, 'categories'), { name });
        setCategories(prev => [...prev, { id: docRef.id, name }].sort((a,b) => a.name.localeCompare(b.name)));
        return true;
    } catch (error) {
        console.error('Error adding category:', error);
        toast({ title: 'Error', description: 'Failed to add category.', variant: 'destructive' });
        return false;
    }
  };

  const deleteCategory = async (id: string): Promise<boolean> => {
      try {
          await deleteDoc(doc(db, 'categories', id));
          setCategories(prev => prev.filter(c => c.id !== id));
          return true;
      } catch (error) {
          console.error('Error deleting category:', error);
          toast({ title: 'Error', description: 'Failed to delete category.', variant: 'destructive' });
          return false;
      }
  };
  
  const addUnit = async (name: string): Promise<boolean> => {
      try {
          const docRef = await addDoc(collection(db, 'units'), { name });
          setUnits(prev => [...prev, { id: docRef.id, name }].sort((a,b) => a.name.localeCompare(b.name)));
          return true;
      } catch (error) {
          console.error('Error adding unit:', error);
          toast({ title: 'Error', description: 'Failed to add unit.', variant: 'destructive' });
          return false;
      }
  };

  const deleteUnit = async (id: string): Promise<boolean> => {
      try {
          await deleteDoc(doc(db, 'units', id));
          setUnits(prev => prev.filter(u => u.id !== id));
          return true;
      } catch (error) {
          console.error('Error deleting unit:', error);
          toast({ title: 'Error', description: 'Failed to delete unit.', variant: 'destructive' });
          return false;
      }
  };

  const addItemToPickingList = (item: InventoryItem) => {
    setPickingList(prev => {
      const existingItem = prev.find(pi => pi.id === item.id);
      if (existingItem) {
        return prev.map(pi => pi.id === item.id ? { ...pi, quantity: Math.min(pi.quantity + 1, item.quantity) } : pi);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeItemFromPickingList = (itemId: string) => {
    setPickingList(prev => prev.filter(pi => pi.id !== itemId));
  };

  const updatePickingListQuantity = (itemId: string, quantity: number) => {
    const inventoryItem = inventory.find(i => i.id === itemId);
    if (!inventoryItem) return;

    setPickingList(prev => prev.map(pi => pi.id === itemId ? { ...pi, quantity: Math.max(0, Math.min(quantity, inventoryItem.quantity)) } : pi));
  };

  const processPickingList = async () => {
    if (pickingList.length === 0) {
      toast({ title: 'Daftar Kosong', description: 'Tidak ada item untuk diproses.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
        await runTransaction(db, async (transaction) => {
            const itemsToUpdate: { ref: DocumentReference, newQuantity: number }[] = [];

            // 1. Read phase: Read all documents and validate stock
            for (const pickedItem of pickingList) {
                const itemDocRef = doc(db, 'inventory', pickedItem.id);
                const itemDoc = await transaction.get(itemDocRef);

                if (!itemDoc.exists()) {
                    throw new Error(`Item ${pickedItem.name} tidak ditemukan.`);
                }

                const currentQuantity = itemDoc.data().quantity;
                const newQuantity = currentQuantity - pickedItem.quantity;

                if (newQuantity < 0) {
                    throw new Error(`Stok tidak mencukupi untuk item ${pickedItem.name}.`);
                }

                itemsToUpdate.push({ ref: itemDocRef, newQuantity });
            }

            // 2. Write phase: Update all documents
            for (const { ref, newQuantity } of itemsToUpdate) {
                transaction.update(ref, {
                    quantity: newQuantity,
                    last_updated: new Date().toISOString()
                });
            }
        });

        // Update local state after successful transaction
        const updatedInventory = [...inventory];
        pickingList.forEach(pickedItem => {
            const index = updatedInventory.findIndex(invItem => invItem.id === pickedItem.id);
            if (index !== -1) {
                updatedInventory[index].quantity -= pickedItem.quantity;
                updatedInventory[index].last_updated = new Date().toISOString();
            }
        });
        setInventory(updatedInventory);
        setPickingList([]); // Clear the picking list
        toast({ title: 'Sukses', description: 'Pengambilan sparepart berhasil diproses.' });

    } catch (error: any) {
        console.error("Error processing picking list: ", error);
        toast({
            title: 'Error',
            description: error.message || 'Gagal memproses pengambilan.',
            variant: 'destructive',
        });
    }
    setLoading(false);
  };

  const value = {
    role,
    setRole,
    inventory,
    categories,
    units,
    pickingList,
    addItem,
    editItem,
    reduceStock,
    updateStock,
    addCategory,
    deleteCategory,
    addUnit,
    deleteUnit,
    addItemToPickingList,
    removeItemFromPickingList,
    updatePickingListQuantity,
    processPickingList,
    loading,
    user,
  };
  
  const isLoginPage = pathname === '/login';
  if (loading && !isLoginPage) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }
  
  if (!user && !isLoginPage) {
    return null;
  }

  if(user && isLoginPage) {
    return null;
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

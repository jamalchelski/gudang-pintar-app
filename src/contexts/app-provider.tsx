
'use client';

import React, { createContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { InventoryItem, UserRole, Category, Unit, PickingListItem, RetrievalLog, IncomingLog, StockTakeLog, StockTakeItemDetail } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { collection, doc, getDocs, updateDoc, writeBatch, setDoc, getDoc, deleteDoc, addDoc, runTransaction, DocumentReference, query, orderBy } from 'firebase/firestore';
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
  retrievalLogs: RetrievalLog[];
  incomingLogs: IncomingLog[];
  stockTakeLogs: StockTakeLog[];
  addItem: (item: OmitOnAdd) => Promise<boolean>;
  editItem: (item: InventoryItem, oldQuantity: number, type?: IncomingLog['type'], poNumber?: string) => Promise<boolean>;
  reduceStock: (itemId: string, amount: number, poNumber?: string) => Promise<void>;
  updateStock: (itemId: string, newQuantity: number) => void;
  addCategory: (name: string) => Promise<boolean>;
  deleteCategory: (id: string) => Promise<boolean>;
  addUnit: (name: string) => Promise<boolean>;
  deleteUnit: (id: string) => Promise<boolean>;
  addItemToPickingList: (item: InventoryItem) => void;
  removeItemFromPickingList: (itemId: string) => void;
  updatePickingListQuantity: (itemId: string, quantity: number) => void;
  processPickingList: (poNumber?: string) => Promise<void>;
  importInventory: (items: Omit<InventoryItem, 'last_updated'>[]) => Promise<boolean>;
  submitStockTake: (counts: Record<string, number>) => Promise<boolean>;
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
  retrievalLogs: [],
  incomingLogs: [],
  stockTakeLogs: [],
  addItem: async () => false,
  editItem: async () => false,
  reduceStock: async () => {},
  updateStock: () => {},
  addCategory: async () => false,
  deleteCategory: async () => false,
  addUnit: async () => false,
  deleteUnit: async () => false,
  addItemToPickingList: () => {},
  removeItemFromPickingList: () => {},
  updatePickingListQuantity: () => {},
  processPickingList: async () => {},
  importInventory: async () => false,
  submitStockTake: async () => false,
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
  const [retrievalLogs, setRetrievalLogs] = useState<RetrievalLog[]>([]);
  const [incomingLogs, setIncomingLogs] = useState<IncomingLog[]>([]);
  const [stockTakeLogs, setStockTakeLogs] = useState<StockTakeLog[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  
  const router = useRouter();
  const pathname = usePathname();

   useEffect(() => {
    const initialize = async () => {
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
        setTimeout(() => setLoading(false), 50); 
      });
       setInitialized(true);
      return () => unsubscribe();
    };
    if (!initialized) {
        if (pathname !== '/login') {
            seedAuth();
        }
        initialize();
    }
  }, [router, pathname, initialized]);


  const fetchCollection = useCallback(
    async <T extends {id: string, name?: string}>(
      collectionName: string,
      setter: React.Dispatch<React.SetStateAction<T[]>>,
      mockData: T[],
      shouldSeed: boolean,
    ) => {
    try {
      const collectionRef = collection(db, collectionName);
      let snapshot = await getDocs(collectionRef);
      
      if (snapshot.empty && shouldSeed) {
        console.log(`Seeding ${collectionName}...`)
        const batch = writeBatch(db);
        mockData.forEach(item => {
          const docRef = doc(collectionRef, item.id);
          batch.set(docRef, item);
        });
        await batch.commit();
         snapshot = await getDocs(collectionRef);
      }
      
      let data = snapshot.docs.map(
        doc =>
          ({
            id: doc.id,
            ...doc.data(),
          } as T)
      );

       if (data.length > 0 && 'timestamp' in data[0]) {
          data = data.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      } else if (data.length > 0 && data[0].name) {
          data = data.sort((a: any, b: any) => a.name.localeCompare(b.name));
      }
      
      setter(data);

      return snapshot.empty && shouldSeed;

    } catch (error) {
      console.error(`Error fetching ${collectionName}:`, error);
      toast({
        title: 'Error',
        description: `Gagal mengambil data ${collectionName}.`,
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
      await fetchCollection('retrieval_logs', setRetrievalLogs, [], false);
      await fetchCollection('incoming_logs', setIncomingLogs, [], false);
      await fetchCollection('stock_take_logs', setStockTakeLogs, [], false);


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
    if (!user) return false;
    try {
      const itemDocRef = doc(db, 'inventory', itemData.id);

      const docSnap = await getDoc(itemDocRef);
      if (docSnap.exists()) {
        toast({
            title: 'Error',
            description: `Item dengan SKU ${itemData.id} sudah ada.`,
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

      const logEntry: Omit<IncomingLog, 'id'> = {
        itemId: newItem.id,
        itemName: newItem.name,
        quantityAdded: newItem.quantity,
        newQuantity: newItem.quantity,
        type: 'new_item',
        user: user.email ?? 'unknown',
        timestamp: new Date().toISOString(),
      };
      const logRef = await addDoc(collection(db, 'incoming_logs'), logEntry);
      setIncomingLogs(prev => [{...logEntry, id: logRef.id}, ...prev]);


      return true;

    } catch(error) {
      console.error('Error adding item:', error);
      toast({
          title: 'Error',
          description: 'Gagal menambahkan item baru. Hanya admin.',
          variant: 'destructive',
      });
      return false;
    }
  }

  const editItem = async (itemData: InventoryItem, oldQuantity: number, type: IncomingLog['type'] = 'stock_update', poNumber?: string): Promise<boolean> => {
     if (!user) return false;
    try {
        const itemDocRef = doc(db, 'inventory', itemData.id);
        const updatedItem = {
            ...itemData,
            last_updated: new Date().toISOString(),
        };
        await updateDoc(itemDocRef, updatedItem);
        setInventory(prev => prev.map(item => item.id === itemData.id ? updatedItem : item).sort((a, b) => a.name.localeCompare(b.name)));

        const quantityChange = itemData.quantity - oldQuantity;
        if (quantityChange > 0) {
            const logEntry: Omit<IncomingLog, 'id'> = {
                itemId: itemData.id,
                itemName: itemData.name,
                quantityAdded: quantityChange,
                newQuantity: itemData.quantity,
                type: type,
                user: user.email ?? 'unknown',
                timestamp: new Date().toISOString(),
                ...(poNumber && { poNumber }),
            };
             const logRef = await addDoc(collection(db, 'incoming_logs'), logEntry);
             setIncomingLogs(prev => [{...logEntry, id: logRef.id}, ...prev]);
        }

        return true;
    } catch (error) {
        console.error('Error editing item:', error);
        toast({
            title: 'Error',
            description: 'Gagal mengedit item. Hanya admin.',
            variant: 'destructive',
        });
        return false;
    }
  }

  const reduceStock = async (itemId: string, amount: number, poNumber?: string) => {
    if(!user) return;
    const item = inventory.find(i => i.id === itemId);
    if (!item) return;

    const newQuantity = Math.max(0, item.quantity - amount);
    
    try {
        const batch = writeBatch(db);

        const itemDoc = doc(db, 'inventory', itemId);
        batch.update(itemDoc, { quantity: newQuantity, last_updated: new Date().toISOString() });
      
        const logEntry: Omit<RetrievalLog, 'id'> = {
            itemId: item.id,
            itemName: item.name,
            quantityRetrieved: amount,
            user: user.email ?? 'unknown',
            timestamp: new Date().toISOString(),
            ...(poNumber && { poNumber }),
        };

        const logRef = doc(collection(db, "retrieval_logs"));
        batch.set(logRef, logEntry);
        
        await batch.commit();

        setInventory(prevInventory =>
            prevInventory.map(i =>
            i.id === itemId ? { ...i, quantity: newQuantity, last_updated: new Date().toISOString() } : i
            )
        );
        setRetrievalLogs(prev => [{...logEntry, id: logRef.id}, ...prev]);


        toast({
            title: 'Stock Berkurang',
            description: `Stok untuk item ${itemId} berkurang sebanyak ${amount}.`,
        });

        if (newQuantity < item.min_stock) {
            toast({
            title: 'Peringatan Stok Rendah',
            description: `${item.name} sekarang berjumlah ${newQuantity}, di bawah stok minimum ${item.min_stock}.`,
            variant: 'destructive',
            });
        }
    } catch (error) {
       console.error('Error reducing stock:', error);
       toast({
          title: 'Error',
          description: 'Gagal memperbarui stok di Firestore.',
          variant: 'destructive',
        });
    }
  };

  const updateStock = async (itemId: string, newQuantity: number) => {
     const item = inventory.find(i => i.id === itemId);
     if (!item || !user) return;

    try {
      const itemDoc = doc(db, 'inventory', itemId);
      await updateDoc(itemDoc, { quantity: newQuantity, last_updated: new Date().toISOString() });
      
      setInventory(prevInventory =>
        prevInventory.map(i =>
          i.id === itemId ? { ...i, quantity: newQuantity, last_updated: new Date().toISOString() } : i
        )
      );
      
      toast({
        title: 'Stok Diperbarui',
        description: `Stok untuk item ${itemId} diperbarui menjadi ${newQuantity}.`,
      });

      if (newQuantity < item.min_stock) {
        toast({
          title: 'Peringatan Stok Rendah',
          description: `${item.name} sekarang berjumlah ${newQuantity}, yang berada di bawah stok minimum ${item.min_stock}.`,
        });
      }
    } catch (error) {
       console.error('Error updating stock:', error);
       toast({
          title: 'Error',
          description: 'Gagal memperbarui stok di Firestore.',
          variant: 'destructive',
        });
    }
  };

  const addCategory = async (name: string): Promise<boolean> => {
    try {
        const docRef = doc(db, 'categories', name.toLowerCase().replace(/\s/g, '-'));
        const newCategory = { id: docRef.id, name: name };
        await setDoc(docRef, newCategory)
        setCategories(prev => [...prev, newCategory].sort((a,b) => a.name.localeCompare(b.name)));
        return true;
    } catch (error) {
        console.error('Error adding category:', error);
        toast({ title: 'Error', description: 'Gagal menambahkan kategori.', variant: 'destructive' });
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
          toast({ title: 'Error', description: 'Gagal menghapus kategori.', variant: 'destructive' });
          return false;
      }
  };
  
  const addUnit = async (name: string): Promise<boolean> => {
      try {
          const docRef = doc(db, 'units', name.toLowerCase());
          const newUnit = { id: docRef.id, name: name };
          await setDoc(docRef, newUnit);
          setUnits(prev => [...prev, newUnit].sort((a,b) => a.name.localeCompare(b.name)));
          return true;
      } catch (error) {
          console.error('Error adding unit:', error);
          toast({ title: 'Error', description: 'Gagal menambahkan satuan.', variant: 'destructive' });
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
          toast({ title: 'Error', description: 'Gagal menghapus satuan.', variant: 'destructive' });
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

  const processPickingList = async (poNumber?: string) => {
    if (pickingList.length === 0) {
      toast({ title: 'Daftar Kosong', description: 'Tidak ada item untuk diproses.', variant: 'destructive' });
      return;
    }
     if (!user) {
      toast({ title: 'Error', description: 'Anda harus masuk untuk melakukan ini.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
        const newLogs: RetrievalLog[] = [];
        const itemsToUpdate: { ref: DocumentReference; newQuantity: number }[] = [];

        await runTransaction(db, async (transaction) => {
            for (const pickedItem of pickingList) {
                const itemDocRef = doc(db, 'inventory', pickedItem.id);
                const itemDoc = await transaction.get(itemDocRef);
                if (!itemDoc.exists()) throw new Error(`Item ${pickedItem.name} tidak ditemukan.`);
                const currentQuantity = itemDoc.data().quantity;
                const newQuantity = currentQuantity - pickedItem.quantity;
                if (newQuantity < 0) throw new Error(`Stok tidak mencukupi untuk item ${pickedItem.name}.`);
                itemsToUpdate.push({ ref: itemDocRef, newQuantity });
            }

            for (const { ref, newQuantity } of itemsToUpdate) {
                const pickedItem = pickingList.find(p => p.id === ref.id)!;
                transaction.update(ref, {
                    quantity: newQuantity,
                    last_updated: new Date().toISOString()
                });
                
                const logEntry: Omit<RetrievalLog, 'id'> = {
                    itemId: pickedItem.id,
                    itemName: pickedItem.name,
                    quantityRetrieved: pickedItem.quantity,
                    user: user.email ?? 'unknown',
                    timestamp: new Date().toISOString(),
                    ...(poNumber && { poNumber })
                };

                const logRef = doc(collection(db, "retrieval_logs"));
                transaction.set(logRef, logEntry);
                newLogs.push({ ...logEntry, id: logRef.id });
            }
        });

        const updatedInventory = [...inventory];
        pickingList.forEach(pickedItem => {
            const index = updatedInventory.findIndex(invItem => invItem.id === pickedItem.id);
            if (index !== -1) {
                updatedInventory[index].quantity -= pickedItem.quantity;
                updatedInventory[index].last_updated = new Date().toISOString();
            }
        });
        setInventory(updatedInventory);
        setPickingList([]);
        setRetrievalLogs(prev => [...newLogs, ...prev].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));

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

  const importInventory = async (items: Omit<InventoryItem, 'last_updated'>[]): Promise<boolean> => {
    if (!user) return false;
    setLoading(true);
    try {
      const batch = writeBatch(db);
      const newLogs: IncomingLog[] = [];
      const updatedInventory = [...inventory];

      for (const item of items) {
        const docRef = doc(db, 'inventory', item.id);
        const newItem: InventoryItem = {
          ...item,
          last_updated: new Date().toISOString(),
        };
        batch.set(docRef, newItem, { merge: true });

        const existingIndex = updatedInventory.findIndex(i => i.id === item.id);
        if (existingIndex > -1) {
          updatedInventory[existingIndex] = newItem;
        } else {
          updatedInventory.push(newItem);
        }
      }

      await batch.commit();
      setInventory(updatedInventory.sort((a,b) => a.name.localeCompare(b.name)));
      
      setLoading(false);
      return true;
    } catch (error) {
      console.error('Error importing inventory:', error);
      toast({
        title: 'Error',
        description: 'Gagal mengimpor data inventaris.',
        variant: 'destructive',
      });
      setLoading(false);
      return false;
    }
  }

  const submitStockTake = async (counts: Record<string, number>): Promise<boolean> => {
    if (!user) return false;

    try {
        const batch = writeBatch(db);
        const updatedInventory = [...inventory];
        const stockTakeDetails: StockTakeItemDetail[] = [];
        const newIncomingLogs: IncomingLog[] = [];

        for (const [itemId, countedQuantity] of Object.entries(counts)) {
            const itemIndex = updatedInventory.findIndex(item => item.id === itemId);
            if (itemIndex > -1) {
                const item = updatedInventory[itemIndex];
                const variance = countedQuantity - item.quantity;
                
                stockTakeDetails.push({
                    id: item.id,
                    name: item.name,
                    brand: item.brand,
                    systemQty: item.quantity,
                    countedQty: countedQuantity,
                    variance: variance
                });

                const itemRef = doc(db, 'inventory', itemId);
                batch.update(itemRef, {
                    quantity: countedQuantity,
                    last_updated: new Date().toISOString(),
                });

                if (variance > 0) {
                    const logEntry: Omit<IncomingLog, 'id'> = {
                        itemId: item.id,
                        itemName: item.name,
                        quantityAdded: variance,
                        newQuantity: countedQuantity,
                        type: 'stock_take',
                        user: user.email ?? 'unknown',
                        timestamp: new Date().toISOString(),
                    };
                    const logRef = doc(collection(db, 'incoming_logs'));
                    batch.set(logRef, logEntry);
                    newIncomingLogs.push({...logEntry, id: logRef.id});
                }
                
                updatedInventory[itemIndex].quantity = countedQuantity;
                updatedInventory[itemIndex].last_updated = new Date().toISOString();
            }
        }

        const stockTakeLogRef = doc(collection(db, 'stock_take_logs'));
        const newStockTakeLog: Omit<StockTakeLog, 'id'> = {
            timestamp: new Date().toISOString(),
            user: user.email ?? 'unknown',
            details: stockTakeDetails
        };
        batch.set(stockTakeLogRef, newStockTakeLog);

        await batch.commit();
        
        setInventory(updatedInventory);
        setStockTakeLogs(prev => [{ ...newStockTakeLog, id: stockTakeLogRef.id }, ...prev].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
        if (newIncomingLogs.length > 0) {
            setIncomingLogs(prev => [...newIncomingLogs, ...prev].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
        }

        return true;
    } catch (error) {
        console.error("Error submitting stock take:", error);
        toast({
            title: 'Error',
            description: 'Gagal mengirimkan hasil stock take.',
            variant: 'destructive',
        });
        return false;
    }
  };

  const value = {
    role,
    setRole,
    inventory,
    categories,
    units,
    pickingList,
    retrievalLogs,
    incomingLogs,
    stockTakeLogs,
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
    importInventory,
    submitStockTake,
    loading,
    user,
  };
  
  const isLoginPage = pathname === '/login';
  if (loading && !isLoginPage && !initialized) {
    return <div className="flex h-screen items-center justify-center">Memuat Aplikasi...</div>;
  }
  
  if (!user && !isLoginPage) {
    return null;
  }

  if(user && isLoginPage) {
    return <div className="flex h-screen items-center justify-center">Mengalihkan...</div>;
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

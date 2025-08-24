export type InventoryItem = {
  id: string;
  name: string;
  brand: string;
  unit: 'pcs' | 'box' | 'liter' | 'kg' | 'set';
  category: string;
  quantity: number;
  min_stock: number;
  max_stock: number;
  last_updated: string;
  image: string;
};

export type UserRole = 'admin' | 'user';


export type InventoryItem = {
  id: string;
  name: string;
  brand: string;
  unit: string;
  category: string;
  quantity: number;
  min_stock: number;
  max_stock: number;
  last_updated: string;
  image: string;
};

export type PickingListItem = InventoryItem & {
  // quantity in this context is the amount to be picked
};

export type UserRole = 'admin' | 'user';

export type Category = {
  id: string;
  name: string;
};

export type Unit = {
  id: string;
  name: string;
};

export type RetrievalLog = {
    id: string;
    itemId: string;
    itemName: string;
    quantityRetrieved: number;
    user: string;
    timestamp: string;
}

export type IncomingLog = {
    id: string;
    itemId: string;
    itemName: string;
    quantityAdded: number;
    newQuantity: number;
    type: 'new_item' | 'stock_update';
    user: string;
    timestamp: string;
}

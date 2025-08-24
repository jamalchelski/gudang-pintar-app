import { InventoryItem, Category, Unit } from './types';

export const MOCK_INVENTORY: InventoryItem[] = [
  // Existing 8 items
  {
    id: 'SKU-0001',
    name: 'Busi Champion',
    brand: 'Champion',
    category: 'Suku Cadang Mesin',
    unit: 'pcs',
    quantity: 15,
    min_stock: 10,
    max_stock: 50,
    last_updated: '2023-10-26T10:00:00Z',
    image: 'https://placehold.co/400x400.png',
  },
];


export const MOCK_CATEGORIES: Category[] = [
  { id: 'cat-001', name: 'Suku Cadang Mesin' },
  { id: 'cat-002', name: 'Pelumas' },
  { id: 'cat-003', name: 'Filter' },
  { id: 'cat-004', name: 'Sistem Pengereman' },
  { id: 'cat-005', name: 'Kelistrikan' },
  { id: 'cat-006', name: 'Suku Cadang Roda' },
  { id: 'cat-007', name: 'Suspensi & Kaki-kaki' },
  { id: 'cat-008', name: 'Sistem Pendingin' },
  { id: 'cat-009', name: 'Sistem Bahan Bakar' },
  { id: 'cat-010', name: 'Komponen Interior' },
  { id: 'cat-011', name: 'Komponen Eksterior' },
  { id: 'cat-012', name: 'Perkakas & Lain-lain' },
];

export const MOCK_UNITS: Unit[] = [
  { id: 'unit-001', name: 'pcs' },
  { id: 'unit-002', name: 'box' },
  { id: 'unit-003', name: 'liter' },
  { id: 'unit-004', name: 'kg' },
  { id: 'unit-005', name: 'set' },
  { id: 'unit-006', name: 'roll' },
];

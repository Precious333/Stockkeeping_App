// src/types/inventory.ts

export interface InventoryItem {
  id: string;
  name: string;
  sku?: string;
  category: (typeof CATEGORIES)[number]; // strong typing with categories
  quantity: number;
  minLevel: number;
  location?: string;
  price: number;
  notes?: string;
  history?: InventoryHistory[];
  image?: string; // local require or URI
}

export interface InventoryHistory {
  id: string;
  date: string; // ISO string

  // FIX → allow edit history
  type: 'add' | 'remove' | 'edit';

  quantity: number;
  reason?: string;
  previousQuantity: number;
  newQuantity: number;
}

export type StockLevel = 'low' | 'medium' | 'good';

export const getStockLevel = (quantity: number, minLevel: number): StockLevel => {
  if (quantity <= minLevel) return 'low';
  if (quantity <= minLevel * 2) return 'medium';
  return 'good';
};

export const CATEGORIES = [
  'Antibiotics',
  'Multivitamins',
  'Anticocci',
  'AntiCRD',
  'Dewormer',
  'Other',
] as const;

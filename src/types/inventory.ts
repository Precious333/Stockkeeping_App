// src/types/inventory.ts

export interface InventoryItem {
  id: string;
  name: string;
  sku?: string;
  category: (typeof CATEGORIES)[number];
  quantity: number;
  minLevel: number;
  location?: string;
  price: number;
  notes?: string;
  history?: InventoryHistory[];
  image?: string; 
}

export interface InventoryHistory {
  id: string;
  date: string; 

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
  'Vaccines',
  'Antibiotics',
  'Multivitamins',
  'Anticocci',
  'AntiCRD',
  'Dewormer',
  'Booster',
  'Egg Booster',
  'Pox drugs',
  'Calcium',
  'Viral Solutions',
  'Liver Tonics',
  'Ivermectin',
  'Oxytetracycline L.A',
  'Oxytetracycline 5.5%',
  "Tylosin",
  "Multivitamin Inj.",
  'Iron D.',
  'Penicillin',
  'Wound Spray',
  'Ectoparasiticides',
  'Probiotics',
  'Antidiarrheals',
  'Disinfectants',
  'Other',
] as const;

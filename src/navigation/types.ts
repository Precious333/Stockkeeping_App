import { InventoryItem } from "../types/inventory";

export type RootStackParamList = {
  Dashboard: undefined;
  Inventory: undefined;
  AddItem: { item?: InventoryItem } | undefined;
  ItemDetail: { id: string };
};

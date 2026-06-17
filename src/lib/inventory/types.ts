export type Category = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
};

export type Item = {
  id: string;
  name: string;
  sku: string | null;
  category_id: string | null;
  unit: string;
  quantity: number;
  reorder_level: number;
  cost_price: number;
  sale_price: number;
  supplier: string | null;
  location: string | null;
  created_at: string;
  updated_at: string;
};

export type ItemWithCategory = Item & {
  category: Pick<Category, "id" | "name"> | null;
};

export type MovementType = "in" | "out" | "adjust";

export type StockMovement = {
  id: string;
  item_id: string;
  type: MovementType;
  quantity: number;
  note: string | null;
  created_at: string;
  created_by: string | null;
};

export type MovementWithItem = StockMovement & {
  item: Pick<Item, "id" | "name" | "sku" | "unit"> | null;
};

export type DashboardStats = {
  totalItems: number;
  totalUnits: number;
  inventoryValue: number;
  lowStockCount: number;
};

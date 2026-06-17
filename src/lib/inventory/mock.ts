import type { Category, ItemWithCategory, MovementWithItem } from "./types";

/** Sample data shown in preview mode (before real Supabase keys are added). */

export const MOCK_CATEGORIES: Category[] = [
  { id: "c1", name: "Fabric", description: "Raw fabric rolls", created_at: "2026-05-01T00:00:00Z" },
  { id: "c2", name: "Accessories", description: "Buttons, zippers, labels", created_at: "2026-05-01T00:00:00Z" },
  { id: "c3", name: "Finished Goods", description: "Packed ready-to-ship garments", created_at: "2026-05-01T00:00:00Z" },
];

const cat = (id: string) => {
  const c = MOCK_CATEGORIES.find((x) => x.id === id)!;
  return { id: c.id, name: c.name };
};

export const MOCK_ITEMS: ItemWithCategory[] = [
  { id: "i1", name: "Cotton Twill 240gsm", sku: "FAB-CT240", category_id: "c1", unit: "m", quantity: 1200, reorder_level: 300, cost_price: 3.2, sale_price: 5.5, supplier: "Hossain Textiles", location: "Rack A1", created_at: "2026-05-02T00:00:00Z", updated_at: "2026-06-10T00:00:00Z", category: cat("c1") },
  { id: "i2", name: "Polyester Lining", sku: "FAB-POLY", category_id: "c1", unit: "m", quantity: 180, reorder_level: 250, cost_price: 1.1, sale_price: 2.0, supplier: "Dhaka Mills", location: "Rack A3", created_at: "2026-05-02T00:00:00Z", updated_at: "2026-06-11T00:00:00Z", category: cat("c1") },
  { id: "i3", name: "YKK Zipper 18cm", sku: "ACC-ZIP18", category_id: "c2", unit: "pcs", quantity: 5400, reorder_level: 1000, cost_price: 0.18, sale_price: 0.4, supplier: "YKK BD", location: "Bin C2", created_at: "2026-05-03T00:00:00Z", updated_at: "2026-06-09T00:00:00Z", category: cat("c2") },
  { id: "i4", name: "Woven Brand Label", sku: "ACC-LBL", category_id: "c2", unit: "pcs", quantity: 320, reorder_level: 2000, cost_price: 0.05, sale_price: 0.12, supplier: "LabelCraft", location: "Bin C5", created_at: "2026-05-03T00:00:00Z", updated_at: "2026-06-12T00:00:00Z", category: cat("c2") },
  { id: "i5", name: "Mens Polo Shirt - M", sku: "FG-POLO-M", category_id: "c3", unit: "pcs", quantity: 860, reorder_level: 200, cost_price: 4.8, sale_price: 11.0, supplier: null, location: "Shelf F2", created_at: "2026-05-04T00:00:00Z", updated_at: "2026-06-12T00:00:00Z", category: cat("c3") },
  { id: "i6", name: "Mens Polo Shirt - L", sku: "FG-POLO-L", category_id: "c3", unit: "pcs", quantity: 90, reorder_level: 200, cost_price: 4.8, sale_price: 11.0, supplier: null, location: "Shelf F2", created_at: "2026-05-04T00:00:00Z", updated_at: "2026-06-12T00:00:00Z", category: cat("c3") },
];

export const MOCK_MOVEMENTS: MovementWithItem[] = [
  { id: "m1", item_id: "i1", type: "in", quantity: 500, note: "PO #1042 received", created_at: "2026-06-10T09:00:00Z", created_by: null, item: { id: "i1", name: "Cotton Twill 240gsm", sku: "FAB-CT240", unit: "m" } },
  { id: "m2", item_id: "i5", type: "out", quantity: 240, note: "Dispatch to line 3", created_at: "2026-06-11T11:30:00Z", created_by: null, item: { id: "i5", name: "Mens Polo Shirt - M", sku: "FG-POLO-M", unit: "pcs" } },
  { id: "m3", item_id: "i3", type: "in", quantity: 2000, note: "PO #1051 received", created_at: "2026-06-11T14:10:00Z", created_by: null, item: { id: "i3", name: "YKK Zipper 18cm", sku: "ACC-ZIP18", unit: "pcs" } },
  { id: "m4", item_id: "i6", type: "out", quantity: 110, note: "Dispatch to line 1", created_at: "2026-06-12T08:45:00Z", created_by: null, item: { id: "i6", name: "Mens Polo Shirt - L", sku: "FG-POLO-L", unit: "pcs" } },
];

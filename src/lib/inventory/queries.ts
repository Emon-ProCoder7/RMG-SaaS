import "server-only";
import { createClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/config";
import { MOCK_CATEGORIES, MOCK_ITEMS, MOCK_MOVEMENTS } from "./mock";
import type {
  Category,
  DashboardStats,
  ItemWithCategory,
  MovementWithItem,
} from "./types";

/** Read functions for Server Components. Fall back to mock data in preview mode. */

export async function getItems(): Promise<ItemWithCategory[]> {
  if (!supabaseConfigured) return MOCK_ITEMS;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("items")
    .select("*, category:categories(id, name)")
    .order("name", { ascending: true });
  if (error) throw error;
  return (data ?? []) as ItemWithCategory[];
}

export async function getCategories(): Promise<Category[]> {
  if (!supabaseConfigured) return MOCK_CATEGORIES;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Category[];
}

export async function getRecentMovements(limit = 8): Promise<MovementWithItem[]> {
  if (!supabaseConfigured) return MOCK_MOVEMENTS.slice(0, limit);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("stock_movements")
    .select("*, item:items(id, name, sku, unit)")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as MovementWithItem[];
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const items = await getItems();
  return {
    totalItems: items.length,
    totalUnits: items.reduce((sum, i) => sum + Number(i.quantity), 0),
    inventoryValue: items.reduce(
      (sum, i) => sum + Number(i.quantity) * Number(i.cost_price),
      0,
    ),
    lowStockCount: items.filter(
      (i) => Number(i.quantity) <= Number(i.reorder_level),
    ).length,
  };
}

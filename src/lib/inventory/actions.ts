"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/config";
import type { MovementType } from "./types";

export type ActionResult = { ok: boolean; error?: string };

const PREVIEW_MSG =
  "Preview mode — add your own Supabase keys to .env.local to save changes.";

function str(fd: FormData, key: string): string | null {
  const v = fd.get(key);
  if (v === null) return null;
  const s = String(v).trim();
  return s.length ? s : null;
}
function num(fd: FormData, key: string): number {
  const v = fd.get(key);
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function revalidate() {
  revalidatePath("/inventory");
  revalidatePath("/dashboard");
  revalidatePath("/movements");
}

export async function createItem(fd: FormData): Promise<ActionResult> {
  if (!supabaseConfigured) return { ok: false, error: PREVIEW_MSG };
  const name = str(fd, "name");
  if (!name) return { ok: false, error: "Item name is required." };

  const supabase = await createClient();
  const { error } = await supabase.from("items").insert({
    name,
    sku: str(fd, "sku"),
    category_id: str(fd, "category_id"),
    unit: str(fd, "unit") ?? "pcs",
    quantity: num(fd, "quantity"),
    reorder_level: num(fd, "reorder_level"),
    cost_price: num(fd, "cost_price"),
    sale_price: num(fd, "sale_price"),
    supplier: str(fd, "supplier"),
    location: str(fd, "location"),
  });
  if (error) return { ok: false, error: error.message };
  revalidate();
  return { ok: true };
}

export async function updateItem(fd: FormData): Promise<ActionResult> {
  if (!supabaseConfigured) return { ok: false, error: PREVIEW_MSG };
  const id = str(fd, "id");
  if (!id) return { ok: false, error: "Missing item id." };
  const name = str(fd, "name");
  if (!name) return { ok: false, error: "Item name is required." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("items")
    .update({
      name,
      sku: str(fd, "sku"),
      category_id: str(fd, "category_id"),
      unit: str(fd, "unit") ?? "pcs",
      reorder_level: num(fd, "reorder_level"),
      cost_price: num(fd, "cost_price"),
      sale_price: num(fd, "sale_price"),
      supplier: str(fd, "supplier"),
      location: str(fd, "location"),
    })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidate();
  return { ok: true };
}

export async function deleteItem(id: string): Promise<ActionResult> {
  if (!supabaseConfigured) return { ok: false, error: PREVIEW_MSG };
  const supabase = await createClient();
  const { error } = await supabase.from("items").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidate();
  return { ok: true };
}

export async function recordMovement(fd: FormData): Promise<ActionResult> {
  if (!supabaseConfigured) return { ok: false, error: PREVIEW_MSG };
  const item_id = str(fd, "item_id");
  const type = str(fd, "type") as MovementType | null;
  if (!item_id) return { ok: false, error: "Select an item." };
  if (!type || !["in", "out", "adjust"].includes(type))
    return { ok: false, error: "Invalid movement type." };
  const quantity = num(fd, "quantity");
  if (quantity < 0) return { ok: false, error: "Quantity must be positive." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { error } = await supabase.from("stock_movements").insert({
    item_id,
    type,
    quantity,
    note: str(fd, "note"),
    created_by: user?.id ?? null,
  });
  if (error) return { ok: false, error: error.message };
  revalidate();
  return { ok: true };
}

export async function createCategory(fd: FormData): Promise<ActionResult> {
  if (!supabaseConfigured) return { ok: false, error: PREVIEW_MSG };
  const name = str(fd, "name");
  if (!name) return { ok: false, error: "Category name is required." };
  const supabase = await createClient();
  const { error } = await supabase
    .from("categories")
    .insert({ name, description: str(fd, "description") });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/categories");
  revalidatePath("/inventory");
  return { ok: true };
}

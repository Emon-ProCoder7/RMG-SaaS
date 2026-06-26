"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/config";
import type { MovementType } from "./types";

export type ActionResult = { ok: boolean; error?: string };

const PREVIEW_MSG = "Preview mode — add your own Supabase keys to .env.local to save changes.";

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

function fnum(fd: FormData, key: string): number {
  const v = fd.get(key);
  const n = parseFloat(String(v).replace(/[,৳$]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function revalidateAll() {
  ["/dashboard", "/inventory", "/movements", "/customers", "/suppliers", "/sales", "/purchases", "/returns", "/reports"].forEach((p) => revalidatePath(p));
}

// ── ITEMS ──

export async function createItem(fd: FormData): Promise<ActionResult> {
  if (!supabaseConfigured) return { ok: false, error: PREVIEW_MSG };
  const name = str(fd, "name");
  if (!name) return { ok: false, error: "Item name is required." };
  const supabase = await createClient();
  const { error } = await supabase.from("items").insert({
    name, sku: str(fd, "sku"), barcode: str(fd, "barcode"), category_id: str(fd, "category_id"),
    store_id: str(fd, "store_id"), unit: str(fd, "unit") ?? "pcs", quantity: num(fd, "quantity"),
    reorder_level: num(fd, "reorder_level"), cost_price: fnum(fd, "cost_price"), sale_price: fnum(fd, "sale_price"),
    supplier_id: str(fd, "supplier_id"), supplier: str(fd, "supplier"), location: str(fd, "location"),
    color: str(fd, "color"), size: str(fd, "size"), season: str(fd, "season"), department: str(fd, "department"),
  });
  if (error) return { ok: false, error: error.message };
  revalidateAll();
  return { ok: true };
}

export async function updateItem(fd: FormData): Promise<ActionResult> {
  if (!supabaseConfigured) return { ok: false, error: PREVIEW_MSG };
  const id = str(fd, "id");
  if (!id) return { ok: false, error: "Missing item id." };
  const name = str(fd, "name");
  if (!name) return { ok: false, error: "Item name is required." };
  const supabase = await createClient();
  const { error } = await supabase.from("items").update({
    name, sku: str(fd, "sku"), barcode: str(fd, "barcode"), category_id: str(fd, "category_id"),
    unit: str(fd, "unit") ?? "pcs", reorder_level: num(fd, "reorder_level"),
    cost_price: fnum(fd, "cost_price"), sale_price: fnum(fd, "sale_price"),
    supplier_id: str(fd, "supplier_id"), supplier: str(fd, "supplier"), location: str(fd, "location"),
    color: str(fd, "color"), size: str(fd, "size"), season: str(fd, "season"), department: str(fd, "department"),
  }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidateAll();
  return { ok: true };
}

export async function deleteItem(id: string): Promise<ActionResult> {
  if (!supabaseConfigured) return { ok: false, error: PREVIEW_MSG };
  const supabase = await createClient();
  const { error } = await supabase.from("items").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidateAll();
  return { ok: true };
}

// ── MOVEMENTS ──

export async function recordMovement(fd: FormData): Promise<ActionResult> {
  if (!supabaseConfigured) return { ok: false, error: PREVIEW_MSG };
  const item_id = str(fd, "item_id");
  const type = str(fd, "type") as MovementType | null;
  if (!item_id) return { ok: false, error: "Select an item." };
  if (!type || !["in", "out", "adjust", "damage", "return"].includes(type)) return { ok: false, error: "Invalid type." };
  const quantity = Math.abs(num(fd, "quantity"));
  if (quantity <= 0) return { ok: false, error: "Quantity must be positive." };
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { error } = await supabase.from("stock_movements").insert({
    item_id, type, quantity, note: str(fd, "note"), store_id: str(fd, "store_id"), created_by: user?.id ?? null,
  });
  if (error) return { ok: false, error: error.message };
  revalidateAll();
  return { ok: true };
}

// ── CATEGORIES ──

export async function createCategory(fd: FormData): Promise<ActionResult> {
  if (!supabaseConfigured) return { ok: false, error: PREVIEW_MSG };
  const name = str(fd, "name");
  if (!name) return { ok: false, error: "Category name is required." };
  const supabase = await createClient();
  const { error } = await supabase.from("categories").insert({ name, description: str(fd, "description") });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/categories");
  revalidatePath("/inventory");
  return { ok: true };
}

// ── CUSTOMERS ──

export async function createCustomer(fd: FormData): Promise<ActionResult> {
  if (!supabaseConfigured) return { ok: false, error: PREVIEW_MSG };
  const supabase = await createClient();
  const { error } = await supabase.from("customers").insert({
    name: str(fd, "name"), name_ar: str(fd, "name_ar"), mobile: str(fd, "mobile"), phone: str(fd, "phone"),
    email: str(fd, "email"), address: str(fd, "address"), transport: str(fd, "transport"),
    vat_no: str(fd, "vat_no"), ledger_book_no: str(fd, "ledger_book_no"),
    opening_bl: num(fd, "opening_bl"), credit_limit: num(fd, "credit_limit"),
  });
  if (error) return { ok: false, error: error.message };
  revalidateAll();
  return { ok: true };
}

export async function updateCustomer(fd: FormData): Promise<ActionResult> {
  if (!supabaseConfigured) return { ok: false, error: PREVIEW_MSG };
  const id = str(fd, "id");
  if (!id) return { ok: false, error: "Missing id." };
  const supabase = await createClient();
  const { error } = await supabase.from("customers").update({
    name: str(fd, "name"), name_ar: str(fd, "name_ar"), mobile: str(fd, "mobile"), phone: str(fd, "phone"),
    email: str(fd, "email"), address: str(fd, "address"), transport: str(fd, "transport"),
    vat_no: str(fd, "vat_no"), ledger_book_no: str(fd, "ledger_book_no"),
    opening_bl: num(fd, "opening_bl"), credit_limit: num(fd, "credit_limit"),
  }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidateAll();
  return { ok: true };
}

export async function deleteCustomer(id: string): Promise<ActionResult> {
  if (!supabaseConfigured) return { ok: false, error: PREVIEW_MSG };
  const supabase = await createClient();
  const { error } = await supabase.from("customers").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidateAll();
  return { ok: true };
}

// ── SUPPLIERS ──

export async function createSupplier(fd: FormData): Promise<ActionResult> {
  if (!supabaseConfigured) return { ok: false, error: PREVIEW_MSG };
  const supabase = await createClient();
  const { error } = await supabase.from("suppliers").insert({
    name: str(fd, "name"), contact_person: str(fd, "contact_person"), phone: str(fd, "phone"),
    email: str(fd, "email"), address: str(fd, "address"), vat_no: str(fd, "vat_no"),
    payment_terms: str(fd, "payment_terms"),
  });
  if (error) return { ok: false, error: error.message };
  revalidateAll();
  return { ok: true };
}

export async function deleteSupplier(id: string): Promise<ActionResult> {
  if (!supabaseConfigured) return { ok: false, error: PREVIEW_MSG };
  const supabase = await createClient();
  const { error } = await supabase.from("suppliers").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidateAll();
  return { ok: true };
}

// ── SALES / INVOICES ──

export async function createInvoice(fd: FormData): Promise<ActionResult> {
  if (!supabaseConfigured) return { ok: false, error: PREVIEW_MSG };
  const supabase = await createClient();
  const customer_id = str(fd, "customer_id");
  if (!customer_id) return { ok: false, error: "Select a customer." };
  const items_json = str(fd, "items");
  if (!items_json) return { ok: false, error: "Add at least one item." };
  let items: { item_id: string; barcode: string | null; description: string | null; quantity: number; price: number }[];
  try { items = JSON.parse(items_json); } catch { return { ok: false, error: "Invalid items data." }; }

  const subtotal = items.reduce((s, i) => s + i.quantity * i.price, 0);
  const discount_pct = num(fd, "discount_pct");
  const discount_amount = subtotal * (discount_pct / 100);
  const vat_pct = num(fd, "vat_pct");
  const vatable = subtotal - discount_amount;
  const vat_amount = vatable * (vat_pct / 100);
  const total = vatable + vat_amount;
  const amount_paid = num(fd, "amount_paid");
  const payment_method = str(fd, "payment_method") ?? "cash";
  const balance_due = total - amount_paid;
  const payment_status = balance_due <= 0 ? "paid" : amount_paid > 0 ? "partial" : "unpaid";

  const { data: { user } } = await supabase.auth.getUser();

  // Get next invoice number
  const seqNum = Math.floor(Math.random() * 9000 + 1000);
  const invoice_number = `INV-2026-${String(seqNum).padStart(4, "0")}`;

  const { data: invoice, error: invErr } = await supabase.from("sales_invoices").insert({
    invoice_number, customer_id, invoice_date: str(fd, "invoice_date") ?? new Date().toISOString().split("T")[0],
    subtotal, discount_pct, discount_amount, vat_pct, vat_amount, total,
    payment_method, payment_status, amount_paid, balance_due, notes: str(fd, "notes"), created_by: user?.id ?? null,
  }).select("id").single();
  if (invErr) return { ok: false, error: invErr.message };

  const invoiceId = invoice.id;
  const saleItems = items.map((i) => ({ invoice_id: invoiceId, ...i }));
  const { error: itemsErr } = await supabase.from("sale_items").insert(saleItems);
  if (itemsErr) return { ok: false, error: itemsErr.message };

  // Update price history
  for (const item of items) {
    await supabase.from("sale_price_history").upsert({
      customer_id, item_id: item.item_id, last_price: item.price, last_sale_date: new Date().toISOString(),
    }, { onConflict: "customer_id,item_id", ignoreDuplicates: false });
  }

  // Add credit ledger entry
  await supabase.from("credit_ledger").insert({
    customer_id, type: "sale", amount: total, reference: invoice_number, invoice_id: invoiceId,
    notes: str(fd, "notes"), created_by: user?.id ?? null,
  });

  // Add payment to ledger
  if (amount_paid > 0) {
    await supabase.from("credit_ledger").insert({
      customer_id, type: "payment", amount: -amount_paid, reference: `${payment_method} payment`, invoice_id: invoiceId,
      created_by: user?.id ?? null,
    });
  }

  revalidateAll();
  return { ok: true, error: invoice_number };
}

export async function recordReturn(fd: FormData): Promise<ActionResult> {
  if (!supabaseConfigured) return { ok: false, error: PREVIEW_MSG };
  const supabase = await createClient();
  const item_id = str(fd, "item_id");
  const customer_id = str(fd, "customer_id");
  const invoice_id = str(fd, "invoice_id");
  if (!item_id) return { ok: false, error: "Select an item." };
  const quantity = Math.abs(num(fd, "quantity"));
  if (quantity <= 0) return { ok: false, error: "Quantity must be positive." };
  const amount = fnum(fd, "amount");
  const { data: { user } } = await supabase.auth.getUser();

  // Record stock movement (return = +stock)
  const { error: movErr } = await supabase.from("stock_movements").insert({
    item_id, type: "return", quantity, note: str(fd, "reason"), store_id: str(fd, "store_id"),
    reference_type: "return", reference_id: invoice_id, created_by: user?.id ?? null,
  });
  if (movErr) return { ok: false, error: movErr.message };

  // Add credit ledger entry (return = negative amount, reduces customer balance)
  if (customer_id) {
    await supabase.from("credit_ledger").insert({
      customer_id, type: "return", amount: -amount, reference: `Return: ${str(fd, "reason") ?? item_id}`,
      invoice_id: invoice_id ?? null, created_by: user?.id ?? null,
    });
  }

  revalidateAll();
  return { ok: true };
}

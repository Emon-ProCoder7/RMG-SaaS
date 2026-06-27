import "server-only";
import { createClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/config";
import { MOCK_CATEGORIES, MOCK_ITEMS, MOCK_MOVEMENTS } from "./mock";
import { MOCK_CUSTOMERS, MOCK_SUPPLIERS, MOCK_INVOICES, MOCK_SALE_ITEMS, MOCK_SALE_PRICES, MOCK_CREDIT_LEDGER, MOCK_PURCHASE_ORDERS, MOCK_STORE } from "@/lib/mock";
import type { Category, Customer, DashboardStats, ItemWithCategory, MovementWithItem, Supplier, SaleInvoiceWithCustomer, SaleItem, SalePriceHistory, CreditLedger, PurchaseOrder } from "./types";

async function sb(): Promise<ReturnType<typeof createClient>> {
  return await createClient();
}

async function queryOrMock<T>(key: string, fn: () => Promise<T>, mock: T): Promise<T> {
  if (!supabaseConfigured) return mock;
  try { return await fn(); } catch { return mock; }
}

export async function getItems(): Promise<ItemWithCategory[]> {
  return queryOrMock("items", async () => {
    const supabase = await sb();
    const { data, error } = await supabase.from("items").select("*, category:categories(id, name)").order("name");
    if (error) throw error;
    return (data ?? []) as ItemWithCategory[];
  }, MOCK_ITEMS);
}

export async function getCategories(): Promise<Category[]> {
  return queryOrMock("categories", async () => {
    const supabase = await sb();
    const { data, error } = await supabase.from("categories").select("*").order("name");
    if (error) throw error;
    return (data ?? []) as Category[];
  }, MOCK_CATEGORIES);
}

export async function getRecentMovements(limit = 8): Promise<MovementWithItem[]> {
  return queryOrMock("movements", async () => {
    const supabase = await sb();
    const { data, error } = await supabase.from("stock_movements").select("*, item:items(id, name, sku, unit)").order("created_at", { ascending: false }).limit(limit);
    if (error) throw error;
    return (data ?? []) as MovementWithItem[];
  }, MOCK_MOVEMENTS.slice(0, limit));
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const items = await getItems();
  return {
    totalItems: items.length,
    totalUnits: items.reduce((s, i) => s + Number(i.quantity), 0),
    inventoryValue: items.reduce((s, i) => s + Number(i.quantity) * Number(i.cost_price), 0),
    lowStockCount: items.filter((i) => Number(i.quantity) <= Number(i.reorder_level)).length,
  };
}

export async function getCustomers(): Promise<Customer[]> {
  return queryOrMock("customers", async () => {
    const supabase = await sb();
    const { data, error } = await supabase.from("customers").select("*").order("name");
    if (error) throw error;
    return (data ?? []) as Customer[];
  }, MOCK_CUSTOMERS);
}

export async function getCustomerLedger(customerId: string): Promise<CreditLedger[]> {
  return queryOrMock("ledger", async () => {
    const supabase = await sb();
    const { data, error } = await supabase.from("credit_ledger").select("*").eq("customer_id", customerId).order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as CreditLedger[];
  }, MOCK_CREDIT_LEDGER.filter((l) => l.customer_id === customerId));
}

export async function getCustomerBalance(customerId: string): Promise<number> {
  const ledger = await getCustomerLedger(customerId);
  return ledger.reduce((s, l) => s + Number(l.amount), 0);
}

export async function getSuppliers(): Promise<Supplier[]> {
  return queryOrMock("suppliers", async () => {
    const supabase = await sb();
    const { data, error } = await supabase.from("suppliers").select("*").order("name");
    if (error) throw error;
    return (data ?? []) as Supplier[];
  }, MOCK_SUPPLIERS);
}

export async function getInvoices(): Promise<SaleInvoiceWithCustomer[]> {
  return queryOrMock("invoices", async () => {
    const supabase = await sb();
    const { data, error } = await supabase.from("sales_invoices").select("*, customer:customers(id, name)").order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as SaleInvoiceWithCustomer[];
  }, MOCK_INVOICES);
}

export async function getInvoicesByCustomer(customerId: string): Promise<SaleInvoiceWithCustomer[]> {
  return queryOrMock("invoices", async () => {
    const supabase = await sb();
    const { data, error } = await supabase.from("sales_invoices").select("*, customer:customers(id, name)").eq("customer_id", customerId).order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as SaleInvoiceWithCustomer[];
  }, MOCK_INVOICES.filter((i) => i.customer_id === customerId));
}

export async function getSaleItems(invoiceId: string): Promise<SaleItem[]> {
  return queryOrMock("sale_items", async () => {
    const supabase = await sb();
    const { data, error } = await supabase.from("sale_items").select("*").eq("invoice_id", invoiceId);
    if (error) throw error;
    return (data ?? []) as SaleItem[];
  }, MOCK_SALE_ITEMS.filter((i) => i.invoice_id === invoiceId));
}

export async function getSalePriceHistory(customerId: string, itemId: string): Promise<SalePriceHistory | null> {
  const all = await queryOrMock("sale_price_history", async () => {
    const supabase = await sb();
    const { data, error } = await supabase.from("sale_price_history").select("*").eq("customer_id", customerId).eq("item_id", itemId).maybeSingle();
    if (error) return [];
    return data ? [data as SalePriceHistory] : [];
  }, MOCK_SALE_PRICES.filter((p) => p.customer_id === customerId && p.item_id === itemId));
  return all.length > 0 ? all[0] : null;
}

export async function getPurchaseOrders(): Promise<PurchaseOrder[]> {
  return queryOrMock("purchase_orders", async () => {
    const supabase = await sb();
    const { data, error } = await supabase.from("purchase_orders").select("*, supplier:suppliers(name)").order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as PurchaseOrder[];
  }, MOCK_PURCHASE_ORDERS);
}

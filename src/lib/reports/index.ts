import "server-only";
import { createClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/config";

export type ProfitRow = { itemId: string; itemName: string; qtySold: number; revenue: number; cost: number; profit: number; margin: number };
export type BestSeller = { itemId: string; itemName: string; qtySold: number; revenue: number; pctOfTotal: number };
export type ForecastPoint = { period: string; actual: number; predicted: number | null };
export type ZakatResult = { totalAssets: number; zakatDue: number; nisabMet: boolean; details: ZakatDetail[] };
type ZakatDetail = { label: string; amount: number };
type ReorderRec = { id: string; name: string; sku: string; currentStock: number; reorderLevel: number; suggestedQty: number };

const MOCK_ITEMS_FLAT = [
  { id: "i1", name: "Cotton Twill 240gsm", cost_price: 3.2 },
  { id: "i2", name: "Polyester Lining", cost_price: 1.1 },
  { id: "i3", name: "YKK Zipper 18cm", cost_price: 0.18 },
  { id: "i4", name: "Woven Brand Label", cost_price: 0.05 },
  { id: "i5", name: "Mens Polo Shirt - M", cost_price: 4.8 },
  { id: "i6", name: "Mens Polo Shirt - L", cost_price: 4.8 },
];

const MOCK_SALE_ITEMS_FLAT = [
  { item_id: "i5", quantity: 5, total: 52.5 },
  { item_id: "i6", quantity: 3, total: 31.5 },
  { item_id: "i1", quantity: 10, total: 31.5 },
  { item_id: "i5", quantity: 20, total: 220.0 },
  { item_id: "i1", quantity: 5, total: 25.0 },
];

async function sb() {
  return await createClient();
}

async function queryOrMock<T>(fn: () => Promise<T>, mock: T): Promise<T> {
  if (!supabaseConfigured) return mock;
  try { return await fn(); } catch { return mock; }
}

// ── Profit & Loss ──

export async function getProfitReport(): Promise<{ rows: ProfitRow[]; totalRevenue: number; totalCost: number; totalProfit: number; overallMargin: number }> {
  return queryOrMock(async () => {
    const supabase = await sb();
    const { data: items, error: itemErr } = await supabase.from("items").select("id, name, cost_price");
    if (itemErr) throw itemErr;
    const { data: saleItems, error: siErr } = await supabase.from("sale_items").select("item_id, quantity, price, total");
    if (siErr) throw siErr;

    const itemMap = new Map((items ?? []).map((i: any) => [i.id, i]));
    const byItem = new Map<string, { qty: number; revenue: number }>();

    for (const si of saleItems ?? []) {
      if (!si.item_id) continue;
      const e = byItem.get(si.item_id) ?? { qty: 0, revenue: 0 };
      e.qty += Number(si.quantity);
      e.revenue += Number(si.total);
      byItem.set(si.item_id, e);
    }

    const rows: ProfitRow[] = [];
    let totalRevenue = 0, totalCost = 0;
    for (const [itemId, d] of byItem) {
      const item = itemMap.get(itemId);
      const cost = d.qty * Number(item?.cost_price ?? 0);
      const profit = d.revenue - cost;
      totalRevenue += d.revenue;
      totalCost += cost;
      rows.push({
        itemId, itemName: item?.name ?? "Unknown",
        qtySold: d.qty, revenue: d.revenue, cost, profit,
        margin: d.revenue > 0 ? (profit / d.revenue) * 100 : 0,
      });
    }
    rows.sort((a, b) => b.profit - a.profit);
    return { rows, totalRevenue, totalCost, totalProfit: totalRevenue - totalCost, overallMargin: totalRevenue > 0 ? ((totalRevenue - totalCost) / totalRevenue) * 100 : 0 };
  }, getMockProfitReport());
}

export async function getBestSellers(): Promise<BestSeller[]> {
  return queryOrMock(async () => {
    const data = await getProfitReport();
    const total = data.totalRevenue;
    return data.rows.map((r) => ({
      itemId: r.itemId, itemName: r.itemName, qtySold: r.qtySold, revenue: r.revenue,
      pctOfTotal: total > 0 ? (r.revenue / total) * 100 : 0,
    })).slice(0, 10);
  }, getMockBestSellers());
}

// ── Reorder Recommendations ──

export async function getReorderRecommendations(): Promise<ReorderRec[]> {
  return queryOrMock(async () => {
    const supabase = await sb();
    const { data, error } = await supabase
      .from("items")
      .select("id, name, sku, quantity, reorder_level")
      .order("quantity", { ascending: true });

    if (error) throw error;

    return (data ?? [])
      .filter((i: any) => Number(i.quantity) <= Number(i.reorder_level))
      .map((i: any) => {
        const reorderLevel = Number(i.reorder_level);
        const currentStock = Number(i.quantity);
        const suggestedQty = Math.max(reorderLevel * 2 - currentStock, reorderLevel);
        return { id: i.id, name: i.name, sku: i.sku ?? "", currentStock, reorderLevel, suggestedQty };
      });
  }, getMockReorderRecommendations());
}

// ── Sales History (for demand forecasting) ──

export async function getSalesHistory(): Promise<{ date: string; qty: number }[]> {
  return queryOrMock(async () => {
    const supabase = await sb();
    const { data, error } = await supabase
      .from("sales_invoices")
      .select("invoice_date, total")
      .order("invoice_date", { ascending: true });

    if (error) throw error;

    const monthly = new Map<string, number>();
    for (const inv of data ?? []) {
      const d = new Date(inv.invoice_date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthly.set(key, (monthly.get(key) ?? 0) + Number(inv.total));
    }

    return Array.from(monthly.entries()).map(([date, qty]) => ({ date, qty: Math.round(qty / 1000) }));
  }, getMockSalesHistory());
}

// ── Demand Forecasting ──

export function forecastDemand(sales: { date: string; qty: number }[], periodsAhead = 4): { period: string; predicted: number }[] {
  if (sales.length < 2) return [];
  const values = sales.map((s) => s.qty);
  const n = values.length;
  const xMean = (n - 1) / 2;
  const yMean = values.reduce((a, b) => a + b, 0) / n;
  let num = 0, den = 0;
  for (let i = 0; i < n; i++) {
    num += (i - xMean) * (values[i] - yMean);
    den += (i - xMean) ** 2;
  }
  const slope = den !== 0 ? num / den : 0;
  const intercept = yMean - slope * xMean;
  const result: { period: string; predicted: number }[] = [];
  for (let i = 1; i <= periodsAhead; i++) {
    const pred = Math.max(0, Math.round(intercept + slope * (n - 1 + i)));
    result.push({ period: `Period ${n + i}`, predicted: pred });
  }
  return result;
}

// ── Zakat Calculator ──

export function calculateZakat(cashInBank: number, inventoryValue: number, receivables: number, payables: number): ZakatResult {
  const inventoryZakatable = inventoryValue * 0.85;
  const totalAssets = cashInBank + inventoryZakatable + receivables;
  const netZakatable = Math.max(0, totalAssets - payables);
  const nisabThreshold = 500000;
  const nisabMet = netZakatable >= nisabThreshold;
  const zakatDue = nisabMet ? netZakatable * 0.025 : 0;
  return {
    totalAssets: netZakatable,
    zakatDue: Math.round(zakatDue * 100) / 100,
    nisabMet,
    details: [
      { label: "Cash in Bank", amount: cashInBank },
      { label: "Inventory (85% zakatable)", amount: inventoryZakatable },
      { label: "Accounts Receivable", amount: receivables },
      { label: "Less: Accounts Payable", amount: -payables },
    ],
  };
}

// ── Mock fallbacks (kept for when supabase is not configured) ──

function getMockProfitReport() {
  const itemMap = new Map(MOCK_ITEMS_FLAT.map((i) => [i.id, i]));
  const byItem = new Map<string, { qty: number; revenue: number }>();
  for (const si of MOCK_SALE_ITEMS_FLAT) {
    if (!si.item_id) continue;
    const e = byItem.get(si.item_id) ?? { qty: 0, revenue: 0 };
    e.qty += Number(si.quantity);
    e.revenue += Number(si.total);
    byItem.set(si.item_id, e);
  }
  const rows: ProfitRow[] = [];
  let totalRevenue = 0, totalCost = 0;
  for (const [itemId, d] of byItem) {
    const item = itemMap.get(itemId);
    const cost = d.qty * Number(item?.cost_price ?? 0);
    const profit = d.revenue - cost;
    totalRevenue += d.revenue;
    totalCost += cost;
    rows.push({
      itemId, itemName: item?.name ?? "Unknown",
      qtySold: d.qty, revenue: d.revenue, cost, profit,
      margin: d.revenue > 0 ? (profit / d.revenue) * 100 : 0,
    });
  }
  rows.sort((a, b) => b.profit - a.profit);
  return { rows, totalRevenue, totalCost, totalProfit: totalRevenue - totalCost, overallMargin: totalRevenue > 0 ? ((totalRevenue - totalCost) / totalRevenue) * 100 : 0 };
}

function getMockBestSellers() {
  const data = getMockProfitReport();
  const total = data.totalRevenue;
  return data.rows.map((r) => ({
    itemId: r.itemId, itemName: r.itemName, qtySold: r.qtySold, revenue: r.revenue,
    pctOfTotal: total > 0 ? (r.revenue / total) * 100 : 0,
  })).slice(0, 10);
}

function getMockSalesHistory(): { date: string; qty: number }[] {
  return [
    { date: "2026-01", qty: 120 }, { date: "2026-02", qty: 150 },
    { date: "2026-03", qty: 140 }, { date: "2026-04", qty: 180 },
    { date: "2026-05", qty: 220 }, { date: "2026-06", qty: 250 },
  ];
}

function getMockReorderRecommendations(): ReorderRec[] {
  return [
    { id: "i2", name: "Polyester Lining", sku: "FAB-POLY", currentStock: 180, reorderLevel: 250, suggestedQty: 320 },
    { id: "i4", name: "Woven Brand Label", sku: "ACC-LBL", currentStock: 320, reorderLevel: 2000, suggestedQty: 3680 },
    { id: "i6", name: "Mens Polo Shirt - L", sku: "FG-POLO-L", currentStock: 90, reorderLevel: 200, suggestedQty: 310 },
  ];
}

import { Suspense } from "react";
import { getDashboardStats, getItems, getRecentMovements, getInvoices } from "@/lib/inventory/queries";
import { formatCurrency } from "@/lib/format";
import { IndustrialStatCard, StatCardSkeleton } from "@/components/industrial/stat-card";
import { IndustrialSectionHeader } from "@/components/industrial/section-header";
import { MiniBarChart } from "@/components/industrial/mini-chart";
import { IndustrialBgShapes } from "@/components/industrial/bg-shapes";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, TrendingUp, AlertTriangle, Layers, ShoppingCart, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { getBestSellers } from "@/lib/reports";
import type { BestSeller } from "@/lib/reports";

async function StatsGrid() {
  const stats = await getDashboardStats();
  const items = await getItems();
  const lowStockItems = items.filter((i) => Number(i.quantity) <= Number(i.reorder_level));
  const invoices = await getInvoices();
  const totalSales = invoices.reduce((s, i) => s + Number(i.total), 0);
  const monthlySales = [45, 52, 48, 61, 73, 85];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <IndustrialStatCard title="Total Inventory" value={String(stats.totalItems)} subtitle={`${stats.totalUnits} units`} icon={<Package className="h-4 w-4" />} accentColor="gold" />
      <IndustrialStatCard title="Inventory Value" value={formatCurrency(stats.inventoryValue)} subtitle="At cost" icon={<TrendingUp className="h-4 w-4" />} accentColor="amber" />
      <IndustrialStatCard title="Total Sales" value={formatCurrency(totalSales)} subtitle={`${invoices.length} invoices`} trend={{ dir: "up", pct: "12.5%" }} icon={<ShoppingCart className="h-4 w-4" />} accentColor="green" />
      <IndustrialStatCard title="Low Stock" value={String(stats.lowStockCount)} subtitle={stats.lowStockCount > 0 ? "Needs reorder" : "All stocked"} icon={<AlertTriangle className="h-4 w-4" />} accentColor="rose" />
    </div>
  );
}

async function BestSellersPanel() {
  const bestSellers = await getBestSellers();
  const maxPct = bestSellers.length > 0 ? bestSellers[0].pctOfTotal : 1;

  return (
    <Card className="border-0 shadow-md overflow-hidden bg-card">
      <CardContent className="p-5">
        <IndustrialSectionHeader title="Best Selling Products" subtitle="Top performers by revenue" />
        <div className="space-y-3">
          {bestSellers.slice(0, 5).map((item, i) => (
            <div key={item.itemId} className="group">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-amber-500/60 w-5">{i + 1}.</span>
                  <span className="text-sm font-medium text-amber-100">{item.itemName}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-semibold tabular-nums">{formatCurrency(item.revenue)}</span>
                  <span className="text-xs text-amber-400/50 ml-2">({item.qtySold} units)</span>
                </div>
              </div>
              <div className="h-1.5 bg-amber-900/30 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-500 group-hover:opacity-80" style={{ width: `${(item.pctOfTotal / maxPct) * 100}%` }} />
              </div>
            </div>
          ))}
          {bestSellers.length === 0 && <p className="text-sm text-amber-400/50 py-4 text-center">No sales data yet</p>}
        </div>
      </CardContent>
    </Card>
  );
}

async function LowStockPanel() {
  const items = await getItems();
  const lowStockItems = items.filter((i) => Number(i.quantity) <= Number(i.reorder_level));

  return (
    <Card className="border-0 shadow-md overflow-hidden bg-card">
      <CardContent className="p-5">
        <IndustrialSectionHeader title="Low Stock Alerts" subtitle={`${lowStockItems.length} items below reorder level`} />
        <div className="space-y-2">
          {lowStockItems.slice(0, 6).map((item) => {
            const pct = Number(item.quantity) / Number(item.reorder_level) * 100;
            return (
              <div key={item.id} className="flex items-center justify-between py-1.5 border-b border-rose-900/30 last:border-0">
                <div className="flex-1">
                  <p className="text-sm font-medium text-amber-100">{item.name}</p>
                  <p className="text-xs text-amber-400/50">{item.sku ?? "—"}</p>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="bg-rose-500/15 text-rose-300 border-rose-700/40 text-xs">
                    {Number(item.quantity)} / {item.reorder_level}
                  </Badge>
                  <div className="mt-1 h-1 w-20 bg-rose-900/30 rounded-full ml-auto">
                    <div className="h-full rounded-full bg-gradient-to-r from-rose-500 to-rose-400" style={{ width: `${Math.min(pct, 100)}%` }} />
                  </div>
                </div>
              </div>
            );
          })}
          {lowStockItems.length === 0 && <p className="text-sm text-green-400 py-4 text-center flex items-center justify-center gap-1"><TrendingUp className="h-4 w-4" /> All items are well stocked</p>}
        </div>
      </CardContent>
    </Card>
  );
}

async function MonthlySalesChart() {
  const monthlySales = [45, 52, 48, 61, 73, 85];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const invoices = await getInvoices();
  const prevTotal = 280000;
  const currTotal = invoices.reduce((s, i) => s + Number(i.total), 0);
  const growth = prevTotal > 0 ? ((currTotal - prevTotal) / prevTotal) * 100 : 0;

  return (
    <Card className="border-0 shadow-md overflow-hidden lg:col-span-1 bg-card">
      <CardContent className="p-5">
        <IndustrialSectionHeader title="Sales Trend" subtitle={growth >= 0 ? `↑ ${growth.toFixed(1)}% vs last period` : `↓ ${Math.abs(growth).toFixed(1)}% vs last period`} />
        <div className="flex items-end gap-2 h-40 mt-2">
          {monthlySales.map((v, i) => {
            const max = Math.max(...monthlySales, 1);
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1 justify-end">
                <span className="text-[10px] text-amber-400/60 tabular-nums font-medium">{v}K</span>
                <div className="w-full rounded-t-sm transition-all duration-300 hover:opacity-80" style={{
                  height: `${(v / max) * 100}%`,
                  background: `linear-gradient(to top, #C79F5E${90 - i * 12}, #E8CA7E${80 - i * 10})`,
                  minHeight: 4,
                }} />
                <span className="text-[9px] text-amber-400/50">{months[i]}</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

async function RecentActivityPanel() {
  const movements = await getRecentMovements(6);
  const MOVEMENT_ICONS = { in: "↓", out: "↑", adjust: "↔", damage: "✕", return: "↩", transfer_in: "→", transfer_out: "←" } as const;
  const MOVEMENT_COLORS = { in: "text-green-400 bg-green-500/15", out: "text-rose-400 bg-rose-500/15", adjust: "text-amber-400 bg-amber-500/15", damage: "text-gray-400 bg-gray-500/15", return: "text-sky-400 bg-sky-500/15", transfer_in: "text-amber-300 bg-amber-500/10", transfer_out: "text-purple-400 bg-purple-500/15" } as const;

  return (
    <Card className="border-0 shadow-md overflow-hidden lg:col-span-1 bg-card">
      <CardContent className="p-5">
        <IndustrialSectionHeader title="Recent Activity" subtitle="Latest stock movements" />
        <div className="space-y-2">
          {movements.map((m) => {
            const icon = MOVEMENT_ICONS[m.type as keyof typeof MOVEMENT_ICONS] ?? "?";
            const color = MOVEMENT_COLORS[m.type as keyof typeof MOVEMENT_COLORS] ?? "bg-gray-500/15 text-gray-400";
            return (
              <div key={m.id} className="flex items-center gap-3 py-1.5 border-b border-amber-900/20 last:border-0">
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${color}`}>{icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-amber-100 truncate">{m.item?.name ?? "Unknown"}</p>
                  <p className="text-[11px] text-amber-400/50">{new Date(m.created_at).toLocaleDateString()}{m.note ? ` — ${m.note}` : ""}</p>
                </div>
                <span className={`text-sm font-bold tabular-nums ${m.type === "in" || m.type === "return" ? "text-green-400" : "text-rose-400"}`}>
                  {m.type === "in" || m.type === "return" ? "+" : "-"}{m.quantity}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  return (
    <div className="p-6 relative z-10">
      <IndustrialBgShapes />
      <div className="relative z-10">
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <span className="w-1.5 h-10 bg-gradient-to-b from-amber-500 to-amber-300 rounded-full" />
            <div>
              <h1 className="text-3xl font-bold text-amber-50 tracking-tight">Operations Dashboard</h1>
              <p className="text-sm text-amber-400/60 mt-0.5">RMG Manufacturing — Real-time overview</p>
            </div>
          </div>
        </div>

        <Suspense fallback={<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">{Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}</div>}>
          <StatsGrid />
        </Suspense>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Suspense fallback={<div className="h-72 rounded-xl bg-amber-900/15 animate-pulse" />}>
            <BestSellersPanel />
          </Suspense>
          <Suspense fallback={<div className="h-72 rounded-xl bg-amber-900/15 animate-pulse" />}>
            <LowStockPanel />
          </Suspense>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Suspense fallback={<div className="h-64 rounded-xl bg-amber-900/15 animate-pulse" />}>
            <MonthlySalesChart />
          </Suspense>
          <Suspense fallback={<div className="h-64 rounded-xl bg-amber-900/15 animate-pulse" />}>
            <RecentActivityPanel />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

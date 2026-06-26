import { Suspense } from "react";
import { getDashboardStats, getItems, getRecentMovements } from "@/lib/inventory/queries";
import { formatCurrency } from "@/lib/format";
import { AnimatedStatCard } from "@/components/dashboard/animated-stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const MOVEMENT_ICONS: Record<string, string> = { in: "↓", out: "↑", adjust: "↔", damage: "✕", return: "↩" };
const MOVEMENT_COLORS: Record<string, string> = { in: "text-green-600 bg-green-50", out: "text-red-600 bg-red-50", adjust: "text-amber-600 bg-amber-50", damage: "text-gray-600 bg-gray-100", return: "text-blue-600 bg-blue-50" };

async function StatsGrid() {
  const stats = await getDashboardStats();
  const items = await getItems();
  const lowStockItems = items.filter((i) => Number(i.quantity) <= Number(i.reorder_level));

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <AnimatedStatCard title="Total Items" value={String(stats.totalItems)} icon="📦" subtitle={`${stats.totalUnits} units in stock`} />
        <AnimatedStatCard title="Inventory Value" value={formatCurrency(stats.inventoryValue)} icon="💰" subtitle="At cost price" />
        <AnimatedStatCard title="Low Stock Items" value={String(stats.lowStockCount)} icon="⚠️" subtitle={stats.lowStockCount > 0 ? "Needs reorder" : "All good"} />
        <AnimatedStatCard title="Categories" value={String(new Set(items.map((i) => i.category?.name)).size)} icon="🏷️" subtitle="Active categories" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-md">
          <CardHeader><CardTitle className="text-lg text-indigo-800">Low Stock Alerts</CardTitle></CardHeader>
          <CardContent>
            {lowStockItems.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">All items are well stocked ✓</p>
            ) : (
              <div className="space-y-2">
                {lowStockItems.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-1.5 border-b border-amber-100 last:border-0">
                    <div>
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.sku ?? "No SKU"}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">{Number(item.quantity)} / {item.reorder_level}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <RecentMovementsSection />
      </div>
    </>
  );
}

async function RecentMovementsSection() {
  const movements = await getRecentMovements(7);

  return (
    <Card className="border-0 shadow-md">
      <CardHeader><CardTitle className="text-lg text-indigo-800">Recent Movements</CardTitle></CardHeader>
      <CardContent>
        {movements.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">No recent movements</p>
        ) : (
          <div className="space-y-2">
            {movements.map((m) => (
              <div key={m.id} className="flex items-center justify-between py-1.5 border-b border-indigo-100 last:border-0">
                <div className="flex items-center gap-2">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${MOVEMENT_COLORS[m.type] ?? "bg-gray-100"}`}>
                    {MOVEMENT_ICONS[m.type] ?? "?"}
                  </span>
                  <div>
                    <p className="text-sm">{m.item?.name ?? "Unknown item"}</p>
                    <p className="text-xs text-muted-foreground">{new Date(m.created_at).toLocaleDateString()}{m.note ? ` — ${m.note}` : ""}</p>
                  </div>
                </div>
                <Badge className={`${m.type === "in" || m.type === "return" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                  {m.type === "in" || m.type === "return" ? "+" : "-"}{m.quantity}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-indigo-900 mb-1">Dashboard</h1>
      <p className="text-sm text-muted-foreground mb-6">Welcome to RMG Operations — overview of your garment inventory</p>
      <Suspense fallback={<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}</div>}>
        <StatsGrid />
      </Suspense>
    </div>
  );
}

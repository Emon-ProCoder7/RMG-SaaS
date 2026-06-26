import { Suspense } from "react";
import { getDashboardStats, getItems, getInvoices, getPurchaseOrders } from "@/lib/inventory/queries";
import { formatCurrency } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

async function ReportCards() {
  const stats = await getDashboardStats();
  const items = await getItems();
  const invoices = await getInvoices();
  const orders = await getPurchaseOrders();

  const totalSales = invoices.reduce((s, i) => s + Number(i.total), 0);
  const totalPurchases = orders.reduce((s, o) => s + Number(o.total), 0);
  const topItems = [...items].sort((a, b) => Number(b.quantity) - Number(a.quantity)).slice(0, 10);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-md bg-gradient-to-br from-white to-green-50">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-green-800">Total Sales</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold text-green-900">{formatCurrency(totalSales)}</p><p className="text-xs text-muted-foreground mt-1">{invoices.length} invoices</p></CardContent>
        </Card>
        <Card className="border-0 shadow-md bg-gradient-to-br from-white to-amber-50">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-amber-800">Total Purchases</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold text-amber-900">{formatCurrency(totalPurchases)}</p><p className="text-xs text-muted-foreground mt-1">{orders.length} orders</p></CardContent>
        </Card>
        <Card className="border-0 shadow-md bg-gradient-to-br from-white to-indigo-50">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-indigo-800">Inventory Value</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold text-indigo-900">{formatCurrency(stats.inventoryValue)}</p><p className="text-xs text-muted-foreground mt-1">{stats.totalItems} items</p></CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-md">
        <CardHeader><CardTitle className="text-lg text-indigo-800">Top Stocked Items</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-1">
            {topItems.map((item, i) => (
              <div key={item.id} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-muted-foreground w-5">{i + 1}.</span>
                  <span className="text-sm">{item.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium">{Number(item.quantity)} {item.unit}</span>
                  <span className="text-xs text-muted-foreground ml-3">{formatCurrency(Number(item.quantity) * Number(item.cost_price))}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ReportsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-indigo-900 mb-6">Reports</h1>
      <Suspense fallback={<div className="grid grid-cols-1 md:grid-cols-3 gap-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}</div>}>
        <ReportCards />
      </Suspense>
    </div>
  );
}

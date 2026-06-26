import { Suspense } from "react";
import { getItems, getInvoices } from "@/lib/inventory/queries";
import { formatCurrency } from "@/lib/format";
import { IndustrialStatCard, StatCardSkeleton } from "@/components/industrial/stat-card";
import { IndustrialSectionHeader } from "@/components/industrial/section-header";
import { IndustrialBgShapes } from "@/components/industrial/bg-shapes";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DollarSign, TrendingUp, BarChart3, Calculator, ShoppingCart, RotateCcw } from "lucide-react";
import { getMockProfitReport, getMockBestSellers, getMockReorderRecommendations } from "@/lib/reports";
import { DemandForecastCard, ZakatCalculator } from "./components/report-widgets";

async function ProfitPanel() {
  const data = await getMockProfitReport();

  return (
    <section className="mb-8">
      <IndustrialSectionHeader title="Profit & Loss" subtitle="Revenue vs cost analysis" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <IndustrialStatCard title="Total Revenue" value={formatCurrency(data.totalRevenue)} icon={<DollarSign className="h-4 w-4" />} accentColor="emerald" />
        <IndustrialStatCard title="Total Cost" value={formatCurrency(data.totalCost)} icon={<TrendingUp className="h-4 w-4" />} accentColor="rose" />
        <IndustrialStatCard title="Net Profit" value={formatCurrency(data.totalProfit)} subtitle={`${data.overallMargin.toFixed(1)}% margin`} icon={<BarChart3 className="h-4 w-4" />} accentColor="amber" />
      </div>

      <Card className="border-0 shadow-md overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-indigo-50/60">
                <TableHead className="text-indigo-700 font-semibold text-xs uppercase tracking-wider">Product</TableHead>
                <TableHead className="text-indigo-700 font-semibold text-xs uppercase tracking-wider text-right">Units Sold</TableHead>
                <TableHead className="text-indigo-700 font-semibold text-xs uppercase tracking-wider text-right">Revenue</TableHead>
                <TableHead className="text-indigo-700 font-semibold text-xs uppercase tracking-wider text-right">Cost</TableHead>
                <TableHead className="text-indigo-700 font-semibold text-xs uppercase tracking-wider text-right">Profit</TableHead>
                <TableHead className="text-indigo-700 font-semibold text-xs uppercase tracking-wider text-right">Margin</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.rows.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-indigo-400">No sales data yet</TableCell></TableRow>
              ) : data.rows.map((row) => (
                <TableRow key={row.itemId} className="hover:bg-amber-50/30 transition-colors">
                  <TableCell className="font-medium text-indigo-800">{row.itemName}</TableCell>
                  <TableCell className="text-right tabular-nums">{row.qtySold}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatCurrency(row.revenue)}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatCurrency(row.cost)}</TableCell>
                  <TableCell className="text-right tabular-nums font-semibold">{formatCurrency(row.profit)}</TableCell>
                  <TableCell className="text-right">
                    <span className={`tabular-nums font-medium ${row.margin >= 20 ? "text-emerald-600" : row.margin >= 10 ? "text-amber-600" : "text-rose-600"}`}>
                      {row.margin.toFixed(1)}%
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </section>
  );
}

async function BestSellersPanel() {
  const bestSellers = await getMockBestSellers();
  const maxPct = bestSellers.length > 0 ? bestSellers[0].pctOfTotal : 1;

  return (
    <section className="mb-8">
      <IndustrialSectionHeader title="Best Selling Products" subtitle="Ranked by revenue contribution" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {bestSellers.slice(0, 5).map((item, i) => {
          const bars = [85, 65, 50, 30, 20];
          return (
            <Card key={item.itemId} className="border-0 shadow-md bg-gradient-to-br from-white to-indigo-50/30 overflow-hidden">
              <CardContent className="p-4 text-center">
                <span className="text-2xl font-bold text-indigo-200 block mb-1">#{i + 1}</span>
                <p className="text-sm font-semibold text-indigo-800 truncate">{item.itemName}</p>
                <p className="text-xs text-indigo-400 mb-3">{item.qtySold} units sold</p>
                <div className="flex items-end justify-center gap-1 h-16 mb-2">
                  {bars.map((h, j) => (
                    <div key={j} className="w-3 rounded-t-sm" style={{
                      height: `${h * (1 - j * 0.15)}%`,
                      background: `linear-gradient(to top, #D4A843, #E8C468)`,
                      opacity: 0.6 + j * 0.1,
                    }} />
                  ))}
                </div>
                <p className="text-lg font-bold text-amber-700 tabular-nums">{formatCurrency(item.revenue)}</p>
                <p className="text-[10px] text-indigo-400">{item.pctOfTotal.toFixed(1)}% of total</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}

async function ReorderPanel() {
  const recommendations = await getMockReorderRecommendations();

  return (
    <section className="mb-8">
      <IndustrialSectionHeader title="Inventory Reorder Recommendations" subtitle={`${recommendations.length} items need restocking`} />
      <Card className="border-0 shadow-md overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-indigo-50/60">
                <TableHead className="text-indigo-700 font-semibold text-xs uppercase tracking-wider">Product</TableHead>
                <TableHead className="text-indigo-700 font-semibold text-xs uppercase tracking-wider text-right">Current Stock</TableHead>
                <TableHead className="text-indigo-700 font-semibold text-xs uppercase tracking-wider text-right">Reorder Level</TableHead>
                <TableHead className="text-indigo-700 font-semibold text-xs uppercase tracking-wider text-right">Suggested Order</TableHead>
                <TableHead className="text-indigo-700 font-semibold text-xs uppercase tracking-wider">Urgency</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recommendations.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-indigo-400">All items well stocked</TableCell></TableRow>
              ) : recommendations.map((rec) => (
                <TableRow key={rec.id} className="hover:bg-amber-50/30 transition-colors">
                  <TableCell className="font-medium text-indigo-800">{rec.name}<span className="text-xs text-indigo-400 ml-2">{rec.sku}</span></TableCell>
                  <TableCell className="text-right tabular-nums text-rose-600 font-medium">{rec.currentStock}</TableCell>
                  <TableCell className="text-right tabular-nums">{rec.reorderLevel}</TableCell>
                  <TableCell className="text-right tabular-nums font-semibold text-emerald-600">{rec.suggestedQty}</TableCell>
                  <TableCell>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${rec.currentStock === 0 ? "bg-rose-100 text-rose-800" : rec.currentStock < rec.reorderLevel / 2 ? "bg-amber-100 text-amber-800" : "bg-indigo-100 text-indigo-800"}`}>
                      {rec.currentStock === 0 ? "Critical" : rec.currentStock < rec.reorderLevel / 2 ? "Low" : "Normal"}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </section>
  );
}

export default function ReportsPage() {
  return (
    <div className="p-6 relative z-10">
      <IndustrialBgShapes />
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-8">
          <span className="w-1.5 h-10 bg-gradient-to-b from-amber-500 to-amber-300 rounded-full" />
          <div>
            <h1 className="text-3xl font-bold text-indigo-900 tracking-tight">Reports & Analytics</h1>
            <p className="text-sm text-indigo-400/70 mt-0.5">Profit, demand forecasting, inventory planning & Zakat</p>
          </div>
        </div>

        <Suspense fallback={<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">{Array.from({ length: 3 }).map((_, i) => <StatCardSkeleton key={i} />)}</div>}>
          <ProfitPanel />
        </Suspense>

        <Suspense fallback={<div className="h-48 rounded-xl bg-indigo-50/30 animate-pulse mb-8" />}>
          <BestSellersPanel />
        </Suspense>

        <Suspense fallback={<div className="h-64 rounded-xl bg-indigo-50/30 animate-pulse mb-8" />}>
          <ReorderPanel />
        </Suspense>

        <div className="mb-8">
          <Suspense fallback={<div className="h-80 rounded-xl bg-indigo-50/30 animate-pulse" />}>
            <DemandForecastCard />
          </Suspense>
        </div>

        <div className="mb-8">
          <ZakatCalculator />
        </div>
      </div>
    </div>
  );
}

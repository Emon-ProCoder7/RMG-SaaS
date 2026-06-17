import Link from "next/link";
import {
  Package,
  Boxes,
  DollarSign,
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  Settings2,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import {
  getDashboardStats,
  getItems,
  getRecentMovements,
} from "@/lib/inventory/queries";
import { formatCurrency, formatDateTime, formatNumber } from "@/lib/format";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const metadata = { title: "Dashboard · RMG Suite" };

const MOVE_META = {
  in: { icon: ArrowDownLeft, cls: "text-emerald-600" },
  out: { icon: ArrowUpRight, cls: "text-red-600" },
  adjust: { icon: Settings2, cls: "text-amber-600" },
} as const;

export default async function DashboardPage() {
  const [stats, items, movements] = await Promise.all([
    getDashboardStats(),
    getItems(),
    getRecentMovements(6),
  ]);

  const lowStock = items
    .filter((i) => Number(i.quantity) <= Number(i.reorder_level))
    .sort((a, b) => Number(a.quantity) - Number(b.quantity))
    .slice(0, 6);

  const cards = [
    { label: "Total items", value: formatNumber(stats.totalItems), icon: Package },
    { label: "Total units", value: formatNumber(stats.totalUnits), icon: Boxes },
    {
      label: "Inventory value",
      value: formatCurrency(stats.inventoryValue),
      icon: DollarSign,
    },
    {
      label: "Low stock",
      value: formatNumber(stats.lowStockCount),
      icon: AlertTriangle,
      alert: stats.lowStockCount > 0,
    },
  ];

  return (
    <div>
      <PageHeader title="Dashboard" description="Overview of your inventory." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {c.label}
              </CardTitle>
              <c.icon
                className={`size-4 ${c.alert ? "text-red-600" : "text-muted-foreground"}`}
              />
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-semibold tabular-nums ${c.alert ? "text-red-600" : ""}`}
              >
                {c.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Low stock</CardTitle>
            <Link href="/inventory" className="text-sm text-muted-foreground hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent>
            {lowStock.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Everything is above its reorder level. 🎉
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead className="text-right">Stock</TableHead>
                    <TableHead className="text-right">Reorder at</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lowStock.map((i) => (
                    <TableRow key={i.id}>
                      <TableCell className="font-medium">{i.name}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant="destructive">
                          {formatNumber(Number(i.quantity))} {i.unit}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-muted-foreground">
                        {formatNumber(Number(i.reorder_level))}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent movements</CardTitle>
            <Link href="/movements" className="text-sm text-muted-foreground hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent>
            {movements.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No stock movements yet.
              </p>
            ) : (
              <ul className="space-y-3">
                {movements.map((m) => {
                  const meta = MOVE_META[m.type];
                  const Icon = meta.icon;
                  return (
                    <li key={m.id} className="flex items-center gap-3 text-sm">
                      <Icon className={`size-4 shrink-0 ${meta.cls}`} />
                      <span className="flex-1 truncate">
                        <span className="font-medium">{m.item?.name ?? "—"}</span>
                        {m.note ? (
                          <span className="text-muted-foreground"> · {m.note}</span>
                        ) : null}
                      </span>
                      <span className="tabular-nums text-muted-foreground">
                        {m.type === "out" ? "−" : m.type === "in" ? "+" : "="}
                        {formatNumber(Number(m.quantity))}
                      </span>
                      <span className="w-20 shrink-0 text-right text-xs text-muted-foreground">
                        {formatDateTime(m.created_at)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

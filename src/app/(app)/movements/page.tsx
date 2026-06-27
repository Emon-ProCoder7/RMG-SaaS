import { ArrowDownLeft, ArrowUpRight, Settings2, RotateCcw, AlertTriangle, ArrowLeftRight } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { MovementsToolbar } from "@/components/inventory/movements-toolbar";
import { getItems, getRecentMovements } from "@/lib/inventory/queries";
import { formatDateTime, formatNumber } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const metadata = { title: "Stock Movements · RMG Suite" };

const TYPE_META: Record<string, { label: string; icon: React.ComponentType<{ className?: string }>; cls: string }> = {
  in: { label: "Stock in", icon: ArrowDownLeft, cls: "text-green-400" },
  out: { label: "Stock out", icon: ArrowUpRight, cls: "text-rose-400" },
  adjust: { label: "Adjust", icon: Settings2, cls: "text-amber-400" },
  transfer_in: { label: "Transfer in", icon: ArrowLeftRight, cls: "text-sky-400" },
  transfer_out: { label: "Transfer out", icon: ArrowLeftRight, cls: "text-purple-400" },
  damage: { label: "Damage", icon: AlertTriangle, cls: "text-rose-400" },
  return: { label: "Return", icon: RotateCcw, cls: "text-teal-400" },
};

export default async function MovementsPage() {
  const [movements, items] = await Promise.all([
    getRecentMovements(50),
    getItems(),
  ]);

  return (
    <div className="p-6">
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <span className="w-1.5 h-10 bg-gradient-to-b from-amber-500 to-amber-300 rounded-full" />
        <div>
          <h1 className="text-2xl font-bold text-amber-50">Stock Movements</h1>
          <p className="text-sm text-amber-400/60 mt-0.5">History of stock in, out and adjustments.</p>
        </div>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-black/20">
              <TableHead className="text-amber-200">When</TableHead>
              <TableHead className="text-amber-200">Item</TableHead>
              <TableHead className="text-amber-200">Type</TableHead>
              <TableHead className="text-amber-200 text-right">Qty</TableHead>
              <TableHead className="text-amber-200 hidden md:table-cell">Note</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {movements.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No movements yet.
                </TableCell>
              </TableRow>
            ) : (
              movements.map((m) => {
                const meta = TYPE_META[m.type];
                const Icon = meta.icon;
                return (
                  <TableRow key={m.id} className="hover:bg-amber-500/5">
                    <TableCell className="text-muted-foreground">
                      {formatDateTime(m.created_at)}
                    </TableCell>
                    <TableCell className="font-medium">
                      {m.item?.name ?? "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={meta.cls}>
                        <Icon className="size-3" />
                        {meta.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatNumber(Number(m.quantity))} {m.item?.unit ?? ""}
                    </TableCell>
                    <TableCell className="text-muted-foreground hidden md:table-cell">
                      {m.note ?? "—"}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

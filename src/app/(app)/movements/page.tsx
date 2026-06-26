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
  in: { label: "Stock in", icon: ArrowDownLeft, cls: "text-emerald-600" },
  out: { label: "Stock out", icon: ArrowUpRight, cls: "text-red-600" },
  adjust: { label: "Adjust", icon: Settings2, cls: "text-amber-600" },
  transfer_in: { label: "Transfer in", icon: ArrowLeftRight, cls: "text-blue-600" },
  transfer_out: { label: "Transfer out", icon: ArrowLeftRight, cls: "text-purple-600" },
  damage: { label: "Damage", icon: AlertTriangle, cls: "text-red-700" },
  return: { label: "Return", icon: RotateCcw, cls: "text-teal-600" },
};

export default async function MovementsPage() {
  const [movements, items] = await Promise.all([
    getRecentMovements(50),
    getItems(),
  ]);

  return (
    <div>
      <PageHeader title="Stock Movements" description="History of stock in, out and adjustments.">
        <MovementsToolbar items={items} />
      </PageHeader>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>When</TableHead>
              <TableHead>Item</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Qty</TableHead>
              <TableHead>Note</TableHead>
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
                  <TableRow key={m.id}>
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
                    <TableCell className="text-muted-foreground">
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

import { Suspense } from "react";
import { getPurchaseOrders } from "@/lib/inventory/queries";
import { formatCurrency } from "@/lib/format";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const STATUS_BADGES: Record<string, string> = {
  pending: "bg-amber-500/15 text-amber-300",
  received: "bg-green-500/15 text-green-300",
  cancelled: "bg-rose-500/15 text-rose-300",
};

async function PurchaseTable() {
  const orders = await getPurchaseOrders();

  return (
    <Card className="border-0 shadow-md bg-card">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-black/20">
              <TableHead className="font-semibold text-amber-200">PO #</TableHead>
              <TableHead className="font-semibold text-amber-200">Supplier</TableHead>
              <TableHead className="font-semibold text-amber-200">Order Date</TableHead>
              <TableHead className="font-semibold text-amber-200">Expected</TableHead>
              <TableHead className="font-semibold text-amber-200 text-right">Total</TableHead>
              <TableHead className="font-semibold text-amber-200 text-center">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No purchase orders yet.</TableCell></TableRow>
            ) : orders.map((po) => (
              <TableRow key={po.id} className="hover:bg-amber-500/5 transition-colors">
                <TableCell className="font-mono text-sm font-medium">{po.po_number}</TableCell>
                <TableCell>{(po as any).supplier?.name ?? "—"}</TableCell>
                <TableCell className="text-sm">{new Date(po.order_date).toLocaleDateString()}</TableCell>
                <TableCell className="text-sm">{po.expected_date ? new Date(po.expected_date).toLocaleDateString() : "—"}</TableCell>
                <TableCell className="text-right font-medium">{formatCurrency(po.total)}</TableCell>
                <TableCell className="text-center">
                  <Badge className={STATUS_BADGES[po.status] ?? "bg-gray-500/15"}>{po.status}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default function PurchasesPage() {
  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <span className="w-1.5 h-10 bg-gradient-to-b from-amber-500 to-amber-300 rounded-full" />
        <div>
          <h1 className="text-2xl font-bold text-amber-50">Purchase Orders</h1>
          <p className="text-sm text-amber-400/60 mt-0.5">Track orders from suppliers</p>
        </div>
      </div>
      <Suspense fallback={<Skeleton className="h-64 rounded-xl bg-amber-900/15" />}>
        <PurchaseTable />
      </Suspense>
    </div>
  );
}

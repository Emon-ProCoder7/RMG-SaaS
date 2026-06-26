import { Suspense } from "react";
import { getPurchaseOrders } from "@/lib/inventory/queries";
import { formatCurrency } from "@/lib/format";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const STATUS_BADGES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800", received: "bg-green-100 text-green-800", cancelled: "bg-red-100 text-red-800",
};

async function PurchaseTable() {
  const orders = await getPurchaseOrders();

  return (
    <Card className="border-0 shadow-md">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-indigo-50/50">
              <TableHead className="font-semibold text-indigo-800">PO #</TableHead>
              <TableHead className="font-semibold text-indigo-800">Supplier</TableHead>
              <TableHead className="font-semibold text-indigo-800">Order Date</TableHead>
              <TableHead className="font-semibold text-indigo-800">Expected</TableHead>
              <TableHead className="font-semibold text-indigo-800 text-right">Total</TableHead>
              <TableHead className="font-semibold text-indigo-800 text-center">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No purchase orders yet.</TableCell></TableRow>
            ) : orders.map((po) => (
              <TableRow key={po.id} className="hover:bg-amber-50/30 transition-colors">
                <TableCell className="font-mono text-sm font-medium">{po.po_number}</TableCell>
                <TableCell>{(po as any).supplier?.name ?? "—"}</TableCell>
                <TableCell className="text-sm">{new Date(po.order_date).toLocaleDateString()}</TableCell>
                <TableCell className="text-sm">{po.expected_date ? new Date(po.expected_date).toLocaleDateString() : "—"}</TableCell>
                <TableCell className="text-right font-medium">{formatCurrency(po.total)}</TableCell>
                <TableCell className="text-center">
                  <Badge className={STATUS_BADGES[po.status] ?? "bg-gray-100"}>{po.status}</Badge>
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-indigo-900">Purchase Orders</h1>
        <p className="text-sm text-muted-foreground">Track orders from suppliers</p>
      </div>
      <Suspense fallback={<Skeleton className="h-64 rounded-xl" />}>
        <PurchaseTable />
      </Suspense>
    </div>
  );
}

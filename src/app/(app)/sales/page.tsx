import { Suspense } from "react";
import Link from "next/link";
import { getInvoices, getSaleItems } from "@/lib/inventory/queries";
import { formatCurrency } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Printer } from "lucide-react";

const PAYMENT_BADGES: Record<string, string> = {
  paid: "bg-green-100 text-green-800", partial: "bg-amber-100 text-amber-800", unpaid: "bg-red-100 text-red-800",
};

async function InvoiceList() {
  const invoices = await getInvoices();

  return (
    <Card className="border-0 shadow-md">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-indigo-50/50">
              <TableHead className="font-semibold text-indigo-800">Invoice #</TableHead>
              <TableHead className="font-semibold text-indigo-800">Customer</TableHead>
              <TableHead className="font-semibold text-indigo-800">Date</TableHead>
              <TableHead className="font-semibold text-indigo-800 text-right">Total</TableHead>
              <TableHead className="font-semibold text-indigo-800 text-right">Paid</TableHead>
              <TableHead className="font-semibold text-indigo-800 text-right">Balance</TableHead>
              <TableHead className="font-semibold text-indigo-800 text-center">Status</TableHead>
              <TableHead className="font-semibold text-indigo-800 text-right">Print</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.length === 0 ? (
              <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No sales yet. Create your first invoice.</TableCell></TableRow>
            ) : invoices.map((inv) => (
              <TableRow key={inv.id} className="hover:bg-amber-50/30 transition-colors">
                <TableCell className="font-mono text-sm font-medium">{inv.invoice_number}</TableCell>
                <TableCell>{inv.customer?.name ?? "Walk-in"}</TableCell>
                <TableCell className="text-sm">{new Date(inv.invoice_date).toLocaleDateString()}</TableCell>
                <TableCell className="text-right font-medium">{formatCurrency(inv.total)}</TableCell>
                <TableCell className="text-right">{formatCurrency(inv.amount_paid)}</TableCell>
                <TableCell className="text-right">
                  <span className={inv.balance_due > 0 ? "text-amber-700 font-semibold" : "text-green-600"}>
                    {formatCurrency(inv.balance_due)}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <Badge className={PAYMENT_BADGES[inv.payment_status] ?? "bg-gray-100"}>
                    {inv.payment_status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Link href={`/sales/${inv.id}/print`}>
                    <Button variant="ghost" size="icon" className="h-8 w-8"><Printer className="h-3.5 w-3.5" /></Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default function SalesPage() {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-indigo-900">Sales / Invoicing</h1>
          <p className="text-sm text-muted-foreground">Create and manage sales invoices</p>
        </div>
        <Link href="/sales/new">
          <Button className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md hover:shadow-lg">
            <Plus className="h-4 w-4 mr-1" /> New Invoice
          </Button>
        </Link>
      </div>
      <Suspense fallback={<Skeleton className="h-64 rounded-xl" />}>
        <InvoiceList />
      </Suspense>
    </div>
  );
}

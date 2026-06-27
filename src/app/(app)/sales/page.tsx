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
import { DeleteButton } from "@/components/delete-button";
import { deleteInvoice } from "@/lib/inventory/actions";

const PAYMENT_BADGES: Record<string, string> = {
  paid: "bg-green-500/15 text-green-300",
  partial: "bg-amber-500/15 text-amber-300",
  unpaid: "bg-rose-500/15 text-rose-300",
};

async function InvoiceList() {
  const invoices = await getInvoices();

  return (
    <Card className="border-0 shadow-md bg-card">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-black/20">
              <TableHead className="font-semibold text-amber-200">Invoice #</TableHead>
              <TableHead className="font-semibold text-amber-200">Customer</TableHead>
              <TableHead className="font-semibold text-amber-200 hidden md:table-cell">Date</TableHead>
              <TableHead className="font-semibold text-amber-200 text-right">Total</TableHead>
              <TableHead className="font-semibold text-amber-200 text-right">Paid</TableHead>
              <TableHead className="font-semibold text-amber-200 text-right hidden md:table-cell">Balance</TableHead>
              <TableHead className="font-semibold text-amber-200 text-center">Status</TableHead>
              <TableHead className="font-semibold text-amber-200 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.length === 0 ? (
              <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No sales yet. Create your first invoice.</TableCell></TableRow>
            ) : invoices.map((inv) => (
              <TableRow key={inv.id} className="hover:bg-amber-500/5 transition-colors">
                <TableCell className="font-mono text-sm font-medium">{inv.invoice_number}</TableCell>
                <TableCell>{inv.customer?.name ?? "Walk-in"}</TableCell>
                <TableCell className="text-sm hidden md:table-cell">{new Date(inv.invoice_date).toLocaleDateString()}</TableCell>
                <TableCell className="text-right font-medium">{formatCurrency(inv.total)}</TableCell>
                <TableCell className="text-right">{formatCurrency(inv.amount_paid)}</TableCell>
                <TableCell className="text-right hidden md:table-cell">
                  <span className={inv.balance_due > 0 ? "text-amber-400 font-semibold" : "text-green-400"}>
                    {formatCurrency(inv.balance_due)}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <Badge className={PAYMENT_BADGES[inv.payment_status] ?? "bg-gray-500/15"}>
                    {inv.payment_status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Link href={`/sales/${inv.id}/print`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8"><Printer className="h-3.5 w-3.5" /></Button>
                    </Link>
                    <DeleteButton id={inv.id} label={inv.invoice_number} action={deleteInvoice} />
                  </div>
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
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <span className="w-1.5 h-10 bg-gradient-to-b from-amber-500 to-amber-300 rounded-full" />
          <div>
            <h1 className="text-2xl font-bold text-amber-50">Sales & Invoices</h1>
            <p className="text-sm text-amber-400/60 mt-0.5">View and manage all sales invoices</p>
          </div>
        </div>
        <Link href="/sales/new">
          <Button className="bg-gold-metallic text-black font-semibold hover:brightness-110 shadow-lg">
            <Plus className="h-4 w-4 mr-1" /> New Invoice
          </Button>
        </Link>
      </div>
      <Suspense fallback={<Skeleton className="h-64 w-full" />}>
        <InvoiceList />
      </Suspense>
    </div>
  );
}

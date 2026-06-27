"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Eye, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import type { Customer, SaleInvoiceWithCustomer, CreditLedger } from "@/lib/inventory/types";

type Props = { customer: Customer; initialBalance: number };

export function CustomerDetailDialog({ customer, initialBalance }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [invoices, setInvoices] = useState<SaleInvoiceWithCustomer[]>([]);
  const [ledger, setLedger] = useState<CreditLedger[]>([]);
  const [balance, setBalance] = useState(initialBalance);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetch(`/api/customers/${customer.id}`).then((r) => r.json()).then((d) => {
      if (d.invoices) setInvoices(d.invoices);
      if (d.ledger) setLedger(d.ledger);
      if (typeof d.balance === "number") setBalance(d.balance);
    }).finally(() => setLoading(false));
  }, [open, customer.id]);

  const balanceStatus = balance > 0 ? "text-amber-400" : "text-green-400";
  const creditUsed = customer.credit_limit > 0 ? (balance / customer.credit_limit) * 100 : 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="h-3.5 w-3.5" /></Button>} />
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-card to-amber-900/20 border-amber-800/30">
        <DialogHeader>
          <DialogTitle className="text-amber-100 text-lg">{customer.name}</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-amber-400" /></div>
        ) : (
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="space-y-1.5">
                <p><span className="text-muted-foreground">Mobile:</span> {customer.mobile ?? "—"}</p>
                <p><span className="text-muted-foreground">Phone:</span> {customer.phone ?? "—"}</p>
                <p><span className="text-muted-foreground">Email:</span> {customer.email ?? "—"}</p>
                <p><span className="text-muted-foreground">Address:</span> {customer.address ?? "—"}</p>
                {customer.name_ar && <p className="text-muted-foreground" dir="rtl">{customer.name_ar}</p>}
              </div>
              <div className="space-y-1.5">
                <p><span className="text-muted-foreground">Transport:</span> {customer.transport ?? "—"}</p>
                <p><span className="text-muted-foreground">VAT No.:</span> {customer.vat_no ?? "—"}</p>
                <p><span className="text-muted-foreground">Ledger Book:</span> {customer.ledger_book_no ?? "—"}</p>
                <p>
                  <span className="text-muted-foreground">Status:</span>{" "}
                  <span className={customer.is_active ? "text-green-400" : "text-rose-400"}>{customer.is_active ? "Active" : "Inactive"}</span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-lg bg-black/30 p-3 border border-amber-900/30">
                <p className="text-xs text-muted-foreground mb-0.5">Credit Limit</p>
                <p className="text-lg font-semibold text-amber-50">{formatCurrency(customer.credit_limit)}</p>
              </div>
              <div className="rounded-lg bg-black/30 p-3 border border-amber-900/30">
                <p className="text-xs text-muted-foreground mb-0.5">Current Balance</p>
                <p className={`text-lg font-semibold ${balanceStatus}`}>{formatCurrency(balance)}</p>
              </div>
              <div className="rounded-lg bg-black/30 p-3 border border-amber-900/30">
                <p className="text-xs text-muted-foreground mb-0.5">Credit Used</p>
                <p className={`text-lg font-semibold ${creditUsed > 80 ? "text-rose-400" : "text-amber-50"}`}>
                  {customer.credit_limit > 0 ? `${creditUsed.toFixed(1)}%` : "N/A"}
                </p>
              </div>
            </div>

            {invoices.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-amber-200 mb-2">Recent Invoices</h3>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {invoices.slice(0, 10).map((inv) => (
                    <div key={inv.id} className="flex items-center justify-between text-xs bg-black/20 rounded px-2.5 py-1.5">
                      <div>
                        <span className="font-medium text-amber-100">{inv.invoice_number}</span>
                        <span className="text-muted-foreground ml-2">{new Date(inv.invoice_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span>{formatCurrency(inv.total)}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                          inv.payment_status === "paid" ? "bg-green-500/15 text-green-300" :
                          inv.payment_status === "partial" ? "bg-amber-500/15 text-amber-300" :
                          "bg-rose-500/15 text-rose-300"
                        }`}>
                          {inv.payment_status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {ledger.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-amber-200 mb-2">Ledger Entries</h3>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {ledger.slice(0, 10).map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between text-xs bg-black/20 rounded px-2.5 py-1.5">
                      <div>
                        <span className={`font-medium ${entry.amount > 0 ? "text-amber-300" : "text-green-300"}`}>
                          {entry.type}
                        </span>
                        <span className="text-muted-foreground ml-2">{entry.reference ?? ""}</span>
                        {entry.notes && <span className="text-muted-foreground ml-2 italic">— {entry.notes}</span>}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={entry.amount > 0 ? "text-amber-400" : "text-green-400"}>
                          {entry.amount > 0 ? "+" : ""}{formatCurrency(entry.amount)}
                        </span>
                        <span className="text-muted-foreground">{new Date(entry.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {invoices.length === 0 && ledger.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No transaction history yet.</p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

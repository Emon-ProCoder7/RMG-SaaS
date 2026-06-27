"use client";

import { useState, useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import { recordReturn } from "@/lib/inventory/actions";
import type { Customer, ItemWithCategory } from "@/lib/inventory/types";
import { Loader2, Undo2 } from "lucide-react";

export default function ReturnsPage() {
  const animRef = useRef<HTMLDivElement>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [items, setItems] = useState<ItemWithCategory[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [itemId, setItemId] = useState("");
  const [invoiceId, setInvoiceId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [amount, setAmount] = useState(0);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    if (animRef.current) gsap.fromTo(animRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" });
    fetch("/api/inventory").then((r) => r.json()).then((d) => {
      if (d.customers) setCustomers(d.customers);
      if (d.items) { setItems(d.items.filter((i: ItemWithCategory) => Number(i.quantity) > 0)); }
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!itemId) { setMessage({ ok: false, text: "Select an item" }); return; }
    setSubmitting(true);
    setMessage(null);
    const fd = new FormData();
    fd.set("item_id", itemId);
    fd.set("customer_id", customerId);
    fd.set("invoice_id", invoiceId);
    fd.set("quantity", String(quantity));
    fd.set("amount", String(amount));
    fd.set("reason", reason);
    const result = await recordReturn(fd);
    setMessage({ ok: result.ok, text: result.error ?? "Return recorded successfully" });
    if (result.ok) { setItemId(""); setQuantity(1); setAmount(0); setReason(""); setInvoiceId(""); }
    setSubmitting(false);
  }

  return (
    <div className="p-6 max-w-3xl mx-auto" ref={animRef}>
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <span className="w-1.5 h-10 bg-gradient-to-b from-amber-500 to-amber-300 rounded-full" />
        <h1 className="text-2xl font-bold text-amber-50">Returns</h1>
      </div>

      <Card className="border-0 shadow-md bg-card">
        <CardHeader><CardTitle className="text-lg text-amber-100"><Undo2 className="h-5 w-5 inline mr-2" />Record a Return</CardTitle></CardHeader>
        <CardContent>
          {message && (
            <div className={`mb-4 p-3 rounded-lg text-sm ${message.ok ? "bg-green-500/15 text-green-300 border border-green-700/40" : "bg-rose-500/15 text-rose-300 border border-rose-700/40"}`}>
              {message.text}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Customer</Label>
                <Select value={customerId} onValueChange={(v: string | null) => v && setCustomerId(v)} items={Object.fromEntries(customers.map(c => [c.id, c.name]))}>
                  <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
                  <SelectContent>
                    {customers.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Invoice #</Label>
                <Input value={invoiceId} onChange={(e) => setInvoiceId(e.target.value)} placeholder="Optional" />
              </div>
              <div>
                <Label>Item *</Label>
                <Select value={itemId} onValueChange={(v: string | null) => v && setItemId(v)} items={Object.fromEntries(items.map(i => [i.id, i.name]))}>
                  <SelectTrigger><SelectValue placeholder="Select item..." /></SelectTrigger>
                  <SelectContent>
                    {items.map((i) => <SelectItem key={i.id} value={i.id}>{i.name} (Stock: {i.quantity})</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Quantity *</Label>
                <Input type="number" min={1} value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value) || 1)} />
              </div>
              <div>
                <Label>Return Amount (BDT)</Label>
                <Input type="number" step="0.01" value={amount} onChange={(e) => setAmount(parseFloat(e.target.value) || 0)} />
              </div>
              <div>
                <Label>Reason</Label>
                <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Damaged / Wrong item" />
              </div>
            </div>
            <Button type="submit" disabled={submitting} className="bg-gold-metallic text-black font-semibold shadow-md hover:brightness-110">
              {submitting && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
              Record Return
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

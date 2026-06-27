"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { gsap } from "@/lib/gsap";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Plus, Search, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { createInvoice } from "@/lib/inventory/actions";
import type { Customer, ItemWithCategory, SalePriceHistory } from "@/lib/inventory/types";
import { useRouter } from "next/navigation";

type LineItem = { tempId: string; itemId: string; barcode: string | null; description: string; qty: number; price: number; stock: number };

export default function NewSalePage() {
  const router = useRouter();
  const animRef = useRef<HTMLDivElement>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [items, setItems] = useState<ItemWithCategory[]>([]);
  const [customerId, setCustomerId] = useState<string>("");
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [priceHistory, setPriceHistory] = useState<Map<string, number>>(new Map());
  const [itemSearch, setItemSearch] = useState("");
  const [discountPct, setDiscountPct] = useState(0);
  const [vatPct, setVatPct] = useState(15);
  const [amountPaid, setAmountPaid] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("bank");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const onCustChange = (v: string | null) => v && setCustomerId(v);
  const onPayChange = (v: string | null) => v && setPaymentMethod(v);

  useEffect(() => {
    if (animRef.current) {
      gsap.fromTo(animRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" });
    }
  }, []);

  useEffect(() => {
    fetch("/api/inventory").then((r) => r.json()).then((d) => {
      if (d.customers) setCustomers(d.customers);
      if (d.items) setItems(d.items);
    });
  }, []);

  useEffect(() => {
    if (!customerId) { setPriceHistory(new Map()); return; }
    fetch(`/api/inventory?customer_id=${customerId}`).then((r) => r.json()).then((d) => {
      if (d.priceHistory) {
        const m = new Map<string, number>();
        d.priceHistory.forEach((p: SalePriceHistory) => m.set(p.item_id, p.last_price));
        setPriceHistory(m);
      }
    });
  }, [customerId]);

  const addLine = useCallback((item: ItemWithCategory) => {
    setLineItems((prev) => {
      const existing = prev.find((l) => l.itemId === item.id);
      if (existing) return prev.map((l) => l.itemId === item.id ? { ...l, qty: l.qty + 1 } : l);
      return [...prev, {
        tempId: crypto.randomUUID(), itemId: item.id, barcode: item.barcode ?? null,
        description: item.name, qty: 1,
        price: priceHistory.get(item.id) ?? Number(item.sale_price),
        stock: Number(item.quantity),
      }];
    });
    setItemSearch("");
  }, [priceHistory]);

  const updateLine = (tempId: string, field: "qty" | "price", value: number) => {
    setLineItems((prev) => prev.map((l) => l.tempId === tempId ? { ...l, [field]: value } : l));
  };

  const removeLine = (tempId: string) => setLineItems((prev) => prev.filter((l) => l.tempId !== tempId));

  const subtotal = lineItems.reduce((s, l) => s + l.qty * l.price, 0);
  const discountAmount = subtotal * (discountPct / 100);
  const vatable = subtotal - discountAmount;
  const vatAmount = vatable * (vatPct / 100);
  const total = vatable + vatAmount;
  const balanceDue = total - amountPaid;

  const filteredItems = items.filter((i) =>
    i.is_active !== false &&
    (i.name.toLowerCase().includes(itemSearch.toLowerCase()) || (i.barcode && i.barcode.includes(itemSearch)) || (i.sku && i.sku.includes(itemSearch)))
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!customerId) { setError("Select a customer"); return; }
    if (lineItems.length === 0) { setError("Add at least one item"); return; }
    setSubmitting(true);
    setError("");
    const fd = new FormData();
    fd.set("customer_id", customerId);
    fd.set("items", JSON.stringify(lineItems.map((l) => ({ item_id: l.itemId, barcode: l.barcode, description: l.description, quantity: l.qty, price: l.price }))));
    fd.set("discount_pct", String(discountPct));
    fd.set("vat_pct", String(vatPct));
    fd.set("amount_paid", String(amountPaid));
    fd.set("payment_method", paymentMethod);
    fd.set("notes", notes);
    fd.set("invoice_date", new Date().toISOString().split("T")[0]);
    const result = await createInvoice(fd);
    if (result.ok) {
      router.push("/sales");
    } else {
      setError(result.error ?? "Failed to create invoice");
      setSubmitting(false);
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto" ref={animRef}>
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <span className="w-1.5 h-10 bg-gradient-to-b from-amber-500 to-amber-300 rounded-full" />
        <h1 className="text-2xl font-bold text-amber-50">New Invoice</h1>
      </div>

      <form onSubmit={handleSubmit}>
        {error && <div className="mb-4 p-3 bg-rose-500/15 border border-rose-700/40 text-rose-300 rounded-lg text-sm">{error}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <Card className="border-0 shadow-md lg:col-span-2 bg-card">
            <CardHeader><CardTitle className="text-lg text-amber-100">Customer & Items</CardTitle></CardHeader>
            <CardContent>
              <div className="mb-4">
                <Label>Customer</Label>
                <Select value={customerId} onValueChange={onCustChange} items={Object.fromEntries(customers.map(c => [c.id, c.name]))}>
                  <SelectTrigger><SelectValue placeholder="Select customer..." /></SelectTrigger>
                  <SelectContent>
                    {customers.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}{c.name_ar ? ` (${c.name_ar})` : ""} {c.mobile ? `— ${c.mobile}` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search items by name, barcode, or SKU..."
                  value={itemSearch}
                  onChange={(e) => setItemSearch(e.target.value)}
                  className="pl-9"
                />
                {itemSearch && (
                  <div className="absolute z-10 top-full mt-1 left-0 right-0 bg-card border border-amber-800/40 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {filteredItems.length === 0 ? (
                      <p className="p-3 text-sm text-muted-foreground">No items found</p>
                    ) : filteredItems.map((item) => {
                      const prevPrice = priceHistory.get(item.id);
                      return (
                        <button key={item.id} type="button" onClick={() => addLine(item)}
                          className="w-full text-left p-2.5 hover:bg-amber-500/10 flex items-center justify-between text-sm transition-colors border-b border-amber-900/20">
                          <div>
                            <span className="font-medium">{item.name}</span>
                            {item.sku && <span className="text-xs text-muted-foreground ml-2">SKU: {item.sku}</span>}
                          </div>
                          <div className="text-right text-xs">
                            <span className="text-muted-foreground">Stock: {item.quantity}</span>
                            {prevPrice && <span className="ml-2 text-amber-400">Prev: ৳{prevPrice}</span>}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {lineItems.length > 0 && (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-black/20">
                      <TableHead className="text-amber-200">Item</TableHead>
                      <TableHead className="text-amber-200 text-center hidden md:table-cell">Stock</TableHead>
                      <TableHead className="text-amber-200 text-right">Qty</TableHead>
                      <TableHead className="text-amber-200 text-right">Price</TableHead>
                      <TableHead className="text-amber-200 text-right">Total</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lineItems.map((line) => (
                      <TableRow key={line.tempId} className="hover:bg-amber-500/5">
                        <TableCell>
                          <p className="font-medium text-sm">{line.description}</p>
                          {line.barcode && <p className="text-xs text-muted-foreground">{line.barcode}</p>}
                        </TableCell>
                        <TableCell className="text-center text-sm hidden md:table-cell">{line.stock}</TableCell>
                        <TableCell className="text-right">
                          <Input type="number" min={1} max={line.stock} value={line.qty}
                            onChange={(e) => updateLine(line.tempId, "qty", Math.max(1, Math.min(line.stock, parseInt(e.target.value) || 1)))}
                            className="w-20 h-8 text-right ml-auto" />
                        </TableCell>
                        <TableCell className="text-right">
                          <Input type="number" step="0.01" value={line.price}
                            onChange={(e) => updateLine(line.tempId, "price", parseFloat(e.target.value) || 0)}
                            className="w-24 h-8 text-right ml-auto" />
                          {priceHistory.has(line.itemId) && priceHistory.get(line.itemId) !== line.price && (
                            <p className="text-[10px] text-amber-400/60 mt-0.5">Prev: ৳{priceHistory.get(line.itemId)}</p>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(line.qty * line.price)}</TableCell>
                        <TableCell>
                          <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-rose-400" onClick={() => removeLine(line.tempId)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-card">
            <CardHeader><CardTitle className="text-lg text-amber-100">Summary</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
                <div className="flex justify-between text-sm items-center">
                  <span>Discount</span>
                  <div className="flex items-center gap-1">
                    <Input type="number" min={0} max={100} value={discountPct}
                      onChange={(e) => setDiscountPct(parseFloat(e.target.value) || 0)}
                      className="w-16 h-7 text-right" /><span className="text-xs">%</span>
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Disc. Amount</span>
                  <span className="text-rose-400">−{formatCurrency(discountAmount)}</span>
                </div>
                <div className="flex justify-between text-sm items-center">
                  <span>VAT</span>
                  <div className="flex items-center gap-1">
                    <Input type="number" min={0} max={100} value={vatPct}
                      onChange={(e) => setVatPct(parseFloat(e.target.value) || 0)}
                      className="w-16 h-7 text-right" /><span className="text-xs">%</span>
                  </div>
                </div>
                <div className="flex justify-between text-sm"><span>VAT Amount</span><span>{formatCurrency(vatAmount)}</span></div>
                <div className="border-t pt-2 flex justify-between font-bold text-lg text-amber-50">
                  <span>Total</span><span>{formatCurrency(total)}</span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <div>
                  <Label className="text-xs">Payment Method</Label>
                  <Select value={paymentMethod} onValueChange={onPayChange} items={{ cash: "Cash", bank: "Bank Transfer", credit: "Credit", bKash: "bKash", Nagad: "Nagad" }}>
                    <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="bank">Bank Transfer</SelectItem>
                      <SelectItem value="credit">Credit</SelectItem>
                      <SelectItem value="bKash">bKash</SelectItem>
                      <SelectItem value="Nagad">Nagad</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Amount Paid</Label>
                  <Input type="number" step="0.01" value={amountPaid}
                    onChange={(e) => setAmountPaid(parseFloat(e.target.value) || 0)}
                    className="h-8" />
                </div>
                <div className="flex justify-between text-sm font-semibold">
                  <span>Balance Due</span>
                  <span className={balanceDue > 0 ? "text-amber-400" : "text-green-400"}>{formatCurrency(balanceDue)}</span>
                </div>
                <div>
                  <Label className="text-xs">Notes</Label>
                  <Input value={notes} onChange={(e) => setNotes(e.target.value)} className="h-8" />
                </div>
              </div>

              <Button type="submit" disabled={submitting || lineItems.length === 0}
                className="w-full bg-gold-metallic text-black font-semibold shadow-md hover:brightness-110">
                {submitting && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                Create Invoice
              </Button>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { formatCurrency } from "@/lib/format";
import type { SaleInvoiceWithCustomer, SaleItem, Customer } from "@/lib/inventory/types";

export default function PrintInvoicePage() {
  const { id } = useParams();
  const printRef = useRef<HTMLDivElement>(null);
  const [invoice, setInvoice] = useState<SaleInvoiceWithCustomer | null>(null);
  const [items, setItems] = useState<SaleItem[]>([]);
  const [customer, setCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    fetch(`/api/invoice/${id}`).then((r) => r.json()).then((d) => {
      setInvoice(d.invoice);
      setItems(d.items);
      setCustomer(d.customer);
    });
  }, [id]);

  useEffect(() => {
    if (invoice) setTimeout(() => window.print(), 500);
  }, [invoice]);

  if (!invoice) return <div className="p-8 text-center text-muted-foreground">Loading invoice...</div>;

  const subtotal = items.reduce((s, i) => s + Number(i.total), 0);
  const isDubai = customer?.address?.toLowerCase().includes("dubai") || customer?.address?.toLowerCase().includes("uae") || customer?.address?.toLowerCase().includes("abu dhabi");

  return (
    <div ref={printRef}>
      <style>{`
        @page { margin: 8mm; }
        @media print {
          body { background: white !important; }
          body * { visibility: visible !important; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="no-print text-center mb-4">
        <button onClick={() => window.print()} className="px-4 py-2 bg-gold-metallic text-black font-semibold rounded-lg shadow-md hover:brightness-110">
          Print Invoice
        </button>
      </div>

      <div className="max-w-4xl mx-auto p-8" style={{ fontFamily: "'Courier New', monospace", background: "white", color: "#1a1a1a" }}>
        <div className="border-2 border-gray-800 p-6">
          <div className="text-center border-b-2 border-gray-800 pb-4 mb-4">
            {isDubai && customer?.name_ar && <h2 className="text-xl mb-1" dir="rtl">{customer.name_ar}</h2>}
            <div className="flex items-center justify-center gap-3 mb-2">
              <img src="/logo.png" alt="Labiba Fashion" className="h-10 w-10" />
              <h1 className="text-2xl font-bold">Labiba Fashion</h1>
            </div>
            <p className="text-sm">Dhaka, Bangladesh</p>
            <p className="text-xs">VAT Reg: 1234567890</p>
            <h2 className="text-lg font-bold mt-2">SALES INVOICE</h2>
            <p className="text-sm font-mono">#{invoice.invoice_number}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
            <div>
              <p className="font-bold">Bill To:</p>
              <p>{customer?.name ?? "Walk-in Customer"}</p>
              {customer?.name_ar && <p dir="rtl">{customer.name_ar}</p>}
              <p>{customer?.address ?? ""}</p>
              <p>{customer?.mobile ?? ""}</p>
            </div>
            <div className="text-right">
              <p><span className="font-bold">Date:</span> {new Date(invoice.invoice_date).toLocaleDateString()}</p>
              <p><span className="font-bold">Invoice #:</span> {invoice.invoice_number}</p>
              {customer?.vat_no && <p><span className="font-bold">VAT:</span> {customer.vat_no}</p>}
              {customer?.ledger_book_no && <p><span className="font-bold">Ledger:</span> {customer.ledger_book_no}</p>}
            </div>
          </div>

          <table className="w-full text-sm mb-4 border-collapse">
            <thead>
              <tr className="border-t-2 border-b-2 border-gray-800">
                <th className="text-left py-1">#</th>
                <th className="text-left py-1">Description</th>
                <th className="text-right py-1">Qty</th>
                <th className="text-right py-1">Price</th>
                <th className="text-right py-1">Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={item.id} className="border-b border-gray-300">
                  <td className="py-1">{i + 1}</td>
                  <td className="py-1">{item.description ?? "Item"}</td>
                  <td className="text-right py-1">{item.quantity}</td>
                  <td className="text-right py-1">{formatCurrency(Number(item.price))}</td>
                  <td className="text-right py-1">{formatCurrency(Number(item.total))}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end">
            <div className="w-64 text-sm">
              <div className="flex justify-between py-0.5"><span>Subtotal:</span><span>{formatCurrency(subtotal)}</span></div>
              {invoice.discount_pct > 0 && (
                <div className="flex justify-between py-0.5 text-red-600">
                  <span>Discount ({invoice.discount_pct}%):</span><span>−{formatCurrency(invoice.discount_amount)}</span>
                </div>
              )}
              {invoice.vat_pct > 0 && (
                <div className="flex justify-between py-0.5"><span>VAT ({invoice.vat_pct}%):</span><span>{formatCurrency(invoice.vat_amount)}</span></div>
              )}
              <div className="flex justify-between font-bold border-t-2 border-gray-800 pt-1 mt-1">
                <span>Total:</span><span>{formatCurrency(invoice.total)}</span>
              </div>
              <div className="flex justify-between py-0.5 text-green-700">
                <span>Paid:</span><span>{formatCurrency(invoice.amount_paid)}</span>
              </div>
              {invoice.balance_due > 0 && (
                <div className="flex justify-between py-0.5 text-amber-700 font-bold">
                  <span>Balance Due:</span><span>{formatCurrency(invoice.balance_due)}</span>
                </div>
              )}
            </div>
          </div>

          {isDubai && (
            <div className="text-center mt-6 text-sm border-t-2 border-gray-800 pt-3">
              <p dir="rtl">شكرا لك على عملك</p>
              <p>Thank you for your business</p>
            </div>
          )}

          <div className="text-center mt-4 text-xs text-gray-500 border-t border-gray-300 pt-2">
            <p>Labiba Fashion — Dhaka, Bangladesh | {invoice.invoice_number}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

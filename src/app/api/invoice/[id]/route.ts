import { NextRequest, NextResponse } from "next/server";
import { getSaleItems } from "@/lib/inventory/queries";
import { getCustomers } from "@/lib/inventory/queries";
import { getInvoices } from "@/lib/inventory/queries";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [invoices, items, customers] = await Promise.all([getInvoices(), getSaleItems(id), getCustomers()]);
  const invoice = invoices.find((i) => i.id === id) ?? null;
  const customer = invoice?.customer_id ? customers.find((c) => c.id === invoice.customer_id) ?? null : null;
  return NextResponse.json({ invoice, items, customer });
}

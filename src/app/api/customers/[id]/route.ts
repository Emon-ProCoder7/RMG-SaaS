import { NextRequest, NextResponse } from "next/server";
import { getCustomers, getInvoicesByCustomer, getCustomerLedger, getCustomerBalance } from "@/lib/inventory/queries";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [customers, invoices, ledger, balance] = await Promise.all([
    getCustomers(),
    getInvoicesByCustomer(id),
    getCustomerLedger(id),
    getCustomerBalance(id),
  ]);
  const customer = customers.find((c) => c.id === id) ?? null;
  return NextResponse.json({ customer, invoices, ledger, balance });
}

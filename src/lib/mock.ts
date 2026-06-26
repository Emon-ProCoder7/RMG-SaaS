import type { Customer, Supplier, SaleInvoice, SaleInvoiceWithCustomer, SaleItem, SalePriceHistory, CreditLedger, PurchaseOrder, PurchaseItem, Store } from "./inventory/types";
import { MOCK_CATEGORIES, MOCK_ITEMS, MOCK_MOVEMENTS } from "./inventory/mock";

export const MOCK_STORE: Store = {
  id: "s1", name: "Dhaka Factory", code: "DHC", location: "Dhaka, Bangladesh", is_active: true, created_at: "2026-01-01T00:00:00Z",
};

export const MOCK_CUSTOMERS: Customer[] = [
  { id: "c1", name: "Nuzmatul Haram", name_ar: "نزمة الحرام", mobile: "0541418210", phone: null, email: null, address: "Dubai, UAE", transport: null, vat_no: "VAT12345", ledger_book_no: "LB001", opening_bl: 0, credit_limit: 50000, picture_url: null, id_card_url: null, is_active: true, created_at: "2026-01-15T00:00:00Z" },
  { id: "c2", name: "Al Razi Textiles", name_ar: "الرازي للمنسوجات", mobile: "0559876543", phone: null, email: "info@alrazi.ae", address: "Abu Dhabi, UAE", transport: null, vat_no: "VAT67890", ledger_book_no: "LB002", opening_bl: 15000, credit_limit: 100000, picture_url: null, id_card_url: null, is_active: true, created_at: "2026-02-01T00:00:00Z" },
  { id: "c3", name: "Dhaka Fashion House", name_ar: null, mobile: "01712345678", phone: null, email: null, address: "Dhaka, Bangladesh", transport: null, vat_no: null, ledger_book_no: "LB003", opening_bl: 0, credit_limit: 25000, picture_url: null, id_card_url: null, is_active: true, created_at: "2026-03-10T00:00:00Z" },
];

export const MOCK_SUPPLIERS: Supplier[] = [
  { id: "sp1", name: "Hossain Textiles", contact_person: "Mr. Hossain", phone: "01711111111", email: "hossain@textiles.com", address: "Dhaka, Bangladesh", vat_no: "VAT11111", payment_terms: "Net 30", is_active: true, created_at: "2026-01-01T00:00:00Z" },
  { id: "sp2", name: "Dhaka Mills Ltd", contact_person: "Rafiq Ahmed", phone: "01722222222", email: "rafiq@dhakamills.com", address: "Gazipur, Bangladesh", vat_no: "VAT22222", payment_terms: "Net 45", is_active: true, created_at: "2026-01-01T00:00:00Z" },
  { id: "sp3", name: "YKK Bangladesh", contact_person: "Tanvir Hasan", phone: "01733333333", email: "tanvir@ykkbd.com", address: "Chittagong, Bangladesh", vat_no: "VAT33333", payment_terms: "Net 30", is_active: true, created_at: "2026-01-01T00:00:00Z" },
];

export const MOCK_SALE_PRICES: SalePriceHistory[] = [
  { id: "sp1", customer_id: "c1", item_id: "i5", last_price: 10.5, last_sale_date: "2026-05-15T00:00:00Z" },
  { id: "sp2", customer_id: "c1", item_id: "i6", last_price: 10.5, last_sale_date: "2026-05-15T00:00:00Z" },
  { id: "sp3", customer_id: "c2", item_id: "i5", last_price: 11.0, last_sale_date: "2026-06-01T00:00:00Z" },
  { id: "sp4", customer_id: "c2", item_id: "i1", last_price: 5.0, last_sale_date: "2026-06-01T00:00:00Z" },
];

export const MOCK_INVOICES: SaleInvoiceWithCustomer[] = [
  { id: "inv1", invoice_number: "INV-2026-0001", customer_id: "c1", store_id: "s1", invoice_date: "2026-05-15T00:00:00Z", subtotal: 115.5, discount_pct: 0, discount_amount: 0, vat_pct: 15, vat_amount: 17.33, total: 132.83, payment_method: "bank", payment_status: "paid", amount_paid: 132.83, balance_due: 0, notes: null, created_by: null, created_at: "2026-05-15T00:00:00Z", customer: { id: "c1", name: "Nuzmatul Haram" } },
  { id: "inv2", invoice_number: "INV-2026-0002", customer_id: "c2", store_id: "s1", invoice_date: "2026-06-01T00:00:00Z", subtotal: 250.0, discount_pct: 5, discount_amount: 12.5, vat_pct: 15, vat_amount: 35.63, total: 273.13, payment_method: "credit", payment_status: "partial", amount_paid: 100.0, balance_due: 173.13, notes: null, created_by: null, created_at: "2026-06-01T00:00:00Z", customer: { id: "c2", name: "Al Razi Textiles" } },
];

export const MOCK_SALE_ITEMS: SaleItem[] = [
  { id: "si1", invoice_id: "inv1", item_id: "i5", barcode: null, description: "Mens Polo Shirt - M", quantity: 5, price: 10.5, total: 52.5 },
  { id: "si2", invoice_id: "inv1", item_id: "i6", barcode: null, description: "Mens Polo Shirt - L", quantity: 3, price: 10.5, total: 31.5 },
  { id: "si3", invoice_id: "inv1", item_id: "i1", barcode: null, description: "Cotton Twill 240gsm", quantity: 10, price: 3.15, total: 31.5 },
  { id: "si4", invoice_id: "inv2", item_id: "i5", barcode: null, description: "Mens Polo Shirt - M", quantity: 20, price: 11.0, total: 220.0 },
  { id: "si5", invoice_id: "inv2", item_id: "i1", barcode: null, description: "Cotton Twill 240gsm", quantity: 5, price: 5.0, total: 25.0 },
];

export const MOCK_PURCHASE_ORDERS: PurchaseOrder[] = [
  { id: "po1", po_number: "PO-2026-0001", supplier_id: "sp1", store_id: "s1", order_date: "2026-05-01", expected_date: "2026-05-15", status: "received", subtotal: 15000, vat_amount: 0, total: 15000, notes: null, created_by: null, created_at: "2026-05-01T00:00:00Z" },
  { id: "po2", po_number: "PO-2026-0002", supplier_id: "sp3", store_id: "s1", order_date: "2026-06-01", expected_date: "2026-06-20", status: "pending", subtotal: 8000, vat_amount: 0, total: 8000, notes: null, created_by: null, created_at: "2026-06-01T00:00:00Z" },
];

export const MOCK_CREDIT_LEDGER: CreditLedger[] = [
  { id: "cl1", customer_id: "c1", type: "sale", amount: 132.83, reference: "INV-2026-0001", invoice_id: "inv1", notes: null, created_by: null, created_at: "2026-05-15T00:00:00Z" },
  { id: "cl2", customer_id: "c1", type: "payment", amount: -132.83, reference: "Bank Transfer", invoice_id: null, notes: "Full payment received", created_by: null, created_at: "2026-05-20T00:00:00Z" },
  { id: "cl3", customer_id: "c2", type: "sale", amount: 273.13, reference: "INV-2026-0002", invoice_id: "inv2", notes: null, created_by: null, created_at: "2026-06-01T00:00:00Z" },
  { id: "cl4", customer_id: "c2", type: "payment", amount: -100.0, reference: "Cash", invoice_id: null, notes: "Partial payment", created_by: null, created_at: "2026-06-05T00:00:00Z" },
];

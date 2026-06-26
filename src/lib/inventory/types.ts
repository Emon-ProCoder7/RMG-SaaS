export type Category = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
};

export type Store = {
  id: string;
  name: string;
  code: string;
  location: string | null;
  is_active: boolean;
  created_at: string;
};

export type Item = {
  id: string;
  name: string;
  sku?: string | null;
  barcode?: string | null;
  category_id?: string | null;
  store_id?: string | null;
  unit: string;
  quantity: number;
  reorder_level?: number;
  cost_price: number;
  sale_price: number;
  supplier_id?: string | null;
  supplier?: string | null;
  location?: string | null;
  color?: string | null;
  size?: string | null;
  season?: string | null;
  department?: string | null;
  image_url?: string | null;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
};

export type ItemWithCategory = Item & {
  category: Pick<Category, "id" | "name"> | null;
};

export type MovementType = "in" | "out" | "adjust" | "transfer_in" | "transfer_out" | "damage" | "return";

export type StockMovement = {
  id: string;
  item_id: string;
  store_id?: string | null;
  type: MovementType;
  quantity: number;
  reference_type?: string | null;
  reference_id?: string | null;
  note?: string | null;
  created_at: string;
  created_by?: string | null;
};

export type MovementWithItem = StockMovement & {
  item: Pick<Item, "id" | "name" | "sku" | "unit"> | null;
};

export type DashboardStats = {
  totalItems: number;
  totalUnits: number;
  inventoryValue: number;
  lowStockCount: number;
};

export type Supplier = {
  id: string;
  name: string;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  vat_no: string | null;
  payment_terms: string | null;
  is_active: boolean;
  created_at: string;
};

export type Customer = {
  id: string;
  name: string;
  name_ar: string | null;
  mobile: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  transport: string | null;
  vat_no: string | null;
  ledger_book_no: string | null;
  opening_bl: number;
  credit_limit: number;
  picture_url: string | null;
  id_card_url: string | null;
  is_active: boolean;
  created_at: string;
};

export type SaleInvoice = {
  id: string;
  invoice_number: string;
  customer_id: string | null;
  store_id: string | null;
  invoice_date: string;
  subtotal: number;
  discount_pct: number;
  discount_amount: number;
  vat_pct: number;
  vat_amount: number;
  total: number;
  payment_method: string;
  payment_status: string;
  amount_paid: number;
  balance_due: number;
  notes: string | null;
  created_by: string | null;
  created_at: string;
};

export type SaleItem = {
  id: string;
  invoice_id: string;
  item_id: string | null;
  barcode: string | null;
  description: string | null;
  quantity: number;
  price: number;
  total: number;
};

export type SaleInvoiceWithCustomer = SaleInvoice & {
  customer: Pick<Customer, "id" | "name"> | null;
};

export type SalePriceHistory = {
  id: string;
  customer_id: string;
  item_id: string;
  last_price: number;
  last_sale_date: string;
};

export type CreditLedger = {
  id: string;
  customer_id: string;
  type: "sale" | "payment" | "adjustment" | "return";
  amount: number;
  reference: string | null;
  invoice_id: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
};

export type PurchaseOrder = {
  id: string;
  po_number: string;
  supplier_id: string | null;
  store_id: string | null;
  order_date: string;
  expected_date: string | null;
  status: string;
  subtotal: number;
  vat_amount: number;
  total: number;
  notes: string | null;
  created_by: string | null;
  created_at: string;
};

export type PurchaseItem = {
  id: string;
  po_id: string;
  item_id: string | null;
  barcode: string | null;
  description: string | null;
  quantity: number;
  received_qty: number;
  unit_price: number;
  total: number;
};

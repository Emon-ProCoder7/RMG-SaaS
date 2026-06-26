-- ============================================================
-- RMG SaaS — COMPLETE SCHEMA (from scratch)
-- Single migration: base tables + all business modules
-- ============================================================

-- ---------------------------------------------------------------------------
-- 1. CATEGORIES
-- ---------------------------------------------------------------------------
create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 2. STORES
-- ---------------------------------------------------------------------------
create table if not exists public.stores (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  code        text not null unique,
  location    text,
  is_active   boolean default true,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 3. SUPPLIERS
-- ---------------------------------------------------------------------------
create table if not exists public.suppliers (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  contact_person  text,
  phone           text,
  email           text,
  address         text,
  vat_no          text,
  payment_terms   text,
  is_active       boolean default true,
  created_at      timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 4. CUSTOMERS
-- ---------------------------------------------------------------------------
create table if not exists public.customers (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  name_ar         text,
  mobile          text,
  phone           text,
  email           text,
  address         text,
  transport       text,
  vat_no          text,
  ledger_book_no  text,
  opening_bl      numeric not null default 0,
  credit_limit    numeric not null default 0,
  picture_url     text,
  id_card_url     text,
  is_active       boolean default true,
  created_at      timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 5. ITEMS (full with all columns)
-- ---------------------------------------------------------------------------
create table if not exists public.items (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  sku            text,
  barcode        text,
  category_id    uuid references public.categories(id) on delete set null,
  store_id       uuid references public.stores(id) on delete set null,
  unit           text not null default 'pcs',
  quantity       numeric not null default 0,
  reorder_level  numeric not null default 0,
  cost_price     numeric not null default 0,
  sale_price     numeric not null default 0,
  supplier_id    uuid references public.suppliers(id) on delete set null,
  supplier       text,
  location       text,
  color          text,
  size           text,
  season         text,
  department     text,
  image_url      text,
  is_active      boolean default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create unique index if not exists items_barcode_idx on public.items (barcode) where barcode is not null;
create index if not exists items_sku_idx on public.items (sku);
create index if not exists items_category_idx on public.items (category_id);
create index if not exists items_supplier_idx on public.items (supplier_id);
create index if not exists items_store_idx on public.items (store_id);

-- Default store
insert into public.stores (name, code, location) values ('Dhaka Factory', 'DHC', 'Dhaka, Bangladesh') on conflict (code) do nothing;

-- ---------------------------------------------------------------------------
-- 6. STOCK MOVEMENTS
-- ---------------------------------------------------------------------------
create table if not exists public.stock_movements (
  id              uuid primary key default gen_random_uuid(),
  item_id         uuid not null references public.items(id) on delete cascade,
  store_id        uuid references public.stores(id),
  type            text not null check (type in ('in','out','adjust','transfer_in','transfer_out','damage','return')),
  quantity        numeric not null,
  reference_type  text,
  reference_id    text,
  note            text,
  created_by      uuid references auth.users(id),
  created_at      timestamptz not null default now()
);

create index if not exists stock_movements_item_idx on public.stock_movements (item_id);
create index if not exists stock_movements_date_idx on public.stock_movements (created_at desc);
create index if not exists stock_movements_type_idx on public.stock_movements (type);

-- ---------------------------------------------------------------------------
-- 7. PURCHASE ORDERS
-- ---------------------------------------------------------------------------
create table if not exists public.purchase_orders (
  id              uuid primary key default gen_random_uuid(),
  po_number       text not null unique,
  supplier_id     uuid references public.suppliers(id),
  store_id        uuid references public.stores(id),
  order_date      date default current_date,
  expected_date   date,
  status          text not null default 'pending' check (status in ('pending','partial','received','cancelled')),
  subtotal        numeric not null default 0,
  vat_amount      numeric not null default 0,
  total           numeric not null default 0,
  notes           text,
  created_by      uuid references auth.users(id),
  created_at      timestamptz not null default now()
);

create table if not exists public.purchase_items (
  id              uuid primary key default gen_random_uuid(),
  po_id           uuid not null references public.purchase_orders(id) on delete cascade,
  item_id         uuid references public.items(id),
  barcode         text,
  description     text,
  quantity        numeric not null,
  received_qty    numeric not null default 0,
  unit_price      numeric not null,
  total           numeric generated always as (quantity * unit_price) stored
);

create index if not exists purchase_items_po_idx on public.purchase_items (po_id);
create index if not exists purchase_orders_supplier_idx on public.purchase_orders (supplier_id);
create index if not exists purchase_orders_date_idx on public.purchase_orders (order_date desc);

-- ---------------------------------------------------------------------------
-- 8. SALES INVOICES
-- ---------------------------------------------------------------------------
create table if not exists public.sales_invoices (
  id              uuid primary key default gen_random_uuid(),
  invoice_number  text not null unique,
  customer_id     uuid references public.customers(id),
  store_id        uuid references public.stores(id),
  invoice_date    date default current_date,
  subtotal        numeric not null default 0,
  discount_pct    numeric not null default 0,
  discount_amount numeric not null default 0,
  vat_pct         numeric not null default 0,
  vat_amount      numeric not null default 0,
  total           numeric not null default 0,
  payment_method  text not null default 'cash' check (payment_method in ('cash','bank','credit','bKash','Nagad','mixed')),
  payment_status  text not null default 'unpaid' check (payment_status in ('paid','partial','unpaid','cancelled')),
  amount_paid     numeric not null default 0,
  balance_due     numeric not null default 0,
  notes           text,
  created_by      uuid references auth.users(id),
  created_at      timestamptz not null default now()
);

create table if not exists public.sale_items (
  id              uuid primary key default gen_random_uuid(),
  invoice_id      uuid not null references public.sales_invoices(id) on delete cascade,
  item_id         uuid references public.items(id),
  barcode         text,
  description     text,
  quantity        numeric not null,
  price           numeric not null,
  total           numeric generated always as (quantity * price) stored
);

create table if not exists public.sale_price_history (
  id              uuid primary key default gen_random_uuid(),
  customer_id     uuid not null references public.customers(id) on delete cascade,
  item_id         uuid not null references public.items(id) on delete cascade,
  last_price      numeric not null,
  last_sale_date  timestamptz not null default now(),
  unique(customer_id, item_id)
);

create index if not exists sale_items_invoice_idx on public.sale_items (invoice_id);
create index if not exists sales_invoices_customer_idx on public.sales_invoices (customer_id);
create index if not exists sales_invoices_date_idx on public.sales_invoices (invoice_date desc);
create index if not exists sales_invoices_status_idx on public.sales_invoices (payment_status);
create index if not exists sale_price_history_customer_item_idx on public.sale_price_history (customer_id, item_id);

-- ---------------------------------------------------------------------------
-- 9. CREDIT LEDGER
-- ---------------------------------------------------------------------------
create table if not exists public.credit_ledger (
  id              uuid primary key default gen_random_uuid(),
  customer_id     uuid not null references public.customers(id),
  type            text not null check (type in ('sale','payment','adjustment','return')),
  amount          numeric not null,
  reference       text,
  invoice_id      uuid references public.sales_invoices(id),
  notes           text,
  created_by      uuid references auth.users(id),
  created_at      timestamptz not null default now()
);

create index if not exists credit_ledger_customer_idx on public.credit_ledger (customer_id);
create index if not exists credit_ledger_date_idx on public.credit_ledger (created_at desc);

-- ---------------------------------------------------------------------------
-- 10. STOCK TRANSFERS (future multi-store)
-- ---------------------------------------------------------------------------
create table if not exists public.stock_transfers (
  id              uuid primary key default gen_random_uuid(),
  transfer_number text not null unique,
  from_store_id   uuid references public.stores(id),
  to_store_id     uuid references public.stores(id),
  transfer_date   date default current_date,
  status          text not null default 'pending' check (status in ('pending','in_transit','received','cancelled')),
  notes           text,
  created_by      uuid references auth.users(id),
  created_at      timestamptz not null default now()
);

create table if not exists public.stock_transfer_items (
  id              uuid primary key default gen_random_uuid(),
  transfer_id     uuid not null references public.stock_transfers(id) on delete cascade,
  item_id         uuid references public.items(id),
  quantity        numeric not null
);

-- ---------------------------------------------------------------------------
-- 11. DAMAGE RECORDS
-- ---------------------------------------------------------------------------
create table if not exists public.damage_records (
  id              uuid primary key default gen_random_uuid(),
  item_id         uuid references public.items(id),
  store_id        uuid references public.stores(id),
  quantity        numeric not null,
  reason          text,
  damage_date     date default current_date,
  created_by      uuid references auth.users(id),
  created_at      timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 12. INVOICE AUTO-NUMBERING SEQUENCE
-- ---------------------------------------------------------------------------
create sequence if not exists public.invoice_number_seq start 1;

-- ---------------------------------------------------------------------------
-- 13. ROW LEVEL SECURITY
-- ---------------------------------------------------------------------------
alter table public.categories          enable row level security;
alter table public.stores              enable row level security;
alter table public.suppliers           enable row level security;
alter table public.customers           enable row level security;
alter table public.items               enable row level security;
alter table public.stock_movements     enable row level security;
alter table public.purchase_orders     enable row level security;
alter table public.purchase_items      enable row level security;
alter table public.sales_invoices      enable row level security;
alter table public.sale_items          enable row level security;
alter table public.sale_price_history  enable row level security;
alter table public.credit_ledger       enable row level security;
alter table public.stock_transfers     enable row level security;
alter table public.stock_transfer_items enable row level security;
alter table public.damage_records      enable row level security;

-- Authenticated user full access policies
create policy "authenticated all categories" on public.categories for all to authenticated using (true) with check (true);
create policy "authenticated all stores" on public.stores for all to authenticated using (true) with check (true);
create policy "authenticated all suppliers" on public.suppliers for all to authenticated using (true) with check (true);
create policy "authenticated all customers" on public.customers for all to authenticated using (true) with check (true);
create policy "authenticated all items" on public.items for all to authenticated using (true) with check (true);
create policy "authenticated all stock_movements" on public.stock_movements for all to authenticated using (true) with check (true);
create policy "authenticated all purchase_orders" on public.purchase_orders for all to authenticated using (true) with check (true);
create policy "authenticated all purchase_items" on public.purchase_items for all to authenticated using (true) with check (true);
create policy "authenticated all sales_invoices" on public.sales_invoices for all to authenticated using (true) with check (true);
create policy "authenticated all sale_items" on public.sale_items for all to authenticated using (true) with check (true);
create policy "authenticated all sale_price_history" on public.sale_price_history for all to authenticated using (true) with check (true);
create policy "authenticated all credit_ledger" on public.credit_ledger for all to authenticated using (true) with check (true);
create policy "authenticated all stock_transfers" on public.stock_transfers for all to authenticated using (true) with check (true);
create policy "authenticated all stock_transfer_items" on public.stock_transfer_items for all to authenticated using (true) with check (true);
create policy "authenticated all damage_records" on public.damage_records for all to authenticated using (true) with check (true);

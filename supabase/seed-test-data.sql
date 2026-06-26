-- ============================================================
-- RMG SaaS — COMPREHENSIVE TEST DATA
-- Run this in Supabase SQL Editor after migrations complete.
-- Covers all 15 tables with interconnected realistic data.
-- ============================================================

-- Clear existing data (safe to re-run)
delete from public.sale_price_history;
delete from public.sale_items;
delete from public.sales_invoices;
delete from public.credit_ledger;
delete from public.stock_movements;
delete from public.stock_transfer_items;
delete from public.stock_transfers;
delete from public.damage_records;
delete from public.purchase_items;
delete from public.purchase_orders;
delete from public.items;
delete from public.customers;
delete from public.suppliers;
delete from public.categories;
delete from public.stores;

-- Restart invoice sequence
alter sequence public.invoice_number_seq restart;

-- ============================================================
-- 1. STORES
-- ============================================================
insert into public.stores (id, name, code, location, is_active) values
  ('s1000000-0000-0000-0000-000000000001', 'Dhaka Factory', 'DHC', 'Dhaka, Bangladesh', true),
  ('s1000000-0000-0000-0000-000000000002', 'Chittagong Warehouse', 'CGC', 'Chittagong, Bangladesh', true);

-- ============================================================
-- 2. CATEGORIES
-- ============================================================
insert into public.categories (id, name, description) values
  ('c0000000-0000-0000-0000-000000000001', 'Fabrics', 'Cotton, polyester, blended textiles'),
  ('c0000000-0000-0000-0000-000000000002', 'Trims & Accessories', 'Zippers, buttons, labels, elastics'),
  ('c0000000-0000-0000-0000-000000000003', 'Packaging', 'Poly bags, cartons, hang tags'),
  ('c0000000-0000-0000-0000-000000000004', 'Finished Garments', 'Ready-to-ship apparel products'),
  ('c0000000-0000-0000-0000-000000000005', 'Washing & Dyeing', 'Chemicals and dyes');

-- ============================================================
-- 3. SUPPLIERS
-- ============================================================
insert into public.suppliers (id, name, contact_person, phone, email, address, vat_no, payment_terms, is_active) values
  ('sp000000-0000-0000-0000-000000000001', 'Bangladesh Textile Mills Ltd.', 'Rafiqul Islam', '+880-1711-111111', 'rafiq@btm.com.bd', '56 Karwan Bazar, Dhaka 1215', 'BTM-45678-VAT', 'net60', true),
  ('sp000000-0000-0000-0000-000000000002', 'Global Trim Suppliers', 'Sakib Hasan', '+880-1812-222222', 'sakib@globaltrim.com', '12 Nayapaltan, Dhaka 1000', 'GTS-23456-VAT', 'net30', true),
  ('sp000000-0000-0000-0000-000000000003', 'EcoPack Bangladesh', 'Fatima Begum', '+880-1913-333333', 'fatima@ecopack.com.bd', '78 Tejgaon I/A, Dhaka 1208', 'EPB-34567-VAT', 'net45', true),
  ('sp000000-0000-0000-0000-000000000004', 'DyeChem Ltd.', 'Mohammad Ali', '+880-1724-444444', 'ali@dyechem.com', '22 Rayer Bazar, Dhaka 1209', 'DCL-56789-VAT', 'net30', true);

-- ============================================================
-- 4. CUSTOMERS (Dubai & regional buyers)
-- ============================================================
insert into public.customers (id, name, name_ar, mobile, phone, email, address, transport, vat_no, ledger_book_no, opening_bl, credit_limit, is_active) values
  ('cu000000-0000-0000-0000-000000000001', 'Al-Futtaim Retail LLC', 'الفطيم للتجزئة', '+971-50-111-1111', '+971-4-222-2222', 'procurement@alfuttaim.ae', 'Dubai Festival City, Dubai, UAE', 'own', 'AE-1234567-001', 'LB-001', 0, 5000000, true),
  ('cu000000-0000-0000-0000-000000000002', 'Al Shaya Trading Co.', 'شركة الشايا التجارية', '+971-55-333-3333', '+971-4-444-4444', 'orders@alshaya.ae', 'Al Quoz 3, Dubai, UAE', 'courier', 'AE-2345678-002', 'LB-002', 250000, 3500000, true),
  ('cu000000-0000-0000-0000-000000000003', 'Lulu Hypermarket LLC', 'لولو هايبرماركت', '+971-50-555-5555', '+971-2-666-6666', 'garments@lulugroup.ae', 'Zayed The Second St, Abu Dhabi, UAE', 'own', 'AE-3456789-003', 'LB-003', 0, 8000000, true),
  ('cu000000-0000-0000-0000-000000000004', 'BinDawood Holding', 'بن داوود القابضة', '+966-50-777-7777', '+966-12-888-8888', 'apparel@bindawood.sa', 'King Fahd Rd, Jeddah 23456, KSA', 'courier', 'SA-4567890-004', 'LB-004', 100000, 4500000, true),
  ('cu000000-0000-0000-0000-000000000005', 'Sharaf Group Apparel', 'مجموعة شرف للملابس', '+971-56-999-9999', '+971-4-101-0101', 'info@sharafapparel.ae', 'Al Maktoum Rd, Deira, Dubai, UAE', 'own', 'AE-5678901-005', 'LB-005', 0, 2500000, true);

-- ============================================================
-- 5. ITEMS (mix of raw materials & finished goods)
-- ============================================================
insert into public.items (id, name, sku, barcode, category_id, store_id, unit, quantity, reorder_level, cost_price, sale_price, supplier_id, location, color, size, is_active) values
  -- Fabrics
  ('i0000000-0000-0000-0000-000000000001', 'Cotton Single Jersey 180gsm', 'FAB-CSJ-180', '8801234567890', 'c0000000-0000-0000-0000-000000000001', 's1000000-0000-0000-0000-000000000001', 'kg', 2500, 800, 2.85, 0, 'sp000000-0000-0000-0000-000000000001', 'Aisle 1, Rack 3', 'White', null, true),
  ('i0000000-0000-0000-0000-000000000002', 'Cotton Polyester Blend 220gsm', 'FAB-CPB-220', '8801234567891', 'c0000000-0000-0000-0000-000000000001', 's1000000-0000-0000-0000-000000000001', 'kg', 1800, 600, 3.20, 0, 'sp000000-0000-0000-0000-000000000001', 'Aisle 1, Rack 4', 'Navy', null, true),
  ('i0000000-0000-0000-0000-000000000003', 'Polyester Mesh 150gsm', 'FAB-PM-150', '8801234567892', 'c0000000-0000-0000-0000-000000000001', 's1000000-0000-0000-0000-000000000001', 'kg', 600, 400, 1.95, 0, 'sp000000-0000-0000-0000-000000000001', 'Aisle 1, Rack 2', 'Black', null, true),
  -- Trims & Accessories
  ('i0000000-0000-0000-0000-000000000004', 'YKK Nylon Zipper #5 (18cm)', 'TRM-YKK-5-18', '8801234567893', 'c0000000-0000-0000-0000-000000000002', 's1000000-0000-0000-0000-000000000001', 'pcs', 8500, 5000, 0.18, 0, 'sp000000-0000-0000-0000-000000000002', 'Aisle 2, Rack 1', 'Black', null, true),
  ('i0000000-0000-0000-0000-000000000005', 'Button Plastic 18L', 'TRM-BTN-18L', '8801234567894', 'c0000000-0000-0000-0000-000000000002', 's1000000-0000-0000-0000-000000000001', 'pcs', 22000, 10000, 0.03, 0, 'sp000000-0000-0000-0000-000000000002', 'Aisle 2, Rack 2', 'White', '18L', true),
  ('i0000000-0000-0000-0000-000000000006', 'Woven Brand Label', 'TRM-LBL-WOV', '8801234567895', 'c0000000-0000-0000-0000-000000000002', 's1000000-0000-0000-0000-000000000001', 'pcs', 15000, 8000, 0.05, 0, 'sp000000-0000-0000-0000-000000000002', 'Aisle 2, Rack 5', null, null, true),
  -- Packaging
  ('i0000000-0000-0000-0000-000000000007', 'Poly Bag 12x18 inch', 'PKG-PB-12x18', '8801234567896', 'c0000000-0000-0000-0000-000000000003', 's1000000-0000-0000-0000-000000000001', 'pcs', 50000, 20000, 0.02, 0, 'sp000000-0000-0000-0000-000000000003', 'Aisle 3, Rack 1', null, null, true),
  ('i0000000-0000-0000-0000-000000000008', 'Carton Box 24x18x12', 'PKG-CRT-2418', '8801234567897', 'c0000000-0000-0000-0000-000000000003', 's1000000-0000-0000-0000-000000000001', 'pcs', 3000, 1500, 0.85, 0, 'sp000000-0000-0000-0000-000000000003', 'Aisle 3, Rack 3', null, null, true),
  -- Finished Garments
  ('i0000000-0000-0000-0000-000000000009', 'Mens Polo Shirt (Navy, M)', 'FG-POLO-NV-M', '8801234567898', 'c0000000-0000-0000-0000-000000000004', 's1000000-0000-0000-0000-000000000001', 'pcs', 450, 200, 4.80, 12.50, null, 'Rack A1', 'Navy', 'M', true),
  ('i0000000-0000-0000-0000-000000000010', 'Mens Polo Shirt (Navy, L)', 'FG-POLO-NV-L', '8801234567899', 'c0000000-0000-0000-0000-000000000004', 's1000000-0000-0000-0000-000000000001', 'pcs', 380, 200, 4.80, 12.50, null, 'Rack A2', 'Navy', 'L', true),
  ('i0000000-0000-0000-0000-000000000011', 'Womens T-Shirt (White, M)', 'FG-TEE-WH-M', '8801234567900', 'c0000000-0000-0000-0000-000000000004', 's1000000-0000-0000-0000-000000000001', 'pcs', 620, 250, 3.50, 9.00, null, 'Rack B1', 'White', 'M', true),
  ('i0000000-0000-0000-0000-000000000012', 'Womens T-Shirt (White, L)', 'FG-TEE-WH-L', '8801234567901', 'c0000000-0000-0000-0000-000000000004', 's1000000-0000-0000-0000-000000000001', 'pcs', 540, 250, 3.50, 9.00, null, 'Rack B2', 'White', 'L', true),
  ('i0000000-0000-0000-0000-000000000013', 'Kids Hoodie (Red, 8Y)', 'FG-HOOD-RD-8', '8801234567902', 'c0000000-0000-0000-0000-000000000004', 's1000000-0000-0000-0000-000000000001', 'pcs', 180, 100, 6.20, 15.00, null, 'Rack C1', 'Red', '8Y', true),
  ('i0000000-0000-0000-0000-000000000014', 'Mens Formal Trouser (Grey, 32)', 'FG-TROU-GY-32', '8801234567903', 'c0000000-0000-0000-0000-000000000004', 's1000000-0000-0000-0000-000000000001', 'pcs', 260, 120, 7.50, 18.00, null, 'Rack D1', 'Grey', '32', true),
  ('i0000000-0000-0000-0000-000000000015', 'Womens Hijab Scarf (Beige)', 'FG-HIJB-BE', '8801234567904', 'c0000000-0000-0000-0000-000000000004', 's1000000-0000-0000-0000-000000000001', 'pcs', 890, 300, 1.80, 5.50, null, 'Rack E1', 'Beige', 'One Size', true),
  -- Low stock alerts (these are items below reorder level to test reorder recommendations)
  ('i0000000-0000-0000-0000-000000000016', 'Kids T-Shirt (Blue, 6Y)', 'FG-KT-BL-6', '8801234567905', 'c0000000-0000-0000-0000-000000000004', 's1000000-0000-0000-0000-000000000001', 'pcs', 30, 150, 2.90, 7.50, null, 'Rack C2', 'Blue', '6Y', true);

-- ============================================================
-- 6. SALES INVOICES (with sale_items)
-- ============================================================
-- Invoice INV-2026-001: Al-Futtaim — Jan 2026
insert into public.sales_invoices (id, invoice_number, customer_id, store_id, invoice_date, subtotal, discount_pct, discount_amount, vat_pct, vat_amount, total, payment_method, payment_status, amount_paid, balance_due) values
  ('inv00001-0000-0000-0000-000000000001', 'INV-2026-001', 'cu000000-0000-0000-0000-000000000001', 's1000000-0000-0000-0000-000000000001', '2026-01-15', 162500, 2.5, 4062.5, 5, 7921.88, 166359.38, 'credit', 'paid', 166359.38, 0);
insert into public.sale_items (id, invoice_id, item_id, barcode, description, quantity, price) values
  ('si000001-0000-0000-0000-000000000001', 'inv00001-0000-0000-0000-000000000001', 'i0000000-0000-0000-0000-000000000009', '8801234567898', 'Mens Polo Shirt (Navy, M)', 5000, 12.50),
  ('si000001-0000-0000-0000-000000000002', 'inv00001-0000-0000-0000-000000000001', 'i0000000-0000-0000-0000-000000000010', '8801234567899', 'Mens Polo Shirt (Navy, L)', 5000, 12.50),
  ('si000001-0000-0000-0000-000000000003', 'inv00001-0000-0000-0000-000000000001', 'i0000000-0000-0000-0000-000000000015', '8801234567904', 'Womens Hijab Scarf (Beige)', 5000, 5.50);
insert into public.credit_ledger (id, customer_id, type, amount, reference, invoice_id, notes) values
  ('cl000001-0000-0000-0000-000000000001', 'cu000000-0000-0000-0000-000000000001', 'sale', 166359.38, 'INV-2026-001', 'inv00001-0000-0000-0000-000000000001', 'Credit sale - Al-Futtaim Jan order');
insert into public.credit_ledger (id, customer_id, type, amount, reference, invoice_id, notes) values
  ('cl000002-0000-0000-0000-000000000002', 'cu000000-0000-0000-0000-000000000001', 'payment', -166359.38, 'Payment WIRE-2026-001', 'inv00001-0000-0000-0000-000000000001', 'Wire transfer received');

-- Invoice INV-2026-002: Al Shaya — Feb 2026
insert into public.sales_invoices (id, invoice_number, customer_id, store_id, invoice_date, subtotal, discount_pct, discount_amount, vat_pct, vat_amount, total, payment_method, payment_status, amount_paid, balance_due) values
  ('inv00001-0000-0000-0000-000000000002', 'INV-2026-002', 'cu000000-0000-0000-0000-000000000002', 's1000000-0000-0000-0000-000000000001', '2026-02-20', 255000, 3.0, 7650, 5, 12367.50, 259717.50, 'credit', 'partial', 200000, 59717.50);
insert into public.sale_items (id, invoice_id, item_id, barcode, description, quantity, price) values
  ('si000001-0000-0000-0000-000000000004', 'inv00001-0000-0000-0000-000000000002', 'i0000000-0000-0000-0000-000000000011', '8801234567900', 'Womens T-Shirt (White, M)', 10000, 9.00),
  ('si000001-0000-0000-0000-000000000005', 'inv00001-0000-0000-0000-000000000002', 'i0000000-0000-0000-0000-000000000012', '8801234567901', 'Womens T-Shirt (White, L)', 10000, 9.00),
  ('si000001-0000-0000-0000-000000000006', 'inv00001-0000-0000-0000-000000000002', 'i0000000-0000-0000-0000-000000000014', '8801234567903', 'Mens Formal Trouser (Grey, 32)', 3000, 18.00);
insert into public.credit_ledger (id, customer_id, type, amount, reference, invoice_id, notes) values
  ('cl000003-0000-0000-0000-000000000003', 'cu000000-0000-0000-0000-000000000002', 'sale', 259717.50, 'INV-2026-002', 'inv00001-0000-0000-0000-000000000002', 'Credit sale - Al Shaya Feb order');
insert into public.credit_ledger (id, customer_id, type, amount, reference, invoice_id, notes) values
  ('cl000004-0000-0000-0000-000000000004', 'cu000000-0000-0000-0000-000000000002', 'payment', -200000, 'Payment WIRE-2026-002', 'inv00001-0000-0000-0000-000000000002', 'Wire transfer partial');

-- Invoice INV-2026-003: Lulu Hypermarket — Mar 2026
insert into public.sales_invoices (id, invoice_number, customer_id, store_id, invoice_date, subtotal, discount_pct, discount_amount, vat_pct, vat_amount, total, payment_method, payment_status, amount_paid, balance_due) values
  ('inv00001-0000-0000-0000-000000000003', 'INV-2026-003', 'cu000000-0000-0000-0000-000000000003', 's1000000-0000-0000-0000-000000000001', '2026-03-10', 375000, 4.0, 15000, 5, 18000, 378000.00, 'credit', 'paid', 378000.00, 0);
insert into public.sale_items (id, invoice_id, item_id, barcode, description, quantity, price) values
  ('si000001-0000-0000-0000-000000000007', 'inv00001-0000-0000-0000-000000000003', 'i0000000-0000-0000-0000-000000000009', '8801234567898', 'Mens Polo Shirt (Navy, M)', 12000, 12.50),
  ('si000001-0000-0000-0000-000000000008', 'inv00001-0000-0000-0000-000000000003', 'i0000000-0000-0000-0000-000000000010', '8801234567899', 'Mens Polo Shirt (Navy, L)', 12000, 12.50),
  ('si000001-0000-0000-0000-000000000009', 'inv00001-0000-0000-0000-000000000003', 'i0000000-0000-0000-0000-000000000013', '8801234567902', 'Kids Hoodie (Red, 8Y)', 3000, 15.00);
insert into public.credit_ledger (id, customer_id, type, amount, reference, invoice_id, notes) values
  ('cl000005-0000-0000-0000-000000000005', 'cu000000-0000-0000-0000-000000000003', 'sale', 378000, 'INV-2026-003', 'inv00001-0000-0000-0000-000000000003', 'Credit sale - Lulu Mar order');
insert into public.credit_ledger (id, customer_id, type, amount, reference, invoice_id, notes) values
  ('cl000006-0000-0000-0000-000000000006', 'cu000000-0000-0000-0000-000000000003', 'payment', -378000, 'Payment TT-2026-003', 'inv00001-0000-0000-0000-000000000003', 'Telegraphic transfer received');

-- Invoice INV-2026-004: BinDawood — Apr 2026
insert into public.sales_invoices (id, invoice_number, customer_id, store_id, invoice_date, subtotal, discount_pct, discount_amount, vat_pct, vat_amount, total, payment_method, payment_status, amount_paid, balance_due) values
  ('inv00001-0000-0000-0000-000000000004', 'INV-2026-004', 'cu000000-0000-0000-0000-000000000004', 's1000000-0000-0000-0000-000000000001', '2026-04-05', 118000, 2.0, 2360, 5, 5782, 121422.00, 'credit', 'unpaid', 0, 121422.00);
insert into public.sale_items (id, invoice_id, item_id, barcode, description, quantity, price) values
  ('si000001-0000-0000-0000-000000000010', 'inv00001-0000-0000-0000-000000000004', 'i0000000-0000-0000-0000-000000000011', '8801234567900', 'Womens T-Shirt (White, M)', 6000, 9.00),
  ('si000001-0000-0000-0000-000000000011', 'inv00001-0000-0000-0000-000000000004', 'i0000000-0000-0000-0000-000000000015', '8801234567904', 'Womens Hijab Scarf (Beige)', 8000, 5.50),
  ('si000001-0000-0000-0000-000000000012', 'inv00001-0000-0000-0000-000000000004', 'i0000000-0000-0000-0000-000000000014', '8801234567903', 'Mens Formal Trouser (Grey, 32)', 2000, 18.00);
insert into public.credit_ledger (id, customer_id, type, amount, reference, invoice_id, notes) values
  ('cl000007-0000-0000-0000-000000000007', 'cu000000-0000-0000-0000-000000000004', 'sale', 121422, 'INV-2026-004', 'inv00001-0000-0000-0000-000000000004', 'Credit sale - BinDawood Apr order');

-- Invoice INV-2026-005: Sharaf Group — May 2026
insert into public.sales_invoices (id, invoice_number, customer_id, store_id, invoice_date, subtotal, discount_pct, discount_amount, vat_pct, vat_amount, total, payment_method, payment_status, amount_paid, balance_due) values
  ('inv00001-0000-0000-0000-000000000005', 'INV-2026-005', 'cu000000-0000-0000-0000-000000000005', 's1000000-0000-0000-0000-000000000001', '2026-05-12', 82500, 0, 0, 5, 4125, 86625.00, 'credit', 'unpaid', 0, 86625.00);
insert into public.sale_items (id, invoice_id, item_id, barcode, description, quantity, price) values
  ('si000001-0000-0000-0000-000000000013', 'inv00001-0000-0000-0000-000000000005', 'i0000000-0000-0000-0000-000000000013', '8801234567902', 'Kids Hoodie (Red, 8Y)', 2500, 15.00),
  ('si000001-0000-0000-0000-000000000014', 'inv00001-0000-0000-0000-000000000005', 'i0000000-0000-0000-0000-000000000015', '8801234567904', 'Womens Hijab Scarf (Beige)', 6000, 5.50);
insert into public.credit_ledger (id, customer_id, type, amount, reference, invoice_id, notes) values
  ('cl000008-0000-0000-0000-000000000008', 'cu000000-0000-0000-0000-000000000005', 'sale', 86625, 'INV-2026-005', 'inv00001-0000-0000-0000-000000000005', 'Credit sale - Sharaf Group May order');

-- Invoice INV-2026-006: Al-Futtaim — Jun 2026 (recurring buyer)
insert into public.sales_invoices (id, invoice_number, customer_id, store_id, invoice_date, subtotal, discount_pct, discount_amount, vat_pct, vat_amount, total, payment_method, payment_status, amount_paid, balance_due) values
  ('inv00001-0000-0000-0000-000000000006', 'INV-2026-006', 'cu000000-0000-0000-0000-000000000001', 's1000000-0000-0000-0000-000000000001', '2026-06-18', 190000, 3.5, 6650, 5, 9167.50, 192517.50, 'credit', 'paid', 192517.50, 0);
insert into public.sale_items (id, invoice_id, item_id, barcode, description, quantity, price) values
  ('si000001-0000-0000-0000-000000000015', 'inv00001-0000-0000-0000-000000000006', 'i0000000-0000-0000-0000-000000000009', '8801234567898', 'Mens Polo Shirt (Navy, M)', 6000, 12.50),
  ('si000001-0000-0000-0000-000000000016', 'inv00001-0000-0000-0000-000000000006', 'i0000000-0000-0000-0000-000000000010', '8801234567899', 'Mens Polo Shirt (Navy, L)', 6000, 12.50),
  ('si000001-0000-0000-0000-000000000017', 'inv00001-0000-0000-0000-000000000006', 'i0000000-0000-0000-0000-000000000011', '8801234567900', 'Womens T-Shirt (White, M)', 4000, 9.00),
  ('si000001-0000-0000-0000-000000000018', 'inv00001-0000-0000-0000-000000000006', 'i0000000-0000-0000-0000-000000000015', '8801234567904', 'Womens Hijab Scarf (Beige)', 3000, 5.50);
insert into public.credit_ledger (id, customer_id, type, amount, reference, invoice_id, notes) values
  ('cl000009-0000-0000-0000-000000000009', 'cu000000-0000-0000-0000-000000000001', 'sale', 192517.50, 'INV-2026-006', 'inv00001-0000-0000-0000-000000000006', 'Credit sale - Al-Futtaim Jun reorder');
insert into public.credit_ledger (id, customer_id, type, amount, reference, invoice_id, notes) values
  ('cl000010-0000-0000-0000-000000000010', 'cu000000-0000-0000-0000-000000000001', 'payment', -192517.50, 'Payment LC-2026-006', 'inv00001-0000-0000-0000-000000000006', 'LC payment received');

-- ============================================================
-- 7. SALE PRICE HISTORY
-- ============================================================
insert into public.sale_price_history (customer_id, item_id, last_price, last_sale_date) values
  ('cu000000-0000-0000-0000-000000000001', 'i0000000-0000-0000-0000-000000000009', 12.50, '2026-06-18'),
  ('cu000000-0000-0000-0000-000000000001', 'i0000000-0000-0000-0000-000000000010', 12.50, '2026-06-18'),
  ('cu000000-0000-0000-0000-000000000001', 'i0000000-0000-0000-0000-000000000015', 5.50, '2026-06-18'),
  ('cu000000-0000-0000-0000-000000000002', 'i0000000-0000-0000-0000-000000000011', 9.00, '2026-02-20'),
  ('cu000000-0000-0000-0000-000000000002', 'i0000000-0000-0000-0000-000000000012', 9.00, '2026-02-20'),
  ('cu000000-0000-0000-0000-000000000003', 'i0000000-0000-0000-0000-000000000009', 12.50, '2026-03-10'),
  ('cu000000-0000-0000-0000-000000000003', 'i0000000-0000-0000-0000-000000000013', 15.00, '2026-03-10'),
  ('cu000000-0000-0000-0000-000000000004', 'i0000000-0000-0000-0000-000000000011', 9.00, '2026-04-05'),
  ('cu000000-0000-0000-0000-000000000004', 'i0000000-0000-0000-0000-000000000015', 5.50, '2026-04-05'),
  ('cu000000-0000-0000-0000-000000000005', 'i0000000-0000-0000-0000-000000000013', 15.00, '2026-05-12');

-- ============================================================
-- 8. PURCHASE ORDERS (with purchase_items)
-- ============================================================
insert into public.purchase_orders (id, po_number, supplier_id, store_id, order_date, expected_date, status, subtotal, vat_amount, total, notes) values
  ('po000001-0000-0000-0000-000000000001', 'PO-2026-001', 'sp000000-0000-0000-0000-000000000001', 's1000000-0000-0000-0000-000000000001', '2026-01-10', '2026-02-15', 'received', 42750, 2137.50, 44887.50, 'Fabric restock Q1'),
  ('po000001-0000-0000-0000-000000000002', 'PO-2026-002', 'sp000000-0000-0000-0000-000000000002', 's1000000-0000-0000-0000-000000000001', '2026-02-01', '2026-03-01', 'received', 3600, 180, 3780, 'Trims restock - zippers and buttons'),
  ('po000001-0000-0000-0000-000000000003', 'PO-2026-003', 'sp000000-0000-0000-0000-000000000003', 's1000000-0000-0000-0000-000000000001', '2026-03-05', '2026-04-10', 'received', 4250, 212.50, 4462.50, 'Packaging materials'),
  ('po000001-0000-0000-0000-000000000004', 'PO-2026-004', 'sp000000-0000-0000-0000-000000000001', 's1000000-0000-0000-0000-000000000001', '2026-05-20', '2026-07-01', 'partial', 57600, 2880, 60480, 'Fabric restock Q3'),
  ('po000001-0000-0000-0000-000000000005', 'PO-2026-005', 'sp000000-0000-0000-0000-000000000002', 's1000000-0000-0000-0000-000000000001', '2026-06-01', '2026-07-15', 'pending', 2500, 125, 2625, 'Trim order for Q3 production');

insert into public.purchase_items (id, po_id, item_id, barcode, description, quantity, received_qty, unit_price) values
  -- PO-001: 5000kg Cotton SJ @ 2.85, 8000kg Cotton Poly @ 3.20
  ('pi000001-0000-0000-0000-000000000001', 'po000001-0000-0000-0000-000000000001', 'i0000000-0000-0000-0000-000000000001', '8801234567890', 'Cotton Single Jersey 180gsm', 5000, 5000, 2.85),
  ('pi000001-0000-0000-0000-000000000002', 'po000001-0000-0000-0000-000000000001', 'i0000000-0000-0000-0000-000000000002', '8801234567891', 'Cotton Polyester Blend 220gsm', 8000, 8000, 3.20),
  -- PO-002: 10000 zippers @ 0.18, 20000 labels @ 0.05
  ('pi000001-0000-0000-0000-000000000003', 'po000001-0000-0000-0000-000000000002', 'i0000000-0000-0000-0000-000000000004', '8801234567893', 'YKK Nylon Zipper #5 (18cm)', 10000, 10000, 0.18),
  ('pi000001-0000-0000-0000-000000000004', 'po000001-0000-0000-0000-000000000002', 'i0000000-0000-0000-0000-000000000006', '8801234567895', 'Woven Brand Label', 20000, 20000, 0.05),
  -- PO-003: 5000 poly bags @ 0.02, 5000 cartons @ 0.85
  ('pi000001-0000-0000-0000-000000000005', 'po000001-0000-0000-0000-000000000003', 'i0000000-0000-0000-0000-000000000007', '8801234567896', 'Poly Bag 12x18 inch', 50000, 50000, 0.02),
  ('pi000001-0000-0000-0000-000000000006', 'po000001-0000-0000-0000-000000000003', 'i0000000-0000-0000-0000-000000000008', '8801234567897', 'Carton Box 24x18x12', 3000, 3000, 0.85),
  -- PO-004: partially received - 10000/18000 kg
  ('pi000001-0000-0000-0000-000000000007', 'po000001-0000-0000-0000-000000000004', 'i0000000-0000-0000-0000-000000000001', '8801234567890', 'Cotton Single Jersey 180gsm', 10000, 5000, 2.80),
  ('pi000001-0000-0000-0000-000000000008', 'po000001-0000-0000-0000-000000000004', 'i0000000-0000-0000-0000-000000000002', '8801234567891', 'Cotton Polyester Blend 220gsm', 8000, 3000, 3.15),
  -- PO-005: pending
  ('pi000001-0000-0000-0000-000000000009', 'po000001-0000-0000-0000-000000000005', 'i0000000-0000-0000-0000-000000000004', '8801234567893', 'YKK Nylon Zipper #5 (18cm)', 8000, 0, 0.18),
  ('pi000001-0000-0000-0000-000000000010', 'po000001-0000-0000-0000-000000000005', 'i0000000-0000-0000-0000-000000000005', '8801234567894', 'Button Plastic 18L', 10000, 0, 0.03);

-- ============================================================
-- 9. STOCK MOVEMENTS
-- ============================================================
insert into public.stock_movements (id, item_id, store_id, type, quantity, reference_type, reference_id, note) values
  -- Fabric inward movements
  ('sm000001-0000-0000-0000-000000000001', 'i0000000-0000-0000-0000-000000000001', 's1000000-0000-0000-0000-000000000001', 'in', 5000, 'po', 'PO-2026-001', 'Cotton SJ received'),
  ('sm000001-0000-0000-0000-0000-000000000002', 'i0000000-0000-0000-0000-000000000002', 's1000000-0000-0000-0000-000000000001', 'in', 8000, 'po', 'PO-2026-001', 'Cotton Poly received'),
  ('sm000001-0000-0000-0000-0000-000000000003', 'i0000000-0000-0000-0000-000000000001', 's1000000-0000-0000-0000-000000000001', 'in', 5000, 'po', 'PO-2026-004', 'Cotton SJ partial received'),
  ('sm000001-0000-0000-0000-0000-000000000004', 'i0000000-0000-0000-0000-000000000002', 's1000000-0000-0000-0000-000000000001', 'in', 3000, 'po', 'PO-2026-004', 'Cotton Poly partial received'),
  -- Trim inward movements
  ('sm000001-0000-0000-0000-000000000005', 'i0000000-0000-0000-0000-000000000004', 's1000000-0000-0000-0000-000000000001', 'in', 10000, 'po', 'PO-2026-002', 'Zippers received'),
  ('sm000001-0000-0000-0000-000000000006', 'i0000000-0000-0000-0000-000000000006', 's1000000-0000-0000-0000-000000000001', 'in', 20000, 'po', 'PO-2026-002', 'Labels received'),
  ('sm000001-0000-0000-0000-000000000007', 'i0000000-0000-0000-0000-000000000007', 's1000000-0000-0000-0000-000000000001', 'in', 50000, 'po', 'PO-2026-003', 'Poly bags received'),
  ('sm000001-0000-0000-0000-000000000008', 'i0000000-0000-0000-0000-000000000008', 's1000000-0000-0000-0000-000000000001', 'in', 3000, 'po', 'PO-2026-003', 'Cartons received'),
  -- Stock-out movements (production consumption)
  ('sm000001-0000-0000-0000-000000000009', 'i0000000-0000-0000-0000-000000000001', 's1000000-0000-0000-0000-000000000001', 'out', 3500, 'production', 'BATCH-2026-001', 'Used in production batch Jan'),
  ('sm000001-0000-0000-0000-000000000010', 'i0000000-0000-0000-0000-000000000002', 's1000000-0000-0000-0000-000000000001', 'out', 4200, 'production', 'BATCH-2026-002', 'Used in production batch Feb'),
  ('sm000001-0000-0000-0000-000000000011', 'i0000000-0000-0000-0000-000000000004', 's1000000-0000-0000-0000-000000000001', 'out', 1500, 'production', 'BATCH-2026-003', 'Zippers consumed'),
  ('sm000001-0000-0000-0000-000000000012', 'i0000000-0000-0000-0000-000000000005', 's1000000-0000-0000-0000-000000000001', 'out', 8000, 'production', 'BATCH-2026-003', 'Buttons consumed'),
  -- Adjustment
  ('sm000001-0000-0000-0000-000000000013', 'i0000000-0000-0000-0000-000000000003', 's1000000-0000-0000-0000-000000000001', 'adjust', 100, null, null, 'Inventory count adjustment'),
  -- Return
  ('sm000001-0000-0000-0000-000000000014', 'i0000000-0000-0000-0000-000000000005', 's1000000-0000-0000-0000-000000000001', 'return', 500, null, null, 'Defective buttons returned to supplier'),
  -- Transfer to Chittagong
  ('sm000001-0000-0000-0000-000000000015', 'i0000000-0000-0000-0000-000000000007', 's1000000-0000-0000-0000-000000000001', 'transfer_out', 5000, 'transfer', 'TR-2026-001', 'Transferred to Chittagong warehouse'),
  ('sm000001-0000-0000-0000-000000000016', 'i0000000-0000-0000-0000-000000000008', 's1000000-0000-0000-0000-000000000001', 'transfer_out', 500, 'transfer', 'TR-2026-001', 'Transferred to Chittagong warehouse');

-- ============================================================
-- 10. STOCK TRANSFERS
-- ============================================================
insert into public.stock_transfers (id, transfer_number, from_store_id, to_store_id, transfer_date, status, notes) values
  ('tr000001-0000-0000-0000-000000000001', 'TR-2026-001', 's1000000-0000-0000-0000-000000000001', 's1000000-0000-0000-0000-000000000002', '2026-02-15', 'received', 'Packaging stock transfer');

insert into public.stock_transfer_items (id, transfer_id, item_id, quantity) values
  ('ti000001-0000-0000-0000-000000000001', 'tr000001-0000-0000-0000-000000000001', 'i0000000-0000-0000-0000-000000000007', 5000),
  ('ti000001-0000-0000-0000-000000000002', 'tr000001-0000-0000-0000-000000000001', 'i0000000-0000-0000-0000-000000000008', 500);

-- ============================================================
-- 11. DAMAGE RECORDS
-- ============================================================
insert into public.damage_records (id, item_id, store_id, quantity, reason, damage_date) values
  ('dr000001-0000-0000-0000-000000000001', 'i0000000-0000-0000-0000-000000000005', 's1000000-0000-0000-0000-000000000001', 200, 'Water damage in storage', '2026-03-20'),
  ('dr000001-0000-0000-0000-000000000002', 'i0000000-0000-0000-0000-000000000001', 's1000000-0000-0000-0000-000000000001', 50, 'Fabric torn during handling', '2026-04-15');

-- ============================================================
-- DONE
-- ============================================================

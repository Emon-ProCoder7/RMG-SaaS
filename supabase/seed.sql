-- Optional sample data for the RMG inventory. Run after 0001_inventory.sql.
insert into public.categories (name, description) values
  ('Fabric', 'Raw fabric rolls'),
  ('Accessories', 'Buttons, zippers, labels'),
  ('Finished Goods', 'Packed ready-to-ship garments')
on conflict (name) do nothing;

insert into public.items (name, sku, category_id, unit, quantity, reorder_level, cost_price, sale_price, supplier, location)
select v.name, v.sku, c.id, v.unit, v.quantity, v.reorder_level, v.cost_price, v.sale_price, v.supplier, v.location
from (values
  ('Cotton Twill 240gsm', 'FAB-CT240', 'Fabric',        'm',   1200, 300, 3.20, 5.50, 'Hossain Textiles', 'Rack A1'),
  ('Polyester Lining',    'FAB-POLY',  'Fabric',        'm',   180,  250, 1.10, 2.00, 'Dhaka Mills',      'Rack A3'),
  ('YKK Zipper 18cm',     'ACC-ZIP18', 'Accessories',   'pcs', 5400, 1000, 0.18, 0.40, 'YKK BD',          'Bin C2'),
  ('Woven Brand Label',   'ACC-LBL',   'Accessories',   'pcs', 320,  2000, 0.05, 0.12, 'LabelCraft',      'Bin C5'),
  ('Mens Polo Shirt - M', 'FG-POLO-M', 'Finished Goods','pcs', 860,  200, 4.80, 11.00, NULL,             'Shelf F2'),
  ('Mens Polo Shirt - L', 'FG-POLO-L', 'Finished Goods','pcs', 90,   200, 4.80, 11.00, NULL,             'Shelf F2')
) as v(name, sku, cat, unit, quantity, reorder_level, cost_price, sale_price, supplier, location)
join public.categories c on c.name = v.cat
on conflict (sku) do nothing;

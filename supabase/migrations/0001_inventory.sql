-- RMG SaaS — inventory module schema
-- Run in your own Supabase project: SQL Editor → paste → Run
-- (or `supabase db push` if you use the Supabase CLI).

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  description text,
  created_at  timestamptz not null default now()
);

create table if not exists public.items (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  sku           text unique,
  category_id   uuid references public.categories (id) on delete set null,
  unit          text not null default 'pcs',
  quantity      numeric not null default 0,
  reorder_level numeric not null default 0,
  cost_price    numeric not null default 0,
  sale_price    numeric not null default 0,
  supplier      text,
  location      text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists items_category_id_idx on public.items (category_id);
create index if not exists items_name_idx on public.items (name);

create table if not exists public.stock_movements (
  id         uuid primary key default gen_random_uuid(),
  item_id    uuid not null references public.items (id) on delete cascade,
  type       text not null check (type in ('in', 'out', 'adjust')),
  quantity   numeric not null,
  note       text,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null
);

create index if not exists stock_movements_item_id_idx on public.stock_movements (item_id);
create index if not exists stock_movements_created_at_idx on public.stock_movements (created_at desc);

-- ---------------------------------------------------------------------------
-- Triggers: keep items.updated_at fresh, and auto-adjust items.quantity
-- whenever a stock movement is recorded (in = +qty, out = -qty, adjust = set).
-- ---------------------------------------------------------------------------

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists items_touch_updated_at on public.items;
create trigger items_touch_updated_at
  before update on public.items
  for each row execute function public.touch_updated_at();

create or replace function public.apply_stock_movement()
returns trigger language plpgsql as $$
begin
  if new.type = 'in' then
    update public.items set quantity = quantity + new.quantity where id = new.item_id;
  elsif new.type = 'out' then
    update public.items set quantity = quantity - new.quantity where id = new.item_id;
  elsif new.type = 'adjust' then
    update public.items set quantity = new.quantity where id = new.item_id;
  end if;
  return new;
end;
$$;

drop trigger if exists stock_movements_apply on public.stock_movements;
create trigger stock_movements_apply
  after insert on public.stock_movements
  for each row execute function public.apply_stock_movement();

-- ---------------------------------------------------------------------------
-- Row Level Security — any signed-in user has full access (single-org for now;
-- tighten to per-tenant policies when multi-tenancy is added).
-- ---------------------------------------------------------------------------

alter table public.categories      enable row level security;
alter table public.items           enable row level security;
alter table public.stock_movements enable row level security;

drop policy if exists "authenticated full access" on public.categories;
create policy "authenticated full access" on public.categories
  for all to authenticated using (true) with check (true);

drop policy if exists "authenticated full access" on public.items;
create policy "authenticated full access" on public.items
  for all to authenticated using (true) with check (true);

drop policy if exists "authenticated full access" on public.stock_movements;
create policy "authenticated full access" on public.stock_movements
  for all to authenticated using (true) with check (true);

-- ==============================================================================
-- GadgetHouse Supabase Database Schema
-- Multi-Channel E-Commerce & POS System for Mobile Accessories
-- ==============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. PHONE BRANDS & MODELS (Device Compatibility Hierarchy)
-- ------------------------------------------------------------------------------
create table if not exists public.phone_brands (
    id text primary key,
    name text not null,
    logo text,
    created_at timestamptz default now() not null
);

create table if not exists public.phone_models (
    id text primary key,
    brand_id text not null references public.phone_brands(id) on delete cascade,
    name text not null,
    release_year integer not null default 2024,
    popular boolean default false not null,
    created_at timestamptz default now() not null
);

create index if not exists idx_phone_models_brand_id on public.phone_models(brand_id);
create index if not exists idx_phone_models_popular on public.phone_models(popular) where popular is true;

-- ------------------------------------------------------------------------------
-- 2. CATEGORIES
-- ------------------------------------------------------------------------------
create table if not exists public.categories (
    id text primary key,
    slug text unique not null,
    name text not null,
    description text default '' not null,
    item_count integer default 0 not null,
    image text default '' not null,
    created_at timestamptz default now() not null
);

create index if not exists idx_categories_slug on public.categories(slug);

-- ------------------------------------------------------------------------------
-- 3. PRODUCTS & VARIANTS
-- ------------------------------------------------------------------------------
create type product_status as enum ('active', 'draft', 'archived');

create table if not exists public.products (
    id text primary key,
    title text not null,
    slug text unique not null,
    subtitle text default '',
    description text default '',
    category_slug text not null references public.categories(slug) on update cascade,
    accessory_brand text not null default 'GadgetHouse',
    badge text,
    rank integer,
    images text[] default '{}' not null,
    base_price numeric(12, 2) not null default 0,
    compare_at_price numeric(12, 2) not null default 0,
    cost_price numeric(12, 2) not null default 0,
    hsn_code text default '3926',
    gst_rate numeric(5, 2) not null default 18.00,
    rating numeric(3, 2) not null default 4.8,
    review_count integer not null default 0,
    features text[] default '{}' not null,
    specs jsonb default '{}'::jsonb not null,
    is_mag_safe boolean default false not null,
    material text default '',
    status product_status not null default 'active',
    options_count integer default 1 not null,
    created_at timestamptz default now() not null,
    updated_at timestamptz default now() not null
);

create index if not exists idx_products_category on public.products(category_slug);
create index if not exists idx_products_status on public.products(status);
create index if not exists idx_products_slug on public.products(slug);

-- Junction table for product compatible phone models
create table if not exists public.product_compatible_models (
    product_id text not null references public.products(id) on delete cascade,
    phone_model_id text not null references public.phone_models(id) on delete cascade,
    primary key (product_id, phone_model_id)
);

create index if not exists idx_prod_compat_phone on public.product_compatible_models(phone_model_id);

-- Product Variants (SKUs, inventory split across Warehouse and Store POS)
create table if not exists public.product_variants (
    id text primary key,
    product_id text not null references public.products(id) on delete cascade,
    sku text unique not null,
    barcode text default '',
    phone_model_id text references public.phone_models(id) on delete set null,
    color_name text,
    color_hex text,
    finish text,
    price numeric(12, 2) not null default 0,
    compare_at_price numeric(12, 2) not null default 0,
    cost_price numeric(12, 2) not null default 0,
    stock_warehouse integer not null default 0,
    stock_shop integer not null default 0,
    created_at timestamptz default now() not null,
    updated_at timestamptz default now() not null
);

create index if not exists idx_variants_product_id on public.product_variants(product_id);
create index if not exists idx_variants_sku on public.product_variants(sku);
create index if not exists idx_variants_phone_model on public.product_variants(phone_model_id);

-- ------------------------------------------------------------------------------
-- 4. CUSTOMERS & COUPONS
-- ------------------------------------------------------------------------------
create table if not exists public.customers (
    id uuid primary key default gen_random_uuid(),
    auth_user_id uuid references auth.users(id) on delete set null,
    name text not null,
    email text,
    phone text not null,
    phone_model text,
    total_orders integer not null default 0,
    total_spent numeric(12, 2) not null default 0,
    address jsonb,
    created_at timestamptz default now() not null
);

create index if not exists idx_customers_phone on public.customers(phone);
create index if not exists idx_customers_email on public.customers(email);

create table if not exists public.coupons (
    code text primary key,
    discount_type text not null check (discount_type in ('percentage', 'fixed')),
    discount_value numeric(12, 2) not null,
    min_order_value numeric(12, 2) not null default 0,
    description text default '',
    active boolean not null default true,
    created_at timestamptz default now() not null
);

-- ------------------------------------------------------------------------------
-- 5. ORDERS & ORDER ITEMS (Omnichannel: Web + POS)
-- ------------------------------------------------------------------------------
create type order_status as enum ('Pending', 'Paid', 'Packed', 'Shipped', 'Delivered', 'Cancelled', 'Refunded');
create type payment_method as enum ('UPI', 'Card', 'Cash', 'NetBanking', 'COD', 'Split');
create type payment_status as enum ('Paid', 'Pending', 'Refunded');
create type sales_channel as enum ('online', 'POS');

create table if not exists public.orders (
    id uuid primary key default gen_random_uuid(),
    order_number text unique not null,
    channel sales_channel not null default 'online',
    customer_id uuid references public.customers(id) on delete set null,
    customer_name text not null,
    customer_phone text not null,
    customer_email text,
    subtotal numeric(12, 2) not null default 0,
    discount numeric(12, 2) not null default 0,
    coupon_code text references public.coupons(code) on delete set null,
    shipping numeric(12, 2) not null default 0,
    tax_cgst numeric(12, 2) not null default 0,
    tax_sgst numeric(12, 2) not null default 0,
    tax_igst numeric(12, 2) not null default 0,
    total numeric(12, 2) not null default 0,
    status order_status not null default 'Pending',
    payment_method payment_method not null default 'UPI',
    payment_status payment_status not null default 'Pending',
    shipping_address jsonb,
    tracking_number text,
    invoice_url text,
    notes text,
    created_at timestamptz default now() not null,
    updated_at timestamptz default now() not null
);

create index if not exists idx_orders_order_number on public.orders(order_number);
create index if not exists idx_orders_channel on public.orders(channel);
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_orders_created_at on public.orders(created_at desc);

create table if not exists public.order_items (
    id uuid primary key default gen_random_uuid(),
    order_id uuid not null references public.orders(id) on delete cascade,
    product_id text references public.products(id) on delete set null,
    product_title text not null,
    variant_sku text not null,
    phone_model_name text,
    color text,
    price numeric(12, 2) not null,
    quantity integer not null default 1,
    hsn_code text default '3926',
    gst_rate numeric(5, 2) default 18.00,
    image text default ''
);

create index if not exists idx_order_items_order_id on public.order_items(order_id);

-- ------------------------------------------------------------------------------
-- 6. POS OPERATIONS (Shifts & Parked Bills)
-- ------------------------------------------------------------------------------
create table if not exists public.pos_shifts (
    id uuid primary key default gen_random_uuid(),
    cashier_name text not null,
    start_time timestamptz not null default now(),
    end_time timestamptz,
    opening_cash numeric(12, 2) not null default 0,
    closing_cash_expected numeric(12, 2) not null default 0,
    closing_cash_actual numeric(12, 2),
    total_sales numeric(12, 2) not null default 0,
    cash_sales numeric(12, 2) not null default 0,
    upi_sales numeric(12, 2) not null default 0,
    card_sales numeric(12, 2) not null default 0,
    orders_count integer not null default 0,
    status text not null default 'open' check (status in ('open', 'closed')),
    created_at timestamptz default now() not null
);

create table if not exists public.pos_parked_bills (
    id uuid primary key default gen_random_uuid(),
    customer_phone text,
    customer_name text,
    selected_phone_model text,
    notes text,
    items jsonb not null default '[]'::jsonb,
    created_at timestamptz default now() not null
);

-- ------------------------------------------------------------------------------
-- 7. STAFF USERS & AUDIT LOGS
-- ------------------------------------------------------------------------------
create type user_role as enum ('Owner', 'Manager', 'Inventory', 'Cashier', 'Support');

create table if not exists public.staff_users (
    id uuid primary key default gen_random_uuid(),
    auth_user_id uuid references auth.users(id) on delete set null,
    name text not null,
    email text unique not null,
    role user_role not null default 'Cashier',
    active boolean not null default true,
    last_login timestamptz default now(),
    created_at timestamptz default now() not null
);

create table if not exists public.audit_logs (
    id uuid primary key default gen_random_uuid(),
    user_name text not null,
    role text not null,
    action text not null,
    details text not null default '',
    ip_address text,
    timestamp timestamptz default now() not null
);

create index if not exists idx_audit_logs_timestamp on public.audit_logs(timestamp desc);

-- ------------------------------------------------------------------------------
-- 8. AUTO-UPDATE TIMESTAMP FUNCTION & TRIGGERS
-- ------------------------------------------------------------------------------
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger set_products_updated_at
    before update on public.products
    for each row execute function public.handle_updated_at();

create trigger set_product_variants_updated_at
    before update on public.product_variants
    for each row execute function public.handle_updated_at();

create trigger set_orders_updated_at
    before update on public.orders
    for each row execute function public.handle_updated_at();

-- ------------------------------------------------------------------------------
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
alter table public.phone_brands enable row level security;
alter table public.phone_models enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_compatible_models enable row level security;
alter table public.coupons enable row level security;
alter table public.customers enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.pos_shifts enable row level security;
alter table public.pos_parked_bills enable row level security;
alter table public.staff_users enable row level security;
alter table public.audit_logs enable row level security;

-- Public Catalog: Anyone (anon + authenticated) can view active products & devices
create policy "Public catalog read access" on public.phone_brands for select to anon, authenticated using (true);
create policy "Public models read access" on public.phone_models for select to anon, authenticated using (true);
create policy "Public categories read access" on public.categories for select to anon, authenticated using (true);
create policy "Public products read access" on public.products for select to anon, authenticated using (status = 'active');
create policy "Public variants read access" on public.product_variants for select to anon, authenticated using (true);
create policy "Public compatible models read access" on public.product_compatible_models for select to anon, authenticated using (true);
create policy "Public coupons read active" on public.coupons for select to anon, authenticated using (active = true);

-- Orders: Customers can view their own orders or anon guest checkout insert
create policy "Allow order creation" on public.orders for insert to anon, authenticated with check (true);
create policy "Allow order items creation" on public.order_items for insert to anon, authenticated with check (true);
create policy "Users read own orders" on public.orders for select to authenticated using ((select auth.uid()) = (select auth_user_id from public.customers where customers.id = orders.customer_id));

-- Admin & Staff Access (Full management for authenticated staff)
create policy "Staff full access products" on public.products for all to authenticated using (true) with check (true);
create policy "Staff full access variants" on public.product_variants for all to authenticated using (true) with check (true);
create policy "Staff full access orders" on public.orders for all to authenticated using (true) with check (true);
create policy "Staff full access order_items" on public.order_items for all to authenticated using (true) with check (true);
create policy "Staff full access pos_shifts" on public.pos_shifts for all to authenticated using (true) with check (true);
create policy "Staff full access parked_bills" on public.pos_parked_bills for all to authenticated using (true) with check (true);
create policy "Staff full access customers" on public.customers for all to authenticated using (true) with check (true);
create policy "Staff full access audit_logs" on public.audit_logs for all to authenticated using (true) with check (true);
create policy "Staff full access staff_users" on public.staff_users for all to authenticated using (true) with check (true);


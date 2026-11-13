-- ==============================================================================
-- 001_extensions_and_helpers.sql
-- Gadget House Database Architecture
-- Extensions, generic utilities, and timestamp automation
-- ==============================================================================

-- 1. Essential Postgres Extensions
create extension if not exists "pgcrypto";
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";
create extension if not exists "unaccent";

-- 2. Reusable updated_at trigger function
create or replace function public.set_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    new.updated_at = clock_timestamp();
    return new;
end;
$$;

-- 3. Sequence for Orders and Invoices
create sequence if not exists public.order_number_seq start with 1001 increment by 1;
create sequence if not exists public.invoice_number_seq start with 1001 increment by 1;
create sequence if not exists public.credit_note_seq start with 1001 increment by 1;
-- ==============================================================================
-- 002_identity_and_access.sql
-- Gadget House Database Architecture
-- Profiles, RBAC (roles, permissions, role_permissions, staff_roles), Audit Logging
-- ==============================================================================

-- 1. Profiles (Linked 1:1 with Supabase Auth users)
create table if not exists public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    full_name text not null default '',
    phone text,
    avatar_url text,
    preferred_language char(2) not null default 'en',
    preferred_currency char(3) not null default 'INR',
    is_staff boolean not null default false,
    phone_model_id uuid, -- preferred device model
    deleted_at timestamptz,
    created_at timestamptz not null default clock_timestamp(),
    updated_at timestamptz not null default clock_timestamp()
);

create trigger trg_profiles_updated_at
    before update on public.profiles
    for each row execute function public.set_updated_at();

create index if not exists idx_profiles_phone on public.profiles(phone);
create index if not exists idx_profiles_is_staff on public.profiles(is_staff) where is_staff is true;

-- Auto-create profile on Supabase auth.users signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    insert into public.profiles (id, full_name, phone, avatar_url, is_staff)
    values (
        new.id,
        coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
        coalesce(new.raw_user_meta_data->>'phone', new.phone),
        coalesce(new.raw_user_meta_data->>'avatar_url', null),
        false
    )
    on conflict (id) do nothing;
    return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function public.handle_new_user();

-- 2. Roles & Permissions Architecture
create table if not exists public.roles (
    id uuid primary key default gen_random_uuid(),
    name text unique not null,
    description text default '',
    is_system boolean not null default false,
    created_at timestamptz not null default clock_timestamp(),
    updated_at timestamptz not null default clock_timestamp()
);

create trigger trg_roles_updated_at
    before update on public.roles
    for each row execute function public.set_updated_at();

create type permission_action as enum ('view', 'create', 'edit', 'delete', 'export');

create table if not exists public.permissions (
    id uuid primary key default gen_random_uuid(),
    module text not null, -- 'catalogue', 'inventory', 'orders', 'pos', 'staff', 'reports', 'settings'
    action permission_action not null,
    description text default '',
    created_at timestamptz not null default clock_timestamp(),
    unique (module, action)
);

create table if not exists public.role_permissions (
    role_id uuid not null references public.roles(id) on delete cascade,
    permission_id uuid not null references public.permissions(id) on delete cascade,
    created_at timestamptz not null default clock_timestamp(),
    primary key (role_id, permission_id)
);

create index if not exists idx_role_perms_perm on public.role_permissions(permission_id);

create table if not exists public.staff_roles (
    user_id uuid not null references public.profiles(id) on delete cascade,
    role_id uuid not null references public.roles(id) on delete cascade,
    assigned_by uuid references public.profiles(id) on delete set null,
    created_at timestamptz not null default clock_timestamp(),
    primary key (user_id, role_id)
);

create index if not exists idx_staff_roles_role on public.staff_roles(role_id);

-- 3. High-Performance Security Definer RBAC Helper Functions
create or replace function public.is_staff(check_user_id uuid default auth.uid())
returns boolean
language sql
security definer
stable
set search_path = public
as $$
    select exists (
        select 1 from public.profiles
        where id = check_user_id
          and is_staff is true
          and deleted_at is null
    );
$$;

create or replace function public.has_permission(p_module text, p_action permission_action, check_user_id uuid default auth.uid())
returns boolean
language sql
security definer
stable
set search_path = public
as $$
    select exists (
        select 1
        from public.staff_roles sr
        join public.role_permissions rp on rp.role_id = sr.role_id
        join public.permissions p on p.id = rp.permission_id
        join public.profiles pr on pr.id = sr.user_id
        where sr.user_id = check_user_id
          and pr.is_staff is true
          and pr.deleted_at is null
          and p.module = p_module
          and p.action = p_action
    );
$$;

-- 4. Audit Logging Engine
create table if not exists public.audit_logs (
    id uuid primary key default gen_random_uuid(),
    actor_id uuid references public.profiles(id) on delete set null,
    action text not null, -- INSERT, UPDATE, DELETE, RPC_CALL
    table_name text not null,
    record_id text,
    old_data jsonb,
    new_data jsonb,
    ip_address text,
    created_at timestamptz not null default clock_timestamp()
);

create index if not exists idx_audit_logs_table_record on public.audit_logs(table_name, record_id);
create index if not exists idx_audit_logs_actor on public.audit_logs(actor_id);
create index if not exists idx_audit_logs_created_at on public.audit_logs(created_at desc);

-- Generic Audit Trigger for sensitive operations
create or replace function public.audit_trigger_fn()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
    v_record_id text;
    v_actor_id uuid;
begin
    v_actor_id := auth.uid();
    if TG_OP = 'DELETE' then
        v_record_id := old.id::text;
        insert into public.audit_logs (actor_id, action, table_name, record_id, old_data)
        values (v_actor_id, 'DELETE', TG_TABLE_NAME, v_record_id, to_jsonb(old));
        return old;
    elsif TG_OP = 'UPDATE' then
        v_record_id := new.id::text;
        insert into public.audit_logs (actor_id, action, table_name, record_id, old_data, new_data)
        values (v_actor_id, 'UPDATE', TG_TABLE_NAME, v_record_id, to_jsonb(old), to_jsonb(new));
        return new;
    elsif TG_OP = 'INSERT' then
        v_record_id := new.id::text;
        insert into public.audit_logs (actor_id, action, table_name, record_id, new_data)
        values (v_actor_id, 'INSERT', TG_TABLE_NAME, v_record_id, to_jsonb(new));
        return new;
    end if;
    return null;
end;
$$;
-- ==============================================================================
-- 003_catalogue.sql
-- Gadget House Database Architecture
-- Phone brands, models, categories, products, variants, compatibility & search
-- ==============================================================================

-- 1. Phone Brands & Device Models
create table if not exists public.phone_brands (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    slug text unique not null,
    logo_url text,
    sort_order integer not null default 0,
    is_active boolean not null default true,
    created_at timestamptz not null default clock_timestamp(),
    updated_at timestamptz not null default clock_timestamp()
);

create trigger trg_phone_brands_updated_at
    before update on public.phone_brands
    for each row execute function public.set_updated_at();

create index if not exists idx_phone_brands_sort on public.phone_brands(sort_order);

create table if not exists public.phone_models (
    id uuid primary key default gen_random_uuid(),
    brand_id uuid not null references public.phone_brands(id) on delete cascade,
    name text not null,
    slug text unique not null,
    release_year integer not null default 2024,
    image_url text,
    is_active boolean not null default true,
    created_at timestamptz not null default clock_timestamp(),
    updated_at timestamptz not null default clock_timestamp()
);

create trigger trg_phone_models_updated_at
    before update on public.phone_models
    for each row execute function public.set_updated_at();

create index if not exists idx_phone_models_brand on public.phone_models(brand_id);
create index if not exists idx_phone_models_name_trgm on public.phone_models using gin (name gin_trgm_ops);

-- Link profile device FK
alter table public.profiles
    add constraint fk_profiles_phone_model
    foreign key (phone_model_id) references public.phone_models(id) on delete set null;

-- 2. Hierarchical Categories
create table if not exists public.categories (
    id uuid primary key default gen_random_uuid(),
    parent_id uuid references public.categories(id) on delete set null,
    name text not null,
    slug text unique not null,
    image_url text,
    sort_order integer not null default 0,
    is_active boolean not null default true,
    created_at timestamptz not null default clock_timestamp(),
    updated_at timestamptz not null default clock_timestamp()
);

create trigger trg_categories_updated_at
    before update on public.categories
    for each row execute function public.set_updated_at();

create index if not exists idx_categories_parent on public.categories(parent_id);
create index if not exists idx_categories_slug on public.categories(slug);

-- 3. Products
create type product_lifecycle_status as enum ('draft', 'active', 'archived');

create table if not exists public.products (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    slug text unique not null,
    short_description text default '',
    description text default '',
    category_id uuid not null references public.categories(id) on delete restrict,
    accessory_brand text not null default 'Gadget House',
    tags text[] not null default '{}',
    status product_lifecycle_status not null default 'draft',
    seo_title text,
    seo_description text,
    hsn_code text not null default '3926',
    gst_rate numeric(5, 2) not null default 18.00,
    tax_inclusive boolean not null default true,
    weight_grams integer default 0,
    dimensions jsonb not null default '{"length": 0, "width": 0, "height": 0}'::jsonb,
    search_vector tsvector,
    deleted_at timestamptz,
    created_at timestamptz not null default clock_timestamp(),
    updated_at timestamptz not null default clock_timestamp()
);

create trigger trg_products_updated_at
    before update on public.products
    for each row execute function public.set_updated_at();

create index if not exists idx_products_category on public.products(category_id);
create index if not exists idx_products_status_category on public.products(status, category_id) where deleted_at is null;
create index if not exists idx_products_title_trgm on public.products using gin (title gin_trgm_ops);
create index if not exists idx_products_search_vector on public.products using gin (search_vector);

-- Search vector updater trigger
create or replace function public.products_search_vector_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    new.search_vector :=
        setweight(to_tsvector('english', unaccent(coalesce(new.title, ''))), 'A') ||
        setweight(to_tsvector('english', unaccent(array_to_string(new.tags, ' '))), 'B') ||
        setweight(to_tsvector('english', unaccent(coalesce(new.accessory_brand, ''))), 'B') ||
        setweight(to_tsvector('english', unaccent(coalesce(new.short_description, ''))), 'C') ||
        setweight(to_tsvector('english', unaccent(coalesce(new.description, ''))), 'D');
    return new;
end;
$$;

create trigger trg_products_search_vector
    before insert or update on public.products
    for each row execute function public.products_search_vector_update();

-- 4. Product Variants (Money stored as bigint paise)
create table if not exists public.product_variants (
    id uuid primary key default gen_random_uuid(),
    product_id uuid not null references public.products(id) on delete cascade,
    sku text unique not null,
    barcode text unique,
    option_values jsonb not null default '{}'::jsonb, -- e.g. {"color": "Midnight Black", "finish": "Matte"}
    price bigint not null default 0 check (price >= 0), -- minor units (paise)
    compare_at_price bigint not null default 0 check (compare_at_price >= 0),
    cost_price bigint not null default 0 check (cost_price >= 0), -- sensitive!
    weight_grams integer default 0,
    is_active boolean not null default true,
    deleted_at timestamptz,
    created_at timestamptz not null default clock_timestamp(),
    updated_at timestamptz not null default clock_timestamp()
);

create trigger trg_product_variants_updated_at
    before update on public.product_variants
    for each row execute function public.set_updated_at();

create index if not exists idx_variants_product on public.product_variants(product_id);
create index if not exists idx_variants_sku on public.product_variants(sku);
create index if not exists idx_variants_barcode on public.product_variants(barcode) where barcode is not null;

-- 5. Product Images
create table if not exists public.product_images (
    id uuid primary key default gen_random_uuid(),
    product_id uuid not null references public.products(id) on delete cascade,
    variant_id uuid references public.product_variants(id) on delete set null,
    url text not null,
    alt_text text default '',
    sort_order integer not null default 0,
    created_at timestamptz not null default clock_timestamp(),
    updated_at timestamptz not null default clock_timestamp()
);

create trigger trg_product_images_updated_at
    before update on public.product_images
    for each row execute function public.set_updated_at();

create index if not exists idx_product_images_prod on public.product_images(product_id, sort_order);

-- 6. Product Device Compatibility Matrix
create table if not exists public.product_compatibility (
    id uuid primary key default gen_random_uuid(),
    product_id uuid not null references public.products(id) on delete cascade,
    variant_id uuid references public.product_variants(id) on delete cascade,
    phone_model_id uuid not null references public.phone_models(id) on delete cascade,
    created_at timestamptz not null default clock_timestamp(),
    unique (product_id, variant_id, phone_model_id)
);

create index if not exists idx_prod_compat_model on public.product_compatibility(phone_model_id);
create index if not exists idx_prod_compat_prod on public.product_compatibility(product_id);

-- 7. Market-Specific Price Overrides (USD, EUR, GBP, AED, etc.)
create table if not exists public.market_prices (
    id uuid primary key default gen_random_uuid(),
    variant_id uuid not null references public.product_variants(id) on delete cascade,
    currency_code char(3) not null,
    price bigint not null check (price >= 0),
    compare_at_price bigint default 0 check (compare_at_price >= 0),
    created_at timestamptz not null default clock_timestamp(),
    updated_at timestamptz not null default clock_timestamp(),
    unique (variant_id, currency_code)
);

create trigger trg_market_prices_updated_at
    before update on public.market_prices
    for each row execute function public.set_updated_at();

-- Attach Audit Triggers to Products and Variants
create trigger trg_audit_products
    after insert or update or delete on public.products
    for each row execute function public.audit_trigger_fn();

create trigger trg_audit_product_variants
    after insert or update or delete on public.product_variants
    for each row execute function public.audit_trigger_fn();
-- ==============================================================================
-- 004_inventory.sql
-- Gadget House Database Architecture
-- Multi-location inventory, append-only stock ledger, suppliers & purchases
-- ==============================================================================

-- 1. Locations (Online fulfillment warehouse vs retail POS shop counter)
create type location_type as enum ('warehouse', 'shop');

create table if not exists public.locations (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    slug text unique not null,
    type location_type not null default 'warehouse',
    address jsonb not null default '{}'::jsonb,
    is_active boolean not null default true,
    created_at timestamptz not null default clock_timestamp(),
    updated_at timestamptz not null default clock_timestamp()
);

create trigger trg_locations_updated_at
    before update on public.locations
    for each row execute function public.set_updated_at();

-- 2. Inventory Levels
create table if not exists public.inventory_levels (
    id uuid primary key default gen_random_uuid(),
    variant_id uuid not null references public.product_variants(id) on delete cascade,
    location_id uuid not null references public.locations(id) on delete cascade,
    quantity integer not null default 0 check (quantity >= 0),
    reserved integer not null default 0 check (reserved >= 0),
    low_stock_threshold integer not null default 5,
    created_at timestamptz not null default clock_timestamp(),
    updated_at timestamptz not null default clock_timestamp(),
    unique (variant_id, location_id)
);

create trigger trg_inventory_levels_updated_at
    before update on public.inventory_levels
    for each row execute function public.set_updated_at();

create index if not exists idx_inv_levels_variant on public.inventory_levels(variant_id);
create index if not exists idx_inv_levels_low_stock on public.inventory_levels(location_id) where quantity <= low_stock_threshold;

-- 3. Append-Only Stock Movements Ledger
create type stock_movement_reason as enum (
    'sale_online',
    'sale_pos',
    'return',
    'purchase',
    'adjustment',
    'transfer'
);

create table if not exists public.stock_movements (
    id uuid primary key default gen_random_uuid(),
    variant_id uuid not null references public.product_variants(id) on delete cascade,
    location_id uuid not null references public.locations(id) on delete cascade,
    delta integer not null, -- positive for restock, negative for deduction
    reason stock_movement_reason not null,
    reference_type text, -- 'order', 'purchase_entry', 'shift_adjustment'
    reference_id uuid,
    note text,
    created_by uuid references public.profiles(id) on delete set null,
    created_at timestamptz not null default clock_timestamp()
);

create index if not exists idx_stock_movements_variant on public.stock_movements(variant_id, created_at desc);
create index if not exists idx_stock_movements_ref on public.stock_movements(reference_type, reference_id);

-- Enforce that every stock_movements entry applies atomically to inventory_levels
create or replace function public.apply_stock_movement()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    insert into public.inventory_levels (variant_id, location_id, quantity)
    values (new.variant_id, new.location_id, greatest(0, new.delta))
    on conflict (variant_id, location_id) do update
    set quantity = inventory_levels.quantity + new.delta,
        updated_at = clock_timestamp();

    -- Ensure stock didn't drop below 0
    if (select quantity from public.inventory_levels where variant_id = new.variant_id and location_id = new.location_id) < 0 then
        raise exception 'Insufficient stock for variant % at location %', new.variant_id, new.location_id;
    end if;

    return new;
end;
$$;

create trigger trg_apply_stock_movement
    after insert on public.stock_movements
    for each row execute function public.apply_stock_movement();

-- 4. Suppliers & Purchase Entries
create table if not exists public.suppliers (
    id uuid primary key default gen_random_uuid(),
    company_name text not null,
    contact_person text,
    email text,
    phone text,
    gstin text,
    address jsonb default '{}'::jsonb,
    is_active boolean not null default true,
    created_at timestamptz not null default clock_timestamp(),
    updated_at timestamptz not null default clock_timestamp()
);

create trigger trg_suppliers_updated_at
    before update on public.suppliers
    for each row execute function public.set_updated_at();

create type purchase_status as enum ('draft', 'ordered', 'received', 'cancelled');

create table if not exists public.purchase_entries (
    id uuid primary key default gen_random_uuid(),
    supplier_id uuid not null references public.suppliers(id) on delete restrict,
    location_id uuid not null references public.locations(id) on delete restrict,
    invoice_number text not null,
    invoice_date date not null default current_date,
    total_cost bigint not null default 0 check (total_cost >= 0),
    status purchase_status not null default 'draft',
    received_at timestamptz,
    received_by uuid references public.profiles(id) on delete set null,
    notes text,
    created_at timestamptz not null default clock_timestamp(),
    updated_at timestamptz not null default clock_timestamp()
);

create trigger trg_purchase_entries_updated_at
    before update on public.purchase_entries
    for each row execute function public.set_updated_at();

create table if not exists public.purchase_items (
    id uuid primary key default gen_random_uuid(),
    purchase_entry_id uuid not null references public.purchase_entries(id) on delete cascade,
    variant_id uuid not null references public.product_variants(id) on delete restrict,
    quantity integer not null check (quantity > 0),
    unit_cost bigint not null check (unit_cost >= 0),
    tax_rate numeric(5, 2) default 18.00,
    created_at timestamptz not null default clock_timestamp()
);

-- When a purchase is marked 'received', add stock via stock_movements and update cost_price
create or replace function public.handle_purchase_received()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
    r record;
begin
    if new.status = 'received' and (old.status is distinct from 'received') then
        for r in select * from public.purchase_items where purchase_entry_id = new.id loop
            -- 1. Insert stock movement (trigger updates inventory_levels)
            insert into public.stock_movements (
                variant_id,
                location_id,
                delta,
                reason,
                reference_type,
                reference_id,
                created_by
            ) values (
                r.variant_id,
                new.location_id,
                r.quantity,
                'purchase',
                'purchase_entry',
                new.id,
                new.received_by
            );

            -- 2. Update variant latest cost_price
            update public.product_variants
            set cost_price = r.unit_cost,
                updated_at = clock_timestamp()
            where id = r.variant_id;
        end loop;
        new.received_at := clock_timestamp();
    end if;
    return new;
end;
$$;

create trigger trg_purchase_received
    before update on public.purchase_entries
    for each row execute function public.handle_purchase_received();
-- ==============================================================================
-- 005_customers_and_shopping.sql
-- Gadget House Database Architecture
-- Customer addresses, wishlists, carts (guest & auth), reviews & stock alerts
-- ==============================================================================

-- 1. Addresses
create table if not exists public.addresses (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.profiles(id) on delete cascade,
    country_code char(2) not null default 'IN',
    name text not null,
    phone text not null,
    line1 text not null,
    line2 text,
    city text not null,
    state text not null,
    postal_code text not null,
    is_default boolean not null default false,
    created_at timestamptz not null default clock_timestamp(),
    updated_at timestamptz not null default clock_timestamp()
);

create trigger trg_addresses_updated_at
    before update on public.addresses
    for each row execute function public.set_updated_at();

create index if not exists idx_addresses_user on public.addresses(user_id);

-- Enforce single default address per user
create or replace function public.ensure_single_default_address()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    if new.is_default then
        update public.addresses
        set is_default = false
        where user_id = new.user_id and id <> new.id;
    end if;
    return new;
end;
$$;

create trigger trg_ensure_default_address
    before insert or update on public.addresses
    for each row execute function public.ensure_single_default_address();

-- 2. Wishlists
create table if not exists public.wishlists (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.profiles(id) on delete cascade,
    product_id uuid not null references public.products(id) on delete cascade,
    created_at timestamptz not null default clock_timestamp(),
    unique (user_id, product_id)
);

create index if not exists idx_wishlist_user on public.wishlists(user_id);

-- 3. Shopping Carts (Supporting both Logged-in Shoppers and Guest Session IDs)
create table if not exists public.carts (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references public.profiles(id) on delete cascade,
    session_id text, -- for guest anonymous shopping
    currency_code char(3) not null default 'INR',
    created_at timestamptz not null default clock_timestamp(),
    updated_at timestamptz not null default clock_timestamp(),
    check (user_id is not null or session_id is not null)
);

create trigger trg_carts_updated_at
    before update on public.carts
    for each row execute function public.set_updated_at();

create index if not exists idx_carts_user on public.carts(user_id) where user_id is not null;
create index if not exists idx_carts_session on public.carts(session_id) where session_id is not null;

create table if not exists public.cart_items (
    id uuid primary key default gen_random_uuid(),
    cart_id uuid not null references public.carts(id) on delete cascade,
    variant_id uuid not null references public.product_variants(id) on delete cascade,
    quantity integer not null default 1 check (quantity > 0),
    created_at timestamptz not null default clock_timestamp(),
    updated_at timestamptz not null default clock_timestamp(),
    unique (cart_id, variant_id)
);

create trigger trg_cart_items_updated_at
    before update on public.cart_items
    for each row execute function public.set_updated_at();

-- 4. Customer Product Reviews
create type review_status as enum ('pending', 'approved', 'rejected');

create table if not exists public.reviews (
    id uuid primary key default gen_random_uuid(),
    product_id uuid not null references public.products(id) on delete cascade,
    user_id uuid not null references public.profiles(id) on delete cascade,
    order_id uuid, -- optional verification link
    rating smallint not null check (rating between 1 and 5),
    title text default '',
    body text not null,
    photos text[] not null default '{}',
    country_code char(2) default 'IN',
    is_verified_purchase boolean not null default false,
    status review_status not null default 'pending',
    created_at timestamptz not null default clock_timestamp(),
    updated_at timestamptz not null default clock_timestamp(),
    unique (product_id, user_id)
);

create trigger trg_reviews_updated_at
    before update on public.reviews
    for each row execute function public.set_updated_at();

create index if not exists idx_reviews_product_status on public.reviews(product_id, status) where status = 'approved';

-- 5. Back in Stock Notifications
create table if not exists public.back_in_stock_requests (
    id uuid primary key default gen_random_uuid(),
    variant_id uuid not null references public.product_variants(id) on delete cascade,
    email text not null,
    user_id uuid references public.profiles(id) on delete set null,
    status text not null default 'pending' check (status in ('pending', 'notified')),
    created_at timestamptz not null default clock_timestamp(),
    notified_at timestamptz
);

create index if not exists idx_stock_requests_variant on public.back_in_stock_requests(variant_id) where status = 'pending';
-- ==============================================================================
-- 006_orders_and_billing.sql
-- Gadget House Database Architecture
-- Unified omnichannel orders, payments, refunds, shipments, audit events,
-- and gapless GST invoice numbering with row-level counter locking
-- ==============================================================================

-- 1. Status Enums
create type sales_channel as enum ('online', 'pos');
create type order_lifecycle_status as enum (
    'pending',
    'paid',
    'packed',
    'shipped',
    'delivered',
    'cancelled',
    'returned',
    'refunded'
);
create type order_payment_status as enum ('pending', 'paid', 'partially_refunded', 'refunded', 'failed');

-- 2. GST Gapless Sequential Invoice Counters per Location and Financial Year
create table if not exists public.invoice_counters (
    location_id uuid not null references public.locations(id) on delete cascade,
    financial_year text not null, -- e.g. '2026-27'
    prefix text not null default 'GH',
    last_val integer not null default 0,
    created_at timestamptz not null default clock_timestamp(),
    updated_at timestamptz not null default clock_timestamp(),
    primary key (location_id, financial_year, prefix)
);

-- Function to obtain the next gapless invoice number with exclusive row lock
create or replace function public.get_next_invoice_number(p_location_id uuid, p_prefix text default 'GH')
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
    v_fy text;
    v_seq integer;
    v_month integer;
    v_year integer;
    v_loc_code text;
begin
    -- Determine Indian Financial Year (starts April 1)
    v_month := extract(month from clock_timestamp())::int;
    v_year := extract(year from clock_timestamp())::int;
    if v_month >= 4 then
        v_fy := v_year::text || '-' || substr((v_year + 1)::text, 3, 2);
    else
        v_fy := (v_year - 1)::text || '-' || substr(v_year::text, 3, 2);
    end if;

    -- Lookup location prefix (slug or short code)
    select coalesce(substr(upper(slug), 1, 3), 'LOC') into v_loc_code
    from public.locations where id = p_location_id;

    -- Upsert and lock row with FOR UPDATE
    insert into public.invoice_counters (location_id, financial_year, prefix, last_val)
    values (p_location_id, v_fy, p_prefix, 1)
    on conflict (location_id, financial_year, prefix) do update
    set last_val = invoice_counters.last_val + 1,
        updated_at = clock_timestamp()
    returning last_val into v_seq;

    -- Format: GH/BLR/26-27/00001
    return p_prefix || '/' || coalesce(v_loc_code, 'HO') || '/' || v_fy || '/' || lpad(v_seq::text, 5, '0');
end;
$$;

-- 3. Unified Orders Table
create table if not exists public.orders (
    id uuid primary key default gen_random_uuid(),
    order_number text unique not null default ('GH-' || to_char(clock_timestamp(), 'YYYY') || '-' || lpad(nextval('public.order_number_seq')::text, 5, '0')),
    channel sales_channel not null default 'online',
    customer_id uuid references public.profiles(id) on delete set null,
    customer_email text,
    customer_phone text not null,
    currency_code char(3) not null default 'INR',
    exchange_rate numeric(10, 4) not null default 1.0000, -- Rate against INR at placement
    subtotal bigint not null default 0 check (subtotal >= 0),
    discount_total bigint not null default 0 check (discount_total >= 0),
    shipping_total bigint not null default 0 check (shipping_total >= 0),
    tax_total bigint not null default 0 check (tax_total >= 0),
    grand_total bigint not null default 0 check (grand_total >= 0),
    status order_lifecycle_status not null default 'pending',
    payment_status order_payment_status not null default 'pending',
    shipping_address jsonb default '{}'::jsonb,
    billing_address jsonb default '{}'::jsonb,
    location_id uuid not null references public.locations(id) on delete restrict,
    cashier_id uuid references public.profiles(id) on delete set null, -- POS cashier
    shift_id uuid, -- links to pos_shifts
    notes text,
    created_at timestamptz not null default clock_timestamp(),
    updated_at timestamptz not null default clock_timestamp()
);

create trigger trg_orders_updated_at
    before update on public.orders
    for each row execute function public.set_updated_at();

create index if not exists idx_orders_customer on public.orders(customer_id, created_at desc);
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_orders_channel_status on public.orders(channel, status);
create index if not exists idx_orders_created_at on public.orders(created_at desc);

-- 4. Order Line Items
create table if not exists public.order_items (
    id uuid primary key default gen_random_uuid(),
    order_id uuid not null references public.orders(id) on delete cascade,
    variant_id uuid references public.product_variants(id) on delete set null,
    title_snapshot text not null,
    sku_snapshot text not null,
    quantity integer not null check (quantity > 0),
    unit_price bigint not null check (unit_price >= 0),
    discount bigint not null default 0 check (discount >= 0),
    tax_rate numeric(5, 2) not null default 18.00,
    tax_amount bigint not null default 0 check (tax_amount >= 0),
    hsn_code text not null default '3926',
    line_total bigint not null check (line_total >= 0),
    created_at timestamptz not null default clock_timestamp()
);

create index if not exists idx_order_items_order on public.order_items(order_id);
create index if not exists idx_order_items_variant on public.order_items(variant_id);

-- 5. Payments (Supporting Split Payments, UPI, Cash, Cards)
create type payment_provider as enum ('razorpay', 'stripe', 'paypal', 'cash', 'upi', 'card', 'store_credit');
create type payment_record_status as enum ('pending', 'captured', 'failed', 'refunded');

create table if not exists public.payments (
    id uuid primary key default gen_random_uuid(),
    order_id uuid not null references public.orders(id) on delete cascade,
    provider payment_provider not null,
    provider_payment_id text,
    amount bigint not null check (amount > 0),
    currency_code char(3) not null default 'INR',
    status payment_record_status not null default 'pending',
    method text default '', -- e.g. 'UPI_QR', 'VISA_CARD', 'CASH'
    raw_response jsonb default '{}'::jsonb,
    created_at timestamptz not null default clock_timestamp(),
    updated_at timestamptz not null default clock_timestamp()
);

create trigger trg_payments_updated_at
    before update on public.payments
    for each row execute function public.set_updated_at();

create index if not exists idx_payments_order on public.payments(order_id);

-- 6. Refunds & Refund Items
create table if not exists public.refunds (
    id uuid primary key default gen_random_uuid(),
    order_id uuid not null references public.orders(id) on delete cascade,
    amount bigint not null check (amount > 0),
    reason text not null,
    restock boolean not null default true,
    approved_by uuid references public.profiles(id) on delete set null,
    created_at timestamptz not null default clock_timestamp()
);

create table if not exists public.refund_items (
    id uuid primary key default gen_random_uuid(),
    refund_id uuid not null references public.refunds(id) on delete cascade,
    order_item_id uuid not null references public.order_items(id) on delete cascade,
    quantity integer not null check (quantity > 0),
    amount bigint not null check (amount >= 0),
    restocked boolean not null default true,
    created_at timestamptz not null default clock_timestamp()
);

-- Restock on refund approval trigger
create or replace function public.handle_refund_restock()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
    v_order record;
    v_item record;
begin
    if new.restock then
        select location_id into v_order from public.orders where id = new.order_id;
        for v_item in select ri.quantity, oi.variant_id
                      from public.refund_items ri
                      join public.order_items oi on oi.id = ri.order_item_id
                      where ri.refund_id = new.id loop
            if v_item.variant_id is not null then
                insert into public.stock_movements (
                    variant_id,
                    location_id,
                    delta,
                    reason,
                    reference_type,
                    reference_id,
                    created_by
                ) values (
                    v_item.variant_id,
                    v_order.location_id,
                    v_item.quantity,
                    'return',
                    'refund',
                    new.id,
                    new.approved_by
                );
            end if;
        end loop;
    end if;
    return new;
end;
$$;

create trigger trg_refund_restock
    after insert on public.refunds
    for each row execute function public.handle_refund_restock();

-- 7. Shipments
create table if not exists public.shipments (
    id uuid primary key default gen_random_uuid(),
    order_id uuid not null references public.orders(id) on delete cascade,
    courier text not null, -- 'Bluedart', 'Delhivery', 'DHL', 'FedEx'
    tracking_number text not null,
    status text not null default 'manifested',
    label_url text,
    shipped_at timestamptz,
    delivered_at timestamptz,
    created_at timestamptz not null default clock_timestamp(),
    updated_at timestamptz not null default clock_timestamp()
);

create trigger trg_shipments_updated_at
    before update on public.shipments
    for each row execute function public.set_updated_at();

create index if not exists idx_shipments_tracking on public.shipments(tracking_number);

-- 8. Order Events Timeline
create table if not exists public.order_events (
    id uuid primary key default gen_random_uuid(),
    order_id uuid not null references public.orders(id) on delete cascade,
    type text not null, -- 'ORDER_PLACED', 'PAYMENT_CAPTURED', 'DISPATCHED', 'DELIVERED', 'REFUND_ISSUED'
    message text not null,
    actor_id uuid references public.profiles(id) on delete set null,
    metadata jsonb default '{}'::jsonb,
    created_at timestamptz not null default clock_timestamp()
);

create index if not exists idx_order_events_order on public.order_events(order_id, created_at asc);

-- 9. Tax Invoices & Credit Notes
create table if not exists public.invoices (
    id uuid primary key default gen_random_uuid(),
    order_id uuid not null references public.orders(id) on delete cascade,
    invoice_number text unique not null,
    financial_year text not null,
    issued_at timestamptz not null default clock_timestamp(),
    pdf_url text,
    created_at timestamptz not null default clock_timestamp()
);

create index if not exists idx_invoices_order on public.invoices(order_id);
create index if not exists idx_invoices_num on public.invoices(invoice_number);

create table if not exists public.credit_notes (
    id uuid primary key default gen_random_uuid(),
    invoice_id uuid not null references public.invoices(id) on delete cascade,
    refund_id uuid references public.refunds(id) on delete set null,
    credit_note_number text unique not null,
    amount bigint not null check (amount > 0),
    reason text not null,
    issued_at timestamptz not null default clock_timestamp(),
    created_at timestamptz not null default clock_timestamp()
);

-- Sensitive tables audit
create trigger trg_audit_orders
    after insert or update or delete on public.orders
    for each row execute function public.audit_trigger_fn();

create trigger trg_audit_refunds
    after insert or update on public.refunds
    for each row execute function public.audit_trigger_fn();
-- ==============================================================================
-- 007_pos_module.sql
-- Gadget House Database Architecture
-- POS Cashier Shifts, Held Carts, Atomic Checkout RPC & Bill Voiding
-- ==============================================================================

-- 1. POS Cashier Shifts
create type shift_status as enum ('open', 'closed');

create table if not exists public.pos_shifts (
    id uuid primary key default gen_random_uuid(),
    cashier_id uuid not null references public.profiles(id) on delete restrict,
    location_id uuid not null references public.locations(id) on delete restrict,
    opened_at timestamptz not null default clock_timestamp(),
    closed_at timestamptz,
    opening_cash bigint not null default 0 check (opening_cash >= 0),
    expected_cash bigint not null default 0 check (expected_cash >= 0),
    counted_cash bigint check (counted_cash is null or counted_cash >= 0),
    status shift_status not null default 'open',
    notes text,
    created_at timestamptz not null default clock_timestamp(),
    updated_at timestamptz not null default clock_timestamp()
);

create trigger trg_pos_shifts_updated_at
    before update on public.pos_shifts
    for each row execute function public.set_updated_at();

create index if not exists idx_pos_shifts_cashier on public.pos_shifts(cashier_id, status);

-- Attach shift FK to orders
alter table public.orders
    add constraint fk_orders_pos_shift
    foreign key (shift_id) references public.pos_shifts(id) on delete set null;

-- 2. Cash In / Cash Out Movements during Shift
create type cash_movement_type as enum ('in', 'out');

create table if not exists public.pos_cash_movements (
    id uuid primary key default gen_random_uuid(),
    shift_id uuid not null references public.pos_shifts(id) on delete cascade,
    type cash_movement_type not null,
    amount bigint not null check (amount > 0),
    reason text not null,
    authorized_by uuid references public.profiles(id) on delete set null,
    created_at timestamptz not null default clock_timestamp()
);

-- When cash moves in/out, adjust expected_cash
create or replace function public.handle_pos_cash_movement()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    if new.type = 'in' then
        update public.pos_shifts
        set expected_cash = expected_cash + new.amount,
            updated_at = clock_timestamp()
        where id = new.shift_id;
    else
        update public.pos_shifts
        set expected_cash = expected_cash - new.amount,
            updated_at = clock_timestamp()
        where id = new.shift_id;
    end if;
    return new;
end;
$$;

create trigger trg_pos_cash_movement
    after insert on public.pos_cash_movements
    for each row execute function public.handle_pos_cash_movement();

-- 3. Held / Parked Carts
create table if not exists public.pos_held_carts (
    id uuid primary key default gen_random_uuid(),
    cashier_id uuid not null references public.profiles(id) on delete cascade,
    location_id uuid not null references public.locations(id) on delete cascade,
    customer_phone text,
    customer_name text,
    payload jsonb not null default '{}'::jsonb,
    notes text,
    created_at timestamptz not null default clock_timestamp()
);

-- 4. High-Performance Atomic POS Bill Creation RPC
create or replace function public.create_pos_bill(
    p_location_id uuid,
    p_shift_id uuid,
    p_customer_id uuid,
    p_customer_phone text,
    p_customer_name text,
    p_items jsonb,      -- array of {variant_id, quantity, unit_price, discount, tax_rate}
    p_payments jsonb,   -- array of {provider, amount, method}
    p_discount jsonb    -- {code, amount, percentage, approved_by}
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
    v_cashier_id uuid;
    v_shift record;
    v_order_id uuid;
    v_order_number text;
    v_invoice_num text;
    v_item jsonb;
    v_payment jsonb;
    v_subtotal bigint := 0;
    v_tax_total bigint := 0;
    v_discount_total bigint := 0;
    v_grand_total bigint := 0;
    v_cash_paid bigint := 0;
    v_curr_stock integer;
    v_item_line_total bigint;
    v_item_tax bigint;
    v_variant record;
    v_max_cashier_discount_pct numeric := 10.0;
    v_discount_pct numeric := 0;
    v_approver_role text;
begin
    v_cashier_id := auth.uid();

    -- 1. Verify shift is open
    select * into v_shift from public.pos_shifts
    where id = p_shift_id and location_id = p_location_id and status = 'open'
    for update;

    if not found then
        raise exception 'Active shift not found or already closed.';
    end if;

    -- 2. Validate cashier discount limits
    if p_discount is not null and (p_discount->>'percentage')::numeric > 0 then
        v_discount_pct := (p_discount->>'percentage')::numeric;
        if v_discount_pct > v_max_cashier_discount_pct then
            -- Requires manager override
            if (p_discount->>'approved_by') is null then
                raise exception 'Discount of %% exceeds cashier limit (%% max). Manager approval required.', v_discount_pct, v_max_cashier_discount_pct;
            end if;
            -- Check approver has manager/owner role
            select r.name into v_approver_role
            from public.staff_roles sr
            join public.roles r on r.id = sr.role_id
            where sr.user_id = (p_discount->>'approved_by')::uuid
              and r.name in ('Owner', 'Manager');

            if v_approver_role is null then
                raise exception 'Approver is not authorized for manager discount override.';
            end if;
        end if;
    end if;

    -- 3. Pre-calculate totals & lock inventory rows
    for v_item in select * from jsonb_array_elements(p_items) loop
        select quantity into v_curr_stock
        from public.inventory_levels
        where variant_id = (v_item->>'variant_id')::uuid
          and location_id = p_location_id
        for update;

        if v_curr_stock is null or v_curr_stock < (v_item->>'quantity')::int then
            raise exception 'Insufficient stock for variant % (available: %, requested: %)',
                v_item->>'variant_id', coalesce(v_curr_stock, 0), v_item->>'quantity';
        end if;

        v_item_line_total := ((v_item->>'unit_price')::bigint * (v_item->>'quantity')::int) - coalesce((v_item->>'discount')::bigint, 0);
        v_item_tax := round(v_item_line_total * (coalesce((v_item->>'tax_rate')::numeric, 18.0) / 100.0));
        
        v_subtotal := v_subtotal + ((v_item->>'unit_price')::bigint * (v_item->>'quantity')::int);
        v_tax_total := v_tax_total + v_item_tax;
    end loop;

    v_discount_total := coalesce((p_discount->>'amount')::bigint, 0);
    v_grand_total := v_subtotal - v_discount_total + v_tax_total;

    -- 4. Create the Order
    insert into public.orders (
        channel,
        customer_id,
        customer_phone,
        customer_email,
        currency_code,
        subtotal,
        discount_total,
        tax_total,
        grand_total,
        status,
        payment_status,
        location_id,
        cashier_id,
        shift_id
    ) values (
        'pos',
        p_customer_id,
        coalesce(p_customer_phone, 'Walking Customer'),
        null,
        'INR',
        v_subtotal,
        v_discount_total,
        v_tax_total,
        v_grand_total,
        'delivered', -- Immediate in-store delivery
        'paid',
        p_location_id,
        v_cashier_id,
        p_shift_id
    )
    returning id, order_number into v_order_id, v_order_number;

    -- 5. Insert order items & deduct stock via ledger
    for v_item in select * from jsonb_array_elements(p_items) loop
        select pv.sku, p.title into v_variant
        from public.product_variants pv
        join public.products p on p.id = pv.product_id
        where pv.id = (v_item->>'variant_id')::uuid;

        v_item_line_total := ((v_item->>'unit_price')::bigint * (v_item->>'quantity')::int) - coalesce((v_item->>'discount')::bigint, 0);
        v_item_tax := round(v_item_line_total * (coalesce((v_item->>'tax_rate')::numeric, 18.0) / 100.0));

        insert into public.order_items (
            order_id,
            variant_id,
            title_snapshot,
            sku_snapshot,
            quantity,
            unit_price,
            discount,
            tax_rate,
            tax_amount,
            line_total
        ) values (
            v_order_id,
            (v_item->>'variant_id')::uuid,
            coalesce(v_variant.title, 'Accessory'),
            coalesce(v_variant.sku, 'SKU'),
            (v_item->>'quantity')::int,
            (v_item->>'unit_price')::bigint,
            coalesce((v_item->>'discount')::bigint, 0),
            coalesce((v_item->>'tax_rate')::numeric, 18.0),
            v_item_tax,
            v_item_line_total + v_item_tax
        );

        -- Insert stock movement (deducts stock via apply_stock_movement trigger)
        insert into public.stock_movements (
            variant_id,
            location_id,
            delta,
            reason,
            reference_type,
            reference_id,
            created_by
        ) values (
            (v_item->>'variant_id')::uuid,
            p_location_id,
            -((v_item->>'quantity')::int),
            'sale_pos',
            'order',
            v_order_id,
            v_cashier_id
        );
    end loop;

    -- 6. Record Payments (supports Split Payments)
    for v_payment in select * from jsonb_array_elements(p_payments) loop
        insert into public.payments (
            order_id,
            provider,
            amount,
            status,
            method
        ) values (
            v_order_id,
            (v_payment->>'provider')::payment_provider,
            (v_payment->>'amount')::bigint,
            'captured',
            coalesce(v_payment->>'method', 'POS')
        );

        if (v_payment->>'provider') = 'cash' then
            v_cash_paid := v_cash_paid + (v_payment->>'amount')::bigint;
        end if;
    end loop;

    -- 7. Update POS Shift Expected Cash
    if v_cash_paid > 0 then
        update public.pos_shifts
        set expected_cash = expected_cash + v_cash_paid,
            updated_at = clock_timestamp()
        where id = p_shift_id;
    end if;

    -- 8. Generate GST Gapless Sequential Tax Invoice
    v_invoice_num := public.get_next_invoice_number(p_location_id, 'GH');
    insert into public.invoices (order_id, invoice_number, financial_year)
    values (v_order_id, v_invoice_num, to_char(clock_timestamp(), 'YYYY'));

    -- 9. Timeline event
    insert into public.order_events (order_id, type, message, actor_id)
    values (v_order_id, 'ORDER_PLACED', 'POS bill completed at counter with invoice ' || v_invoice_num, v_cashier_id);

    return jsonb_build_object(
        'success', true,
        'order_id', v_order_id,
        'order_number', v_order_number,
        'invoice_number', v_invoice_num,
        'grand_total', v_grand_total
    );
end;
$$;

-- 5. POS Void Bill RPC
create or replace function public.void_pos_bill(
    p_order_id uuid,
    p_reason text,
    p_approved_by uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
    v_order record;
    v_item record;
    v_credit_note_num text;
begin
    select * into v_order from public.orders where id = p_order_id for update;
    if not found then
        raise exception 'Order % not found', p_order_id;
    end if;

    if v_order.status = 'cancelled' or v_order.status = 'refunded' then
        raise exception 'Order is already voided or refunded.';
    end if;

    -- 1. Restock items via stock_movements
    for v_item in select * from public.order_items where order_id = p_order_id loop
        insert into public.stock_movements (
            variant_id,
            location_id,
            delta,
            reason,
            reference_type,
            reference_id,
            note,
            created_by
        ) values (
            v_item.variant_id,
            v_order.location_id,
            v_item.quantity,
            'return',
            'order_void',
            p_order_id,
            p_reason,
            p_approved_by
        );
    end loop;

    -- 2. Mark order cancelled & refunded
    update public.orders
    set status = 'cancelled',
        payment_status = 'refunded',
        updated_at = clock_timestamp()
    where id = p_order_id;

    -- 3. Generate Credit Note
    v_credit_note_num := 'CN/' || to_char(clock_timestamp(), 'YYYY') || '/' || lpad(nextval('public.credit_note_seq')::text, 5, '0');
    
    insert into public.credit_notes (
        invoice_id,
        credit_note_number,
        amount,
        reason
    )
    select id, v_credit_note_num, v_order.grand_total, p_reason
    from public.invoices
    where order_id = p_order_id;

    -- 4. Deduct from shift expected cash if paid by cash
    if v_order.shift_id is not null then
        update public.pos_shifts
        set expected_cash = greatest(0, expected_cash - v_order.grand_total),
            updated_at = clock_timestamp()
        where id = v_order.shift_id;
    end if;

    insert into public.order_events (order_id, type, message, actor_id)
    values (p_order_id, 'ORDER_VOIDED', 'POS bill voided: ' || p_reason, p_approved_by);

    return jsonb_build_object(
        'success', true,
        'credit_note_number', v_credit_note_num
    );
end;
$$;
-- ==============================================================================
-- 008_discounts_tax_shipping_settings.sql
-- Gadget House Database Architecture
-- Coupons, currency conversion, GST tax rules, shipping engine, CMS & settings
-- ==============================================================================

-- 1. Discounts & Coupon Redemptions
create type discount_type as enum ('percentage', 'fixed', 'free_shipping', 'bxgy');

create table if not exists public.discounts (
    id uuid primary key default gen_random_uuid(),
    code text unique not null,
    type discount_type not null default 'percentage',
    value bigint not null check (value >= 0), -- percentage integer or fixed minor units (paise)
    min_cart_amount bigint not null default 0 check (min_cart_amount >= 0),
    starts_at timestamptz not null default clock_timestamp(),
    ends_at timestamptz,
    usage_limit integer,
    per_customer_limit integer not null default 1,
    country_codes text[] not null default '{}',
    is_active boolean not null default true,
    created_at timestamptz not null default clock_timestamp(),
    updated_at timestamptz not null default clock_timestamp()
);

create trigger trg_discounts_updated_at
    before update on public.discounts
    for each row execute function public.set_updated_at();

create index if not exists idx_discounts_code on public.discounts(code);

create table if not exists public.discount_redemptions (
    id uuid primary key default gen_random_uuid(),
    discount_id uuid not null references public.discounts(id) on delete cascade,
    user_id uuid references public.profiles(id) on delete set null,
    order_id uuid not null references public.orders(id) on delete cascade,
    redeemed_at timestamptz not null default clock_timestamp()
);

create index if not exists idx_discount_redemptions_user on public.discount_redemptions(discount_id, user_id);

-- 2. Multi-Currency & Live Exchange Rates
create table if not exists public.currencies (
    code char(3) primary key,
    symbol text not null,
    name text not null,
    decimal_places integer not null default 2,
    is_active boolean not null default true,
    created_at timestamptz not null default clock_timestamp()
);

create table if not exists public.exchange_rates (
    id uuid primary key default gen_random_uuid(),
    base_currency char(3) not null references public.currencies(code),
    quote_currency char(3) not null references public.currencies(code),
    rate numeric(14, 6) not null check (rate > 0),
    fetched_at timestamptz not null default clock_timestamp(),
    unique (base_currency, quote_currency)
);

-- 3. Tax Rules Engine (GST / VAT / Sales Tax)
create type tax_type_enum as enum ('GST', 'VAT', 'sales_tax');

create table if not exists public.tax_rules (
    id uuid primary key default gen_random_uuid(),
    country_code char(2) not null,
    region text default '', -- state e.g. 'KA', 'MH', 'DL'
    tax_type tax_type_enum not null default 'GST',
    rate numeric(5, 2) not null default 18.00,
    inclusive boolean not null default true,
    created_at timestamptz not null default clock_timestamp()
);

create index if not exists idx_tax_rules_lookup on public.tax_rules(country_code, region);

-- 4. Shipping Engine (Zones & Weight Tier Rates)
create table if not exists public.shipping_zones (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    country_codes text[] not null default '{}',
    is_active boolean not null default true,
    created_at timestamptz not null default clock_timestamp()
);

create table if not exists public.shipping_rates (
    id uuid primary key default gen_random_uuid(),
    zone_id uuid not null references public.shipping_zones(id) on delete cascade,
    name text not null, -- 'Standard Ground', 'BlueDart Express Air'
    min_weight_grams integer not null default 0,
    max_weight_grams integer not null default 999999,
    price bigint not null default 0 check (price >= 0), -- minor units
    free_over_amount bigint default 0,
    eta_days_min integer not null default 2,
    eta_days_max integer not null default 5,
    is_active boolean not null default true,
    created_at timestamptz not null default clock_timestamp()
);

-- 5. Localization / Languages
create table if not exists public.languages (
    code char(2) primary key,
    name text not null,
    is_rtl boolean not null default false,
    is_active boolean not null default true,
    created_at timestamptz not null default clock_timestamp()
);

-- 6. Content Management (Banners & Informational Pages)
create type banner_type as enum ('hero', 'announcement', 'offer');

create table if not exists public.banners (
    id uuid primary key default gen_random_uuid(),
    type banner_type not null default 'hero',
    title text not null,
    subtitle text default '',
    cta_label text default 'Shop Now',
    cta_url text default '/shop',
    image_url text not null,
    starts_at timestamptz not null default clock_timestamp(),
    ends_at timestamptz,
    sort_order integer not null default 0,
    is_active boolean not null default true,
    translations jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default clock_timestamp(),
    updated_at timestamptz not null default clock_timestamp()
);

create trigger trg_banners_updated_at
    before update on public.banners
    for each row execute function public.set_updated_at();

create table if not exists public.pages (
    id uuid primary key default gen_random_uuid(),
    slug text unique not null,
    title text not null,
    body text not null,
    translations jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default clock_timestamp(),
    updated_at timestamptz not null default clock_timestamp()
);

create trigger trg_pages_updated_at
    before update on public.pages
    for each row execute function public.set_updated_at();

-- 7. Store Key-Value Settings & Newsletters
create table if not exists public.store_settings (
    key text primary key,
    value jsonb not null,
    description text default '',
    updated_at timestamptz not null default clock_timestamp()
);

create table if not exists public.newsletter_subscribers (
    id uuid primary key default gen_random_uuid(),
    email text unique not null,
    consent_at timestamptz not null default clock_timestamp(),
    country_code char(2) default 'IN',
    created_at timestamptz not null default clock_timestamp()
);
-- ==============================================================================
-- 009_views_and_reporting.sql
-- Gadget House Database Architecture
-- Public views protecting cost prices, fast device queries & financial reporting
-- ==============================================================================

-- 1. Public Secure Views (Masking Sensitive Cost Price)
-- Using Postgres 15+ security_invoker = true so view honours RLS
create or replace view public.products_public
with (security_invoker = true)
as
select 
    p.id,
    p.title,
    p.slug,
    p.short_description,
    p.description,
    p.category_id,
    p.accessory_brand,
    p.tags,
    p.status,
    p.seo_title,
    p.seo_description,
    p.hsn_code,
    p.gst_rate,
    p.tax_inclusive,
    p.weight_grams,
    p.dimensions,
    p.created_at,
    p.updated_at
from public.products p
where p.status = 'active'
  and p.deleted_at is null;

create or replace view public.variants_public
with (security_invoker = true)
as
select 
    pv.id,
    pv.product_id,
    pv.sku,
    pv.barcode,
    pv.option_values,
    pv.price,
    pv.compare_at_price,
    -- cost_price is intentionally omitted to prevent margin exposure!
    pv.weight_grams,
    pv.is_active,
    pv.created_at,
    pv.updated_at
from public.product_variants pv
where pv.is_active is true
  and pv.deleted_at is null;

-- Revoke direct table read access on cost_price column from anon & standard authenticated users
revoke select (cost_price) on public.product_variants from anon, authenticated;

-- 2. Device-Filtered High-Speed Product Query RPC
create or replace function public.get_products_for_model(
    p_phone_model_id uuid,
    p_category_id uuid default null,
    p_limit integer default 20,
    p_offset integer default 0
)
returns table (
    product_id uuid,
    title text,
    slug text,
    category_id uuid,
    accessory_brand text,
    base_price bigint,
    compare_at_price bigint,
    image_url text,
    variant_count bigint
)
language sql
security definer
stable
set search_path = public
as $$
    select 
        p.id as product_id,
        p.title,
        p.slug,
        p.category_id,
        p.accessory_brand,
        coalesce(min(pv.price), 0) as base_price,
        coalesce(min(pv.compare_at_price), 0) as compare_at_price,
        coalesce(
            (select url from public.product_images pi where pi.product_id = p.id order by pi.sort_order asc limit 1),
            ''
        ) as image_url,
        count(distinct pv.id) as variant_count
    from public.products p
    join public.product_compatibility pc on pc.product_id = p.id
    join public.product_variants pv on pv.product_id = p.id and pv.is_active is true and pv.deleted_at is null
    where pc.phone_model_id = p_phone_model_id
      and p.status = 'active'
      and p.deleted_at is null
      and (p_category_id is null or p.category_id = p_category_id)
    group by p.id, p.title, p.slug, p.category_id, p.accessory_brand
    order by p.created_at desc
    limit p_limit
    offset p_offset;
$$;

-- 3. Inventory Low Stock Alerts RPC (Staff Only)
create or replace function public.low_stock_report(p_location_id uuid default null)
returns table (
    variant_id uuid,
    sku text,
    product_title text,
    location_name text,
    quantity integer,
    low_stock_threshold integer,
    shortage integer
)
language sql
security definer
stable
set search_path = public
as $$
    select 
        pv.id as variant_id,
        pv.sku,
        p.title as product_title,
        l.name as location_name,
        il.quantity,
        il.low_stock_threshold,
        (il.low_stock_threshold - il.quantity) as shortage
    from public.inventory_levels il
    join public.product_variants pv on pv.id = il.variant_id
    join public.products p on p.id = pv.product_id
    join public.locations l on l.id = il.location_id
    where il.quantity <= il.low_stock_threshold
      and (p_location_id is null or il.location_id = p_location_id)
      and pv.deleted_at is null
      and p.deleted_at is null
    order by (il.low_stock_threshold - il.quantity) desc;
$$;

-- 4. Daily Sales Summary by Channel (Staff Only)
create or replace function public.daily_sales_summary(
    p_date date default current_date,
    p_channel sales_channel default null
)
returns table (
    channel sales_channel,
    orders_count bigint,
    total_sales bigint,
    total_discounts bigint,
    total_taxes bigint,
    avg_order_value bigint
)
language sql
security definer
stable
set search_path = public
as $$
    select 
        o.channel,
        count(o.id) as orders_count,
        coalesce(sum(o.grand_total), 0) as total_sales,
        coalesce(sum(o.discount_total), 0) as total_discounts,
        coalesce(sum(o.tax_total), 0) as total_taxes,
        case when count(o.id) > 0 then (sum(o.grand_total) / count(o.id)) else 0 end as avg_order_value
    from public.orders o
    where date(o.created_at at time zone 'Asia/Kolkata') = p_date
      and o.payment_status = 'paid'
      and (p_channel is null or o.channel = p_channel)
    group by o.channel;
$$;

-- 5. GST Return & Financial Audit Report (Staff Only)
create or replace function public.gst_report(
    p_from_date date,
    p_to_date date
)
returns table (
    invoice_number text,
    invoice_date timestamptz,
    hsn_code text,
    tax_rate numeric,
    taxable_value bigint,
    cgst_amount bigint,
    sgst_amount bigint,
    igst_amount bigint,
    total_invoice_amount bigint
)
language sql
security definer
stable
set search_path = public
as $$
    select 
        inv.invoice_number,
        inv.issued_at as invoice_date,
        oi.hsn_code,
        oi.tax_rate,
        sum(oi.line_total - oi.tax_amount) as taxable_value,
        round(sum(oi.tax_amount) / 2) as cgst_amount, -- intra-state split
        round(sum(oi.tax_amount) / 2) as sgst_amount,
        0::bigint as igst_amount,
        sum(oi.line_total) as total_invoice_amount
    from public.invoices inv
    join public.orders o on o.id = inv.order_id
    join public.order_items oi on oi.order_id = o.id
    where date(inv.issued_at at time zone 'Asia/Kolkata') between p_from_date and p_to_date
      and o.payment_status = 'paid'
    group by inv.invoice_number, inv.issued_at, oi.hsn_code, oi.tax_rate
    order by inv.issued_at asc;
$$;
-- ==============================================================================
-- 010_storage.sql
-- Gadget House Database Architecture
-- Supabase Storage Buckets & Access Control Policies
-- ==============================================================================

-- 1. Create Buckets
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
    ('product-images', 'product-images', true, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'image/avif']),
    ('banners', 'banners', true, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'image/avif']),
    ('invoices', 'invoices', false, 15728640, array['application/pdf']),
    ('review-photos', 'review-photos', true, 10485760, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set
    public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- 2. Storage Policies

-- product-images: Public can read, only staff with catalogue create/edit can upload
create policy "Public can view product images"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'product-images');

create policy "Staff can upload product images"
on storage.objects for insert
to authenticated
with check (
    bucket_id = 'product-images'
    and public.is_staff(auth.uid())
);

create policy "Staff can update/delete product images"
on storage.objects for all
to authenticated
using (
    bucket_id = 'product-images'
    and public.is_staff(auth.uid())
);

-- banners: Public can read, only staff can manage
create policy "Public can view banners"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'banners');

create policy "Staff can manage banners"
on storage.objects for all
to authenticated
using (
    bucket_id = 'banners'
    and public.is_staff(auth.uid())
)
with check (
    bucket_id = 'banners'
    and public.is_staff(auth.uid())
);

-- invoices: Private (Only customers who own the invoice or staff can read)
create policy "Staff can read all invoices"
on storage.objects for select
to authenticated
using (
    bucket_id = 'invoices'
    and public.is_staff(auth.uid())
);

create policy "Customer can read own invoice PDF"
on storage.objects for select
to authenticated
using (
    bucket_id = 'invoices'
    and exists (
        select 1 from public.invoices inv
        join public.orders o on o.id = inv.order_id
        where inv.pdf_url like ('%' || storage.objects.name)
          and o.customer_id = auth.uid()
    )
);

-- review-photos: Authenticated shoppers can upload, public can view
create policy "Public can view review photos"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'review-photos');

create policy "Shoppers can upload review photos"
on storage.objects for insert
to authenticated
with check (
    bucket_id = 'review-photos'
    and (select auth.uid()) is not null
);
-- ==============================================================================
-- 011_row_level_security.sql
-- Gadget House Database Architecture
-- Comprehensive Zero-Trust Row Level Security (RLS) Policies
-- ==============================================================================

-- 1. Enable RLS on Every Table
alter table public.profiles enable row level security;
alter table public.roles enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;
alter table public.staff_roles enable row level security;
alter table public.audit_logs enable row level security;

alter table public.phone_brands enable row level security;
alter table public.phone_models enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_images enable row level security;
alter table public.product_compatibility enable row level security;
alter table public.market_prices enable row level security;

alter table public.locations enable row level security;
alter table public.inventory_levels enable row level security;
alter table public.stock_movements enable row level security;
alter table public.suppliers enable row level security;
alter table public.purchase_entries enable row level security;
alter table public.purchase_items enable row level security;

alter table public.addresses enable row level security;
alter table public.wishlists enable row level security;
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;
alter table public.reviews enable row level security;
alter table public.back_in_stock_requests enable row level security;

alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;
alter table public.refunds enable row level security;
alter table public.refund_items enable row level security;
alter table public.shipments enable row level security;
alter table public.order_events enable row level security;
alter table public.invoices enable row level security;
alter table public.credit_notes enable row level security;
alter table public.invoice_counters enable row level security;

alter table public.pos_shifts enable row level security;
alter table public.pos_cash_movements enable row level security;
alter table public.pos_held_carts enable row level security;

alter table public.discounts enable row level security;
alter table public.discount_redemptions enable row level security;
alter table public.currencies enable row level security;
alter table public.exchange_rates enable row level security;
alter table public.tax_rules enable row level security;
alter table public.shipping_zones enable row level security;
alter table public.shipping_rates enable row level security;
alter table public.languages enable row level security;

alter table public.banners enable row level security;
alter table public.pages enable row level security;
alter table public.store_settings enable row level security;
alter table public.newsletter_subscribers enable row level security;

-- ==============================================================================
-- 2. Identity, RBAC & Profiles
-- ==============================================================================

-- Profiles: Anyone authenticated can view their own profile; staff can view all profiles
create policy "Users read own profile"
on public.profiles for select
to authenticated
using ((select auth.uid()) = id or public.is_staff((select auth.uid())));

create policy "Users update own profile"
on public.profiles for update
to authenticated
using ((select auth.uid()) = id)
with check (
    (select auth.uid()) = id
    -- Prevent users from elevating themselves to is_staff
    and (is_staff = (select p.is_staff from public.profiles p where p.id = (select auth.uid())))
);

-- Staff can elevate/demote staff if they have staff permissions
create policy "Owner/Manager update staff profiles"
on public.profiles for update
to authenticated
using (public.has_permission('staff', 'edit', (select auth.uid())))
with check (public.has_permission('staff', 'edit', (select auth.uid())));

-- Roles, Permissions & Staff Roles: Staff can read; Only Owner can mutate
create policy "Staff read roles" on public.roles for select to authenticated using (public.is_staff((select auth.uid())));
create policy "Staff read permissions" on public.permissions for select to authenticated using (public.is_staff((select auth.uid())));
create policy "Staff read role_permissions" on public.role_permissions for select to authenticated using (public.is_staff((select auth.uid())));
create policy "Staff read staff_roles" on public.staff_roles for select to authenticated using (public.is_staff((select auth.uid())));

create policy "Owner manage roles" on public.roles for all to authenticated
using (public.has_permission('staff', 'create', (select auth.uid())))
with check (public.has_permission('staff', 'create', (select auth.uid())));

create policy "Owner manage role_permissions" on public.role_permissions for all to authenticated
using (public.has_permission('staff', 'create', (select auth.uid())))
with check (public.has_permission('staff', 'create', (select auth.uid())));

create policy "Owner manage staff_roles" on public.staff_roles for all to authenticated
using (public.has_permission('staff', 'create', (select auth.uid())))
with check (public.has_permission('staff', 'create', (select auth.uid())));

-- Audit Logs: Read-only for Owner/Manager; No one can directly edit or delete
create policy "Staff read audit logs" on public.audit_logs for select to authenticated
using (public.has_permission('reports', 'view', (select auth.uid())));

-- ==============================================================================
-- 3. Catalogue (Public Read vs Staff Management)
-- ==============================================================================

create policy "Public read brands" on public.phone_brands for select to anon, authenticated using (is_active is true or public.is_staff((select auth.uid())));
create policy "Public read models" on public.phone_models for select to anon, authenticated using (is_active is true or public.is_staff((select auth.uid())));
create policy "Public read categories" on public.categories for select to anon, authenticated using (is_active is true or public.is_staff((select auth.uid())));

create policy "Public read active products" on public.products for select to anon, authenticated
using ((status = 'active' and deleted_at is null) or public.is_staff((select auth.uid())));

create policy "Public read active variants" on public.product_variants for select to anon, authenticated
using ((is_active is true and deleted_at is null) or public.is_staff((select auth.uid())));

create policy "Public read product images" on public.product_images for select to anon, authenticated using (true);
create policy "Public read compatibility" on public.product_compatibility for select to anon, authenticated using (true);
create policy "Public read market prices" on public.market_prices for select to anon, authenticated using (true);

-- Staff Catalogue Mutations (Owner / Manager / Inventory)
create policy "Staff manage products" on public.products for all to authenticated
using (public.has_permission('catalogue', 'create', (select auth.uid())) or public.has_permission('catalogue', 'edit', (select auth.uid())))
with check (public.has_permission('catalogue', 'create', (select auth.uid())) or public.has_permission('catalogue', 'edit', (select auth.uid())));

create policy "Staff manage variants" on public.product_variants for all to authenticated
using (public.has_permission('catalogue', 'create', (select auth.uid())) or public.has_permission('catalogue', 'edit', (select auth.uid())))
with check (public.has_permission('catalogue', 'create', (select auth.uid())) or public.has_permission('catalogue', 'edit', (select auth.uid())));

create policy "Staff manage images" on public.product_images for all to authenticated
using (public.has_permission('catalogue', 'create', (select auth.uid())) or public.has_permission('catalogue', 'edit', (select auth.uid())))
with check (public.has_permission('catalogue', 'create', (select auth.uid())) or public.has_permission('catalogue', 'edit', (select auth.uid())));

create policy "Staff manage compatibility" on public.product_compatibility for all to authenticated
using (public.has_permission('catalogue', 'create', (select auth.uid())) or public.has_permission('catalogue', 'edit', (select auth.uid())))
with check (public.has_permission('catalogue', 'create', (select auth.uid())) or public.has_permission('catalogue', 'edit', (select auth.uid())));

-- ==============================================================================
-- 4. Inventory & Suppliers (Staff Protected)
-- ==============================================================================

create policy "Public read locations" on public.locations for select to anon, authenticated using (is_active is true);
create policy "Staff manage locations" on public.locations for all to authenticated using (public.has_permission('settings', 'edit', (select auth.uid())));

create policy "Staff view inventory" on public.inventory_levels for select to authenticated using (public.is_staff((select auth.uid())));
create policy "Staff manage inventory" on public.inventory_levels for all to authenticated using (public.has_permission('inventory', 'edit', (select auth.uid())));

create policy "Staff view stock movements" on public.stock_movements for select to authenticated using (public.is_staff((select auth.uid())));
create policy "Staff insert stock movements" on public.stock_movements for insert to authenticated with check (public.has_permission('inventory', 'create', (select auth.uid())) or public.has_permission('pos', 'create', (select auth.uid())));

create policy "Staff manage suppliers" on public.suppliers for all to authenticated using (public.has_permission('inventory', 'view', (select auth.uid())));
create policy "Staff manage purchases" on public.purchase_entries for all to authenticated using (public.has_permission('inventory', 'create', (select auth.uid())));
create policy "Staff manage purchase items" on public.purchase_items for all to authenticated using (public.has_permission('inventory', 'create', (select auth.uid())));

-- ==============================================================================
-- 5. Customer Addresses, Carts, Wishlists, Reviews
-- ==============================================================================

create policy "Customer manage own addresses" on public.addresses for all to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Customer manage own wishlist" on public.wishlists for all to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

-- Carts: user_id or guest session match
create policy "Customer/Guest access cart" on public.carts for all to anon, authenticated
using ((user_id is not null and (select auth.uid()) = user_id) or (session_id is not null))
with check ((user_id is not null and (select auth.uid()) = user_id) or (session_id is not null));

create policy "Customer/Guest access cart items" on public.cart_items for all to anon, authenticated
using (exists (select 1 from public.carts c where c.id = cart_items.cart_id and ((c.user_id = (select auth.uid())) or (c.session_id is not null))))
with check (exists (select 1 from public.carts c where c.id = cart_items.cart_id and ((c.user_id = (select auth.uid())) or (c.session_id is not null))));

-- Reviews: Public reads approved reviews; Customer manages own reviews
create policy "Public read approved reviews" on public.reviews for select to anon, authenticated
using (status = 'approved' or (user_id = (select auth.uid())) or public.is_staff((select auth.uid())));

create policy "Customer submit review" on public.reviews for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy "Staff moderate reviews" on public.reviews for update to authenticated
using (public.has_permission('catalogue', 'edit', (select auth.uid())));

-- Back in Stock requests
create policy "Anyone request stock notification" on public.back_in_stock_requests for insert to anon, authenticated with check (true);
create policy "Staff view stock requests" on public.back_in_stock_requests for select to authenticated using (public.is_staff((select auth.uid())));

-- ==============================================================================
-- 6. Orders, Payments, Shipments & Billing
-- ==============================================================================

-- Customers can view only their own orders; Staff can view and manage based on permission
create policy "Customer view own orders" on public.orders for select to authenticated
using (customer_id = (select auth.uid()) or public.is_staff((select auth.uid())));

create policy "Allow order creation" on public.orders for insert to anon, authenticated
with check (true);

create policy "Staff update orders" on public.orders for update to authenticated
using (public.has_permission('orders', 'edit', (select auth.uid())));

create policy "Customer view own order items" on public.order_items for select to authenticated
using (exists (select 1 from public.orders o where o.id = order_items.order_id and (o.customer_id = (select auth.uid()) or public.is_staff((select auth.uid())))));

create policy "Allow order items creation" on public.order_items for insert to anon, authenticated
with check (true);

create policy "Staff manage payments" on public.payments for all to authenticated
using (public.is_staff((select auth.uid())));

create policy "Customer view payments" on public.payments for select to authenticated
using (exists (select 1 from public.orders o where o.id = payments.order_id and o.customer_id = (select auth.uid())));

create policy "Staff view shipments" on public.shipments for all to authenticated using (public.is_staff((select auth.uid())));
create policy "Customer track shipments" on public.shipments for select to authenticated
using (exists (select 1 from public.orders o where o.id = shipments.order_id and o.customer_id = (select auth.uid())));

create policy "Customer view own invoices" on public.invoices for select to authenticated
using (exists (select 1 from public.orders o where o.id = invoices.order_id and o.customer_id = (select auth.uid())) or public.is_staff((select auth.uid())));

create policy "Customer view credit notes" on public.credit_notes for select to authenticated
using (exists (select 1 from public.invoices inv join public.orders o on o.id = inv.order_id where inv.id = credit_notes.invoice_id and o.customer_id = (select auth.uid())) or public.is_staff((select auth.uid())));

create policy "Staff manage refunds" on public.refunds for all to authenticated
using (public.has_permission('orders', 'edit', (select auth.uid())));

create policy "Staff manage refund items" on public.refund_items for all to authenticated
using (public.has_permission('orders', 'edit', (select auth.uid())));

create policy "Staff manage invoice counters" on public.invoice_counters for all to authenticated
using (public.is_staff((select auth.uid())));

-- ==============================================================================
-- 7. POS Operations (Cashiers, Managers, Owners)
-- ==============================================================================

create policy "Cashiers view own shifts" on public.pos_shifts for select to authenticated
using (cashier_id = (select auth.uid()) or public.has_permission('pos', 'view', (select auth.uid())));

create policy "Cashiers open shift" on public.pos_shifts for insert to authenticated
with check (public.has_permission('pos', 'create', (select auth.uid())));

create policy "Cashiers close own shift" on public.pos_shifts for update to authenticated
using (cashier_id = (select auth.uid()) or public.has_permission('pos', 'edit', (select auth.uid())))
with check (cashier_id = (select auth.uid()) or public.has_permission('pos', 'edit', (select auth.uid())));

create policy "Cashiers log cash movements" on public.pos_cash_movements for all to authenticated
using (public.has_permission('pos', 'create', (select auth.uid())));

create policy "Cashiers manage held carts" on public.pos_held_carts for all to authenticated
using (cashier_id = (select auth.uid()) or public.has_permission('pos', 'view', (select auth.uid())));

-- ==============================================================================
-- 8. Global Settings, Currencies, Tax & Content
-- ==============================================================================

create policy "Public read discounts" on public.discounts for select to anon, authenticated using (is_active is true and starts_at <= clock_timestamp() and (ends_at is null or ends_at >= clock_timestamp()));
create policy "Staff manage discounts" on public.discounts for all to authenticated using (public.has_permission('catalogue', 'edit', (select auth.uid())));

create policy "Public read currencies" on public.currencies for select to anon, authenticated using (is_active is true);
create policy "Public read rates" on public.exchange_rates for select to anon, authenticated using (true);
create policy "Public read taxes" on public.tax_rules for select to anon, authenticated using (true);
create policy "Public read shipping zones" on public.shipping_zones for select to anon, authenticated using (is_active is true);
create policy "Public read shipping rates" on public.shipping_rates for select to anon, authenticated using (is_active is true);
create policy "Public read languages" on public.languages for select to anon, authenticated using (is_active is true);

create policy "Public read banners" on public.banners for select to anon, authenticated using (is_active is true and starts_at <= clock_timestamp() and (ends_at is null or ends_at >= clock_timestamp()));
create policy "Staff manage banners" on public.banners for all to authenticated using (public.has_permission('settings', 'edit', (select auth.uid())));

create policy "Public read pages" on public.pages for select to anon, authenticated using (true);
create policy "Staff manage pages" on public.pages for all to authenticated using (public.has_permission('settings', 'edit', (select auth.uid())));

create policy "Public read public settings" on public.store_settings for select to anon, authenticated using (key in ('store_name', 'store_phone', 'store_email', 'store_address', 'free_shipping_threshold'));
create policy "Owner manage settings" on public.store_settings for all to authenticated using (public.has_permission('settings', 'edit', (select auth.uid())));

create policy "Public subscribe newsletter" on public.newsletter_subscribers for insert to anon, authenticated with check (true);
create policy "Staff view newsletter" on public.newsletter_subscribers for select to authenticated using (public.has_permission('reports', 'view', (select auth.uid())));
-- ==============================================================================
-- 012_seed_data.sql
-- Gadget House Production Seed Data
-- Roles & RBAC Matrix, Currencies, Languages, Brands, Models, Categories,
-- Locations, Tax Rules, Shipping Zones, Store Settings & 10 Flagship Products
-- ==============================================================================

-- 1. Default Roles
insert into public.roles (name, description, is_system) values
    ('Owner', 'Complete unrestricted store and business control', true),
    ('Manager', 'Store management without staff deletion or dangerous settings', true),
    ('Inventory', 'Warehouse inventory, stock movements and supplier purchase reception', true),
    ('Cashier', 'In-store POS counter billing, shift settlement and customer receipts', true),
    ('Support', 'Customer order tracking, issue resolution and refund processing', true)
on conflict (name) do nothing;

-- Permissions List
insert into public.permissions (module, action, description) values
    ('catalogue', 'view', 'View products, variants, prices and inventory'),
    ('catalogue', 'create', 'Create products and variants'),
    ('catalogue', 'edit', 'Update products, variants and prices'),
    ('catalogue', 'delete', 'Archive or delete products'),
    ('catalogue', 'export', 'Export catalogue data'),
    ('inventory', 'view', 'View stock levels and movements'),
    ('inventory', 'create', 'Receive purchase entries and transfer stock'),
    ('inventory', 'edit', 'Adjust stock levels and configure thresholds'),
    ('inventory', 'delete', 'Delete stock records'),
    ('inventory', 'export', 'Export inventory reports'),
    ('orders', 'view', 'View orders, shipments and invoices'),
    ('orders', 'create', 'Place manual orders'),
    ('orders', 'edit', 'Update order status, tracking and issue refunds'),
    ('orders', 'delete', 'Cancel orders'),
    ('orders', 'export', 'Export order reports'),
    ('pos', 'view', 'View POS shift summaries and held bills'),
    ('pos', 'create', 'Perform POS billing and cash in/out'),
    ('pos', 'edit', 'Modify shift cash and void POS bills'),
    ('pos', 'delete', 'Cancel held bills'),
    ('pos', 'export', 'Export POS settlement registers'),
    ('staff', 'view', 'View staff profiles and role assignments'),
    ('staff', 'create', 'Invite staff and assign roles'),
    ('staff', 'edit', 'Modify staff permissions'),
    ('staff', 'delete', 'Revoke staff access'),
    ('reports', 'view', 'View sales, margin, inventory and GST reports'),
    ('reports', 'export', 'Download financial and tax exports'),
    ('settings', 'view', 'View store configurations and integrations'),
    ('settings', 'edit', 'Modify store settings, payment gateways and tax rules')
on conflict (module, action) do nothing;

-- Populate Permission Matrix
-- Owner: ALL permissions
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id from public.roles r, public.permissions p
where r.name = 'Owner'
on conflict do nothing;

-- Manager: ALL except staff management & critical system settings
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id from public.roles r, public.permissions p
where r.name = 'Manager'
  and not (p.module in ('staff', 'settings') and p.action in ('create', 'edit', 'delete'))
on conflict do nothing;

-- Inventory: Stock & catalogue viewing
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id from public.roles r, public.permissions p
where r.name = 'Inventory'
  and (p.module = 'inventory' or (p.module = 'catalogue' and p.action in ('view', 'edit')))
on conflict do nothing;

-- Cashier: POS operations & reading basic catalogue
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id from public.roles r, public.permissions p
where r.name = 'Cashier'
  and (p.module = 'pos' or (p.module in ('catalogue', 'orders') and p.action = 'view'))
on conflict do nothing;

-- Support: Orders & refunds
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id from public.roles r, public.permissions p
where r.name = 'Support'
  and (p.module = 'orders' and p.action in ('view', 'edit'))
on conflict do nothing;

-- 2. Currencies
insert into public.currencies (code, symbol, name, decimal_places, is_active) values
    ('INR', 'â‚¹', 'Indian Rupee', 2, true),
    ('USD', '$', 'US Dollar', 2, true),
    ('EUR', 'â‚¬', 'Euro', 2, true),
    ('GBP', 'Â£', 'British Pound', 2, true),
    ('AED', 'Ø¯.Ø¥', 'UAE Dirham', 2, true)
on conflict (code) do nothing;

-- Exchange Rates (Base INR)
insert into public.exchange_rates (base_currency, quote_currency, rate) values
    ('INR', 'USD', 0.012000),
    ('INR', 'EUR', 0.011000),
    ('INR', 'GBP', 0.009500),
    ('INR', 'AED', 0.044000)
on conflict (base_currency, quote_currency) do update set rate = excluded.rate;

-- 3. Languages
insert into public.languages (code, name, is_rtl, is_active) values
    ('en', 'English', false, true),
    ('hi', 'à¤¹à¤¿à¤¨à¥à¤¦à¥€ (Hindi)', false, true),
    ('ar', 'Ø§Ù„Ø¹Ø±Ø¨ÙŠØ© (Arabic)', true, true),
    ('es', 'EspaÃ±ol (Spanish)', false, true),
    ('fr', 'FranÃ§ais (French)', false, true)
on conflict (code) do nothing;

-- 4. Locations
insert into public.locations (id, name, slug, type, address, is_active) values
    ('11111111-1111-1111-1111-111111111111', 'Central Fulfillment Warehouse', 'blr-wh', 'warehouse', '{"city": "Bengaluru", "state": "Karnataka", "pincode": "560034", "country": "IN"}'::jsonb, true),
    ('22222222-2222-2222-2222-222222222222', 'Flagship Retail Store Counter', 'blr-pos', 'shop', '{"city": "Bengaluru", "state": "Karnataka", "pincode": "560034", "country": "IN"}'::jsonb, true)
on conflict (id) do nothing;

-- 5. Indian GST Tax Rules
insert into public.tax_rules (country_code, region, tax_type, rate, inclusive) values
    ('IN', 'ALL', 'GST', 18.00, true),
    ('IN', 'ALL', 'GST', 12.00, true),
    ('IN', 'ALL', 'GST', 5.00, true)
on conflict do nothing;

-- 6. Shipping Zones & Rates
insert into public.shipping_zones (id, name, country_codes, is_active) values
    ('33333333-3333-3333-3333-333333333333', 'Domestic India', array['IN'], true),
    ('44444444-4444-4444-4444-444444444444', 'Gulf & Middle East', array['AE', 'SA', 'QA', 'OM', 'KW'], true)
on conflict (id) do nothing;

insert into public.shipping_rates (zone_id, name, min_weight_grams, max_weight_grams, price, free_over_amount, eta_days_min, eta_days_max) values
    ('33333333-3333-3333-3333-333333333333', 'Standard Ground', 0, 5000, 4900, 49900, 3, 5),     -- â‚¹49, free over â‚¹499
    ('33333333-3333-3333-3333-333333333333', 'BlueDart Express Air', 0, 5000, 9900, 99900, 1, 2),  -- â‚¹99, free over â‚¹999
    ('44444444-4444-4444-4444-444444444444', 'DHL Express Gulf', 0, 5000, 149900, 499900, 3, 6)   -- â‚¹1499, free over â‚¹4999
on conflict do nothing;

-- 7. Store Key-Value Settings
insert into public.store_settings (key, value, description) values
    ('gstin', '"29AAAAA0000A1Z5"'::jsonb, 'Store official GST Identification Number'),
    ('store_name', '"Gadget House Inc."'::jsonb, 'Legal Store Brand Name'),
    ('store_address', '{"line1": "Flat 402, Royal Palms", "line2": "Koramangala 4th Block", "city": "Bengaluru", "state": "Karnataka", "pincode": "560034", "country": "India"}'::jsonb, 'Official registered headquarter address'),
    ('max_cashier_discount_pct', '10'::jsonb, 'Maximum discount percentage cashier can apply without manager authorization'),
    ('invoice_prefix', '"GH"'::jsonb, 'Default GST Tax Invoice sequence prefix')
on conflict (key) do update set value = excluded.value;

-- 8. 8 Phone Brands
insert into public.phone_brands (id, name, slug, sort_order) values
    ('b0000001-0000-0000-0000-000000000001', 'Apple', 'apple', 1),
    ('b0000001-0000-0000-0000-000000000002', 'Samsung', 'samsung', 2),
    ('b0000001-0000-0000-0000-000000000003', 'Google Pixel', 'google-pixel', 3),
    ('b0000001-0000-0000-0000-000000000004', 'OnePlus', 'oneplus', 4),
    ('b0000001-0000-0000-0000-000000000005', 'Nothing', 'nothing', 5),
    ('b0000001-0000-0000-0000-000000000006', 'Xiaomi', 'xiaomi', 6),
    ('b0000001-0000-0000-0000-000000000007', 'Motorola', 'motorola', 7),
    ('b0000001-0000-0000-0000-000000000008', 'Vivo', 'vivo', 8)
on conflict (id) do nothing;

-- 25 Phone Models (Full Apple Flagship Suite + Key Android Competitors)
insert into public.phone_models (id, brand_id, name, slug, release_year) values
    -- Apple (15 Models from 17 down to 15)
    ('m0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000001', 'iPhone 17 Pro Max', 'iphone-17-pro-max', 2025),
    ('m0000001-0000-0000-0000-000000000002', 'b0000001-0000-0000-0000-000000000001', 'iPhone 17 Pro', 'iphone-17-pro', 2025),
    ('m0000001-0000-0000-0000-000000000003', 'b0000001-0000-0000-0000-000000000001', 'iPhone 17', 'iphone-17', 2025),
    ('m0000001-0000-0000-0000-000000000004', 'b0000001-0000-0000-0000-000000000001', 'iPhone 17 Air', 'iphone-17-air', 2025),
    ('m0000001-0000-0000-0000-000000000005', 'b0000001-0000-0000-0000-000000000001', 'iPhone 16 Pro Max', 'iphone-16-pro-max', 2024),
    ('m0000001-0000-0000-0000-000000000006', 'b0000001-0000-0000-0000-000000000001', 'iPhone 16 Pro', 'iphone-16-pro', 2024),
    ('m0000001-0000-0000-0000-000000000007', 'b0000001-0000-0000-0000-000000000001', 'iPhone 16 Plus', 'iphone-16-plus', 2024),
    ('m0000001-0000-0000-0000-000000000008', 'b0000001-0000-0000-0000-000000000001', 'iPhone 16', 'iphone-16', 2024),
    ('m0000001-0000-0000-0000-000000000009', 'b0000001-0000-0000-0000-000000000001', 'iPhone 15 Pro Max', 'iphone-15-pro-max', 2023),
    ('m0000001-0000-0000-0000-000000000010', 'b0000001-0000-0000-0000-000000000001', 'iPhone 15 Pro', 'iphone-15-pro', 2023),
    ('m0000001-0000-0000-0000-000000000011', 'b0000001-0000-0000-0000-000000000001', 'iPhone 15 Plus', 'iphone-15-plus', 2023),
    ('m0000001-0000-0000-0000-000000000012', 'b0000001-0000-0000-0000-000000000001', 'iPhone 15', 'iphone-15', 2023),
    ('m0000001-0000-0000-0000-000000000013', 'b0000001-0000-0000-0000-000000000001', 'iPhone 14 Pro Max', 'iphone-14-pro-max', 2022),
    ('m0000001-0000-0000-0000-000000000014', 'b0000001-0000-0000-0000-000000000001', 'iPhone 14 Pro', 'iphone-14-pro', 2022),
    ('m0000001-0000-0000-0000-000000000015', 'b0000001-0000-0000-0000-000000000001', 'iPhone 13', 'iphone-13', 2021),
    -- Samsung
    ('m0000001-0000-0000-0000-000000000016', 'b0000001-0000-0000-0000-000000000002', 'Galaxy S25 Ultra', 'galaxy-s25-ultra', 2025),
    ('m0000001-0000-0000-0000-000000000017', 'b0000001-0000-0000-0000-000000000002', 'Galaxy S25+', 'galaxy-s25-plus', 2025),
    ('m0000001-0000-0000-0000-000000000018', 'b0000001-0000-0000-0000-000000000002', 'Galaxy S24 Ultra', 'galaxy-s24-ultra', 2024),
    ('m0000001-0000-0000-0000-000000000019', 'b0000001-0000-0000-0000-000000000002', 'Galaxy Z Fold 6', 'galaxy-z-fold-6', 2024),
    -- Google Pixel
    ('m0000001-0000-0000-0000-000000000020', 'b0000001-0000-0000-0000-000000000003', 'Pixel 9 Pro XL', 'pixel-9-pro-xl', 2024),
    ('m0000001-0000-0000-0000-000000000021', 'b0000001-0000-0000-0000-000000000003', 'Pixel 9 Pro', 'pixel-9-pro', 2024),
    -- OnePlus
    ('m0000001-0000-0000-0000-000000000022', 'b0000001-0000-0000-0000-000000000004', 'OnePlus 13', 'oneplus-13', 2025),
    ('m0000001-0000-0000-0000-000000000023', 'b0000001-0000-0000-0000-000000000004', 'OnePlus 12', 'oneplus-12', 2024),
    -- Nothing
    ('m0000001-0000-0000-0000-000000000024', 'b0000001-0000-0000-0000-000000000005', 'Nothing Phone (2a)', 'nothing-phone-2a', 2024),
    -- Xiaomi
    ('m0000001-0000-0000-0000-000000000025', 'b0000001-0000-0000-0000-000000000006', 'Xiaomi 15 Pro', 'xiaomi-15-pro', 2025)
on conflict (id) do nothing;

-- 9. 6 Categories
insert into public.categories (id, name, slug, sort_order) values
    ('c0000001-0000-0000-0000-000000000001', 'Back Cases', 'back-cases', 1),
    ('c0000001-0000-0000-0000-000000000002', 'Tempered Glass', 'tempered-glass', 2),
    ('c0000001-0000-0000-0000-000000000003', 'Smart Gadgets', 'smart-gadgets', 3),
    ('c0000001-0000-0000-0000-000000000004', 'Accessories & Mounts', 'accessories', 4),
    ('c0000001-0000-0000-0000-000000000005', 'Camera Protectors', 'camera-protectors', 5),
    ('c0000001-0000-0000-0000-000000000006', 'Charging & Cables', 'charging-cables', 6)
on conflict (id) do nothing;

-- 10. 10 Sample Flagship Products with Variants and Compatibility
insert into public.products (id, title, slug, short_description, description, category_id, accessory_brand, tags, status, hsn_code, gst_rate) values
    ('p0000001-0000-0000-0000-000000000001', 'AeroShield Ultra-Slim Titanium MagSafe Case', 'aeroshield-titanium-magsafe-case', 'Aerospace grade titanium border with N52 strong magnets', '12ft military drop protection with anti-yellowing matte back.', 'c0000001-0000-0000-0000-000000000001', 'Gadget House', array['magsafe', 'titanium', 'case', 'shockproof'], 'active', '3926', 18.00),
    ('p0000001-0000-0000-0000-000000000002', 'Sapphire HD 9H Dust-Free Tempered Glass', 'sapphire-hd-9h-dust-free-glass', 'Zero-dust auto-alignment installation frame included', 'Corning sapphire infused glass with 100% oleophobic touchscreen smoothness.', 'c0000001-0000-0000-0000-000000000002', 'Blueo', array['glass', 'screen-protector', '9h', 'dust-free'], 'active', '7007', 18.00),
    ('p0000001-0000-0000-0000-000000000003', 'Matte Anti-Glare Esports Gaming Glass', 'matte-anti-glare-gaming-glass', 'Silky frosted texture with micro-etched fingerprint repelling layer', 'Engineered for competitive mobile gaming with zero swipe drag.', 'c0000001-0000-0000-0000-000000000002', 'Blueo', array['gaming', 'matte', 'glass', 'anti-glare'], 'active', '7007', 18.00),
    ('p0000001-0000-0000-0000-000000000004', 'Titanium Individual Camera Lens Protector Rings', 'titanium-individual-lens-rings', 'Optical AR coated glass with CNC carved titanium bezel', 'Protects sapphire lenses without any flash reflection or hazing.', 'c0000001-0000-0000-0000-000000000005', 'Gadget House', array['camera', 'lens', 'titanium'], 'active', '7007', 18.00),
    ('p0000001-0000-0000-0000-000000000005', '3-in-1 Foldable MagSafe Travel Charging Station', '3-in-1-foldable-magsafe-travel-charger', 'Charges iPhone, Apple Watch and AirPods simultaneously in a travel pouch', 'CNC aluminum chassis with 15W Qi2 certified fast wireless output.', 'c0000001-0000-0000-0000-000000000003', 'Gadget House', array['charger', 'wireless', 'magsafe', 'dock'], 'active', '8504', 18.00),
    ('p0000001-0000-0000-0000-000000000006', '65W GaN Dual USB-C Fast Wall Charger', '65w-gan-dual-usb-c-charger', 'Ultra-compact Gallium Nitride adapter for phone and laptop', 'Smart power distribution delivers full 65W PD 3.0 speeds.', 'c0000001-0000-0000-0000-000000000006', 'Gadget House', array['gan', 'adapter', 'fast-charging', 'type-c'], 'active', '8504', 18.00),
    ('p0000001-0000-0000-0000-000000000007', '240W Kevlar Braided USB-C to USB-C Cable (2m)', '240w-kevlar-braided-cable', 'Tested for 50,000+ bends with built-in E-Marker IC', 'Supports 48V/5A power delivery and 480Mbps high-speed sync.', 'c0000001-0000-0000-0000-000000000006', 'Gadget House', array['cable', 'braided', '240w'], 'active', '8544', 18.00),
    ('p0000001-0000-0000-0000-000000000008', 'MagSafe Active Air Vent Car Mount with Cryo-Fan', 'magsafe-active-air-vent-car-mount', 'Thermoelectric semiconductor cooling chip prevents iPhone overheating while navigation', 'Secure clamp mechanism with 360-degree ball joint.', 'c0000001-0000-0000-0000-000000000004', 'Gadget House', array['car-mount', 'magsafe', 'cooler'], 'active', '8708', 18.00),
    ('p0000001-0000-0000-0000-000000000009', 'Aramid Fiber 600D Zero-Bulk Armor Case', 'aramid-fiber-600d-armor-case', 'Real aerospace aramid fiber weighing just 12 grams', 'Supercar textured weave with grip-lock non-slip coating.', 'c0000001-0000-0000-0000-000000000001', 'Gadget House', array['aramid', 'carbon-fiber', 'slim'], 'active', '3926', 18.00),
    ('p0000001-0000-0000-0000-000000000010', 'Hydrogel Edge-to-Edge Self-Healing Screen Protector', 'hydrogel-self-healing-protector', 'Nano-rebound polymers automatically fix minor scratches within 24 hours', 'Full curved screen coverage with zero bubble lift.', 'c0000001-0000-0000-0000-000000000002', 'Gadget House', array['hydrogel', 'self-healing'], 'active', '3926', 18.00)
on conflict (id) do nothing;

-- Product Variants (with prices in minor unit paise e.g. â‚¹1299 = 129900 paise, cost_price â‚¹450 = 45000 paise)
insert into public.product_variants (id, product_id, sku, barcode, option_values, price, compare_at_price, cost_price, is_active) values
    ('v0000001-0000-0000-0000-000000000001', 'p0000001-0000-0000-0000-000000000001', 'GH-CASE-17PM-BLK', '890123456001', '{"color": "Titanium Black"}'::jsonb, 149900, 249900, 48000, true),
    ('v0000001-0000-0000-0000-000000000002', 'p0000001-0000-0000-0000-000000000001', 'GH-CASE-17P-NAT', '890123456002', '{"color": "Natural Titanium"}'::jsonb, 149900, 249900, 48000, true),
    ('v0000001-0000-0000-0000-000000000003', 'p0000001-0000-0000-0000-000000000002', 'GH-GLS-17PM-CLR', '890123456003', '{"finish": "Crystal Clear"}'::jsonb, 79900, 149900, 19000, true),
    ('v0000001-0000-0000-0000-000000000004', 'p0000001-0000-0000-0000-000000000003', 'GH-GLS-16PM-MAT', '890123456004', '{"finish": "Matte Gaming"}'::jsonb, 89900, 169900, 23000, true),
    ('v0000001-0000-0000-0000-000000000005', 'p0000001-0000-0000-0000-000000000004', 'GH-CAM-17PM-TI', '890123456005', '{"color": "Desert Titanium"}'::jsonb, 59900, 99900, 12000, true),
    ('v0000001-0000-0000-0000-000000000006', 'p0000001-0000-0000-0000-000000000005', 'GH-CHG-3IN1-SLV', '890123456006', '{"color": "Silver Aluminum"}'::jsonb, 349900, 599900, 130000, true),
    ('v0000001-0000-0000-0000-000000000007', 'p0000001-0000-0000-0000-000000000006', 'GH-GAN-65W-WHT', '890123456007', '{"color": "Glacier White"}'::jsonb, 189900, 299900, 68000, true),
    ('v0000001-0000-0000-0000-000000000008', 'p0000001-0000-0000-0000-000000000007', 'GH-CBL-240W-ORG', '890123456008', '{"color": "Signature Orange"}'::jsonb, 69900, 129900, 18000, true),
    ('v0000001-0000-0000-0000-000000000009', 'p0000001-0000-0000-0000-000000000008', 'GH-MNT-CRYO-BLK', '890123456009', '{"color": "Obsidian Black"}'::jsonb, 229900, 399900, 85000, true),
    ('v0000001-0000-0000-0000-000000000010', 'p0000001-0000-0000-0000-000000000009', 'GH-CASE-S25U-CARB', '890123456010', '{"color": "Matte Carbon"}'::jsonb, 199900, 349900, 65000, true)
on conflict (id) do nothing;

-- Product Compatibility Connections
insert into public.product_compatibility (product_id, phone_model_id) values
    ('p0000001-0000-0000-0000-000000000001', 'm0000001-0000-0000-0000-000000000001'), -- iPhone 17 Pro Max
    ('p0000001-0000-0000-0000-000000000001', 'm0000001-0000-0000-0000-000000000002'), -- iPhone 17 Pro
    ('p0000001-0000-0000-0000-000000000002', 'm0000001-0000-0000-0000-000000000001'), -- Glass 17 Pro Max
    ('p0000001-0000-0000-0000-000000000002', 'm0000001-0000-0000-0000-000000000005'), -- Glass 16 Pro Max
    ('p0000001-0000-0000-0000-000000000003', 'm0000001-0000-0000-0000-000000000005'), -- Gaming Glass 16 PM
    ('p0000001-0000-0000-0000-000000000004', 'm0000001-0000-0000-0000-000000000001'), -- Cam lens 17 PM
    ('p0000001-0000-0000-0000-000000000009', 'm0000001-0000-0000-0000-000000000016')  -- S25 Ultra case
on conflict do nothing;

-- Initialize Stock Levels for Warehouse & Shop
insert into public.inventory_levels (variant_id, location_id, quantity, low_stock_threshold)
select v.id, l.id, 45, 5
from public.product_variants v, public.locations l
on conflict (variant_id, location_id) do update set quantity = excluded.quantity;

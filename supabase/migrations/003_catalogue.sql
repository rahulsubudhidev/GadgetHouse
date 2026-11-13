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

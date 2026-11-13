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

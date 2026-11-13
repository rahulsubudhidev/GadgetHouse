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

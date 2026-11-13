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

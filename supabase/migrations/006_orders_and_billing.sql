-- ==============================================================================
-- 006_orders_and_billing.sql
-- Gadget House Database Architecture
-- Unified omnichannel orders, payments, refunds, shipments, audit events,
-- and gapless GST invoice numbering with row-level counter locking
-- ==============================================================================

-- 1. Status Enums
do $$ begin
    create type sales_channel as enum ('online', 'pos');
exception
    when duplicate_object then null;
end $$;

do $$ begin
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
exception
    when duplicate_object then null;
end $$;

do $$ begin
    create type order_payment_status as enum ('pending', 'paid', 'partially_refunded', 'refunded', 'failed');
exception
    when duplicate_object then null;
end $$;

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
do $$ begin
    create type payment_provider as enum ('razorpay', 'stripe', 'paypal', 'cash', 'upi', 'card', 'store_credit');
exception
    when duplicate_object then null;
end $$;

do $$ begin
    create type payment_record_status as enum ('pending', 'captured', 'failed', 'refunded');
exception
    when duplicate_object then null;
end $$;

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


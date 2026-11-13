-- ==============================================================================
-- 007_pos_module.sql
-- Gadget House Database Architecture
-- POS Cashier Shifts, Held Carts, Atomic Checkout RPC & Bill Voiding
-- ==============================================================================

-- 1. POS Cashier Shifts
do $$ begin
    create type shift_status as enum ('open', 'closed');
exception
    when duplicate_object then null;
end $$;

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
do $$ begin
    create type cash_movement_type as enum ('in', 'out');
exception
    when duplicate_object then null;
end $$;

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
                raise exception 'Discount of % percent exceeds cashier limit (% percent max). Manager approval required.', v_discount_pct, v_max_cashier_discount_pct;
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


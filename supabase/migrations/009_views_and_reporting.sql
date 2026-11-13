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


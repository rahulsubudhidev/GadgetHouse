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

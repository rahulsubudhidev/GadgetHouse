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
    ('INR', '₹', 'Indian Rupee', 2, true),
    ('USD', '$', 'US Dollar', 2, true),
    ('EUR', '€', 'Euro', 2, true),
    ('GBP', '£', 'British Pound', 2, true),
    ('AED', 'د.إ', 'UAE Dirham', 2, true)
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
    ('hi', 'हिन्दी (Hindi)', false, true),
    ('ar', 'العربية (Arabic)', true, true),
    ('es', 'Español (Spanish)', false, true),
    ('fr', 'Français (French)', false, true)
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
    ('33333333-3333-3333-3333-333333333333', 'Standard Ground', 0, 5000, 4900, 49900, 3, 5),     -- ₹49, free over ₹499
    ('33333333-3333-3333-3333-333333333333', 'BlueDart Express Air', 0, 5000, 9900, 99900, 1, 2),  -- ₹99, free over ₹999
    ('44444444-4444-4444-4444-444444444444', 'DHL Express Gulf', 0, 5000, 149900, 499900, 3, 6)   -- ₹1499, free over ₹4999
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

-- Product Variants (with prices in minor unit paise e.g. ₹1299 = 129900 paise, cost_price ₹450 = 45000 paise)
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

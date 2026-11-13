-- ==============================================================================
-- GadgetHouse Initial Seed Data
-- ==============================================================================

-- Phone Brands
insert into public.phone_brands (id, name) values
  ('apple', 'Apple'),
  ('samsung', 'Samsung'),
  ('google', 'Google Pixel'),
  ('oneplus', 'OnePlus'),
  ('nothing', 'Nothing'),
  ('xiaomi', 'Xiaomi'),
  ('motorola', 'Motorola')
on conflict (id) do nothing;

-- Phone Models
insert into public.phone_models (id, brand_id, name, release_year, popular) values
  ('ip-17-pm', 'apple', 'iPhone 17 Pro Max', 2025, true),
  ('ip-17-p', 'apple', 'iPhone 17 Pro', 2025, true),
  ('ip-17', 'apple', 'iPhone 17', 2025, true),
  ('ip-17-air', 'apple', 'iPhone 17 Air', 2025, true),
  ('ip-16-pm', 'apple', 'iPhone 16 Pro Max', 2024, true),
  ('ip-16-p', 'apple', 'iPhone 16 Pro', 2024, true),
  ('ip-16-plus', 'apple', 'iPhone 16 Plus', 2024, true),
  ('ip-16', 'apple', 'iPhone 16', 2024, true),
  ('ip-15-pm', 'apple', 'iPhone 15 Pro Max', 2023, true),
  ('ip-15-p', 'apple', 'iPhone 15 Pro', 2023, false),
  ('ip-15', 'apple', 'iPhone 15', 2023, false),
  ('ip-14-pm', 'apple', 'iPhone 14 Pro Max', 2022, false),
  ('ip-14-p', 'apple', 'iPhone 14 Pro', 2022, false),
  ('ip-14', 'apple', 'iPhone 14', 2022, false),
  ('ip-13', 'apple', 'iPhone 13', 2021, false),
  ('sam-s25-u', 'samsung', 'Galaxy S25 Ultra', 2025, true),
  ('sam-s25-p', 'samsung', 'Galaxy S25+', 2025, true),
  ('sam-s25', 'samsung', 'Galaxy S25', 2025, true),
  ('sam-s24-u', 'samsung', 'Galaxy S24 Ultra', 2024, true),
  ('sam-zfold6', 'samsung', 'Galaxy Z Fold 6', 2024, false),
  ('sam-zflip6', 'samsung', 'Galaxy Z Flip 6', 2024, false),
  ('px-9-pro-xl', 'google', 'Pixel 9 Pro XL', 2024, true),
  ('px-9-pro', 'google', 'Pixel 9 Pro', 2024, false),
  ('px-9', 'google', 'Pixel 9', 2024, false),
  ('op-13', 'oneplus', 'OnePlus 13', 2025, true),
  ('op-12', 'oneplus', 'OnePlus 12', 2024, false),
  ('nothing-2', 'nothing', 'Nothing Phone (2)', 2023, false),
  ('nothing-2a', 'nothing', 'Nothing Phone (2a)', 2024, false)
on conflict (id) do nothing;

-- Categories
insert into public.categories (id, slug, name, description, item_count, image) values
  ('cat-1', 'back-cases', 'Back Cases', 'Slim, shockproof, MagSafe-ready armor for daily drops.', 142, 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=800&q=80'),
  ('cat-2', 'tempered-glass', 'Tempered Glass', '9H hardness, edge-to-edge HD clarity with dust-free install.', 88, 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=800&q=80'),
  ('cat-3', 'smart-gadgets', 'Smart Gadgets', '3-in-1 wireless docks, GaN adapters & travel chargers.', 46, 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80'),
  ('cat-4', 'accessories', 'Accessories', 'MagSafe car mounts, 240W braided cables & desk stands.', 65, 'https://images.unsplash.com/photo-1616469829941-c7200edec809?auto=format&fit=crop&w=800&q=80'),
  ('cat-5', 'camera-protectors', 'Camera Protectors', 'Titanium alloy independent lens rings with AR optical glass.', 39, 'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=800&q=80')
on conflict (id) do nothing;

-- Coupons
insert into public.coupons (code, discount_type, discount_value, min_order_value, description, active) values
  ('WELCOME10', 'percentage', 10, 499, '10% off on your first order above Rs 499', true),
  ('FESTIVE500', 'fixed', 500, 2499, 'Flat Rs 500 off on orders above Rs 2499', true),
  ('FREESHIP', 'fixed', 99, 999, 'Free express shipping on orders over Rs 999', true)
on conflict (code) do nothing;


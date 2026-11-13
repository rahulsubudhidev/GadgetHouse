-- ==============================================================================
-- 010_storage.sql
-- Gadget House Database Architecture
-- Supabase Storage Buckets & Access Control Policies
-- ==============================================================================

-- 1. Create Buckets
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
    ('product-images', 'product-images', true, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'image/avif']),
    ('banners', 'banners', true, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'image/avif']),
    ('invoices', 'invoices', false, 15728640, array['application/pdf']),
    ('review-photos', 'review-photos', true, 10485760, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set
    public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- 2. Storage Policies

-- product-images: Public can read, only staff with catalogue create/edit can upload
create policy "Public can view product images"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'product-images');

create policy "Staff can upload product images"
on storage.objects for insert
to authenticated
with check (
    bucket_id = 'product-images'
    and public.is_staff(auth.uid())
);

create policy "Staff can update/delete product images"
on storage.objects for all
to authenticated
using (
    bucket_id = 'product-images'
    and public.is_staff(auth.uid())
);

-- banners: Public can read, only staff can manage
create policy "Public can view banners"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'banners');

create policy "Staff can manage banners"
on storage.objects for all
to authenticated
using (
    bucket_id = 'banners'
    and public.is_staff(auth.uid())
)
with check (
    bucket_id = 'banners'
    and public.is_staff(auth.uid())
);

-- invoices: Private (Only customers who own the invoice or staff can read)
create policy "Staff can read all invoices"
on storage.objects for select
to authenticated
using (
    bucket_id = 'invoices'
    and public.is_staff(auth.uid())
);

create policy "Customer can read own invoice PDF"
on storage.objects for select
to authenticated
using (
    bucket_id = 'invoices'
    and exists (
        select 1 from public.invoices inv
        join public.orders o on o.id = inv.order_id
        where inv.pdf_url like ('%' || storage.objects.name)
          and o.customer_id = auth.uid()
    )
);

-- review-photos: Authenticated shoppers can upload, public can view
create policy "Public can view review photos"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'review-photos');

create policy "Shoppers can upload review photos"
on storage.objects for insert
to authenticated
with check (
    bucket_id = 'review-photos'
    and (select auth.uid()) is not null
);


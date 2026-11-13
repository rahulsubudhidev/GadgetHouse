-- ==============================================================================
-- 001_extensions_and_helpers.sql
-- Gadget House Database Architecture
-- Extensions, generic utilities, and timestamp automation
-- ==============================================================================

-- 1. Essential Postgres Extensions
create extension if not exists "pgcrypto";
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";
create extension if not exists "unaccent";

-- 2. Reusable updated_at trigger function
create or replace function public.set_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    new.updated_at = clock_timestamp();
    return new;
end;
$$;

-- 3. Sequence for Orders and Invoices
create sequence if not exists public.order_number_seq start with 1001 increment by 1;
create sequence if not exists public.invoice_number_seq start with 1001 increment by 1;
create sequence if not exists public.credit_note_seq start with 1001 increment by 1;

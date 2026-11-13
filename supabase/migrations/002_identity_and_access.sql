-- ==============================================================================
-- 002_identity_and_access.sql
-- Gadget House Database Architecture
-- Profiles, RBAC (roles, permissions, role_permissions, staff_roles), Audit Logging
-- ==============================================================================

-- 1. Profiles (Linked 1:1 with Supabase Auth users)
create table if not exists public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    full_name text not null default '',
    phone text,
    avatar_url text,
    preferred_language char(2) not null default 'en',
    preferred_currency char(3) not null default 'INR',
    is_staff boolean not null default false,
    phone_model_id uuid, -- preferred device model
    deleted_at timestamptz,
    created_at timestamptz not null default clock_timestamp(),
    updated_at timestamptz not null default clock_timestamp()
);

create trigger trg_profiles_updated_at
    before update on public.profiles
    for each row execute function public.set_updated_at();

create index if not exists idx_profiles_phone on public.profiles(phone);
create index if not exists idx_profiles_is_staff on public.profiles(is_staff) where is_staff is true;

-- Auto-create profile on Supabase auth.users signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    insert into public.profiles (id, full_name, phone, avatar_url, is_staff)
    values (
        new.id,
        coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
        coalesce(new.raw_user_meta_data->>'phone', new.phone),
        coalesce(new.raw_user_meta_data->>'avatar_url', null),
        false
    )
    on conflict (id) do nothing;
    return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function public.handle_new_user();

-- 2. Roles & Permissions Architecture
create table if not exists public.roles (
    id uuid primary key default gen_random_uuid(),
    name text unique not null,
    description text default '',
    is_system boolean not null default false,
    created_at timestamptz not null default clock_timestamp(),
    updated_at timestamptz not null default clock_timestamp()
);

create trigger trg_roles_updated_at
    before update on public.roles
    for each row execute function public.set_updated_at();

create type permission_action as enum ('view', 'create', 'edit', 'delete', 'export');

create table if not exists public.permissions (
    id uuid primary key default gen_random_uuid(),
    module text not null, -- 'catalogue', 'inventory', 'orders', 'pos', 'staff', 'reports', 'settings'
    action permission_action not null,
    description text default '',
    created_at timestamptz not null default clock_timestamp(),
    unique (module, action)
);

create table if not exists public.role_permissions (
    role_id uuid not null references public.roles(id) on delete cascade,
    permission_id uuid not null references public.permissions(id) on delete cascade,
    created_at timestamptz not null default clock_timestamp(),
    primary key (role_id, permission_id)
);

create index if not exists idx_role_perms_perm on public.role_permissions(permission_id);

create table if not exists public.staff_roles (
    user_id uuid not null references public.profiles(id) on delete cascade,
    role_id uuid not null references public.roles(id) on delete cascade,
    assigned_by uuid references public.profiles(id) on delete set null,
    created_at timestamptz not null default clock_timestamp(),
    primary key (user_id, role_id)
);

create index if not exists idx_staff_roles_role on public.staff_roles(role_id);

-- 3. High-Performance Security Definer RBAC Helper Functions
create or replace function public.is_staff(check_user_id uuid default auth.uid())
returns boolean
language sql
security definer
stable
set search_path = public
as $$
    select exists (
        select 1 from public.profiles
        where id = check_user_id
          and is_staff is true
          and deleted_at is null
    );
$$;

create or replace function public.has_permission(p_module text, p_action permission_action, check_user_id uuid default auth.uid())
returns boolean
language sql
security definer
stable
set search_path = public
as $$
    select exists (
        select 1
        from public.staff_roles sr
        join public.role_permissions rp on rp.role_id = sr.role_id
        join public.permissions p on p.id = rp.permission_id
        join public.profiles pr on pr.id = sr.user_id
        where sr.user_id = check_user_id
          and pr.is_staff is true
          and pr.deleted_at is null
          and p.module = p_module
          and p.action = p_action
    );
$$;

-- 4. Audit Logging Engine
create table if not exists public.audit_logs (
    id uuid primary key default gen_random_uuid(),
    actor_id uuid references public.profiles(id) on delete set null,
    action text not null, -- INSERT, UPDATE, DELETE, RPC_CALL
    table_name text not null,
    record_id text,
    old_data jsonb,
    new_data jsonb,
    ip_address text,
    created_at timestamptz not null default clock_timestamp()
);

create index if not exists idx_audit_logs_table_record on public.audit_logs(table_name, record_id);
create index if not exists idx_audit_logs_actor on public.audit_logs(actor_id);
create index if not exists idx_audit_logs_created_at on public.audit_logs(created_at desc);

-- Generic Audit Trigger for sensitive operations
create or replace function public.audit_trigger_fn()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
    v_record_id text;
    v_actor_id uuid;
begin
    v_actor_id := auth.uid();
    if TG_OP = 'DELETE' then
        v_record_id := old.id::text;
        insert into public.audit_logs (actor_id, action, table_name, record_id, old_data)
        values (v_actor_id, 'DELETE', TG_TABLE_NAME, v_record_id, to_jsonb(old));
        return old;
    elsif TG_OP = 'UPDATE' then
        v_record_id := new.id::text;
        insert into public.audit_logs (actor_id, action, table_name, record_id, old_data, new_data)
        values (v_actor_id, 'UPDATE', TG_TABLE_NAME, v_record_id, to_jsonb(old), to_jsonb(new));
        return new;
    elsif TG_OP = 'INSERT' then
        v_record_id := new.id::text;
        insert into public.audit_logs (actor_id, action, table_name, record_id, new_data)
        values (v_actor_id, 'INSERT', TG_TABLE_NAME, v_record_id, to_jsonb(new));
        return new;
    end if;
    return null;
end;
$$;

-- =====================================================================
-- Ladion Services Platform — Database Schema
-- Run this once in the Supabase SQL editor (Dashboard -> SQL Editor).
-- Safe to re-run: uses IF NOT EXISTS / CREATE OR REPLACE throughout.
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- PROFILES  (1:1 with auth.users, created automatically on sign-up)
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  phone text,
  company text,
  role text not null default 'client' check (role in ('client', 'admin')),
  whatsapp_opt_in boolean not null default true,
  created_at timestamptz not null default now()
);

-- Auto-create a profile row whenever a new auth user is created.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, phone)
  values (
    new.id, new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    nullif(new.raw_user_meta_data->>'phone', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- security definer helper so RLS policies can check role without recursive
-- self-referencing policies on the profiles table.
create or replace function public.is_admin()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- ---------------------------------------------------------------------
-- SERVICES  (public catalogue — powers /services and /services/[slug])
-- ---------------------------------------------------------------------
create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  short_description text not null,
  detailed_description text not null,
  capabilities jsonb not null default '[]'::jsonb,
  technology_areas jsonb not null default '[]'::jsonb,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- PROJECTS  (client project requests / intake submissions)
-- ---------------------------------------------------------------------
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  project_code text unique not null,
  client_id uuid not null references public.profiles(id) on delete cascade,
  service_id uuid references public.services(id),
  name text not null,
  company text,
  description text,
  business_problem text,
  goals text,
  functional_requirements text,
  technical_requirements text,
  target_users text,
  preferred_technology text,
  expected_features text,
  integrations_required text,
  budget text,
  timeline_start date,
  timeline_end date,
  priority text not null default 'normal' check (priority in ('low', 'normal', 'high', 'urgent')),
  status text not null default 'requirements_received' check (status in (
    'requirements_received', 'payment_pending', 'payment_received',
    'under_review', 'in_progress', 'testing', 'completed', 'cancelled'
  )),
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create sequence if not exists public.project_code_seq;

create or replace function public.generate_project_code()
returns text
language plpgsql
as $$
declare
  yr text := to_char(now(), 'YYYY');
  n bigint := nextval('public.project_code_seq');
begin
  return 'LAD-' || yr || '-' || lpad(n::text, 3, '0');
end;
$$;

-- ---------------------------------------------------------------------
-- PROJECT FILES  (Supabase Storage metadata)
-- ---------------------------------------------------------------------
create table if not exists public.project_files (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  uploaded_by uuid not null references public.profiles(id),
  file_name text not null,
  file_path text not null,
  file_type text,
  file_size bigint,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- PAYMENTS
-- ---------------------------------------------------------------------
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  payment_code text unique not null,
  project_id uuid not null references public.projects(id) on delete cascade,
  client_id uuid not null references public.profiles(id),
  amount numeric(12, 2) not null,
  currency text not null default 'INR',
  description text not null,
  payment_type text not null default 'advance',
  due_date date,
  status text not null default 'created' check (status in (
    'created', 'processing', 'paid', 'failed', 'cancelled'
  )),
  provider text not null default 'dummy',
  method text,
  order_id text,
  payment_ref text,
  transaction_id text,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

create sequence if not exists public.payment_code_seq;

create or replace function public.generate_payment_code()
returns text
language plpgsql
as $$
declare
  n bigint := nextval('public.payment_code_seq');
begin
  return 'LAD-PAY-' || upper(substr(md5(n::text || clock_timestamp()::text), 1, 6));
end;
$$;

-- ---------------------------------------------------------------------
-- NOTIFICATIONS  (simulated email / whatsapp log)
-- ---------------------------------------------------------------------
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  payment_id uuid references public.payments(id) on delete set null,
  client_id uuid not null references public.profiles(id),
  channel text not null check (channel in ('email', 'whatsapp')),
  recipient text not null,
  subject text,
  message text not null,
  status text not null default 'simulated' check (status in ('simulated', 'delivered', 'failed')),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- ACTIVITY LOG  (admin-facing audit trail + dashboard "recent activity")
-- ---------------------------------------------------------------------
create table if not exists public.activity_log (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  actor_id uuid references public.profiles(id),
  action text not null,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- =====================================================================
-- ROW LEVEL SECURITY
-- =====================================================================

alter table public.profiles enable row level security;
alter table public.services enable row level security;
alter table public.projects enable row level security;
alter table public.project_files enable row level security;
alter table public.payments enable row level security;
alter table public.notifications enable row level security;
alter table public.activity_log enable row level security;

-- PROFILES ---------------------------------------------------------
drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin" on public.profiles
  for select using (id = auth.uid() or public.is_admin());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (id = auth.uid());

-- SERVICES (public read; admin write) -------------------------------
drop policy if exists "services_select_all" on public.services;
create policy "services_select_all" on public.services
  for select using (true);

drop policy if exists "services_admin_write" on public.services;
create policy "services_admin_write" on public.services
  for all using (public.is_admin()) with check (public.is_admin());

-- PROJECTS -----------------------------------------------------------
drop policy if exists "projects_select_own_or_admin" on public.projects;
create policy "projects_select_own_or_admin" on public.projects
  for select using (client_id = auth.uid() or public.is_admin());

drop policy if exists "projects_insert_own" on public.projects;
create policy "projects_insert_own" on public.projects
  for insert with check (client_id = auth.uid());

drop policy if exists "projects_update_admin_only" on public.projects;
create policy "projects_update_admin_only" on public.projects
  for update using (public.is_admin());

-- PROJECT FILES --------------------------------------------------------
drop policy if exists "project_files_select_own_or_admin" on public.project_files;
create policy "project_files_select_own_or_admin" on public.project_files
  for select using (
    public.is_admin()
    or exists (select 1 from public.projects p where p.id = project_id and p.client_id = auth.uid())
  );

drop policy if exists "project_files_insert_own" on public.project_files;
create policy "project_files_insert_own" on public.project_files
  for insert with check (
    exists (select 1 from public.projects p where p.id = project_id and p.client_id = auth.uid())
  );

-- PAYMENTS -------------------------------------------------------------
-- Clients may only ever SELECT their own payments. All inserts/updates to
-- payments happen server-side via the service-role client (see
-- lib/supabase/admin.js) after verifying ownership in application code —
-- the browser is never trusted to change payment status.
drop policy if exists "payments_select_own_or_admin" on public.payments;
create policy "payments_select_own_or_admin" on public.payments
  for select using (client_id = auth.uid() or public.is_admin());

-- NOTIFICATIONS ----------------------------------------------------------
drop policy if exists "notifications_select_own_or_admin" on public.notifications;
create policy "notifications_select_own_or_admin" on public.notifications
  for select using (client_id = auth.uid() or public.is_admin());

-- ACTIVITY LOG (admin only) --------------------------------------------
drop policy if exists "activity_log_admin_only" on public.activity_log;
create policy "activity_log_admin_only" on public.activity_log
  for select using (public.is_admin());

-- =====================================================================
-- STORAGE  (private bucket for project intake file uploads)
-- =====================================================================
insert into storage.buckets (id, name, public)
values ('project-files', 'project-files', false)
on conflict (id) do nothing;

drop policy if exists "project_files_storage_insert_own" on storage.objects;
create policy "project_files_storage_insert_own" on storage.objects
  for insert with check (
    bucket_id = 'project-files'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "project_files_storage_select_own_or_admin" on storage.objects;
create policy "project_files_storage_select_own_or_admin" on storage.objects
  for select using (
    bucket_id = 'project-files'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
  );

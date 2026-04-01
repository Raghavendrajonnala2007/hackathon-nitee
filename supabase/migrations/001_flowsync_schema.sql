-- FlowSync schema — run in Supabase SQL Editor or via Supabase CLI
create extension if not exists "pgcrypto";

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  role text not null default 'user' check (role in ('user', 'admin')),
  plan_tier text not null default 'free' check (plan_tier in ('free', 'pro', 'enterprise')),
  monthly_credit_allowance integer not null default 100 check (monthly_credit_allowance >= 0),
  credits_used_this_period integer not null default 0 check (credits_used_this_period >= 0),
  period_start timestamptz not null default now(),
  company_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_role_idx on public.profiles (role);

create table if not exists public.zones (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  external_zone_id text,
  location text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists zones_user_idx on public.zones (user_id);

create table if not exists public.zone_readings (
  id uuid primary key default gen_random_uuid(),
  zone_id uuid not null references public.zones (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  source_type text not null check (source_type in ('image', 'sensor')),
  density_score numeric,
  occupancy_percent numeric,
  confidence numeric,
  ai_result_url text,
  temp_image_public_id text,
  raw_payload jsonb,
  created_at timestamptz not null default now()
);

create index if not exists zone_readings_user_created_idx on public.zone_readings (user_id, created_at desc);
create index if not exists zone_readings_zone_idx on public.zone_readings (zone_id);

create table if not exists public.alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  zone_id uuid references public.zones (id) on delete set null,
  severity text not null check (severity in ('info', 'warning', 'critical')),
  message text not null,
  acknowledged boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists alerts_user_created_idx on public.alerts (user_id, created_at desc);

create table if not exists public.usage_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  zone_reading_id uuid references public.zone_readings (id) on delete set null,
  credits_delta integer not null,
  event_type text not null,
  created_at timestamptz not null default now()
);

create index if not exists usage_events_user_idx on public.usage_events (user_id, created_at desc);

create table if not exists public.api_monitor_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete set null,
  endpoint text not null,
  status_code integer not null,
  latency_ms integer not null,
  error_message text,
  created_at timestamptz not null default now()
);

create index if not exists api_monitor_logs_created_idx on public.api_monitor_logs (created_at desc);

create or replace function public.flowsync_handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(coalesce(new.email, ''), '@', 1))
  );
  return new;
end;
$$;

drop trigger if exists flowsync_on_auth_user_created on auth.users;
create trigger flowsync_on_auth_user_created
  after insert on auth.users
  for each row execute function public.flowsync_handle_new_user();

create or replace function public.flowsync_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists flowsync_profiles_updated_at on public.profiles;
create trigger flowsync_profiles_updated_at
  before update on public.profiles
  for each row execute function public.flowsync_set_updated_at();

alter table public.profiles enable row level security;
alter table public.zones enable row level security;
alter table public.zone_readings enable row level security;
alter table public.alerts enable row level security;
alter table public.usage_events enable row level security;
alter table public.api_monitor_logs enable row level security;

drop policy if exists "profiles_select_self_or_admin" on public.profiles;
create policy "profiles_select_self_or_admin"
  on public.profiles for select
  using (id = auth.uid() or public.is_admin());

drop policy if exists "profiles_update_self" on public.profiles;
create policy "profiles_update_self"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

drop policy if exists "profiles_update_admin" on public.profiles;
create policy "profiles_update_admin"
  on public.profiles for update
  using (public.is_admin());

drop policy if exists "zones_user_crud" on public.zones;
create policy "zones_user_crud"
  on public.zones for all
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "zone_readings_select" on public.zone_readings;
create policy "zone_readings_select"
  on public.zone_readings for select
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists "alerts_select" on public.alerts;
create policy "alerts_select"
  on public.alerts for select
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists "alerts_update_ack" on public.alerts;
create policy "alerts_update_ack"
  on public.alerts for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "usage_events_select" on public.usage_events;
create policy "usage_events_select"
  on public.usage_events for select
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists "api_logs_select_admin" on public.api_monitor_logs;
create policy "api_logs_select_admin"
  on public.api_monitor_logs for select
  using (public.is_admin());

create or replace function public.flowsync_profiles_restrict_non_admin_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_admin() then
    return new;
  end if;
  if new.id <> auth.uid() then
    return new;
  end if;
  if new.role is distinct from old.role
     or new.plan_tier is distinct from old.plan_tier
     or new.monthly_credit_allowance is distinct from old.monthly_credit_allowance
     or new.credits_used_this_period is distinct from old.credits_used_this_period
     or new.period_start is distinct from old.period_start then
    raise exception 'Not allowed to change role, plan, or credit fields';
  end if;
  return new;
end;
$$;

drop trigger if exists flowsync_profiles_restrict_update on public.profiles;
create trigger flowsync_profiles_restrict_update
  before update on public.profiles
  for each row execute function public.flowsync_profiles_restrict_non_admin_update();

-- Realtime: run once in Dashboard SQL (duplicate errors if re-run)
-- alter publication supabase_realtime add table public.zone_readings;

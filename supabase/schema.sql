-- ==============================================================================
-- OstraOps 2.0 Enterprise Hosted Gateway & Multi-Tenant Schema (Phase 1)
-- Run this in Supabase SQL Editor (Dashboard -> SQL Editor -> New query)
-- ==============================================================================

-- 1. Enable Required Extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ==============================================================================
-- 2. Organizations & Multi-Tenancy Hierarchy
-- ==============================================================================

-- Organizations (Root Tenant Container)
create table if not exists public.organizations (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text unique not null,
  billing_status text not null default 'active' check (billing_status in ('active', 'past_due', 'canceled', 'trialing')),
  plan text not null default 'free' check (plan in ('free', 'team', 'enterprise')),
  billing_email text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Organization Members (RBAC Junction between auth.users and organizations)
create table if not exists public.organization_members (
  id uuid default gen_random_uuid() primary key,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'developer' check (role in ('owner', 'admin', 'developer', 'viewer', 'billing', 'client')),
  created_at timestamptz default now() not null,
  unique (organization_id, user_id)
);

create index if not exists idx_org_members_user on public.organization_members(user_id);
create index if not exists idx_org_members_org on public.organization_members(organization_id);

-- User Profiles (Extends auth.users with public tenant context)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  org_id uuid references public.organizations(id) on delete set null,
  full_name text,
  email text,
  phone text,
  job_title text,
  company_name text,
  company_website text,
  avatar_url text,
  timezone text default 'Asia/Kolkata',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index if not exists idx_profiles_org on public.profiles(org_id);

-- Projects (Scoped work units within an Organization)
create table if not exists public.projects (
  id uuid default gen_random_uuid() primary key,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  slug text not null,
  description text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  unique (organization_id, slug)
);

create index if not exists idx_projects_org on public.projects(organization_id);

-- Environments (Isolated stages per project: dev / staging / prod)
create table if not exists public.environments (
  id uuid default gen_random_uuid() primary key,
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null check (name in ('development', 'staging', 'production')),
  created_at timestamptz default now() not null,
  unique (project_id, name)
);

create index if not exists idx_environments_project on public.environments(project_id);

-- Virtual Keys (Developer tokens ost_live_... tied directly to tenant hierarchy)
create table if not exists public.virtual_keys (
  id uuid default gen_random_uuid() primary key,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  environment_id uuid not null references public.environments(id) on delete cascade,
  name text not null,
  key_prefix text not null, -- e.g. "ost_live_9a7b" for identification
  key_hash text not null unique, -- SHA-256 hash of the complete secret token
  monthly_limit_usd numeric(12, 4) not null default 100.0000,
  current_spend_usd numeric(12, 4) not null default 0.0000,
  rpm_limit int not null default 60,
  tpm_limit int not null default 100000,
  max_concurrency int not null default 10,
  status text not null default 'active' check (status in ('active', 'frozen', 'revoked')),
  created_at timestamptz default now() not null,
  last_used_at timestamptz
);

create index if not exists idx_virtual_keys_hash on public.virtual_keys(key_hash);
create index if not exists idx_virtual_keys_org on public.virtual_keys(organization_id);

-- Decoupled Provider Secrets Metadata (Referencing Vault / KMS)
-- Actual API keys are never stored plain here; secret_reference points to vault
create table if not exists public.provider_connections (
  id uuid default gen_random_uuid() primary key,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  provider text not null, -- e.g. 'openai', 'anthropic', 'deepseek', 'google'
  secret_reference text not null, -- Vault secret UUID or encrypted reference
  status text not null default 'active' check (status in ('active', 'inactive', 'rate_limited')),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  last_used_at timestamptz,
  unique (organization_id, provider)
);

create index if not exists idx_provider_connections_org on public.provider_connections(organization_id);

-- ==============================================================================
-- 3. Time-Partitioned Gateway Telemetry (gateway_logs)
-- ==============================================================================

create table if not exists public.gateway_logs (
  id uuid default gen_random_uuid(),
  request_id text not null, -- Correlation ID: ost_req_...
  organization_id uuid not null,
  project_id uuid not null,
  environment_id uuid not null,
  virtual_key_id uuid not null,
  provider text not null,
  requested_model text not null,
  routed_model text not null,
  fallback_used boolean default false not null,
  fallback_from_model text,
  input_tokens int default 0 not null,
  output_tokens int default 0 not null,
  cost_usd numeric(12, 6) default 0.000000 not null,
  latency_ms int default 0 not null,
  status_code int not null,
  error_type text,
  error_code text,
  created_at timestamptz default now() not null,
  completed_at timestamptz,
  primary key (id, created_at)
) partition by range (created_at);

-- Monthly Range Partitions for 2026
create table if not exists public.gateway_logs_2026_09 partition of public.gateway_logs
  for values from ('2026-09-01 00:00:00+00') to ('2026-10-01 00:00:00+00');

create table if not exists public.gateway_logs_2026_10 partition of public.gateway_logs
  for values from ('2026-10-01 00:00:00+00') to ('2026-11-01 00:00:00+00');

create table if not exists public.gateway_logs_2026_11 partition of public.gateway_logs
  for values from ('2026-11-01 00:00:00+00') to ('2026-12-01 00:00:00+00');

create table if not exists public.gateway_logs_2026_12 partition of public.gateway_logs
  for values from ('2026-12-01 00:00:00+00') to ('2027-01-01 00:00:00+00');

-- Default partition for future logs fallback
create table if not exists public.gateway_logs_default partition of public.gateway_logs default;

-- Performance indexes on partitioned telemetry
create index if not exists idx_gateway_logs_org_created on public.gateway_logs(organization_id, created_at desc);
create index if not exists idx_gateway_logs_req_id on public.gateway_logs(request_id);
create index if not exists idx_gateway_logs_key on public.gateway_logs(virtual_key_id);

-- ==============================================================================
-- 4. Atomic Financial Ledger Sync & Auto-Freeze Trigger
-- ==============================================================================

-- Stored procedure: atomic delta spend increment
-- Designed to be called by the gateway (or worker flush) to increment spend and auto-freeze if budget crossed
create or replace function public.increment_key_spend(
  p_virtual_key_id uuid,
  p_spend_delta numeric
)
returns jsonb as $$
declare
  v_new_spend numeric;
  v_limit numeric;
  v_status text;
  v_is_frozen boolean := false;
begin
  update public.virtual_keys
  set 
    current_spend_usd = current_spend_usd + p_spend_delta,
    last_used_at = now(),
    status = case 
      when (current_spend_usd + p_spend_delta) >= monthly_limit_usd then 'frozen'
      else status 
    end
  where id = p_virtual_key_id
  returning current_spend_usd, monthly_limit_usd, status
  into v_new_spend, v_limit, v_status;

  if not found then
    return jsonb_build_object('success', false, 'error', 'Virtual key not found');
  end if;

  v_is_frozen := (v_status = 'frozen');

  return jsonb_build_object(
    'success', true,
    'current_spend_usd', v_new_spend,
    'monthly_limit_usd', v_limit,
    'status', v_status,
    'is_frozen', v_is_frozen
  );
end;
$$ language plpgsql security definer;

-- ==============================================================================
-- 5. Defensive User Bootstrap (Invites + Personal Tenant)
-- ==============================================================================

create or replace function public.handle_new_user()
returns trigger as $$
declare
  v_invited_org_id uuid;
  v_invited_role text;
  v_org_id uuid;
  v_project_id uuid;
  v_user_name text;
  v_base_slug text;
begin
  -- 1. Extract name cleanly without 'null' or fallback bugs
  v_user_name := coalesce(
    nullif(trim(new.raw_user_meta_data->>'full_name'), ''),
    nullif(trim(split_part(new.email, '@', 1)), ''),
    'Workspace'
  );

  -- 2. Check if user is signing up via an organization invitation
  if new.raw_user_meta_data->>'invited_to_org_id' is not null then
    begin
      v_invited_org_id := (new.raw_user_meta_data->>'invited_to_org_id')::uuid;
      v_invited_role := coalesce(new.raw_user_meta_data->>'invited_role', 'developer');

      -- Confirm target organization exists
      if exists (select 1 from public.organizations where id = v_invited_org_id) then
        insert into public.organization_members (organization_id, user_id, role)
        values (v_invited_org_id, new.id, v_invited_role)
        on conflict (organization_id, user_id) do nothing;

        insert into public.profiles (id, org_id, full_name, email)
        values (new.id, v_invited_org_id, v_user_name, new.email)
        on conflict (id) do update set org_id = v_invited_org_id;

        return new;
      end if;
    exception when others then
      -- If invalid UUID or invite fails, fall through to personal org provisioning
      null;
    end;
  end if;

  -- 3. Default: Provision fresh Personal Organization & Hierarchy
  v_base_slug := lower(regexp_replace(v_user_name, '[^a-zA-Z0-9]', '-', 'g'));
  if length(v_base_slug) = 0 then
    v_base_slug := 'org';
  end if;
  v_base_slug := v_base_slug || '-' || substr(new.id::text, 1, 6);

  insert into public.organizations (name, slug, billing_status, plan, billing_email)
  values (v_user_name || '''s Organization', v_base_slug, 'active', 'free', new.email)
  returning id into v_org_id;

  -- Add user as Owner
  insert into public.organization_members (organization_id, user_id, role)
  values (v_org_id, new.id, 'owner')
  on conflict (organization_id, user_id) do nothing;

  -- Profile
  insert into public.profiles (id, org_id, full_name, email)
  values (new.id, v_org_id, v_user_name, new.email)
  on conflict (id) do update set org_id = v_org_id;

  -- Default Project
  insert into public.projects (organization_id, name, slug, description)
  values (v_org_id, 'Production API', 'production-api', 'Default AI proxy project')
  returning id into v_project_id;

  -- Default Environments
  insert into public.environments (project_id, name)
  values 
    (v_project_id, 'development'),
    (v_project_id, 'staging'),
    (v_project_id, 'production')
  on conflict (project_id, name) do nothing;

  return new;
exception when others then
  -- ponytail: never block auth user creation if hierarchy bootstrap encounters an edge case
  return new;
end;
$$ language plpgsql security definer;

-- Drop and recreate trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ==============================================================================
-- 6. Strict Row-Level Security (RLS) with InitPlan (select auth.uid()) Optimization
-- ==============================================================================

alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.environments enable row level security;
alter table public.virtual_keys enable row level security;
alter table public.provider_connections enable row level security;
alter table public.gateway_logs enable row level security;

-- ------------------------------------------------------------------------------
-- Organizations Policies
-- ------------------------------------------------------------------------------
create policy "Users can view organizations they belong to"
  on public.organizations for select
  using (
    id in (
      select organization_id 
      from public.organization_members 
      where user_id = (select auth.uid())
    )
  );

create policy "Org owners can update their organization"
  on public.organizations for update
  using (
    id in (
      select organization_id 
      from public.organization_members 
      where user_id = (select auth.uid()) and role in ('owner', 'admin')
    )
  );

-- ------------------------------------------------------------------------------
-- Organization Members Policies
-- ------------------------------------------------------------------------------
create policy "Users can view members of their organizations"
  on public.organization_members for select
  using (
    organization_id in (
      select organization_id 
      from public.organization_members 
      where user_id = (select auth.uid())
    )
  );

create policy "Admins can manage organization members"
  on public.organization_members for all
  using (
    organization_id in (
      select organization_id 
      from public.organization_members 
      where user_id = (select auth.uid()) and role in ('owner', 'admin')
    )
  );

-- ------------------------------------------------------------------------------
-- Profiles Policies
-- ------------------------------------------------------------------------------
create policy "Users can view own profile"
  on public.profiles for select
  using (id = (select auth.uid()));

create policy "Users can update own profile"
  on public.profiles for update
  using (id = (select auth.uid()));

-- ------------------------------------------------------------------------------
-- Projects Policies
-- ------------------------------------------------------------------------------
create policy "Users can view projects in their org"
  on public.projects for select
  using (
    organization_id in (
      select organization_id 
      from public.organization_members 
      where user_id = (select auth.uid())
    )
  );

create policy "Developers and admins can modify projects"
  on public.projects for all
  using (
    organization_id in (
      select organization_id 
      from public.organization_members 
      where user_id = (select auth.uid()) and role in ('owner', 'admin', 'developer')
    )
  );

-- ------------------------------------------------------------------------------
-- Environments Policies
-- ------------------------------------------------------------------------------
create policy "Users can view environments in their org"
  on public.environments for select
  using (
    project_id in (
      select p.id from public.projects p
      where p.organization_id in (
        select organization_id 
        from public.organization_members 
        where user_id = (select auth.uid())
      )
    )
  );

-- ------------------------------------------------------------------------------
-- Virtual Keys Policies
-- ------------------------------------------------------------------------------
create policy "Users can view virtual keys in their org"
  on public.virtual_keys for select
  using (
    organization_id in (
      select organization_id 
      from public.organization_members 
      where user_id = (select auth.uid())
    )
  );

create policy "Developers and admins can manage virtual keys"
  on public.virtual_keys for all
  using (
    organization_id in (
      select organization_id 
      from public.organization_members 
      where user_id = (select auth.uid()) and role in ('owner', 'admin', 'developer')
    )
  );

-- ------------------------------------------------------------------------------
-- Provider Connections (Secrets Metadata) Policies
-- ------------------------------------------------------------------------------
create policy "Users can view configured providers in their org"
  on public.provider_connections for select
  using (
    organization_id in (
      select organization_id 
      from public.organization_members 
      where user_id = (select auth.uid())
    )
  );

create policy "Admins can configure provider connections"
  on public.provider_connections for all
  using (
    organization_id in (
      select organization_id 
      from public.organization_members 
      where user_id = (select auth.uid()) and role in ('owner', 'admin')
    )
  );

-- ------------------------------------------------------------------------------
-- Gateway Logs Policies (InitPlan Optimized for High-Frequency Querying)
-- ------------------------------------------------------------------------------
create policy "Users can view gateway logs for their organization"
  on public.gateway_logs for select
  using (
    organization_id in (
      select organization_id 
      from public.organization_members 
      where user_id = (select auth.uid())
    )
  );

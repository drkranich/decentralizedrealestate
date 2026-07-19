-- Seravie Heritage Service Marketplace
-- Real marketplace for service providers, owners and tenants:
-- provider onboarding, paid/commission plans, listings, service requests,
-- quotes and commission ledger with RLS for every public table.

create extension if not exists pgcrypto;

create schema if not exists private;
revoke all on schema private from public;

create or replace function private.current_user_role()
returns text
language sql
security definer
set search_path = public
stable
as $$
  select coalesce((select role::text from public.users where id = (select auth.uid()) limit 1), '');
$$;

create or replace function private.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$ select private.current_user_role() = 'admin'; $$;

create or replace function private.is_service_provider()
returns boolean
language sql
security definer
set search_path = public
stable
as $$ select private.current_user_role() = 'service_provider'; $$;

grant usage on schema private to authenticated;
grant execute on function private.current_user_role() to authenticated;
grant execute on function private.is_admin() to authenticated;
grant execute on function private.is_service_provider() to authenticated;

do $$
declare
  constraint_record record;
begin
  for constraint_record in
    select c.conname
    from pg_constraint c
    join pg_class t on t.oid = c.conrelid
    join pg_namespace n on n.oid = t.relnamespace
    where n.nspname = 'public'
      and t.relname = 'users'
      and c.contype = 'c'
      and pg_get_constraintdef(c.oid) ilike '%role%'
  loop
    execute format('alter table public.users drop constraint %I', constraint_record.conname);
  end loop;

  alter table public.users
    add constraint users_role_check
    check (role in ('admin', 'owner', 'tenant', 'investor', 'service_provider'));
exception
  when duplicate_object then null;
end $$;

create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists service_marketplace_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  icon_key text not null default 'sparkles',
  sort_order integer not null default 100,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists service_marketplace_plans (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  billing_model text not null default 'commission' check (billing_model in ('commission', 'subscription', 'hybrid')),
  monthly_fee_cents integer not null default 0 check (monthly_fee_cents >= 0),
  commission_rate numeric(6,4) not null default 0 check (commission_rate >= 0 and commission_rate <= 1),
  currency text not null default 'BRL',
  description text,
  features text[] not null default '{}',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists service_provider_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  plan_id uuid references service_marketplace_plans(id),
  business_name text not null,
  legal_name text,
  tax_id text,
  contact_email text,
  phone text,
  website text,
  country text,
  city text,
  service_area text,
  status text not null default 'pending_review' check (status in ('draft', 'pending_review', 'approved', 'blocked', 'archived')),
  verification_notes text,
  subscription_status text not null default 'not_started' check (subscription_status in ('not_started', 'trialing', 'active', 'past_due', 'cancelled')),
  approved_at timestamptz,
  approved_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists service_listings (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references service_provider_profiles(id) on delete cascade,
  category_id uuid references service_marketplace_categories(id),
  title text not null,
  summary text not null,
  description text,
  target_roles text[] not null default array['owner', 'tenant'],
  pricing_model text not null default 'quote' check (pricing_model in ('fixed', 'hourly', 'quote', 'subscription')),
  starting_price numeric(14,2),
  currency text not null default 'BRL',
  coverage_area text,
  response_sla text,
  status text not null default 'pending_review' check (status in ('draft', 'pending_review', 'approved', 'blocked', 'archived')),
  featured boolean not null default false,
  media_urls text[] not null default '{}',
  metadata jsonb not null default '{}'::jsonb,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists service_requests (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references service_listings(id) on delete cascade,
  requester_id uuid not null references auth.users(id) on delete cascade,
  requester_role text not null,
  property_id uuid references properties(id),
  title text not null,
  details text,
  desired_date date,
  budget_amount numeric(14,2),
  currency text not null default 'BRL',
  status text not null default 'requested' check (status in ('requested', 'provider_contacted', 'quoted', 'accepted', 'completed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists service_quotes (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references service_requests(id) on delete cascade,
  provider_id uuid not null references service_provider_profiles(id) on delete cascade,
  amount numeric(14,2) not null default 0,
  currency text not null default 'BRL',
  commission_rate numeric(6,4) not null default 0,
  commission_amount numeric(14,2) generated always as (round((amount * commission_rate), 2)) stored,
  status text not null default 'sent' check (status in ('draft', 'sent', 'accepted', 'declined', 'expired')),
  notes text,
  valid_until date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists service_commission_ledger (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references service_provider_profiles(id) on delete cascade,
  request_id uuid references service_requests(id) on delete set null,
  quote_id uuid references service_quotes(id) on delete set null,
  amount numeric(14,2) not null default 0,
  currency text not null default 'BRL',
  rate numeric(6,4) not null default 0,
  status text not null default 'pending' check (status in ('pending', 'invoiced', 'paid', 'waived')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_service_provider_profiles_user on service_provider_profiles(user_id);
create index if not exists idx_service_listings_provider on service_listings(provider_id, status);
create index if not exists idx_service_listings_category_status on service_listings(category_id, status, published_at desc);
create index if not exists idx_service_requests_requester on service_requests(requester_id, status);
create index if not exists idx_service_requests_listing on service_requests(listing_id, status);
create index if not exists idx_service_quotes_request on service_quotes(request_id, status);
create index if not exists idx_service_commission_provider on service_commission_ledger(provider_id, status);
create unique index if not exists idx_service_commission_quote_unique
  on service_commission_ledger(quote_id)
  where quote_id is not null;

create or replace function private.lock_service_provider_profile_admin_fields()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if (select private.is_admin()) then
    if new.status = 'approved' and old.status is distinct from 'approved' then
      new.approved_at = coalesce(new.approved_at, now());
      new.approved_by = coalesce(new.approved_by, (select auth.uid()));
    end if;
    return new;
  end if;

  new.status = old.status;
  new.verification_notes = old.verification_notes;
  new.subscription_status = old.subscription_status;
  new.approved_at = old.approved_at;
  new.approved_by = old.approved_by;
  return new;
end;
$$;

create or replace function private.guard_service_listing_status()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if (select private.is_admin()) then
    if new.status = 'approved' and (tg_op = 'INSERT' or old.status is distinct from 'approved') then
      new.published_at = coalesce(new.published_at, now());
    end if;
    return new;
  end if;

  if tg_op = 'INSERT' then
    if new.status not in ('draft', 'pending_review') then
      new.status = 'pending_review';
    end if;
  else
    if new.status in ('approved', 'blocked') and new.status is distinct from old.status then
      new.status = old.status;
    end if;
  end if;

  return new;
end;
$$;

create or replace function private.create_service_commission_from_quote()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.status = 'accepted' and (tg_op = 'INSERT' or old.status is distinct from 'accepted') then
    insert into service_commission_ledger (
      provider_id,
      request_id,
      quote_id,
      amount,
      currency,
      rate,
      status,
      notes
    )
    values (
      new.provider_id,
      new.request_id,
      new.id,
      new.commission_amount,
      new.currency,
      new.commission_rate,
      'pending',
      'Comissão gerada automaticamente a partir de proposta aceita.'
    )
    on conflict do nothing;
  end if;

  return new;
end;
$$;

drop trigger if exists lock_service_provider_profile_admin_fields on service_provider_profiles;
create trigger lock_service_provider_profile_admin_fields
before update on service_provider_profiles
for each row execute function private.lock_service_provider_profile_admin_fields();

drop trigger if exists guard_service_listing_status on service_listings;
create trigger guard_service_listing_status
before insert or update on service_listings
for each row execute function private.guard_service_listing_status();

drop trigger if exists create_service_commission_from_quote on service_quotes;
create trigger create_service_commission_from_quote
after insert or update on service_quotes
for each row execute function private.create_service_commission_from_quote();

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'service_marketplace_categories',
    'service_marketplace_plans',
    'service_provider_profiles',
    'service_listings',
    'service_requests',
    'service_quotes',
    'service_commission_ledger'
  ]
  loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('grant select, insert, update, delete on table public.%I to authenticated', table_name);
    execute format('drop policy if exists %I on public.%I', table_name || ' admin all', table_name);
    execute format(
      'create policy %I on public.%I for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()))',
      table_name || ' admin all',
      table_name
    );
  end loop;
end $$;

grant select on table service_marketplace_categories to anon;
grant select on table service_marketplace_plans to anon;
grant select on table service_listings to anon;
grant select on table service_provider_profiles to anon;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'service_marketplace_categories',
    'service_marketplace_plans',
    'service_provider_profiles',
    'service_listings',
    'service_requests',
    'service_quotes',
    'service_commission_ledger'
  ]
  loop
    execute format('drop trigger if exists set_updated_at on public.%I', table_name);
    execute format('create trigger set_updated_at before update on public.%I for each row execute function private.set_updated_at()', table_name);
  end loop;
end $$;

drop policy if exists "active categories visible" on service_marketplace_categories;
create policy "active categories visible"
on service_marketplace_categories
for select
to anon, authenticated
using (active = true);

drop policy if exists "active service plans visible" on service_marketplace_plans;
create policy "active service plans visible"
on service_marketplace_plans
for select
to anon, authenticated
using (active = true);

drop policy if exists "approved provider profiles visible" on service_provider_profiles;
create policy "approved provider profiles visible"
on service_provider_profiles
for select
to anon, authenticated
using (status = 'approved');

drop policy if exists "providers view own profile" on service_provider_profiles;
create policy "providers view own profile"
on service_provider_profiles
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "providers create own profile" on service_provider_profiles;
create policy "providers create own profile"
on service_provider_profiles
for insert
to authenticated
with check ((select auth.uid()) = user_id and status in ('draft', 'pending_review'));

drop policy if exists "providers update own profile" on service_provider_profiles;
create policy "providers update own profile"
on service_provider_profiles
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "approved service listings visible" on service_listings;
create policy "approved service listings visible"
on service_listings
for select
to anon, authenticated
using (status = 'approved' and published_at is not null);

drop policy if exists "providers manage own listings" on service_listings;
create policy "providers manage own listings"
on service_listings
for all
to authenticated
using (
  exists (
    select 1 from service_provider_profiles p
    where p.id = service_listings.provider_id
      and p.user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1 from service_provider_profiles p
    where p.id = service_listings.provider_id
      and p.user_id = (select auth.uid())
  )
);

drop policy if exists "requesters create service requests" on service_requests;
create policy "requesters create service requests"
on service_requests
for insert
to authenticated
with check (
  (select auth.uid()) = requester_id
  and requester_role in ('owner', 'tenant')
  and listing_id in (
    select id from service_listings
    where status = 'approved' and published_at is not null
  )
);

drop policy if exists "requesters view own service requests" on service_requests;
create policy "requesters view own service requests"
on service_requests
for select
to authenticated
using ((select auth.uid()) = requester_id);

drop policy if exists "requesters update own service requests" on service_requests;
create policy "requesters update own service requests"
on service_requests
for update
to authenticated
using ((select auth.uid()) = requester_id)
with check ((select auth.uid()) = requester_id and status in ('requested', 'accepted', 'cancelled'));

drop policy if exists "providers view listing requests" on service_requests;
create policy "providers view listing requests"
on service_requests
for select
to authenticated
using (
  exists (
    select 1
    from service_listings l
    join service_provider_profiles p on p.id = l.provider_id
    where l.id = service_requests.listing_id
      and p.user_id = (select auth.uid())
  )
);

drop policy if exists "providers update listing requests" on service_requests;
create policy "providers update listing requests"
on service_requests
for update
to authenticated
using (
  exists (
    select 1
    from service_listings l
    join service_provider_profiles p on p.id = l.provider_id
    where l.id = service_requests.listing_id
      and p.user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from service_listings l
    join service_provider_profiles p on p.id = l.provider_id
    where l.id = service_requests.listing_id
      and p.user_id = (select auth.uid())
  )
);

drop policy if exists "providers manage own quotes" on service_quotes;
create policy "providers manage own quotes"
on service_quotes
for all
to authenticated
using (
  exists (
    select 1 from service_provider_profiles p
    where p.id = service_quotes.provider_id
      and p.user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1 from service_provider_profiles p
    where p.id = service_quotes.provider_id
      and p.user_id = (select auth.uid())
  )
);

drop policy if exists "requesters view own quotes" on service_quotes;
create policy "requesters view own quotes"
on service_quotes
for select
to authenticated
using (
  exists (
    select 1 from service_requests r
    where r.id = service_quotes.request_id
      and r.requester_id = (select auth.uid())
  )
);

drop policy if exists "requesters update own quotes" on service_quotes;
create policy "requesters update own quotes"
on service_quotes
for update
to authenticated
using (
  exists (
    select 1 from service_requests r
    where r.id = service_quotes.request_id
      and r.requester_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1 from service_requests r
    where r.id = service_quotes.request_id
      and r.requester_id = (select auth.uid())
  )
  and status in ('accepted', 'declined')
);

drop policy if exists "providers view own commission ledger" on service_commission_ledger;
create policy "providers view own commission ledger"
on service_commission_ledger
for select
to authenticated
using (
  exists (
    select 1 from service_provider_profiles p
    where p.id = service_commission_ledger.provider_id
      and p.user_id = (select auth.uid())
  )
);

insert into service_marketplace_categories (slug, name, description, icon_key, sort_order)
values
  ('cleaning', 'Limpeza e conservação', 'Faxina, limpeza pós-obra, higienização e rotinas recorrentes.', 'brush', 10),
  ('repairs', 'Reparos e manutenção', 'Elétrica, hidráulica, ar-condicionado, pintura e pequenos consertos.', 'hammer', 20),
  ('moving', 'Mudança e logística', 'Transporte, embalagem, guarda-móveis e montagem.', 'truck', 30),
  ('furnishing', 'Móveis e interiores', 'Mobiliário, enxoval, decoração, fotografia e preparação para locação.', 'sofa', 40),
  ('security', 'Segurança e seguros', 'Seguro residencial, vistoria, fechaduras, portaria e monitoramento.', 'shield-check', 50),
  ('smart-home', 'Smart home', 'Automação, sensores, fechaduras digitais, redes e energia.', 'cpu', 60),
  ('legal-docs', 'Documentos e vistoria', 'Laudos, inventário, documentação, contratos e apoio regulatório.', 'scroll-text', 70),
  ('landscaping', 'Jardim e piscina', 'Paisagismo, piscina, dedetização e áreas externas.', 'leaf', 80)
on conflict (slug) do update
set name = excluded.name,
    description = excluded.description,
    icon_key = excluded.icon_key,
    sort_order = excluded.sort_order,
    active = true,
    updated_at = now();

insert into service_marketplace_plans (slug, name, billing_model, monthly_fee_cents, commission_rate, currency, description, features)
values
  ('commission', 'Comissão', 'commission', 0, 0.1200, 'BRL', 'Sem mensalidade. A plataforma cobra comissão sobre serviços aceitos.', array['Cadastro gratuito', 'Aprovação manual', '12% sobre orçamento aceito']),
  ('pro', 'Pro mensal', 'hybrid', 14900, 0.0600, 'BRL', 'Mensalidade com comissão reduzida para prestadores frequentes.', array['R$149/mês', 'Destaque moderado', '6% sobre orçamento aceito']),
  ('partner', 'Parceiro verificado', 'hybrid', 39900, 0.0300, 'BRL', 'Plano para redes regionais, imobiliárias parceiras e fornecedores certificados.', array['R$399/mês', 'Selo verificado', '3% sobre orçamento aceito', 'Prioridade editorial'])
on conflict (slug) do update
set name = excluded.name,
    billing_model = excluded.billing_model,
    monthly_fee_cents = excluded.monthly_fee_cents,
    commission_rate = excluded.commission_rate,
    currency = excluded.currency,
    description = excluded.description,
    features = excluded.features,
    active = true,
    updated_at = now();

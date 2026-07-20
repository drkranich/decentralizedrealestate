create extension if not exists pgcrypto;

-- Base operational tables may already exist remotely. Keep this migration
-- idempotent and make sure every browser-facing table has RLS + Data API grants.
create table if not exists public.notification_rules (
  id uuid primary key default gen_random_uuid(),
  name text,
  trigger_event text,
  channel text not null default 'in_app',
  enabled boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.notification_rules
  add column if not exists name text,
  add column if not exists trigger_event text,
  add column if not exists channel text not null default 'in_app',
  add column if not exists enabled boolean not null default true,
  add column if not exists created_by uuid references auth.users(id) on delete set null,
  add column if not exists created_at timestamptz not null default now();

create table if not exists public.workflows (
  id uuid primary key default gen_random_uuid(),
  name text,
  trigger_event text,
  action text,
  enabled boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.workflows
  add column if not exists name text,
  add column if not exists trigger_event text,
  add column if not exists action text,
  add column if not exists enabled boolean not null default true,
  add column if not exists created_by uuid references auth.users(id) on delete set null,
  add column if not exists created_at timestamptz not null default now();

create table if not exists public.webhooks (
  id uuid primary key default gen_random_uuid(),
  name text,
  url text,
  event text,
  enabled boolean not null default true,
  last_triggered_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.webhooks
  add column if not exists name text,
  add column if not exists url text,
  add column if not exists event text,
  add column if not exists enabled boolean not null default true,
  add column if not exists last_triggered_at timestamptz,
  add column if not exists created_by uuid references auth.users(id) on delete set null,
  add column if not exists created_at timestamptz not null default now();

create table if not exists public.user_notification_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  notification_key text not null,
  label text not null,
  channel text not null default 'in_app',
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, notification_key, channel),
  check (channel in ('in_app', 'email'))
);

create table if not exists public.user_session_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null,
  user_agent text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.platform_api_keys (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  key_prefix text not null,
  key_hash text not null unique,
  scopes text[] not null default array['read'],
  created_by uuid references auth.users(id) on delete set null,
  last_used_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.workflow_runs (
  id uuid primary key default gen_random_uuid(),
  workflow_id uuid references public.workflows(id) on delete set null,
  trigger_event text not null,
  action text not null,
  status text not null default 'success' check (status in ('queued', 'running', 'success', 'failed')),
  result text,
  executed_by uuid references auth.users(id) on delete set null,
  started_at timestamptz not null default now(),
  finished_at timestamptz
);

create table if not exists public.webhook_delivery_attempts (
  id uuid primary key default gen_random_uuid(),
  webhook_id uuid references public.webhooks(id) on delete cascade,
  event text not null,
  status text not null default 'queued' check (status in ('queued', 'skipped_external', 'sent', 'failed')),
  payload jsonb not null default '{}'::jsonb,
  error text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_user_notification_preferences_user
on public.user_notification_preferences (user_id, channel, notification_key);

create index if not exists idx_user_session_events_user
on public.user_session_events (user_id, created_at desc);

create index if not exists idx_platform_api_keys_owner
on public.platform_api_keys (owner_id, revoked_at, created_at desc);

create index if not exists idx_workflow_runs_workflow
on public.workflow_runs (workflow_id, started_at desc);

create index if not exists idx_webhook_delivery_attempts_webhook
on public.webhook_delivery_attempts (webhook_id, created_at desc);

alter table public.notification_rules enable row level security;
alter table public.workflows enable row level security;
alter table public.webhooks enable row level security;
alter table public.user_notification_preferences enable row level security;
alter table public.user_session_events enable row level security;
alter table public.platform_api_keys enable row level security;
alter table public.workflow_runs enable row level security;
alter table public.webhook_delivery_attempts enable row level security;

grant select, insert, update, delete on public.notification_rules to authenticated;
grant select, insert, update, delete on public.workflows to authenticated;
grant select, insert, update, delete on public.webhooks to authenticated;
grant select, insert, update, delete on public.user_notification_preferences to authenticated;
grant select, insert, update, delete on public.user_session_events to authenticated;
grant select, insert, update, delete on public.platform_api_keys to authenticated;
grant select, insert, update, delete on public.workflow_runs to authenticated;
grant select, insert, update, delete on public.webhook_delivery_attempts to authenticated;

drop policy if exists "notification_rules admin all" on public.notification_rules;
create policy "notification_rules admin all"
on public.notification_rules
for all
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

drop policy if exists "workflows admin all" on public.workflows;
create policy "workflows admin all"
on public.workflows
for all
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

drop policy if exists "webhooks admin all" on public.webhooks;
create policy "webhooks admin all"
on public.webhooks
for all
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

drop policy if exists "notification_preferences admin all" on public.user_notification_preferences;
create policy "notification_preferences admin all"
on public.user_notification_preferences
for all
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

drop policy if exists "users manage own notification preferences" on public.user_notification_preferences;
create policy "users manage own notification preferences"
on public.user_notification_preferences
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "session_events admin all" on public.user_session_events;
create policy "session_events admin all"
on public.user_session_events
for all
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

drop policy if exists "users view own session events" on public.user_session_events;
create policy "users view own session events"
on public.user_session_events
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "users append own session events" on public.user_session_events;
create policy "users append own session events"
on public.user_session_events
for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "api_keys admin all" on public.platform_api_keys;
create policy "api_keys admin all"
on public.platform_api_keys
for all
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

drop policy if exists "users manage own api keys" on public.platform_api_keys;
create policy "users manage own api keys"
on public.platform_api_keys
for all
to authenticated
using ((select auth.uid()) = owner_id)
with check (
  (select auth.uid()) = owner_id
  and (created_by is null or created_by = (select auth.uid()))
);

drop policy if exists "workflow_runs admin all" on public.workflow_runs;
create policy "workflow_runs admin all"
on public.workflow_runs
for all
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

drop policy if exists "workflow_runs executor insert" on public.workflow_runs;
create policy "workflow_runs executor insert"
on public.workflow_runs
for insert
to authenticated
with check ((select auth.uid()) = executed_by);

drop policy if exists "webhook_delivery_attempts admin all" on public.webhook_delivery_attempts;
create policy "webhook_delivery_attempts admin all"
on public.webhook_delivery_attempts
for all
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

drop policy if exists "webhook_delivery_attempts creator insert" on public.webhook_delivery_attempts;
create policy "webhook_delivery_attempts creator insert"
on public.webhook_delivery_attempts
for insert
to authenticated
with check ((select auth.uid()) = created_by);

insert into public.user_notification_preferences (user_id, notification_key, label, channel, enabled)
select u.id, seed.notification_key, seed.label, 'in_app', seed.enabled
from public.users u
cross join (
  values
    ('new_leads', 'Novos leads', true),
    ('contracts', 'Contratos e documentos', true),
    ('maintenance', 'Chamados de manutenção', true),
    ('legaltech', 'Alertas LegalTech', true),
    ('weekly_reports', 'Resumo semanal interno', true)
) as seed(notification_key, label, enabled)
where u.role = 'admin'
  and exists (
    select 1
    from auth.users au
    where au.id = u.id
  )
on conflict (user_id, notification_key, channel) do nothing;

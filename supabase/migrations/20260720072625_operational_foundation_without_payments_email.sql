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
as $$
  select private.current_user_role() = 'admin';
$$;

grant usage on schema private to authenticated;
grant execute on function private.current_user_role() to authenticated;
grant execute on function private.is_admin() to authenticated;

alter table public.maintenance_requests
  add column if not exists title text,
  add column if not exists priority text not null default 'medium',
  add column if not exists assigned_provider_id uuid references public.service_provider_profiles(id) on delete set null,
  add column if not exists due_at timestamptz,
  add column if not exists resolved_at timestamptz,
  add column if not exists resolution_notes text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'maintenance_requests_priority_check'
      and conrelid = 'public.maintenance_requests'::regclass
  ) then
    alter table public.maintenance_requests
      add constraint maintenance_requests_priority_check
      check (priority in ('low', 'medium', 'high', 'urgent'));
  end if;
end $$;

create table if not exists public.platform_notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid references auth.users(id) on delete cascade,
  title text not null,
  body text,
  category text not null default 'system',
  subject_type text,
  subject_id uuid,
  status text not null default 'unread' check (status in ('unread', 'read', 'archived')),
  created_by uuid references auth.users(id),
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_platform_notifications_recipient
on public.platform_notifications (recipient_id, status, created_at desc);

create index if not exists idx_maintenance_requests_status_due
on public.maintenance_requests (status, due_at, created_at desc);

alter table public.platform_notifications enable row level security;
grant select, insert, update, delete on public.platform_notifications to authenticated;

drop policy if exists "platform_notifications admin all" on public.platform_notifications;
create policy "platform_notifications admin all"
on public.platform_notifications
for all
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

drop policy if exists "users view own notifications" on public.platform_notifications;
create policy "users view own notifications"
on public.platform_notifications
for select
to authenticated
using ((select auth.uid()) = recipient_id);

drop policy if exists "users update own notifications" on public.platform_notifications;
create policy "users update own notifications"
on public.platform_notifications
for update
to authenticated
using ((select auth.uid()) = recipient_id)
with check ((select auth.uid()) = recipient_id and status in ('unread', 'read', 'archived'));

-- Harden operational configuration tables. Payments/Stripe and email delivery are intentionally out of scope here.
drop policy if exists "notification_rules_admin_all" on public.notification_rules;
drop policy if exists "notification_rules admin all" on public.notification_rules;
create policy "notification_rules admin all"
on public.notification_rules
for all
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

drop policy if exists "workflows_admin_all" on public.workflows;
drop policy if exists "workflows admin all" on public.workflows;
create policy "workflows admin all"
on public.workflows
for all
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

drop policy if exists "webhooks_admin_all" on public.webhooks;
drop policy if exists "webhooks admin all" on public.webhooks;
create policy "webhooks admin all"
on public.webhooks
for all
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

drop policy if exists "site_content_admin_write" on public.site_content;
drop policy if exists "site_content admin write" on public.site_content;
create policy "site_content admin write"
on public.site_content
for all
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

drop policy if exists "app_settings_admin_write" on public.app_settings;
drop policy if exists "app_settings admin write" on public.app_settings;
create policy "app_settings admin write"
on public.app_settings
for all
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

-- Tighten participant tables without relying on broad public policies.
drop policy if exists "maintenance_admin_all" on public.maintenance_requests;
drop policy if exists "maintenance admin all" on public.maintenance_requests;
create policy "maintenance admin all"
on public.maintenance_requests
for all
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

drop policy if exists "maintenance_insert_participant" on public.maintenance_requests;
drop policy if exists "maintenance participant insert" on public.maintenance_requests;
create policy "maintenance participant insert"
on public.maintenance_requests
for insert
to authenticated
with check (
  (select auth.uid()) = requested_by
  and (
    exists (
      select 1 from public.properties p
      where p.id = maintenance_requests.property_id
        and p.owner_id = (select auth.uid())
    )
    or exists (
      select 1 from public.contracts c
      where c.property_id = maintenance_requests.property_id
        and c.user_id = (select auth.uid())
        and coalesce(c.status, 'pending') in ('pending', 'active', 'signed')
    )
  )
);

drop policy if exists "maintenance_select_participant" on public.maintenance_requests;
drop policy if exists "maintenance participant select" on public.maintenance_requests;
create policy "maintenance participant select"
on public.maintenance_requests
for select
to authenticated
using (
  (select auth.uid()) = requested_by
  or exists (
    select 1 from public.properties p
    where p.id = maintenance_requests.property_id
      and p.owner_id = (select auth.uid())
  )
);

drop policy if exists "maintenance_update_participant" on public.maintenance_requests;
drop policy if exists "maintenance participant update" on public.maintenance_requests;
create policy "maintenance participant update"
on public.maintenance_requests
for update
to authenticated
using (
  (select auth.uid()) = requested_by
  or exists (
    select 1 from public.properties p
    where p.id = maintenance_requests.property_id
      and p.owner_id = (select auth.uid())
  )
)
with check (
  (select auth.uid()) = requested_by
  or exists (
    select 1 from public.properties p
    where p.id = maintenance_requests.property_id
      and p.owner_id = (select auth.uid())
  )
);

drop policy if exists "messages_admin_all" on public.messages;
drop policy if exists "messages admin all" on public.messages;
create policy "messages admin all"
on public.messages
for all
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

drop policy if exists "messages_select_participant" on public.messages;
drop policy if exists "messages participant select" on public.messages;
create policy "messages participant select"
on public.messages
for select
to authenticated
using (
  exists (
    select 1
    from public.contracts c
    left join public.properties p on p.id = c.property_id
    where c.id = messages.contract_id
      and (c.user_id = (select auth.uid()) or p.owner_id = (select auth.uid()))
  )
);

drop policy if exists "messages_insert_participant" on public.messages;
drop policy if exists "messages participant insert" on public.messages;
create policy "messages participant insert"
on public.messages
for insert
to authenticated
with check (
  (select auth.uid()) = sender_id
  and exists (
    select 1
    from public.contracts c
    left join public.properties p on p.id = c.property_id
    where c.id = messages.contract_id
      and (c.user_id = (select auth.uid()) or p.owner_id = (select auth.uid()))
  )
);

insert into public.notification_rules (name, trigger_event, channel, enabled)
values
  ('Novo lead recebido', 'lead.created', 'in_app', true),
  ('Chamado de manutenção aberto', 'maintenance.opened', 'in_app', true),
  ('Gate LegalTech crítico', 'legaltech.gate.critical', 'in_app', true),
  ('Orçamento de serviço recebido', 'service.quote.received', 'in_app', true)
on conflict do nothing;

insert into public.workflows (name, trigger_event, action, enabled)
values
  ('Triar novo lead imobiliário', 'lead.created', 'Criar tarefa de follow-up e avisar operação no app', true),
  ('Abrir gate LegalTech para oferta', 'investment_opportunity.created', 'Criar checklist de compliance antes de publicar', true),
  ('Encaminhar manutenção urgente', 'maintenance.opened.urgent', 'Priorizar chamado e vincular prestador aprovado', true),
  ('Registrar aceite de orçamento', 'service.quote.accepted', 'Criar lançamento de comissão pendente sem cobrança automática', true)
on conflict do nothing;

insert into public.service_marketplace_categories (slug, name, description, icon_key, sort_order)
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

insert into public.service_marketplace_plans (slug, name, billing_model, monthly_fee_cents, commission_rate, currency, description, features)
values
  ('commission', 'Comissão', 'commission', 0, 0.1200, 'BRL', 'Sem mensalidade. A plataforma cobra comissão sobre serviços aceitos quando a cobrança estiver ativada.', array['Cadastro gratuito', 'Aprovação manual', '12% sobre orçamento aceito']),
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

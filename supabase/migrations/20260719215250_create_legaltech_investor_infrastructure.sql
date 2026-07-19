-- Seravie Heritage LegalTech + Investor Infrastructure
-- Creates the operational database surface requested from the LegalTech PDF:
-- jurisdiction rule packs, token classification, compliance decisions, CLM,
-- Legal Vault, KYC/KYB/AML, escrow/reconciliation, audit evidence and the
-- investor portal data model.

create extension if not exists pgcrypto;

create schema if not exists private;
revoke all on schema private from public;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'legaltech_review_status') then
    create type legaltech_review_status as enum (
      'draft',
      'pending_review',
      'legal_review',
      'approved',
      'approved_with_conditions',
      'blocked',
      'expired',
      'archived',
      'deleted',
      'legal_hold'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'legaltech_decision_result') then
    create type legaltech_decision_result as enum (
      'approved',
      'approved_with_conditions',
      'legal_review_required',
      'compliance_review_required',
      'additional_documentation_required',
      'enhanced_due_diligence',
      'senior_approval_required',
      'licensed_partner_required',
      'jurisdiction_unavailable',
      'blocked',
      'continuous_monitoring'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'legaltech_document_kind') then
    create type legaltech_document_kind as enum (
      'property_document',
      'identity_document',
      'kyb_document',
      'contract_draft',
      'contract_signed',
      'legal_opinion',
      'token_classification',
      'payment_evidence',
      'escrow_evidence',
      'audit_export',
      'regulatory_report',
      'investor_statement'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'investor_order_status') then
    create type investor_order_status as enum (
      'draft',
      'pending_compliance',
      'pending_payment',
      'funded',
      'settled',
      'cancelled',
      'blocked',
      'refunded'
    );
  end if;
end $$;

create or replace function private.current_user_role()
returns text
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(
    (select role::text from public.users where id = (select auth.uid()) limit 1),
    ''
  );
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

create or replace function private.is_investor()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select private.current_user_role() = 'investor';
$$;

grant usage on schema private to authenticated;
grant execute on function private.current_user_role() to authenticated;
grant execute on function private.is_admin() to authenticated;
grant execute on function private.is_investor() to authenticated;

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

create table if not exists legal_jurisdictions (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  status legaltech_review_status not null default 'draft',
  primary_regulators text[] not null default '{}',
  data_protection_rules text[] not null default '{}',
  blocked_reason text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  approved_at timestamptz,
  approved_by uuid references auth.users(id)
);

create table if not exists legal_jurisdiction_rule_packs (
  id uuid primary key default gen_random_uuid(),
  jurisdiction_id uuid not null references legal_jurisdictions(id) on delete cascade,
  version text not null,
  status legaltech_review_status not null default 'draft',
  effective_from date,
  effective_until date,
  summary text not null,
  source_links text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  approved_at timestamptz,
  approved_by uuid references auth.users(id),
  unique (jurisdiction_id, version)
);

create table if not exists legal_regulatory_requirements (
  id uuid primary key default gen_random_uuid(),
  rule_pack_id uuid not null references legal_jurisdiction_rule_packs(id) on delete cascade,
  requirement_key text not null,
  title text not null,
  description text,
  applies_to text[] not null default '{}',
  severity text not null default 'medium' check (severity in ('low', 'medium', 'high', 'critical')),
  decision_on_failure legaltech_decision_result not null default 'compliance_review_required',
  evidence_required text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (rule_pack_id, requirement_key)
);

create table if not exists vault_documents (
  id uuid primary key default gen_random_uuid(),
  document_kind legaltech_document_kind not null,
  subject_type text not null,
  subject_id uuid,
  title text not null default 'Documento',
  storage_bucket text not null default 'legal-vault',
  storage_path text not null,
  mime_type text,
  file_size bigint,
  hash_sha256 text,
  version text not null default '1',
  status legaltech_review_status not null default 'draft',
  sensitivity text not null default 'restricted' check (sensitivity in ('public', 'internal', 'restricted', 'confidential')),
  retention_until date,
  uploaded_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (storage_bucket, storage_path, version)
);

create table if not exists legal_opinions (
  id uuid primary key default gen_random_uuid(),
  jurisdiction_id uuid references legal_jurisdictions(id),
  rule_pack_id uuid references legal_jurisdiction_rule_packs(id),
  subject text not null,
  status legaltech_review_status not null default 'draft',
  external_counsel text,
  document_id uuid references vault_documents(id),
  summary text,
  valid_from date,
  valid_until date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  approved_at timestamptz,
  approved_by uuid references auth.users(id)
);

create table if not exists legal_token_projects (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references properties(id),
  jurisdiction_id uuid not null references legal_jurisdictions(id),
  code text not null unique,
  title text not null,
  status legaltech_review_status not null default 'draft',
  issuer_entity text,
  asset_vehicle text,
  planned_investor_profile text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists legal_token_classifications (
  id uuid primary key default gen_random_uuid(),
  token_project_id uuid not null references legal_token_projects(id) on delete cascade,
  rule_pack_id uuid not null references legal_jurisdiction_rule_packs(id),
  status legaltech_review_status not null default 'draft',
  token_is_property_title boolean not null default false,
  economic_rights text[] not null default '{}',
  governance_rights text[] not null default '{}',
  transfer_restrictions text[] not null default '{}',
  offering_restrictions text[] not null default '{}',
  suitability_required boolean not null default true,
  legal_opinion_id uuid references legal_opinions(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  approved_at timestamptz,
  approved_by uuid references auth.users(id)
);

create table if not exists compliance_decisions (
  id uuid primary key default gen_random_uuid(),
  rule_pack_id uuid references legal_jurisdiction_rule_packs(id),
  requirement_id uuid references legal_regulatory_requirements(id),
  subject_type text not null,
  subject_id uuid,
  result legaltech_decision_result not null,
  severity text not null default 'medium' check (severity in ('low', 'medium', 'high', 'critical')),
  rationale text not null,
  conditions text[] not null default '{}',
  reviewed_by uuid references auth.users(id),
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  expires_at timestamptz
);

create table if not exists compliance_evidence (
  id uuid primary key default gen_random_uuid(),
  decision_id uuid not null references compliance_decisions(id) on delete cascade,
  document_id uuid references vault_documents(id),
  evidence_type text not null,
  hash_sha256 text,
  notes text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists compliance_gates (
  id uuid primary key default gen_random_uuid(),
  gate_key text not null,
  title text not null,
  subject_type text not null,
  subject_id uuid,
  status legaltech_review_status not null default 'draft',
  result legaltech_decision_result,
  current_step text,
  required_evidence jsonb not null default '[]'::jsonb,
  assigned_to uuid references auth.users(id),
  due_at timestamptz,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists contract_templates (
  id uuid primary key default gen_random_uuid(),
  jurisdiction_id uuid references legal_jurisdictions(id),
  template_key text not null,
  title text not null,
  status legaltech_review_status not null default 'draft',
  version text not null,
  body_markdown text not null,
  approved_at timestamptz,
  approved_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (template_key, version)
);

create table if not exists contract_clauses (
  id uuid primary key default gen_random_uuid(),
  template_id uuid references contract_templates(id) on delete cascade,
  clause_key text not null,
  title text not null,
  status legaltech_review_status not null default 'draft',
  version text not null,
  body_markdown text not null,
  risk_level text not null default 'medium' check (risk_level in ('low', 'medium', 'high', 'critical')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists contract_versions (
  id uuid primary key default gen_random_uuid(),
  contract_id uuid references contracts(id),
  template_id uuid references contract_templates(id),
  status legaltech_review_status not null default 'draft',
  version text not null,
  document_id uuid references vault_documents(id),
  generated_by text not null default 'system',
  legal_approval_decision_id uuid references compliance_decisions(id),
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists signature_requests (
  id uuid primary key default gen_random_uuid(),
  contract_version_id uuid not null references contract_versions(id) on delete cascade,
  provider text not null,
  provider_request_id text,
  status legaltech_review_status not null default 'pending_review',
  sent_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists signature_evidence (
  id uuid primary key default gen_random_uuid(),
  signature_request_id uuid not null references signature_requests(id) on delete cascade,
  signer_user_id uuid references auth.users(id),
  signer_name text,
  signer_email text,
  evidence_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists legal_holds (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references vault_documents(id) on delete cascade,
  reason text not null,
  status legaltech_review_status not null default 'legal_hold',
  opened_by uuid references auth.users(id),
  opened_at timestamptz not null default now(),
  closed_by uuid references auth.users(id),
  closed_at timestamptz
);

create table if not exists kyc_cases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  status legaltech_review_status not null default 'draft',
  risk_level text not null default 'medium' check (risk_level in ('low', 'medium', 'high', 'critical')),
  residence_country text,
  tax_residence_country text,
  source_of_funds_summary text,
  provider text,
  provider_case_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  approved_at timestamptz,
  approved_by uuid references auth.users(id)
);

create table if not exists kyb_cases (
  id uuid primary key default gen_random_uuid(),
  organization_name text not null,
  user_id uuid references auth.users(id),
  status legaltech_review_status not null default 'draft',
  beneficial_owners jsonb not null default '[]'::jsonb,
  representation_documents jsonb not null default '[]'::jsonb,
  provider text,
  provider_case_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  approved_at timestamptz,
  approved_by uuid references auth.users(id)
);

create table if not exists aml_alerts (
  id uuid primary key default gen_random_uuid(),
  subject_type text not null,
  subject_id uuid,
  user_id uuid references auth.users(id),
  alert_type text not null,
  severity text not null default 'medium' check (severity in ('low', 'medium', 'high', 'critical')),
  status legaltech_review_status not null default 'pending_review',
  provider text,
  provider_alert_id text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  resolved_at timestamptz,
  resolved_by uuid references auth.users(id)
);

create table if not exists sanctions_checks (
  id uuid primary key default gen_random_uuid(),
  subject_type text not null,
  subject_id uuid,
  user_id uuid references auth.users(id),
  provider text not null,
  provider_check_id text,
  match_found boolean not null default false,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists escrow_flows (
  id uuid primary key default gen_random_uuid(),
  subject_type text not null,
  subject_id uuid,
  jurisdiction_id uuid references legal_jurisdictions(id),
  provider text,
  provider_flow_id text,
  status legaltech_review_status not null default 'draft',
  amount numeric(14,2),
  currency text not null default 'USD',
  release_conditions jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists regulatory_reports (
  id uuid primary key default gen_random_uuid(),
  jurisdiction_id uuid references legal_jurisdictions(id),
  report_type text not null,
  status legaltech_review_status not null default 'draft',
  period_start date,
  period_end date,
  document_id uuid references vault_documents(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  submitted_at timestamptz,
  submitted_by uuid references auth.users(id)
);

create table if not exists audit_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  subject_type text not null,
  subject_id uuid,
  actor_id uuid references auth.users(id),
  actor_role text,
  decision_id uuid references compliance_decisions(id),
  document_id uuid references vault_documents(id),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists legaltech_module_records (
  id uuid primary key default gen_random_uuid(),
  module_key text not null,
  ref text not null,
  title text not null,
  owner_label text not null default 'Operação',
  status legaltech_review_status not null default 'draft',
  risk_level text not null default 'medium' check (risk_level in ('low', 'medium', 'high', 'critical')),
  due_date date,
  summary text,
  metadata jsonb not null default '{}'::jsonb,
  archived_at timestamptz,
  deleted_at timestamptz,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (module_key, ref)
);

create table if not exists legaltech_work_items (
  id uuid primary key default gen_random_uuid(),
  module_key text not null,
  record_id uuid references legaltech_module_records(id) on delete set null,
  title text not null,
  status legaltech_review_status not null default 'pending_review',
  risk_level text not null default 'medium' check (risk_level in ('low', 'medium', 'high', 'critical')),
  assigned_to uuid references auth.users(id),
  due_at timestamptz,
  notes text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists investor_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  onboarding_status legaltech_review_status not null default 'draft',
  kyc_status legaltech_review_status not null default 'draft',
  suitability_status legaltech_review_status not null default 'draft',
  wallet_status legaltech_review_status not null default 'draft',
  risk_profile text not null default 'balanced' check (risk_profile in ('conservative', 'balanced', 'growth', 'professional')),
  residence_country text,
  tax_residence_country text,
  source_of_funds_status legaltech_review_status not null default 'draft',
  pep_status text not null default 'not_checked',
  sanctions_status text not null default 'not_checked',
  investment_limit numeric(14,2),
  preferred_currency text not null default 'USD',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists investor_wallets (
  id uuid primary key default gen_random_uuid(),
  investor_id uuid not null references auth.users(id) on delete cascade,
  label text not null default 'Carteira principal',
  wallet_type text not null default 'custodial' check (wallet_type in ('custodial', 'self_custody', 'bank_account', 'escrow')),
  network text,
  address text,
  provider text,
  status legaltech_review_status not null default 'draft',
  last_screened_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists investment_opportunities (
  id uuid primary key default gen_random_uuid(),
  token_project_id uuid references legal_token_projects(id),
  property_id uuid references properties(id),
  title text not null,
  location text,
  token_symbol text not null unique,
  status legaltech_review_status not null default 'draft',
  summary text,
  target_amount numeric(14,2) not null default 0,
  raised_amount numeric(14,2) not null default 0,
  min_ticket numeric(14,2) not null default 0,
  currency text not null default 'USD',
  expected_yield_percent numeric(6,2),
  risk_level text not null default 'medium' check (risk_level in ('low', 'medium', 'high', 'critical')),
  available_to_retail boolean not null default false,
  closing_date date,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists investor_orders (
  id uuid primary key default gen_random_uuid(),
  investor_id uuid not null references auth.users(id) on delete cascade,
  opportunity_id uuid not null references investment_opportunities(id) on delete cascade,
  status investor_order_status not null default 'draft',
  units numeric(18,6) not null default 0,
  unit_price numeric(14,4) not null default 0,
  amount numeric(14,2) not null default 0,
  currency text not null default 'USD',
  compliance_decision_id uuid references compliance_decisions(id),
  escrow_flow_id uuid references escrow_flows(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists investor_positions (
  id uuid primary key default gen_random_uuid(),
  investor_id uuid not null references auth.users(id) on delete cascade,
  opportunity_id uuid references investment_opportunities(id),
  property_id uuid references properties(id),
  token_code text not null,
  units numeric(18,6) not null default 0,
  unit_price numeric(14,4) not null default 0,
  fraction_percent numeric(8,4) not null default 0,
  principal_amount numeric(14,2) not null default 0,
  currency text not null default 'USD',
  status legaltech_review_status not null default 'approved',
  acquired_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists investor_earnings (
  id uuid primary key default gen_random_uuid(),
  investor_id uuid not null references auth.users(id) on delete cascade,
  position_id uuid references investor_positions(id) on delete set null,
  opportunity_id uuid references investment_opportunities(id),
  period_start date,
  period_end date,
  gross_amount numeric(14,2) not null default 0,
  net_amount numeric(14,2) not null default 0,
  currency text not null default 'USD',
  status legaltech_review_status not null default 'pending_review',
  payable_at date,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists investor_documents (
  id uuid primary key default gen_random_uuid(),
  investor_id uuid not null references auth.users(id) on delete cascade,
  vault_document_id uuid references vault_documents(id),
  opportunity_id uuid references investment_opportunities(id),
  title text not null,
  document_type text not null,
  status legaltech_review_status not null default 'draft',
  visible_to_investor boolean not null default true,
  issued_at date,
  expires_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_rule_packs_jurisdiction on legal_jurisdiction_rule_packs(jurisdiction_id);
create index if not exists idx_requirements_rule_pack on legal_regulatory_requirements(rule_pack_id);
create index if not exists idx_module_records_module on legaltech_module_records(module_key, status);
create index if not exists idx_work_items_module on legaltech_work_items(module_key, status);
create index if not exists idx_vault_subject on vault_documents(subject_type, subject_id);
create index if not exists idx_audit_subject on audit_events(subject_type, subject_id, created_at desc);
create index if not exists idx_kyc_user on kyc_cases(user_id, status);
create index if not exists idx_investor_profiles_user on investor_profiles(user_id);
create index if not exists idx_positions_investor on investor_positions(investor_id, status);
create index if not exists idx_earnings_investor on investor_earnings(investor_id, status);
create index if not exists idx_documents_investor on investor_documents(investor_id, visible_to_investor);
create index if not exists idx_orders_investor on investor_orders(investor_id, status);
create index if not exists idx_opportunities_status on investment_opportunities(status, published_at desc);

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'legal_jurisdictions',
    'legal_jurisdiction_rule_packs',
    'legal_regulatory_requirements',
    'legal_opinions',
    'legal_token_projects',
    'legal_token_classifications',
    'compliance_decisions',
    'compliance_evidence',
    'compliance_gates',
    'contract_templates',
    'contract_clauses',
    'contract_versions',
    'signature_requests',
    'signature_evidence',
    'vault_documents',
    'legal_holds',
    'kyc_cases',
    'kyb_cases',
    'aml_alerts',
    'sanctions_checks',
    'escrow_flows',
    'regulatory_reports',
    'audit_events',
    'legaltech_module_records',
    'legaltech_work_items',
    'investor_profiles',
    'investor_wallets',
    'investment_opportunities',
    'investor_orders',
    'investor_positions',
    'investor_earnings',
    'investor_documents'
  ]
  loop
    execute format('alter table %I enable row level security', table_name);
  end loop;
end $$;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'legal_jurisdictions',
    'legal_jurisdiction_rule_packs',
    'legal_regulatory_requirements',
    'legal_opinions',
    'legal_token_projects',
    'legal_token_classifications',
    'compliance_decisions',
    'compliance_evidence',
    'compliance_gates',
    'contract_templates',
    'contract_clauses',
    'contract_versions',
    'signature_requests',
    'signature_evidence',
    'vault_documents',
    'legal_holds',
    'kyc_cases',
    'kyb_cases',
    'aml_alerts',
    'sanctions_checks',
    'escrow_flows',
    'regulatory_reports',
    'audit_events',
    'legaltech_module_records',
    'legaltech_work_items',
    'investor_profiles',
    'investor_wallets',
    'investment_opportunities',
    'investor_orders',
    'investor_positions',
    'investor_earnings',
    'investor_documents'
  ]
  loop
    execute format('grant select, insert, update, delete on table %I to authenticated', table_name);
    execute format('grant select on table %I to anon', table_name);
  end loop;
end $$;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'legal_jurisdictions',
    'legal_jurisdiction_rule_packs',
    'legal_regulatory_requirements',
    'legal_opinions',
    'legal_token_projects',
    'legal_token_classifications',
    'compliance_decisions',
    'compliance_gates',
    'contract_templates',
    'contract_clauses',
    'contract_versions',
    'signature_requests',
    'vault_documents',
    'legal_holds',
    'kyc_cases',
    'kyb_cases',
    'aml_alerts',
    'escrow_flows',
    'regulatory_reports',
    'legaltech_module_records',
    'legaltech_work_items',
    'investor_profiles',
    'investor_wallets',
    'investment_opportunities',
    'investor_orders',
    'investor_positions',
    'investor_earnings',
    'investor_documents'
  ]
  loop
    execute format('drop trigger if exists set_updated_at on %I', table_name);
    execute format('create trigger set_updated_at before update on %I for each row execute function private.set_updated_at()', table_name);
  end loop;
end $$;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'legal_jurisdictions',
    'legal_jurisdiction_rule_packs',
    'legal_regulatory_requirements',
    'legal_opinions',
    'legal_token_projects',
    'legal_token_classifications',
    'compliance_decisions',
    'compliance_evidence',
    'compliance_gates',
    'contract_templates',
    'contract_clauses',
    'contract_versions',
    'signature_requests',
    'signature_evidence',
    'vault_documents',
    'legal_holds',
    'kyc_cases',
    'kyb_cases',
    'aml_alerts',
    'sanctions_checks',
    'escrow_flows',
    'regulatory_reports',
    'audit_events',
    'legaltech_module_records',
    'legaltech_work_items',
    'investor_profiles',
    'investor_wallets',
    'investment_opportunities',
    'investor_orders',
    'investor_positions',
    'investor_earnings',
    'investor_documents'
  ]
  loop
    execute format('drop policy if exists "%s admin all" on %I', table_name, table_name);
    execute format(
      'create policy "%s admin all" on %I for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()))',
      table_name,
      table_name
    );
  end loop;
end $$;

drop policy if exists "published opportunities visible" on investment_opportunities;
create policy "published opportunities visible"
on investment_opportunities
for select
to anon, authenticated
using (status in ('approved', 'approved_with_conditions') and published_at is not null);

drop policy if exists "investors view own profile" on investor_profiles;
create policy "investors view own profile"
on investor_profiles
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "investors create own profile" on investor_profiles;
create policy "investors create own profile"
on investor_profiles
for insert
to authenticated
with check (
  (select auth.uid()) = user_id
  and onboarding_status in ('draft', 'pending_review')
  and kyc_status in ('draft', 'pending_review')
  and suitability_status in ('draft', 'pending_review')
  and wallet_status in ('draft', 'pending_review')
);

drop policy if exists "investors update own profile" on investor_profiles;
create policy "investors update own profile"
on investor_profiles
for update
to authenticated
using ((select auth.uid()) = user_id)
with check (
  (select auth.uid()) = user_id
  and onboarding_status in ('draft', 'pending_review', 'legal_review')
  and kyc_status in ('draft', 'pending_review', 'legal_review')
  and suitability_status in ('draft', 'pending_review', 'legal_review')
  and wallet_status in ('draft', 'pending_review', 'legal_review')
);

drop policy if exists "investors manage own wallets" on investor_wallets;
create policy "investors manage own wallets"
on investor_wallets
for all
to authenticated
using ((select auth.uid()) = investor_id)
with check (
  (select auth.uid()) = investor_id
  and status in ('draft', 'pending_review', 'legal_review')
);

drop policy if exists "investors manage own orders" on investor_orders;
create policy "investors manage own orders"
on investor_orders
for all
to authenticated
using ((select auth.uid()) = investor_id)
with check (
  (select auth.uid()) = investor_id
  and opportunity_id in (
    select id
    from investment_opportunities
    where status in ('approved', 'approved_with_conditions')
      and published_at is not null
  )
);

drop policy if exists "investors view own positions" on investor_positions;
create policy "investors view own positions"
on investor_positions
for select
to authenticated
using ((select auth.uid()) = investor_id);

drop policy if exists "investors view own earnings" on investor_earnings;
create policy "investors view own earnings"
on investor_earnings
for select
to authenticated
using ((select auth.uid()) = investor_id);

drop policy if exists "investors view own documents" on investor_documents;
create policy "investors view own documents"
on investor_documents
for select
to authenticated
using ((select auth.uid()) = investor_id and visible_to_investor = true);

drop policy if exists "users view own kyc" on kyc_cases;
create policy "users view own kyc"
on kyc_cases
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "users create own kyc" on kyc_cases;
create policy "users create own kyc"
on kyc_cases
for insert
to authenticated
with check ((select auth.uid()) = user_id and status in ('draft', 'pending_review'));

drop policy if exists "users update own draft kyc" on kyc_cases;
create policy "users update own draft kyc"
on kyc_cases
for update
to authenticated
using ((select auth.uid()) = user_id and status in ('draft', 'pending_review', 'legal_review'))
with check ((select auth.uid()) = user_id and status in ('draft', 'pending_review', 'legal_review'));

drop policy if exists "users view own aml alerts" on aml_alerts;
create policy "users view own aml alerts"
on aml_alerts
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "users view own sanctions checks" on sanctions_checks;
create policy "users view own sanctions checks"
on sanctions_checks
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "audit_events admin all" on audit_events;
drop policy if exists "audit_events admin read" on audit_events;
create policy "audit_events admin read"
on audit_events
for select
to authenticated
using ((select private.is_admin()));

drop policy if exists "audit_events admin insert" on audit_events;
create policy "audit_events admin insert"
on audit_events
for insert
to authenticated
with check ((select private.is_admin()));

drop policy if exists "audit append only" on audit_events;
create policy "audit append only"
on audit_events
for insert
to authenticated
with check ((select private.is_admin()) or (select auth.uid()) = actor_id);

drop policy if exists "vault uploader can view own" on vault_documents;
create policy "vault uploader can view own"
on vault_documents
for select
to authenticated
using ((select auth.uid()) = uploaded_by and sensitivity <> 'confidential');

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'legal-vault',
  'legal-vault',
  false,
  52428800,
  array[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'text/plain',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "legal vault admin read" on storage.objects;
create policy "legal vault admin read"
on storage.objects
for select
to authenticated
using (bucket_id = 'legal-vault' and (select private.is_admin()));

drop policy if exists "legal vault admin insert" on storage.objects;
create policy "legal vault admin insert"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'legal-vault' and (select private.is_admin()));

drop policy if exists "legal vault admin update" on storage.objects;
create policy "legal vault admin update"
on storage.objects
for update
to authenticated
using (bucket_id = 'legal-vault' and (select private.is_admin()))
with check (bucket_id = 'legal-vault' and (select private.is_admin()));

drop policy if exists "legal vault admin delete" on storage.objects;
create policy "legal vault admin delete"
on storage.objects
for delete
to authenticated
using (bucket_id = 'legal-vault' and (select private.is_admin()));

with br as (
  insert into legal_jurisdictions (
    code,
    name,
    status,
    primary_regulators,
    data_protection_rules,
    notes,
    approved_at
  )
  values (
    'BR',
    'Brasil',
    'approved_with_conditions',
    array['CVM', 'BACEN', 'COAF', 'Cartórios de Registro de Imóveis', 'Receita Federal'],
    array['LGPD'],
    'Jurisdição prioritária. Operações tokenizadas dependem de parecer jurídico, parceiros licenciados e gates de compliance.',
    now()
  )
  on conflict (code) do update
  set name = excluded.name,
      status = excluded.status,
      primary_regulators = excluded.primary_regulators,
      data_protection_rules = excluded.data_protection_rules,
      notes = excluded.notes,
      updated_at = now()
  returning id
),
pack as (
  insert into legal_jurisdiction_rule_packs (
    jurisdiction_id,
    version,
    status,
    effective_from,
    summary,
    source_links,
    approved_at
  )
  select
    id,
    '1.0-BR',
    'approved_with_conditions',
    current_date,
    'Pacote inicial Brasil: diagnóstico obrigatório antes de publicar ofertas tokenizadas, aceitar recursos ou liberar assinatura.',
    array['https://www.gov.br/cvm', 'https://www.bcb.gov.br', 'https://www.gov.br/coaf'],
    now()
  from br
  on conflict (jurisdiction_id, version) do update
  set status = excluded.status,
      summary = excluded.summary,
      source_links = excluded.source_links,
      updated_at = now()
  returning id
)
insert into legal_regulatory_requirements (
  rule_pack_id,
  requirement_key,
  title,
  description,
  applies_to,
  severity,
  decision_on_failure,
  evidence_required
)
select
  id,
  key,
  title,
  description,
  applies_to,
  severity,
  decision_on_failure::legaltech_decision_result,
  evidence_required
from pack
cross join (
  values
    (
      'BR-PROPERTY-GATE',
      'Gate do imóvel antes da oferta',
      'Matrícula, titularidade, ônus, débitos, avaliação e documentos do vendedor precisam estar anexados.',
      array['property', 'token_project'],
      'high',
      'additional_documentation_required',
      array['matricula_atualizada', 'certidoes', 'avaliacao', 'documentos_do_vendedor']
    ),
    (
      'BR-TOKEN-CLASSIFICATION',
      'Classificação jurídica do token',
      'Token não pode ser comunicado como escritura ou propriedade registral direta sem estrutura jurídica aprovada.',
      array['token_project', 'opportunity'],
      'critical',
      'legal_review_required',
      array['legal_token_classification_record', 'parecer_juridico', 'disclosure_de_risco']
    ),
    (
      'BR-INVESTOR-KYC',
      'KYC, suitability e origem de recursos',
      'Investidor precisa passar por identidade, residência fiscal, sanções/PEP e origem de recursos antes de investir.',
      array['investor', 'order'],
      'high',
      'enhanced_due_diligence',
      array['kyc', 'sanctions_check', 'suitability', 'source_of_funds']
    )
) as seed(key, title, description, applies_to, severity, decision_on_failure, evidence_required)
on conflict (rule_pack_id, requirement_key) do update
set title = excluded.title,
    description = excluded.description,
    applies_to = excluded.applies_to,
    severity = excluded.severity,
    decision_on_failure = excluded.decision_on_failure,
    evidence_required = excluded.evidence_required,
    updated_at = now();

insert into legal_jurisdictions (code, name, status, primary_regulators, blocked_reason, notes)
values
  ('PT', 'Portugal', 'blocked', array['CMVM', 'Banco de Portugal'], 'Aguardando parecer local e parceiro licenciado.', 'Bloqueada para oferta até rule pack aprovado.'),
  ('US', 'Estados Unidos', 'blocked', array['SEC', 'FinCEN', 'State regulators'], 'Exige análise por estado, Reg D/Reg S e restrições de distribuição.', 'Sem oferta pública até aprovação externa.'),
  ('AE', 'Emirados Árabes Unidos', 'pending_review', array['VARA', 'ADGM', 'DFSA'], null, 'Pré-análise para zonas francas e parceiros licenciados.')
on conflict (code) do update
set name = excluded.name,
    status = excluded.status,
    primary_regulators = excluded.primary_regulators,
    blocked_reason = excluded.blocked_reason,
    notes = excluded.notes,
    updated_at = now();

insert into legaltech_module_records (module_key, ref, title, owner_label, status, risk_level, due_date, summary, metadata)
values
  ('jurisdictions', 'BR-REAL-1.0', 'Brasil Real Estate Pack', 'Legal', 'approved_with_conditions', 'high', current_date + 30, 'Pacote Brasil inicial com operações condicionadas a parecer e parceiros licenciados.', '{"jurisdiction":"BR"}'),
  ('jurisdictions', 'PT-REAL-HOLD', 'Portugal Property Pack', 'Externo', 'blocked', 'high', null, 'Bloqueado até parecer local e validação CMVM/AML.', '{"jurisdiction":"PT"}'),
  ('token-classifications', 'LTC-BR-001', 'Residencial fracionado BR', 'Legal', 'legal_review', 'high', current_date + 21, 'Ficha de classificação para frações econômicas sem promessa de escritura direta.', '{}'),
  ('compliance-engine', 'DEC-GATE-001', 'Offer legal gate', 'Compliance', 'pending_review', 'high', current_date + 7, 'Decisão exige rule pack, evidências e aprovação humana.', '{}'),
  ('legal-vault', 'VAULT-PROP', 'Documentos do imóvel', 'Operação', 'approved_with_conditions', 'high', current_date + 14, 'Cofre privado para matrícula, certidões, contrato e evidências.', '{}'),
  ('contract-lifecycle', 'CLM-INVEST-001', 'Termo de investimento fracionado', 'Legal', 'legal_review', 'high', current_date + 21, 'Template exige versão aprovada antes de assinatura.', '{}'),
  ('identity-aml', 'KYC-INVESTOR-001', 'KYC/KYB/AML do investidor', 'Compliance', 'pending_review', 'high', current_date + 10, 'Onboarding com identidade, origem de recursos, sanções e PEP.', '{}'),
  ('escrow-reconciliation', 'ESC-TOKEN-001', 'Escrow para oferta tokenizada', 'Finance', 'pending_review', 'high', current_date + 30, 'Fluxo depende de parceiro licenciado e condições precedentes.', '{}'),
  ('audit-evidence', 'AUD-APPEND-001', 'Eventos críticos append-only', 'Audit', 'approved_with_conditions', 'medium', current_date + 30, 'Eventos de contrato, AML, pagamento e vault não devem ser apagados.', '{}')
on conflict (module_key, ref) do update
set title = excluded.title,
    owner_label = excluded.owner_label,
    status = excluded.status,
    risk_level = excluded.risk_level,
    due_date = excluded.due_date,
    summary = excluded.summary,
    metadata = excluded.metadata,
    deleted_at = null,
    updated_at = now();

insert into investment_opportunities (
  title,
  location,
  token_symbol,
  status,
  summary,
  target_amount,
  raised_amount,
  min_ticket,
  currency,
  expected_yield_percent,
  risk_level,
  available_to_retail,
  closing_date,
  published_at
)
values
  (
    'Residencial tokenizado Brasil',
    'São Paulo, Brasil',
    'SH-BR-RES1',
    'approved_with_conditions',
    'Oportunidade piloto para testar suitability, KYC, disclosure e fluxo de evidências antes de qualquer liquidação real.',
    500000,
    185000,
    1000,
    'USD',
    8.75,
    'high',
    false,
    current_date + 45,
    now()
  ),
  (
    'Hospitality income pool',
    'Lisboa, Portugal',
    'SH-PT-HOTEL',
    'blocked',
    'Bloqueada até rule pack Portugal e parecer externo. Exibida internamente para planejamento.',
    750000,
    0,
    2500,
    'EUR',
    9.4,
    'critical',
    false,
    null,
    null
  )
on conflict (token_symbol) do update
set title = excluded.title,
    location = excluded.location,
    status = excluded.status,
    summary = excluded.summary,
    target_amount = excluded.target_amount,
    raised_amount = excluded.raised_amount,
    min_ticket = excluded.min_ticket,
    currency = excluded.currency,
    expected_yield_percent = excluded.expected_yield_percent,
    risk_level = excluded.risk_level,
    available_to_retail = excluded.available_to_retail,
    closing_date = excluded.closing_date,
    published_at = excluded.published_at,
    updated_at = now();

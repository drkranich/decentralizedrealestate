-- Seravie Heritage LegalTech Infrastructure
-- Schema blueprint only. Do not apply to production before legal, security, RLS,
-- Data API exposure and Supabase advisors review.

-- Design rules:
-- 1. Every regulated operation must have jurisdiction, rule version, evidence and actor.
-- 2. A token is not direct property title by default.
-- 3. Signed documents are immutable; later changes create new versions.
-- 4. Sensitive documents stay private and must be audit-logged.
-- 5. Critical events are append-only.

create type legaltech_review_status as enum (
  'draft',
  'pending_review',
  'legal_review',
  'approved',
  'approved_with_conditions',
  'blocked',
  'expired',
  'archived',
  'legal_hold'
);

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
  'regulatory_report'
);

create table legal_jurisdictions (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  status legaltech_review_status not null default 'draft',
  primary_regulators text[] not null default '{}',
  data_protection_rules text[] not null default '{}',
  blocked_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  approved_at timestamptz,
  approved_by uuid references auth.users(id)
);

create table legal_jurisdiction_rule_packs (
  id uuid primary key default gen_random_uuid(),
  jurisdiction_id uuid not null references legal_jurisdictions(id),
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

create table legal_regulatory_requirements (
  id uuid primary key default gen_random_uuid(),
  rule_pack_id uuid not null references legal_jurisdiction_rule_packs(id),
  requirement_key text not null,
  title text not null,
  applies_to text[] not null default '{}',
  severity text not null check (severity in ('low', 'medium', 'high', 'critical')),
  decision_on_failure legaltech_decision_result not null default 'compliance_review_required',
  evidence_required text[] not null default '{}',
  created_at timestamptz not null default now(),
  unique (rule_pack_id, requirement_key)
);

create table legal_opinions (
  id uuid primary key default gen_random_uuid(),
  jurisdiction_id uuid references legal_jurisdictions(id),
  rule_pack_id uuid references legal_jurisdiction_rule_packs(id),
  subject text not null,
  status legaltech_review_status not null default 'draft',
  external_counsel text,
  document_id uuid,
  summary text,
  valid_from date,
  valid_until date,
  created_at timestamptz not null default now(),
  approved_at timestamptz,
  approved_by uuid references auth.users(id)
);

create table legal_token_projects (
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

create table legal_token_classifications (
  id uuid primary key default gen_random_uuid(),
  token_project_id uuid not null references legal_token_projects(id),
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
  approved_at timestamptz,
  approved_by uuid references auth.users(id)
);

create table compliance_decisions (
  id uuid primary key default gen_random_uuid(),
  rule_pack_id uuid not null references legal_jurisdiction_rule_packs(id),
  requirement_id uuid references legal_regulatory_requirements(id),
  subject_type text not null,
  subject_id uuid,
  result legaltech_decision_result not null,
  severity text not null check (severity in ('low', 'medium', 'high', 'critical')),
  rationale text not null,
  conditions text[] not null default '{}',
  reviewed_by uuid references auth.users(id),
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  expires_at timestamptz
);

create table compliance_evidence (
  id uuid primary key default gen_random_uuid(),
  decision_id uuid not null references compliance_decisions(id),
  document_id uuid,
  evidence_type text not null,
  hash_sha256 text,
  notes text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table contract_templates (
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
  unique (template_key, version)
);

create table contract_clauses (
  id uuid primary key default gen_random_uuid(),
  template_id uuid references contract_templates(id),
  clause_key text not null,
  title text not null,
  status legaltech_review_status not null default 'draft',
  version text not null,
  body_markdown text not null,
  risk_level text not null check (risk_level in ('low', 'medium', 'high', 'critical')),
  created_at timestamptz not null default now()
);

create table contract_versions (
  id uuid primary key default gen_random_uuid(),
  contract_id uuid references contracts(id),
  template_id uuid references contract_templates(id),
  status legaltech_review_status not null default 'draft',
  version text not null,
  document_id uuid,
  generated_by text not null default 'system',
  legal_approval_decision_id uuid references compliance_decisions(id),
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table signature_requests (
  id uuid primary key default gen_random_uuid(),
  contract_version_id uuid not null references contract_versions(id),
  provider text not null,
  provider_request_id text,
  status legaltech_review_status not null default 'pending_review',
  sent_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table signature_evidence (
  id uuid primary key default gen_random_uuid(),
  signature_request_id uuid not null references signature_requests(id),
  signer_user_id uuid references auth.users(id),
  signer_name text,
  signer_email text,
  evidence_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table vault_documents (
  id uuid primary key default gen_random_uuid(),
  document_kind legaltech_document_kind not null,
  subject_type text not null,
  subject_id uuid,
  storage_bucket text not null,
  storage_path text not null,
  hash_sha256 text not null,
  version text not null default '1',
  status legaltech_review_status not null default 'draft',
  retention_until date,
  uploaded_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  unique (storage_bucket, storage_path, version)
);

create table legal_holds (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references vault_documents(id),
  reason text not null,
  status legaltech_review_status not null default 'legal_hold',
  opened_by uuid references auth.users(id),
  opened_at timestamptz not null default now(),
  closed_by uuid references auth.users(id),
  closed_at timestamptz
);

create table kyc_cases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  status legaltech_review_status not null default 'draft',
  risk_level text not null check (risk_level in ('low', 'medium', 'high', 'critical')),
  residence_country text,
  tax_residence_country text,
  source_of_funds_summary text,
  provider text,
  provider_case_id text,
  created_at timestamptz not null default now(),
  approved_at timestamptz,
  approved_by uuid references auth.users(id)
);

create table kyb_cases (
  id uuid primary key default gen_random_uuid(),
  organization_name text not null,
  status legaltech_review_status not null default 'draft',
  beneficial_owners jsonb not null default '[]'::jsonb,
  representation_documents jsonb not null default '[]'::jsonb,
  provider text,
  provider_case_id text,
  created_at timestamptz not null default now(),
  approved_at timestamptz,
  approved_by uuid references auth.users(id)
);

create table aml_alerts (
  id uuid primary key default gen_random_uuid(),
  subject_type text not null,
  subject_id uuid,
  alert_type text not null,
  severity text not null check (severity in ('low', 'medium', 'high', 'critical')),
  status legaltech_review_status not null default 'pending_review',
  provider text,
  provider_alert_id text,
  notes text,
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  resolved_by uuid references auth.users(id)
);

create table sanctions_checks (
  id uuid primary key default gen_random_uuid(),
  subject_type text not null,
  subject_id uuid,
  provider text not null,
  provider_check_id text,
  match_found boolean not null default false,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table escrow_flows (
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
  created_at timestamptz not null default now()
);

create table regulatory_reports (
  id uuid primary key default gen_random_uuid(),
  jurisdiction_id uuid references legal_jurisdictions(id),
  report_type text not null,
  status legaltech_review_status not null default 'draft',
  period_start date,
  period_end date,
  document_id uuid,
  created_at timestamptz not null default now(),
  submitted_at timestamptz,
  submitted_by uuid references auth.users(id)
);

create table audit_events (
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

-- RLS should be enabled on every table above before exposing it through Supabase Data API.
-- Policies must distinguish admin/legal/compliance roles, owner/investor visibility,
-- document sensitivity, legal hold and append-only audit constraints.

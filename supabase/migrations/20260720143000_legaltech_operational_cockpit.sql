alter table public.compliance_gates
  add column if not exists description text,
  add column if not exists gate_order integer,
  add column if not exists module_key text,
  add column if not exists severity text not null default 'high',
  add column if not exists owner_label text not null default 'Compliance',
  add column if not exists decision_on_failure legaltech_decision_result not null default 'legal_review_required',
  add column if not exists metadata jsonb not null default '{}'::jsonb;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'compliance_gates_severity_check'
      and conrelid = 'public.compliance_gates'::regclass
  ) then
    alter table public.compliance_gates
      add constraint compliance_gates_severity_check
      check (severity in ('low', 'medium', 'high', 'critical'));
  end if;
end $$;

create unique index if not exists idx_compliance_gates_platform_unique
on public.compliance_gates (gate_key, subject_type)
where subject_id is null;

create table if not exists public.legaltech_evidence_exports (
  id uuid primary key default gen_random_uuid(),
  export_ref text not null unique,
  scope text not null default 'legaltech_cockpit',
  status text not null default 'generated' check (status in ('generated', 'archived', 'deleted')),
  generated_by uuid references auth.users(id),
  generated_at timestamptz not null default now(),
  counts jsonb not null default '{}'::jsonb,
  snapshot jsonb not null default '{}'::jsonb,
  content_markdown text not null,
  hash_sha256 text,
  archived_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_legaltech_evidence_exports_generated_at
on public.legaltech_evidence_exports (generated_at desc);

alter table public.legaltech_evidence_exports enable row level security;

grant select, insert, update, delete on public.legaltech_evidence_exports to authenticated;

drop policy if exists "legaltech_evidence_exports admin all" on public.legaltech_evidence_exports;
create policy "legaltech_evidence_exports admin all"
on public.legaltech_evidence_exports
for all
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

do $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgname = 'set_legaltech_evidence_exports_updated_at'
  ) then
    execute 'create trigger set_legaltech_evidence_exports_updated_at before update on public.legaltech_evidence_exports for each row execute function private.set_updated_at()';
  end if;
end $$;

create unique index if not exists idx_legaltech_work_items_platform_unique
on public.legaltech_work_items (module_key, title)
where record_id is null;

with seed (
  gate_key,
  title,
  description,
  gate_order,
  module_key,
  status,
  result,
  severity,
  decision_on_failure,
  owner_label,
  due_offset,
  required_evidence,
  applies_to
) as (
  values
    (
      'gate-1-property-eligibility',
      'Elegibilidade do imóvel',
      'Matrícula, titularidade, ônus, ações, débitos, ocupação, avaliação, seguro e documentos do vendedor.',
      1,
      'legal-vault',
      'approved_with_conditions',
      'approved_with_conditions',
      'high',
      'additional_documentation_required',
      'Legal + Operação',
      interval '14 days',
      array['matrícula atualizada', 'certidões negativas', 'avaliação independente', 'seguro e fotos técnicas'],
      array['property', 'token_project', 'opportunity']
    ),
    (
      'gate-2-owner-eligibility',
      'Elegibilidade do proprietário',
      'Identidade, representação, poderes, beneficiário final, sanções, PEP e origem do patrimônio.',
      2,
      'identity-aml',
      'pending_review',
      'enhanced_due_diligence',
      'high',
      'enhanced_due_diligence',
      'Compliance',
      interval '10 days',
      array['documento de identidade', 'comprovante de poderes', 'UBO/KYB', 'sanções e PEP'],
      array['owner', 'seller', 'issuer']
    ),
    (
      'gate-3-offer-legal-eligibility',
      'Elegibilidade jurídica da oferta',
      'Natureza da oferta, público, canal, valores mobiliários, suitability, licença e restrições.',
      3,
      'token-classifications',
      'legal_review',
      'legal_review_required',
      'critical',
      'legal_review_required',
      'Legal',
      interval '21 days',
      array['legal token classification record', 'parecer jurídico', 'disclosure de risco', 'rule pack de jurisdição'],
      array['token_project', 'opportunity', 'marketplace']
    ),
    (
      'gate-4-investor-eligibility',
      'Elegibilidade do investidor',
      'Identidade, residência fiscal, perfil de risco, limites, origem de recursos, PEP, sanções e aceites.',
      4,
      'identity-aml',
      'pending_review',
      'compliance_review_required',
      'high',
      'compliance_review_required',
      'Compliance',
      interval '7 days',
      array['KYC aprovado', 'suitability', 'origem de recursos', 'aceites de risco'],
      array['investor', 'order', 'secondary_trade']
    ),
    (
      'gate-5-closing',
      'Fechamento',
      'Condições precedentes, pagamentos, escrow, assinaturas, tributos, registro, token e auditoria.',
      5,
      'escrow-reconciliation',
      'pending_review',
      'senior_approval_required',
      'critical',
      'senior_approval_required',
      'Legal + Finance',
      interval '30 days',
      array['condições precedentes', 'comprovante de escrow', 'contrato assinado', 'evento de auditoria'],
      array['contract', 'payment', 'token_project']
    ),
    (
      'gate-6-post-closing',
      'Pós-fechamento',
      'Rendimentos, retenções, relatórios, seguros, governança, AML contínuo e incidentes.',
      6,
      'audit-evidence',
      'approved_with_conditions',
      'continuous_monitoring',
      'medium',
      'continuous_monitoring',
      'Audit + Gestão',
      interval '45 days',
      array['relatórios periódicos', 'retenções e impostos', 'renovação de seguros', 'monitoramento AML'],
      array['asset', 'investor_position', 'distribution']
    )
)
insert into public.compliance_gates (
  gate_key,
  title,
  subject_type,
  status,
  result,
  current_step,
  required_evidence,
  due_at,
  description,
  gate_order,
  module_key,
  severity,
  owner_label,
  decision_on_failure,
  metadata
)
select
  gate_key,
  title,
  'platform',
  status::legaltech_review_status,
  result::legaltech_decision_result,
  description,
  to_jsonb(required_evidence),
  now() + due_offset,
  description,
  gate_order,
  module_key,
  severity,
  owner_label,
  decision_on_failure::legaltech_decision_result,
  jsonb_build_object('source', 'legaltech_operational_cockpit', 'applies_to', applies_to)
from seed
on conflict (gate_key, subject_type) where subject_id is null do update
set title = excluded.title,
    status = excluded.status,
    result = excluded.result,
    current_step = excluded.current_step,
    required_evidence = excluded.required_evidence,
    due_at = excluded.due_at,
    description = excluded.description,
    gate_order = excluded.gate_order,
    module_key = excluded.module_key,
    severity = excluded.severity,
    owner_label = excluded.owner_label,
    decision_on_failure = excluded.decision_on_failure,
    metadata = excluded.metadata,
    updated_at = now();

with seed (module_key, title, status, risk_level, due_offset, notes) as (
  values
    (
      'jurisdictions',
      'Validar escopo de países liberados para oferta e marketplace secundário',
      'legal_review',
      'critical',
      interval '14 days',
      'Bloquear qualquer país sem rule pack, parecer local e parceiro regulado mapeado.'
    ),
    (
      'token-classifications',
      'Padronizar ficha jurídica de cada ativo tokenizado antes da publicação',
      'pending_review',
      'critical',
      interval '21 days',
      'A ficha deve registrar direito econômico, veículo jurídico, restrições, suitability e disclosure.'
    ),
    (
      'contract-lifecycle',
      'Conectar contrato aprovado ao Legal Vault e ao fluxo de assinatura',
      'pending_review',
      'high',
      interval '18 days',
      'Contrato assinado precisa gerar versão imutável, hash e evento de auditoria.'
    ),
    (
      'identity-aml',
      'Fechar política de KYC/KYB/AML para investidores, proprietários e prestadores',
      'pending_review',
      'high',
      interval '10 days',
      'Decidir provedores, níveis de risco, EDD, sanções, PEP, origem de recursos e retenção documental.'
    ),
    (
      'escrow-reconciliation',
      'Definir parceiro licenciado para escrow, pagamento, split e conciliação',
      'legal_review',
      'critical',
      interval '30 days',
      'A plataforma não deve custodiar recursos sem parceiro e fluxo jurídico-financeiro aprovado.'
    ),
    (
      'audit-evidence',
      'Ativar exportações auditáveis por operação, ativo e investidor',
      'approved_with_conditions',
      'medium',
      interval '7 days',
      'O cockpit já gera snapshot persistido; anexos do vault e eventos críticos entram na próxima rotina.'
    )
)
insert into public.legaltech_work_items (
  module_key,
  title,
  status,
  risk_level,
  due_at,
  notes
)
select
  module_key,
  title,
  status::legaltech_review_status,
  risk_level,
  now() + due_offset,
  notes
from seed
on conflict (module_key, title) where record_id is null do update
set status = excluded.status,
    risk_level = excluded.risk_level,
    due_at = excluded.due_at,
    notes = excluded.notes,
    updated_at = now();

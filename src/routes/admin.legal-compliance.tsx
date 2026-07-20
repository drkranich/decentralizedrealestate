import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Archive,
  BadgeCheck,
  ClipboardCheck,
  Database,
  Download,
  FileCheck2,
  FileLock2,
  Gavel,
  Globe2,
  Landmark,
  Loader2,
  LockKeyhole,
  Scale,
  ShieldCheck,
  Signature,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader, StatCard, Card, SectionTitle, Badge } from "@/components/app/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuthUser } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/admin/legal-compliance")({
  component: LegalCompliance,
});

type LegalTechStatus =
  | "draft"
  | "pending_review"
  | "legal_review"
  | "approved"
  | "approved_with_conditions"
  | "blocked"
  | "expired"
  | "archived"
  | "deleted"
  | "legal_hold";

type RiskLevel = "low" | "medium" | "high" | "critical";

type DecisionResult =
  | "approved"
  | "approved_with_conditions"
  | "legal_review_required"
  | "compliance_review_required"
  | "additional_documentation_required"
  | "enhanced_due_diligence"
  | "senior_approval_required"
  | "licensed_partner_required"
  | "jurisdiction_unavailable"
  | "blocked"
  | "continuous_monitoring";

type ComplianceGate = {
  id: string;
  gate_key: string;
  title: string;
  description: string | null;
  subject_type: string;
  status: LegalTechStatus;
  result: DecisionResult | null;
  current_step: string | null;
  required_evidence: unknown;
  due_at: string | null;
  gate_order: number | null;
  module_key: string | null;
  severity: RiskLevel;
  owner_label: string | null;
  decision_on_failure: DecisionResult;
  updated_at: string;
};

type ModuleRecordSummary = {
  id: string;
  module_key: string;
  status: LegalTechStatus;
};

type WorkItem = {
  id: string;
  module_key: string;
  title: string;
  status: LegalTechStatus;
  risk_level: RiskLevel;
  due_at: string | null;
  notes: string | null;
  updated_at: string;
};

type EvidenceExport = {
  id: string;
  export_ref: string;
  status: "generated" | "archived" | "deleted";
  generated_at: string;
  counts: unknown;
  content_markdown: string;
  hash_sha256: string | null;
};

const modules = [
  {
    key: "jurisdictions",
    title: "Jurisdiction Rule Packs",
    path: "/admin/jurisdictions",
    icon: Globe2,
    text: "Regras por país, versão, vigência, regulador, licença, restrição e responsável jurídico.",
  },
  {
    key: "token-classifications",
    title: "Legal Token Classification",
    path: "/admin/token-classifications",
    icon: BadgeCheck,
    text: "Ficha obrigatória para classificar cada ativo tokenizado antes de qualquer oferta.",
  },
  {
    key: "compliance-engine",
    title: "Heritage Compliance Engine",
    path: "/admin/compliance-engine",
    icon: ShieldCheck,
    text: "Decisões versionadas com regra aplicada, evidência, fundamento, condição e responsável.",
  },
  {
    key: "contract-lifecycle",
    title: "Contract Lifecycle Management",
    path: "/admin/contract-lifecycle",
    icon: Signature,
    text: "Templates, cláusulas, versões, revisão jurídica, aprovação, assinatura e arquivamento.",
  },
  {
    key: "legal-vault",
    title: "Heritage Legal Vault",
    path: "/admin/legal-vault",
    icon: FileLock2,
    text: "Cofre documental com hash, retenção, legal hold, versão assinada e trilha de custódia.",
  },
  {
    key: "identity-aml",
    title: "KYC, KYB, AML e sanções",
    path: "/admin/identity-aml",
    icon: LockKeyhole,
    text: "Identidade, beneficiário final, origem de recursos, PEP, sanções e monitoramento contínuo.",
  },
  {
    key: "escrow-reconciliation",
    title: "Payments, escrow e conciliação",
    path: "/admin/escrow-reconciliation",
    icon: Landmark,
    text: "Fluxos de pagamento, liberação, devolução, disputa, bloqueio, parceiro licenciado e conciliação.",
  },
  {
    key: "audit-evidence",
    title: "Audit & Evidence Service",
    path: "/admin/audit-evidence",
    icon: Archive,
    text: "Eventos críticos append-only, exportação de evidências e cadeia de custódia operacional.",
  },
];

const prohibitions = [
  "Não declarar que token é escritura ou propriedade registral direta do imóvel.",
  "Não publicar oferta tokenizada sem classificação jurídica aprovada.",
  "Não liberar assinatura de contrato sem aprovação jurídica registrada.",
  "Não alterar contrato assinado, documento sob retenção legal ou evidência crítica.",
  "Não armazenar documentos pessoais em blockchain pública.",
  "Não usar IA como aprovadora jurídica, regulatória, AML ou suitability.",
];

const statusOptions: LegalTechStatus[] = [
  "draft",
  "pending_review",
  "legal_review",
  "approved_with_conditions",
  "approved",
  "blocked",
  "expired",
  "archived",
  "legal_hold",
];

const statusLabels: Record<LegalTechStatus, string> = {
  draft: "Rascunho",
  pending_review: "Revisão",
  legal_review: "Jurídico",
  approved: "Aprovado",
  approved_with_conditions: "Condicionado",
  blocked: "Bloqueado",
  expired: "Expirado",
  archived: "Arquivado",
  deleted: "Excluído",
  legal_hold: "Legal hold",
};

const riskLabels: Record<RiskLevel, string> = {
  low: "Baixo",
  medium: "Médio",
  high: "Alto",
  critical: "Crítico",
};

const decisionLabels: Record<DecisionResult, string> = {
  approved: "Aprovado",
  approved_with_conditions: "Aprovado com condições",
  legal_review_required: "Revisão jurídica obrigatória",
  compliance_review_required: "Revisão de compliance obrigatória",
  additional_documentation_required: "Documentação adicional obrigatória",
  enhanced_due_diligence: "Due diligence reforçada",
  senior_approval_required: "Aprovação sênior obrigatória",
  licensed_partner_required: "Parceiro licenciado obrigatório",
  jurisdiction_unavailable: "Jurisdição indisponível",
  blocked: "Bloqueado",
  continuous_monitoring: "Monitoramento contínuo",
};

function LegalCompliance() {
  const { user } = useAuthUser();
  const [stats, setStats] = useState({
    jurisdictions: 0,
    records: 0,
    vaultDocuments: 0,
    gates: 0,
    workItems: 0,
    exports: 0,
  });
  const [moduleRecords, setModuleRecords] = useState<ModuleRecordSummary[]>([]);
  const [gates, setGates] = useState<ComplianceGate[]>([]);
  const [workItems, setWorkItems] = useState<WorkItem[]>([]);
  const [exports, setExports] = useState<EvidenceExport[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [schemaMissing, setSchemaMissing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setSchemaMissing(false);

    const [jurisdictions, records, vaultDocuments, gateRows, workItemRows, exportRows] =
      await Promise.all([
        supabase.from("legal_jurisdictions").select("id", { count: "exact", head: true }),
        supabase
          .from("legaltech_module_records")
          .select("id, module_key, status")
          .is("deleted_at", null),
        supabase.from("vault_documents").select("id", { count: "exact", head: true }),
        supabase
          .from("compliance_gates")
          .select(
            "id, gate_key, title, description, subject_type, status, result, current_step, required_evidence, due_at, gate_order, module_key, severity, owner_label, decision_on_failure, updated_at",
          )
          .eq("subject_type", "platform")
          .is("subject_id", null)
          .order("gate_order", { ascending: true }),
        supabase
          .from("legaltech_work_items")
          .select("id, module_key, title, status, risk_level, due_at, notes, updated_at")
          .is("record_id", null)
          .order("due_at", { ascending: true }),
        supabase
          .from("legaltech_evidence_exports")
          .select("id, export_ref, status, generated_at, counts, content_markdown, hash_sha256")
          .neq("status", "deleted")
          .order("generated_at", { ascending: false })
          .limit(6),
      ]);

    if (
      jurisdictions.error ||
      records.error ||
      vaultDocuments.error ||
      gateRows.error ||
      workItemRows.error ||
      exportRows.error
    ) {
      setSchemaMissing(true);
      setLoading(false);
      return;
    }

    const nextRecords = (records.data as ModuleRecordSummary[]) ?? [];
    const nextGates = (gateRows.data as ComplianceGate[]) ?? [];
    const nextWorkItems = (workItemRows.data as WorkItem[]) ?? [];
    const nextExports = (exportRows.data as EvidenceExport[]) ?? [];

    setModuleRecords(nextRecords);
    setGates(nextGates);
    setWorkItems(nextWorkItems);
    setExports(nextExports);
    setStats({
      jurisdictions: jurisdictions.count ?? 0,
      records: nextRecords.length,
      vaultDocuments: vaultDocuments.count ?? 0,
      gates: nextGates.length,
      workItems: nextWorkItems.length,
      exports: nextExports.length,
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const moduleCounts = useMemo(() => {
    return moduleRecords.reduce<Record<string, number>>((acc, record) => {
      acc[record.module_key] = (acc[record.module_key] ?? 0) + 1;
      return acc;
    }, {});
  }, [moduleRecords]);

  const gateReadyCount = gates.filter(
    (gate) => gate.status === "approved" || gate.status === "approved_with_conditions",
  ).length;
  const gateBlockedCount = gates.filter(
    (gate) => gate.status === "blocked" || gate.severity === "critical",
  ).length;

  const updateGateStatus = async (gate: ComplianceGate, status: LegalTechStatus) => {
    const { error } = await supabase
      .from("compliance_gates")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", gate.id);

    if (error) {
      toast.error(error.message || "Não foi possível atualizar o gate.");
      return;
    }

    toast.success("Gate atualizado.");
    load();
  };

  const updateWorkItemStatus = async (item: WorkItem, status: LegalTechStatus) => {
    const { error } = await supabase
      .from("legaltech_work_items")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", item.id);

    if (error) {
      toast.error(error.message || "Não foi possível atualizar a fila.");
      return;
    }

    toast.success("Fila atualizada.");
    load();
  };

  const archiveExport = async (item: EvidenceExport) => {
    const { error } = await supabase
      .from("legaltech_evidence_exports")
      .update({ status: "archived", archived_at: new Date().toISOString() })
      .eq("id", item.id);

    if (error) {
      toast.error(error.message || "Não foi possível arquivar a exportação.");
      return;
    }

    toast.success("Exportação arquivada.");
    load();
  };

  const exportEvidence = async () => {
    if (schemaMissing || exporting) return;

    setExporting(true);
    const generatedAt = new Date();
    const exportRef = `LEGEXP-${formatExportRef(generatedAt)}`;
    const snapshot = {
      generated_at: generatedAt.toISOString(),
      generated_by: user?.id ?? null,
      stats,
      gates,
      work_items: workItems,
      module_counts: moduleCounts,
      prohibitions,
    };
    const content = buildEvidenceMarkdown(
      exportRef,
      generatedAt,
      stats,
      gates,
      workItems,
      moduleCounts,
    );
    const hash = await sha256Text(content);

    const { data, error } = await supabase
      .from("legaltech_evidence_exports")
      .insert({
        export_ref: exportRef,
        scope: "legaltech_cockpit",
        status: "generated",
        generated_by: user?.id ?? null,
        generated_at: generatedAt.toISOString(),
        counts: stats,
        snapshot,
        content_markdown: content,
        hash_sha256: hash,
      })
      .select("id, export_ref, status, generated_at, counts, content_markdown, hash_sha256")
      .single();

    if (error) {
      setExporting(false);
      toast.error(error.message || "Não foi possível gerar a exportação.");
      return;
    }

    await supabase.from("audit_events").insert({
      event_type: "legaltech.evidence_export.generated",
      subject_type: "legaltech_evidence_exports",
      subject_id: data.id,
      actor_id: user?.id ?? null,
      actor_role: "admin",
      metadata: {
        export_ref: exportRef,
        hash_sha256: hash,
        counts: stats,
      },
    });

    setExporting(false);
    setExports((prev) => [data as EvidenceExport, ...prev].slice(0, 6));
    setStats((prev) => ({ ...prev, exports: prev.exports + 1 }));
    downloadMarkdown(`${exportRef}.md`, content);
    toast.success("Dossiê de evidências gerado e salvo.");
  };

  return (
    <>
      <PageHeader
        title="Legal & Compliance Cockpit"
        subtitle="Operação LegalTech com gates, filas, evidências, vault, jurisdições e exportações auditáveis da Seravie Heritage."
      >
        <Link
          to="/legaltech-infrastructure"
          className="flex items-center gap-2 rounded-full border border-glass-border bg-card px-4 py-2 text-sm font-medium hover:bg-secondary"
        >
          <Scale className="h-4 w-4" />
          Ver página pública
        </Link>
        <button
          type="button"
          onClick={exportEvidence}
          disabled={exporting || schemaMissing || loading}
          className="flex items-center gap-2 rounded-full bg-emerald px-4 py-2 text-sm font-semibold text-white shadow-glow disabled:opacity-60"
        >
          {exporting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FileCheck2 className="h-4 w-4" />
          )}
          Exportar evidências
        </button>
      </PageHeader>

      <div className="mb-6 rounded-2xl border border-emerald/30 bg-emerald/10 p-4 text-sm text-muted-foreground">
        <span className="font-semibold text-emerald">Cockpit operacional:</span> esta área usa
        Supabase com RLS para controlar gates, registros, fila jurídica e exportações de evidências.
        Aprovações humanas, pareceres e parceiros licenciados continuam sendo registrados antes de
        qualquer operação regulada.
      </div>

      {schemaMissing && (
        <Card className="mb-6 border-dashed border-destructive/30">
          <div className="text-sm text-muted-foreground">
            Não foi possível ler as tabelas LegalTech operacionais. Verifique conexão, permissões
            RLS e exposição das tabelas no Supabase.
          </div>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Fase atual"
          value={schemaMissing ? "Indisponível" : "Operacional"}
          change={schemaMissing ? "verificar Supabase" : `${stats.records} registros`}
          icon={ClipboardCheck}
        />
        <StatCard
          label="Jurisdições"
          value={loading ? "..." : String(stats.jurisdictions)}
          change="rule packs ativos"
          icon={Globe2}
          accent="skyblue"
        />
        <StatCard
          label="Gates prontos"
          value={loading ? "..." : `${gateReadyCount}/${stats.gates}`}
          change={`${gateBlockedCount} críticos ou bloqueados`}
          icon={LockKeyhole}
        />
        <StatCard
          label="Exportações"
          value={loading ? "..." : String(stats.exports)}
          change={`${stats.vaultDocuments} docs no vault`}
          icon={FileLock2}
          accent="skyblue"
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Card>
          <SectionTitle
            title="Portões obrigatórios"
            action={<Badge variant="emerald">Persistido no Supabase</Badge>}
          />
          {loading ? (
            <LoadingLine label="Carregando gates..." />
          ) : gates.length === 0 ? (
            <EmptyLine label="Nenhum gate operacional cadastrado." />
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {gates.map((gate) => (
                <div
                  key={gate.id}
                  className="rounded-2xl border border-glass-border bg-card/45 p-4 shadow-soft backdrop-blur-xl"
                >
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <Badge variant="blue">Gate {gate.gate_order ?? gate.gate_key}</Badge>
                    <Badge variant={riskVariant(gate.severity)}>
                      Risco {riskLabels[gate.severity]}
                    </Badge>
                  </div>
                  <div className="font-display text-sm font-semibold">{gate.title}</div>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {gate.description ?? gate.current_step}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {toStringArray(gate.required_evidence)
                      .slice(0, 4)
                      .map((item) => (
                        <Badge key={item} variant="muted">
                          {item}
                        </Badge>
                      ))}
                  </div>
                  <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto] sm:items-center">
                    <StatusSelect
                      value={gate.status}
                      onValueChange={(status) => updateGateStatus(gate, status)}
                    />
                    <Badge variant={statusVariant(gate.status)}>{statusLabels[gate.status]}</Badge>
                  </div>
                  <div className="mt-2 text-[11px] text-muted-foreground">
                    Falha: {decisionLabels[gate.decision_on_failure]}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <SectionTitle
            title="Proibições ativas"
            action={<AlertTriangle className="h-4 w-4 text-destructive" />}
          />
          <div className="space-y-3">
            {prohibitions.map((item) => (
              <div
                key={item}
                className="flex gap-3 rounded-2xl border border-glass-border bg-glass-fill p-3"
              >
                <Gavel className="mt-0.5 h-4 w-4 shrink-0 text-emerald" />
                <span className="text-sm text-muted-foreground">{item}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="mt-6">
        <SectionTitle title="Módulos estruturantes" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {modules.map((module) => {
            const Icon = module.icon;
            const count = moduleCounts[module.key] ?? 0;
            return (
              <div
                key={module.title}
                className="rounded-2xl border border-glass-border bg-card/45 p-4 shadow-soft backdrop-blur-xl"
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald/15 text-emerald">
                    <Icon className="h-4 w-4" />
                  </div>
                  <Badge variant={count > 0 ? "emerald" : "muted"}>
                    {count > 0 ? `${count} registros` : "Sem registros"}
                  </Badge>
                </div>
                <div className="font-display text-sm font-semibold">{module.title}</div>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{module.text}</p>
                <Link
                  to={module.path as never}
                  className="mt-4 inline-flex items-center rounded-full border border-glass-border bg-card px-3 py-1.5 text-xs font-medium hover:bg-secondary"
                >
                  Abrir módulo
                </Link>
              </div>
            );
          })}
        </div>
      </Card>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card>
          <SectionTitle
            title="Fila operacional"
            action={<Database className="h-4 w-4 text-emerald" />}
          />
          {loading ? (
            <LoadingLine label="Carregando fila..." />
          ) : workItems.length === 0 ? (
            <EmptyLine label="Nenhuma pendência operacional cadastrada." />
          ) : (
            <div className="space-y-3">
              {workItems.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-glass-border bg-card/45 p-4 shadow-soft backdrop-blur-xl"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="font-medium">{item.title}</div>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                        {item.notes}
                      </p>
                    </div>
                    <Badge variant={riskVariant(item.risk_level)}>
                      {riskLabels[item.risk_level]}
                    </Badge>
                  </div>
                  <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto] sm:items-center">
                    <StatusSelect
                      value={item.status}
                      onValueChange={(status) => updateWorkItemStatus(item, status)}
                    />
                    <span className="text-xs text-muted-foreground">
                      {item.due_at
                        ? new Date(item.due_at).toLocaleDateString("pt-BR")
                        : "Sem prazo"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <SectionTitle
            title="Exportações auditáveis"
            action={<Scale className="h-4 w-4 text-emerald" />}
          />
          {loading ? (
            <LoadingLine label="Carregando exportações..." />
          ) : exports.length === 0 ? (
            <EmptyLine label="Nenhuma exportação gerada ainda." />
          ) : (
            <div className="space-y-3">
              {exports.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-glass-border bg-card/45 p-4 shadow-soft backdrop-blur-xl"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="font-mono text-xs font-semibold">{item.export_ref}</div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {new Date(item.generated_at).toLocaleString("pt-BR")}
                      </div>
                      <div className="mt-2 font-mono text-[11px] text-muted-foreground">
                        {item.hash_sha256 ? `${item.hash_sha256.slice(0, 28)}...` : "sem hash"}
                      </div>
                    </div>
                    <Badge variant={item.status === "archived" ? "muted" : "emerald"}>
                      {item.status === "archived" ? "Arquivada" : "Gerada"}
                    </Badge>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        downloadMarkdown(`${item.export_ref}.md`, item.content_markdown)
                      }
                      className="inline-flex items-center gap-2 rounded-full border border-glass-border bg-card px-3 py-1.5 text-xs font-medium hover:bg-secondary"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Baixar
                    </button>
                    {item.status !== "archived" && (
                      <button
                        type="button"
                        onClick={() => archiveExport(item)}
                        className="inline-flex items-center gap-2 rounded-full border border-glass-border bg-card px-3 py-1.5 text-xs font-medium hover:bg-secondary"
                      >
                        <Archive className="h-3.5 w-3.5" />
                        Arquivar
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </>
  );
}

function LoadingLine({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin" />
      {label}
    </div>
  );
}

function EmptyLine({ label }: { label: string }) {
  return <div className="py-8 text-sm text-muted-foreground">{label}</div>;
}

function StatusSelect({
  value,
  onValueChange,
}: {
  value: LegalTechStatus;
  onValueChange: (value: LegalTechStatus) => void;
}) {
  return (
    <Select value={value} onValueChange={(next) => onValueChange(next as LegalTechStatus)}>
      <SelectTrigger className="h-10 rounded-full bg-card/60 text-xs shadow-soft backdrop-blur-xl">
        <SelectValue />
      </SelectTrigger>
      <SelectContent
        side="bottom"
        avoidCollisions
        className="max-h-72 rounded-2xl bg-card/90 p-1 shadow-elegant backdrop-blur-2xl"
      >
        {statusOptions.map((status) => (
          <SelectItem key={status} value={status} className="rounded-xl text-xs">
            {statusLabels[status]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function statusVariant(status: LegalTechStatus) {
  if (status === "approved" || status === "approved_with_conditions") return "emerald" as const;
  if (status === "blocked" || status === "expired" || status === "deleted") return "warn" as const;
  if (status === "pending_review" || status === "legal_review") return "blue" as const;
  return "muted" as const;
}

function riskVariant(risk: RiskLevel) {
  if (risk === "critical" || risk === "high") return "warn" as const;
  if (risk === "medium") return "blue" as const;
  return "emerald" as const;
}

function toStringArray(value: unknown) {
  return Array.isArray(value) ? value.map((item) => String(item)) : [];
}

function formatExportRef(date: Date) {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
}

function buildEvidenceMarkdown(
  exportRef: string,
  generatedAt: Date,
  stats: {
    jurisdictions: number;
    records: number;
    vaultDocuments: number;
    gates: number;
    workItems: number;
    exports: number;
  },
  gates: ComplianceGate[],
  workItems: WorkItem[],
  moduleCounts: Record<string, number>,
) {
  const lines = [
    `# ${exportRef}`,
    "",
    "## Seravie Heritage LegalTech Evidence Export",
    "",
    `Gerado em: ${generatedAt.toLocaleString("pt-BR")}`,
    "",
    "## Indicadores",
    "",
    `- Jurisdições: ${stats.jurisdictions}`,
    `- Registros operacionais: ${stats.records}`,
    `- Documentos no Legal Vault: ${stats.vaultDocuments}`,
    `- Gates: ${stats.gates}`,
    `- Itens de fila: ${stats.workItems}`,
    "",
    "## Gates obrigatórios",
    "",
    ...gates.flatMap((gate) => [
      `### Gate ${gate.gate_order ?? gate.gate_key}: ${gate.title}`,
      `Status: ${statusLabels[gate.status]}`,
      `Severidade: ${riskLabels[gate.severity]}`,
      `Responsável: ${gate.owner_label ?? "Compliance"}`,
      `Decisão em caso de falha: ${decisionLabels[gate.decision_on_failure]}`,
      `Evidências: ${toStringArray(gate.required_evidence).join(", ") || "não informadas"}`,
      "",
    ]),
    "## Fila operacional",
    "",
    ...workItems.flatMap((item) => [
      `### ${item.title}`,
      `Módulo: ${item.module_key}`,
      `Status: ${statusLabels[item.status]}`,
      `Risco: ${riskLabels[item.risk_level]}`,
      `Prazo: ${item.due_at ? new Date(item.due_at).toLocaleDateString("pt-BR") : "sem prazo"}`,
      `Notas: ${item.notes ?? "-"}`,
      "",
    ]),
    "## Módulos",
    "",
    ...modules.map((module) => `- ${module.title}: ${moduleCounts[module.key] ?? 0} registros`),
    "",
  ];

  return lines.join("\n");
}

function downloadMarkdown(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

async function sha256Text(value: string) {
  const buffer = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(hash))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

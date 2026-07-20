import { Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Archive,
  BadgeCheck,
  CheckCircle2,
  Database,
  Download,
  Edit3,
  FileCheck2,
  FileLock2,
  FileSearch,
  Globe2,
  Landmark,
  Loader2,
  Plus,
  Scale,
  ShieldCheck,
  Signature,
  Trash2,
  Upload,
  UserCheck,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader, StatCard, Card, SectionTitle, Badge } from "@/components/app/ui";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";
import { useAuthUser } from "@/lib/auth";

export type LegalTechModuleKey =
  | "jurisdictions"
  | "token-classifications"
  | "compliance-engine"
  | "legal-vault"
  | "contract-lifecycle"
  | "identity-aml"
  | "escrow-reconciliation"
  | "audit-evidence";

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

type ModuleRecord = {
  id: string;
  module_key: LegalTechModuleKey;
  ref: string;
  title: string;
  owner_label: string;
  status: LegalTechStatus;
  risk_level: RiskLevel;
  due_date: string | null;
  summary: string | null;
  archived_at: string | null;
  deleted_at: string | null;
  created_at: string;
};

type VaultDocument = {
  id: string;
  title: string;
  document_kind: string;
  subject_type: string;
  storage_bucket: string;
  storage_path: string;
  hash_sha256: string | null;
  version: string;
  status: LegalTechStatus;
  sensitivity: string;
  created_at: string;
};

type ModuleConfig = {
  key: LegalTechModuleKey;
  path: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  operationalNote: string;
  evidence: string[];
  blockers: string[];
  automations: string[];
};

const moduleConfigs: Record<LegalTechModuleKey, ModuleConfig> = {
  jurisdictions: {
    key: "jurisdictions",
    path: "/admin/jurisdictions",
    title: "Jurisdiction Rule Packs",
    subtitle: "Pacotes regulatórios por país, versão, vigência, restrição e responsável jurídico.",
    icon: Globe2,
    operationalNote:
      "Brasil é o pacote prioritário. Outras jurisdições ficam bloqueadas até parecer local, matriz regulatória e parceiros licenciados.",
    evidence: [
      "Reguladores aplicáveis e links de referência",
      "Parecer jurídico local por jurisdição",
      "Lista de parceiros licenciados aceitos",
      "Versão vigente, responsável e data de aprovação",
    ],
    blockers: [
      "Publicação em país sem rule pack aprovado",
      "Regra expirada ou sem versão",
      "Operação com cripto sem análise local",
      "Oferta pública sem elegibilidade definida",
    ],
    automations: [
      "Avisar quando uma regra estiver perto de expirar",
      "Bloquear produto sem jurisdição válida",
      "Gerar checklist por país antes de cada oferta",
    ],
  },
  "token-classifications": {
    key: "token-classifications",
    path: "/admin/token-classifications",
    title: "Legal Token Classification",
    subtitle: "Ficha jurídica obrigatória para cada ativo tokenizado ou produto fracionado.",
    icon: BadgeCheck,
    operationalNote:
      "Nenhum token deve ser tratado como escritura ou propriedade registral direta sem estrutura jurídica aprovada.",
    evidence: [
      "Parecer jurídico assinado",
      "Termo de risco do investidor",
      "Contrato de participação ou veículo",
      "Cap table e regras de distribuição",
    ],
    blockers: [
      "Token sem classificação jurídica aprovada",
      "Oferta com expectativa de lucro não enquadrada",
      "Transferência sem suitability e AML",
      "Documento de direitos econômicos ausente",
    ],
    automations: [
      "Bloquear oferta quando o record estiver incompleto",
      "Exigir nova revisão ao mudar direito econômico",
      "Gerar disclosure por classe de investidor",
    ],
  },
  "compliance-engine": {
    key: "compliance-engine",
    path: "/admin/compliance-engine",
    title: "Heritage Compliance Engine",
    subtitle: "Decisões com regra aplicada, fundamento, versão, evidência e revisão humana.",
    icon: ShieldCheck,
    operationalNote:
      "Toda aprovação, bloqueio ou exceção precisa de regra versionada, justificativa e trilha de evidências.",
    evidence: [
      "Rule id e versão aplicada",
      "Snapshot dos dados avaliados",
      "Documentos e verificações externas",
      "Justificativa da decisão humana",
    ],
    blockers: [
      "Decisão sem rule pack versionado",
      "Override sem justificativa",
      "Operação sem evidência anexada",
      "Aprovação automática em alto risco",
    ],
    automations: [
      "Calcular severidade por regra e jurisdição",
      "Abrir revisão quando um documento expirar",
      "Gerar relatório de decisões por período",
    ],
  },
  "legal-vault": {
    key: "legal-vault",
    path: "/admin/legal-vault",
    title: "Heritage Legal Vault",
    subtitle: "Cofre documental com hash, versão, retenção, legal hold e cadeia de custódia.",
    icon: FileLock2,
    operationalNote:
      "Documentos sensíveis ficam em bucket privado. Contratos assinados não são sobrescritos; recebem nova versão.",
    evidence: [
      "Hash SHA-256 do arquivo",
      "Metadados de upload e visualização",
      "Versão do documento e vínculo com contrato",
      "Motivo de legal hold e responsável",
    ],
    blockers: [
      "Bucket público para documento sensível",
      "Exclusão de documento sob legal hold",
      "Sobrescrita de contrato assinado",
      "Visualização sem log de auditoria",
    ],
    automations: [
      "Gerar hash ao receber arquivo",
      "Exigir motivo ao baixar documento sensível",
      "Aplicar retenção quando houver disputa",
    ],
  },
  "contract-lifecycle": {
    key: "contract-lifecycle",
    path: "/admin/contract-lifecycle",
    title: "Contract Lifecycle Management",
    subtitle: "Templates, cláusulas, versões, revisão jurídica, assinatura e arquivamento.",
    icon: Signature,
    operationalNote:
      "Contrato gerado por IA ou template só avança para assinatura após revisão jurídica e versão aprovada.",
    evidence: [
      "Versão do template e cláusulas usadas",
      "Aprovação jurídica e data",
      "Assinaturas e certificado do provedor",
      "Documento final arquivado no Legal Vault",
    ],
    blockers: [
      "Assinatura sem aprovação jurídica",
      "Contrato com cláusula expirada",
      "Alteração de contrato assinado",
      "Template sem jurisdição definida",
    ],
    automations: [
      "Bloquear assinatura em revisão",
      "Criar nova versão ao alterar cláusula",
      "Alertar vencimento e renovação",
    ],
  },
  "identity-aml": {
    key: "identity-aml",
    path: "/admin/identity-aml",
    title: "KYC, KYB, AML & Sanctions",
    subtitle: "Identidade, beneficiário final, sanções, PEP, origem de recursos e monitoramento.",
    icon: UserCheck,
    operationalNote:
      "Identidade e AML dependem de provedores e políticas aprovadas; o dashboard registra filas, bloqueios e evidências.",
    evidence: [
      "Documento de identidade e prova de vida",
      "Comprovante de endereço e residência fiscal",
      "Beneficiário final e poderes de representação",
      "Resultado de sanções, PEP e adverse media",
    ],
    blockers: [
      "Usuário sancionado ou PEP sem EDD",
      "KYB sem beneficiário final",
      "Aporte sem origem de recursos",
      "Cripto sem wallet screening",
    ],
    automations: [
      "Reabrir KYC quando documento expirar",
      "Aplicar EDD por risco, país e valor",
      "Bloquear operação com match de sanções",
    ],
  },
  "escrow-reconciliation": {
    key: "escrow-reconciliation",
    path: "/admin/escrow-reconciliation",
    title: "Payments, Escrow & Reconciliation",
    subtitle: "Pagamentos, escrow, condições precedentes, liberação, disputa e conciliação.",
    icon: Landmark,
    operationalNote:
      "A plataforma não deve custodiar recursos sem validação jurídica, financeira e parceiro licenciado.",
    evidence: [
      "Comprovante de pagamento",
      "Condições precedentes atendidas",
      "Autorização de liberação",
      "Recibo, nota, retenções e conciliação",
    ],
    blockers: [
      "Custódia própria sem licença",
      "Liberação sem condição cumprida",
      "Cripto sem AML e parceiro VASP",
      "Repasse sem relatório e conciliação",
    ],
    automations: [
      "Bloquear liberação se gate jurídico estiver pendente",
      "Reconciliar pagamentos por contrato e ativo",
      "Alertar divergência entre valor esperado e recebido",
    ],
  },
  "audit-evidence": {
    key: "audit-evidence",
    path: "/admin/audit-evidence",
    title: "Audit & Evidence Service",
    subtitle: "Eventos append-only, cadeia de custódia, exportação de evidências e auditoria.",
    icon: Archive,
    operationalNote:
      "Eventos críticos não devem ser apagados. O serviço organiza quem fez, quando, com qual regra e qual evidência.",
    evidence: [
      "Timestamp, actor, role e IP",
      "Rule pack e decisão aplicada",
      "Hash dos documentos envolvidos",
      "Exportação assinada do dossiê",
    ],
    blockers: [
      "Alteração direta de evento crítico",
      "Export sem hash ou linha do tempo",
      "Decisão sem regra e evidência",
      "Acesso sensível sem propósito registrado",
    ],
    automations: [
      "Gerar linha do tempo por ativo",
      "Montar dossiê de disputa ou auditoria",
      "Alertar evento crítico sem evidência anexada",
    ],
  },
};

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

const emptyForm: RecordFormState = {
  ref: "",
  title: "",
  owner_label: "Operação",
  status: "draft",
  risk_level: "medium",
  due_date: "",
  summary: "",
};

type RecordFormState = {
  ref: string;
  title: string;
  owner_label: string;
  status: LegalTechStatus;
  risk_level: RiskLevel;
  due_date: string;
  summary: string;
};

export function LegalTechModuleDashboard({ moduleKey }: { moduleKey: LegalTechModuleKey }) {
  const module = moduleConfigs[moduleKey];
  const Icon = module.icon;
  const { user } = useAuthUser();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [records, setRecords] = useState<ModuleRecord[]>([]);
  const [vaultDocs, setVaultDocs] = useState<VaultDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [schemaMissing, setSchemaMissing] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState<ModuleRecord | null>(null);
  const [form, setForm] = useState<RecordFormState>(emptyForm);

  const load = useCallback(async () => {
    setLoading(true);
    setSchemaMissing(false);

    const { data, error } = await supabase
      .from("legaltech_module_records")
      .select(
        "id, module_key, ref, title, owner_label, status, risk_level, due_date, summary, archived_at, deleted_at, created_at",
      )
      .eq("module_key", moduleKey)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) {
      setSchemaMissing(true);
      setRecords([]);
      setLoading(false);
      return;
    }

    setRecords((data as ModuleRecord[]) ?? []);

    if (moduleKey === "legal-vault") {
      const { data: docs } = await supabase
        .from("vault_documents")
        .select(
          "id, title, document_kind, subject_type, storage_bucket, storage_path, hash_sha256, version, status, sensitivity, created_at",
        )
        .order("created_at", { ascending: false });
      setVaultDocs((docs as VaultDocument[]) ?? []);
    }

    setLoading(false);
  }, [moduleKey]);

  useEffect(() => {
    load();
  }, [load]);

  const activeRecords = useMemo(
    () => records.filter((record) => !record.archived_at && record.status !== "archived"),
    [records],
  );
  const approvedCount = records.filter(
    (record) => record.status === "approved" || record.status === "approved_with_conditions",
  ).length;
  const blockedCount = records.filter(
    (record) => record.status === "blocked" || record.risk_level === "critical",
  ).length;
  const dueSoonCount = records.filter((record) => {
    if (!record.due_date) return false;
    const days = (new Date(record.due_date).getTime() - Date.now()) / 86400000;
    return days >= 0 && days <= 14;
  }).length;

  const openCreate = () => {
    setEditing(null);
    setForm({
      ...emptyForm,
      ref: `${moduleKey.toUpperCase().slice(0, 4)}-${Date.now().toString().slice(-5)}`,
    });
    setDialogOpen(true);
  };

  const openEdit = (record: ModuleRecord) => {
    setEditing(record);
    setForm({
      ref: record.ref,
      title: record.title,
      owner_label: record.owner_label,
      status: record.status,
      risk_level: record.risk_level,
      due_date: record.due_date ?? "",
      summary: record.summary ?? "",
    });
    setDialogOpen(true);
  };

  const saveRecord = async () => {
    if (!form.ref.trim() || !form.title.trim()) {
      toast.error("Ref e título são obrigatórios.");
      return;
    }

    setSaving(true);
    const payload = {
      module_key: moduleKey,
      ref: form.ref.trim(),
      title: form.title.trim(),
      owner_label: form.owner_label.trim() || "Operação",
      status: form.status,
      risk_level: form.risk_level,
      due_date: form.due_date || null,
      summary: form.summary.trim() || null,
      created_by: user?.id ?? null,
      archived_at: form.status === "archived" ? new Date().toISOString() : null,
      deleted_at: null,
    };

    const query = editing
      ? supabase.from("legaltech_module_records").update(payload).eq("id", editing.id)
      : supabase.from("legaltech_module_records").insert(payload);

    const { error } = await query;
    setSaving(false);

    if (error) {
      toast.error(error.message || "Não foi possível salvar o registro.");
      return;
    }

    toast.success(editing ? "Registro atualizado." : "Registro criado.");
    setDialogOpen(false);
    load();
  };

  const updateRecordState = async (record: ModuleRecord, status: "archived" | "deleted") => {
    const patch =
      status === "archived"
        ? { status: "archived", archived_at: new Date().toISOString() }
        : { status: "deleted", deleted_at: new Date().toISOString() };

    const { error } = await supabase
      .from("legaltech_module_records")
      .update(patch)
      .eq("id", record.id);
    if (error) {
      toast.error(error.message || "Não foi possível alterar o registro.");
      return;
    }
    toast.success(status === "archived" ? "Registro arquivado." : "Registro excluído.");
    load();
  };

  const uploadVaultDocument = async (file: File) => {
    if (!user) {
      toast.error("Sessão não encontrada.");
      return;
    }

    setUploading(true);
    const hash = await sha256(file);
    const safeName = file.name.replace(/[^\w.-]+/g, "-").toLowerCase();
    const storagePath = `documents/${Date.now()}-${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from("legal-vault")
      .upload(storagePath, file, { upsert: false, cacheControl: "3600" });

    if (uploadError) {
      setUploading(false);
      toast.error(uploadError.message || "Não foi possível enviar o documento.");
      return;
    }

    const { error } = await supabase.from("vault_documents").insert({
      title: file.name,
      document_kind: "property_document",
      subject_type: "legaltech",
      storage_bucket: "legal-vault",
      storage_path: storagePath,
      mime_type: file.type || null,
      file_size: file.size,
      hash_sha256: hash,
      status: "pending_review",
      sensitivity: "restricted",
      uploaded_by: user.id,
    });

    setUploading(false);

    if (error) {
      toast.error(error.message || "Arquivo enviado, mas o registro não foi salvo.");
      return;
    }

    toast.success("Documento enviado ao Legal Vault.");
    load();
  };

  const downloadVaultDocument = async (doc: VaultDocument) => {
    const { data, error } = await supabase.storage
      .from(doc.storage_bucket)
      .createSignedUrl(doc.storage_path, 60);

    if (error || !data?.signedUrl) {
      toast.error(error?.message || "Não foi possível criar link de download.");
      return;
    }

    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      <PageHeader title={module.title} subtitle={module.subtitle}>
        <Link
          to="/admin/legal-compliance"
          className="flex items-center gap-2 rounded-full border border-glass-border bg-card px-4 py-2 text-sm font-medium hover:bg-secondary"
        >
          <Scale className="h-4 w-4" />
          Cockpit
        </Link>
        {moduleKey === "legal-vault" && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) uploadVaultDocument(file);
                event.target.value = "";
              }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || schemaMissing}
              className="flex items-center gap-2 rounded-full border border-glass-border bg-card px-4 py-2 text-sm font-medium hover:bg-secondary disabled:opacity-60"
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              Upload
            </button>
          </>
        )}
        <button
          type="button"
          onClick={openCreate}
          disabled={schemaMissing}
          className="flex items-center gap-2 rounded-full bg-emerald px-4 py-2 text-sm font-semibold text-white shadow-glow disabled:opacity-60"
        >
          <Plus className="h-4 w-4" />
          Novo registro
        </button>
      </PageHeader>

      <div className="mb-6 rounded-2xl border border-emerald/30 bg-emerald/10 p-4 text-sm text-muted-foreground">
        <span className="font-semibold text-emerald">Controle operacional:</span>{" "}
        {module.operationalNote}
      </div>

      {schemaMissing && (
        <Card className="mb-6 border-dashed border-destructive/30">
          <div className="flex gap-3 text-sm text-muted-foreground">
            <AlertTriangle className="h-5 w-5 shrink-0 text-destructive" />
            <div>
              <div className="font-semibold text-foreground">Dados LegalTech indisponíveis</div>
              <p>
                Não foi possível carregar os registros deste módulo. Verifique conexão, permissões
                RLS e exposição das tabelas no Supabase antes de operar.
              </p>
            </div>
          </div>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Registros"
          value={loading ? "..." : String(records.length)}
          icon={Database}
        />
        <StatCard
          label="Ativos"
          value={loading ? "..." : String(activeRecords.length)}
          change="sem arquivados"
          icon={CheckCircle2}
          accent="skyblue"
        />
        <StatCard
          label="Aprovados"
          value={loading ? "..." : String(approvedCount)}
          change="aprovados ou condicionados"
          icon={ShieldCheck}
        />
        <StatCard
          label="Risco/bloqueio"
          value={loading ? "..." : String(blockedCount)}
          change={`${dueSoonCount} vencem em 14 dias`}
          icon={AlertTriangle}
          accent="skyblue"
        />
      </div>

      <Card className="mt-6 overflow-hidden p-0">
        <div className="flex items-start justify-between gap-3 p-6 pb-4">
          <div>
            <h2 className="font-display text-lg font-semibold">Registros operacionais</h2>
            <p className="text-xs text-muted-foreground">
              CRUD real por módulo, conectado à tabela `legaltech_module_records`.
            </p>
          </div>
          <Badge variant={schemaMissing ? "warn" : "emerald"}>
            {schemaMissing ? "Indisponível" : "Operacional"}
          </Badge>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Carregando registros...
          </div>
        ) : records.length === 0 ? (
          <div className="px-6 pb-8 text-sm text-muted-foreground">
            Nenhum registro neste módulo ainda.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-y border-border bg-secondary/30 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-6 py-3 font-medium">Ref</th>
                  <th className="px-6 py-3 font-medium">Registro</th>
                  <th className="px-6 py-3 font-medium">Responsável</th>
                  <th className="px-6 py-3 font-medium">Estado</th>
                  <th className="px-6 py-3 font-medium">Prazo</th>
                  <th className="px-6 py-3 font-medium">Risco</th>
                  <th className="px-6 py-3 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr
                    key={record.id}
                    className="border-b border-border last:border-0 hover:bg-secondary/30"
                  >
                    <td className="px-6 py-4 font-mono text-xs">{record.ref}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium">{record.title}</div>
                      {record.summary && (
                        <div className="mt-1 max-w-md truncate text-xs text-muted-foreground">
                          {record.summary}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{record.owner_label}</td>
                    <td className="px-6 py-4">
                      <Badge variant={statusVariant(record.status)}>
                        {statusLabels[record.status]}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {record.due_date
                        ? new Date(record.due_date).toLocaleDateString("pt-BR")
                        : "-"}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={riskVariant(record.risk_level)}>
                        {riskLabels[record.risk_level]}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-1.5">
                        <IconButton label="Editar" icon={Edit3} onClick={() => openEdit(record)} />
                        <IconButton
                          label="Arquivar"
                          icon={Archive}
                          onClick={() => updateRecordState(record, "archived")}
                        />
                        <IconButton
                          label="Excluir"
                          icon={Trash2}
                          danger
                          onClick={() => {
                            if (window.confirm(`Excluir "${record.title}"?`)) {
                              updateRecordState(record, "deleted");
                            }
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {moduleKey === "legal-vault" && (
        <Card className="mt-6 overflow-hidden p-0">
          <div className="flex items-start justify-between gap-3 p-6 pb-4">
            <div>
              <h2 className="font-display text-lg font-semibold">Documentos no Vault</h2>
              <p className="text-xs text-muted-foreground">
                Upload privado, hash SHA-256 e download por URL assinada.
              </p>
            </div>
            <Badge variant="blue">{vaultDocs.length} documentos</Badge>
          </div>
          {vaultDocs.length === 0 ? (
            <div className="px-6 pb-8 text-sm text-muted-foreground">
              Nenhum documento enviado ainda.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-y border-border bg-secondary/30 text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-6 py-3 font-medium">Documento</th>
                    <th className="px-6 py-3 font-medium">Tipo</th>
                    <th className="px-6 py-3 font-medium">Hash</th>
                    <th className="px-6 py-3 font-medium">Sensibilidade</th>
                    <th className="px-6 py-3 font-medium text-right">Download</th>
                  </tr>
                </thead>
                <tbody>
                  {vaultDocs.map((doc) => (
                    <tr key={doc.id} className="border-b border-border last:border-0">
                      <td className="px-6 py-4 font-medium">{doc.title}</td>
                      <td className="px-6 py-4 text-muted-foreground">{doc.document_kind}</td>
                      <td className="px-6 py-4 font-mono text-[11px] text-muted-foreground">
                        {doc.hash_sha256 ? `${doc.hash_sha256.slice(0, 18)}...` : "-"}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="muted">{doc.sensitivity}</Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <IconButton
                          label="Baixar"
                          icon={Download}
                          onClick={() => downloadVaultDocument(doc)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <ChecklistCard
          title="Evidências exigidas"
          icon={FileCheck2}
          items={module.evidence}
          variant="emerald"
        />
        <ChecklistCard
          title="Bloqueios hard-stop"
          icon={AlertTriangle}
          items={module.blockers}
          variant="warn"
        />
        <ChecklistCard
          title="Controles operacionais"
          icon={FileSearch}
          items={module.automations}
          variant="blue"
        />
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl border-glass-border bg-card/95">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar registro" : "Novo registro"}</DialogTitle>
            <DialogDescription>
              Registro operacional do módulo {module.title}. Use status e risco para controlar gates
              internos antes de publicar qualquer operação.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Ref">
              <input
                value={form.ref}
                onChange={(event) => setFormValue("ref", event.target.value, setForm)}
                className="input"
              />
            </Field>
            <Field label="Responsável">
              <input
                value={form.owner_label}
                onChange={(event) => setFormValue("owner_label", event.target.value, setForm)}
                className="input"
              />
            </Field>
            <Field label="Título" wide>
              <input
                value={form.title}
                onChange={(event) => setFormValue("title", event.target.value, setForm)}
                className="input"
              />
            </Field>
            <Field label="Estado">
              <select
                value={form.status}
                onChange={(event) =>
                  setFormValue("status", event.target.value as LegalTechStatus, setForm)
                }
                className="input"
              >
                {Object.entries(statusLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Risco">
              <select
                value={form.risk_level}
                onChange={(event) =>
                  setFormValue("risk_level", event.target.value as RiskLevel, setForm)
                }
                className="input"
              >
                {Object.entries(riskLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Prazo">
              <input
                type="date"
                value={form.due_date}
                onChange={(event) => setFormValue("due_date", event.target.value, setForm)}
                className="input"
              />
            </Field>
            <Field label="Resumo" wide>
              <textarea
                value={form.summary}
                onChange={(event) => setFormValue("summary", event.target.value, setForm)}
                rows={4}
                className="input min-h-24 resize-none"
              />
            </Field>
          </div>

          <DialogFooter>
            <button
              type="button"
              onClick={() => setDialogOpen(false)}
              className="rounded-full border border-glass-border bg-glass-fill px-4 py-2 text-sm font-medium hover:bg-secondary"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={saveRecord}
              disabled={saving}
              className="flex items-center gap-2 rounded-full bg-emerald px-4 py-2 text-sm font-semibold text-white shadow-glow disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />}
              Salvar
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function ChecklistCard({
  title,
  icon: Icon,
  items,
  variant,
}: {
  title: string;
  icon: LucideIcon;
  items: string[];
  variant: "emerald" | "warn" | "blue";
}) {
  return (
    <Card>
      <SectionTitle title={title} action={<Icon className="h-4 w-4 text-emerald" />} />
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item}
            className="flex gap-3 rounded-2xl border border-glass-border bg-glass-fill p-3"
          >
            <Badge variant={variant}>{variant === "warn" ? "stop" : "req"}</Badge>
            <span className="text-sm text-muted-foreground">{item}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function Field({
  label,
  wide,
  children,
}: {
  label: string;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className={wide ? "sm:col-span-2" : ""}>
      <span className="mb-1 block text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function IconButton({
  label,
  icon: Icon,
  onClick,
  danger,
}: {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-full border border-glass-border transition-colors ${
        danger
          ? "text-destructive hover:bg-destructive/10"
          : "text-muted-foreground hover:bg-secondary hover:text-foreground"
      }`}
    >
      <Icon className="h-4 w-4" />
      <span className="sr-only">{label}</span>
    </button>
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

function setFormValue<K extends keyof RecordFormState>(
  key: K,
  value: RecordFormState[K],
  setForm: React.Dispatch<React.SetStateAction<RecordFormState>>,
) {
  setForm((prev) => ({ ...prev, [key]: value }));
}

async function sha256(file: File) {
  const buffer = await file.arrayBuffer();
  const hash = await crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(hash))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

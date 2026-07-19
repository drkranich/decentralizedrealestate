import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  Archive,
  BadgeCheck,
  ClipboardCheck,
  Database,
  FileCheck2,
  FileLock2,
  Gavel,
  Globe2,
  Landmark,
  LockKeyhole,
  Scale,
  ShieldCheck,
  Signature,
} from "lucide-react";
import { toast } from "sonner";
import {
  PageHeader,
  StatCard,
  Card,
  SectionTitle,
  Badge,
  DemoDataBadge,
} from "@/components/app/ui";

export const Route = createFileRoute("/admin/legal-compliance")({
  component: LegalCompliance,
});

const gates = [
  {
    gate: "Gate 1",
    title: "Elegibilidade do imóvel",
    text: "Matrícula, titularidade, ônus, ações, débitos, ocupação, avaliação, seguro e documentos do vendedor.",
  },
  {
    gate: "Gate 2",
    title: "Elegibilidade do proprietário",
    text: "Identidade, representação, poderes, beneficiário final, sanções, PEP e origem do patrimônio.",
  },
  {
    gate: "Gate 3",
    title: "Elegibilidade jurídica da oferta",
    text: "Natureza da oferta, público, canal, valores mobiliários, suitability, licença e restrições.",
  },
  {
    gate: "Gate 4",
    title: "Elegibilidade do investidor",
    text: "Identidade, residência fiscal, perfil de risco, limites, origem de recursos, PEP, sanções e aceites.",
  },
  {
    gate: "Gate 5",
    title: "Fechamento",
    text: "Condições precedentes, pagamentos, escrow, assinaturas, tributos, registro, token e auditoria.",
  },
  {
    gate: "Gate 6",
    title: "Pós-fechamento",
    text: "Rendimentos, retenções, relatórios, seguros, governança, AML contínuo e incidentes.",
  },
];

const modules = [
  {
    title: "Jurisdiction Rule Packs",
    path: "/admin/jurisdictions",
    icon: Globe2,
    text: "Regras por país, versão, vigência, regulador, licença, restrição e responsável jurídico.",
  },
  {
    title: "Legal Token Classification",
    path: "/admin/token-classifications",
    icon: BadgeCheck,
    text: "Ficha obrigatória para classificar cada ativo tokenizado antes de qualquer oferta.",
  },
  {
    title: "Heritage Compliance Engine",
    path: "/admin/compliance-engine",
    icon: ShieldCheck,
    text: "Decisões versionadas com regra aplicada, evidência, fundamento, condição e responsável.",
  },
  {
    title: "Contract Lifecycle Management",
    path: "/admin/contract-lifecycle",
    icon: Signature,
    text: "Templates, cláusulas, versões, revisão jurídica, aprovação, assinatura e arquivamento.",
  },
  {
    title: "Heritage Legal Vault",
    path: "/admin/legal-vault",
    icon: FileLock2,
    text: "Cofre documental com hash, retenção, legal hold, versão assinada e trilha de custódia.",
  },
  {
    title: "KYC, KYB, AML e sanções",
    path: "/admin/identity-aml",
    icon: LockKeyhole,
    text: "Identidade, beneficiário final, origem de recursos, PEP, sanções e monitoramento contínuo.",
  },
  {
    title: "Payments, escrow e conciliação",
    path: "/admin/escrow-reconciliation",
    icon: Landmark,
    text: "Fluxos de pagamento, liberação, devolução, disputa, bloqueio, parceiro licenciado e reconciliação.",
  },
  {
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

const nextDeliverables = [
  "Mapa de riscos regulatórios, imobiliários, financeiros, privacy e segurança.",
  "Matriz regulatória brasileira com atividades permitidas, bloqueadas e dependentes de terceiros licenciados.",
  "Modelo do Legal Token Classification Record.",
  "Rascunho do schema de banco para jurisdições, regras, evidências, contratos, vault e auditoria.",
  "Threat model para documentos, pagamentos, assinatura, tokenização e APIs externas.",
  "Lista de provedores externos para assinatura, KYC, KYB, AML, escrow, custódia e pagamentos.",
];

const pendingDecisions = [
  "Qual estrutura jurídica será usada para cada oferta tokenizada.",
  "Quem assina como responsável jurídico e compliance officer por jurisdição.",
  "Quais parceiros licenciados assumem escrow, pagamentos, custódia e KYC/KYB.",
  "Quais jurisdições ficam bloqueadas até revisão local.",
  "Quais documentos podem ser públicos, privados, sob retenção ou sob legal hold.",
  "Quais operações exigem aprovação humana sênior.",
];

function LegalCompliance() {
  return (
    <>
      <PageHeader
        title="Legal & Compliance Cockpit"
        subtitle="Camada inicial para LegalTech, RegTech, contratos, vault, jurisdições, gates e evidências da Seravie Heritage."
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
          onClick={() =>
            toast.info("Exportação real será liberada quando houver evidências e decisões salvas.")
          }
          className="flex items-center gap-2 rounded-full bg-emerald px-4 py-2 text-sm font-semibold text-white shadow-glow"
        >
          <FileCheck2 className="h-4 w-4" />
          Exportar evidências
        </button>
      </PageHeader>

      <div className="mb-6 rounded-2xl border border-dashed border-skyblue/35 bg-skyblue/10 p-4 text-sm text-muted-foreground">
        <span className="font-semibold text-skyblue">Nota operacional:</span> esta tela adapta o PDF
        LegalTech Infrastructure como arquitetura inicial. Ela não libera operação regulada, não
        substitui parecer jurídico e não promete conformidade automática.
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Fase atual"
          value="Diagnóstico"
          change="Sem migrations neste passo"
          icon={ClipboardCheck}
        />
        <StatCard
          label="Jurisdição prioritária"
          value="Brasil"
          change="Outras ficam bloqueadas"
          icon={Globe2}
          accent="skyblue"
        />
        <StatCard
          label="Oferta tokenizada"
          value="Bloqueada"
          change="Exige classificação jurídica"
          icon={LockKeyhole}
        />
        <StatCard
          label="Contrato assinado"
          value="Imutável"
          change="Sem sobrescrita de evidência"
          icon={FileLock2}
          accent="skyblue"
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Card>
          <SectionTitle title="Portões obrigatórios" action={<DemoDataBadge />} />
          <div className="grid gap-3 md:grid-cols-2">
            {gates.map((item) => (
              <div
                key={item.gate}
                className="rounded-2xl border border-glass-border bg-glass-fill p-4"
              >
                <div className="mb-2 flex items-center justify-between gap-3">
                  <Badge variant="blue">{item.gate}</Badge>
                  <Badge variant="muted">A definir</Badge>
                </div>
                <div className="font-display text-sm font-semibold">{item.title}</div>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.text}</p>
              </div>
            ))}
          </div>
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
            return (
              <div
                key={module.title}
                className="rounded-2xl border border-glass-border bg-glass-fill p-4"
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald/15 text-emerald">
                    <Icon className="h-4 w-4" />
                  </div>
                  <Badge variant="muted">Planejado</Badge>
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
            title="Próximos entregáveis"
            action={<Database className="h-4 w-4 text-emerald" />}
          />
          <div className="space-y-3">
            {nextDeliverables.map((item, index) => (
              <div
                key={item}
                className="flex gap-3 rounded-2xl border border-glass-border bg-glass-fill p-3"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald/15 font-mono text-[11px] font-semibold text-emerald">
                  {index + 1}
                </span>
                <span className="text-sm text-muted-foreground">{item}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <SectionTitle
            title="Decisões jurídicas pendentes"
            action={<Scale className="h-4 w-4 text-emerald" />}
          />
          <div className="space-y-3">
            {pendingDecisions.map((item) => (
              <div
                key={item}
                className="flex gap-3 rounded-2xl border border-glass-border bg-glass-fill p-3"
              >
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald" />
                <span className="text-sm text-muted-foreground">{item}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Bell,
  Bot,
  Brain,
  CheckCircle2,
  Loader2,
  Scale,
  ShieldCheck,
  Sparkles,
  Workflow,
  Wrench,
} from "lucide-react";
import { PageHeader, StatCard, Card, SectionTitle, Badge } from "@/components/app/ui";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/admin/ai")({
  component: AutomationCenter,
});

type WorkflowRow = {
  id: string;
  name: string;
  trigger_event: string;
  action: string;
  enabled: boolean;
};

type NotificationRule = {
  id: string;
  name: string;
  trigger_event: string;
  channel: string;
  enabled: boolean;
};

type WorkItem = {
  id: string;
  title: string;
  module_key: string;
  status: string;
  risk_level: string;
  due_at: string | null;
};

type AmlAlert = {
  id: string;
  alert_type: string;
  severity: string;
  status: string;
  created_at: string;
};

type Maintenance = {
  id: string;
  title: string | null;
  description: string;
  status: string;
  priority: string;
};

type ServiceRequest = {
  id: string;
  title: string;
  status: string;
  created_at: string;
};

type CenterData = {
  workflows: WorkflowRow[];
  rules: NotificationRule[];
  workItems: WorkItem[];
  amlAlerts: AmlAlert[];
  maintenance: Maintenance[];
  serviceRequests: ServiceRequest[];
};

const statusLabels: Record<string, string> = {
  pending_review: "Em revisão",
  legal_review: "Revisão jurídica",
  approved: "Aprovado",
  approved_with_conditions: "Aprovado com condições",
  open: "Aberto",
  in_progress: "Em andamento",
  requested: "Solicitado",
  quoted: "Cotado",
  accepted: "Aceito",
};

function AutomationCenter() {
  const [data, setData] = useState<CenterData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const [workflows, rules, workItems, amlAlerts, maintenance, serviceRequests] =
        await Promise.all([
          supabase
            .from("workflows")
            .select("id, name, trigger_event, action, enabled")
            .order("created_at", { ascending: false }),
          supabase
            .from("notification_rules")
            .select("id, name, trigger_event, channel, enabled")
            .order("created_at", { ascending: false }),
          supabase
            .from("legaltech_work_items")
            .select("id, title, module_key, status, risk_level, due_at")
            .in("status", ["pending_review", "legal_review"])
            .order("created_at", { ascending: false })
            .limit(8),
          supabase
            .from("aml_alerts")
            .select("id, alert_type, severity, status, created_at")
            .order("created_at", { ascending: false })
            .limit(8),
          supabase
            .from("maintenance_requests")
            .select("id, title, description, status, priority")
            .in("status", ["open", "in_progress"])
            .order("created_at", { ascending: false })
            .limit(8),
          supabase
            .from("service_requests")
            .select("id, title, status, created_at")
            .order("created_at", { ascending: false })
            .limit(8),
        ]);

      if (cancelled) return;
      const firstError = [
        workflows,
        rules,
        workItems,
        amlAlerts,
        maintenance,
        serviceRequests,
      ].find((item) => item.error)?.error;
      if (firstError) {
        setError(firstError.message);
        setData({
          workflows: [],
          rules: [],
          workItems: [],
          amlAlerts: [],
          maintenance: [],
          serviceRequests: [],
        });
        return;
      }

      setError(null);
      setData({
        workflows: ((workflows.data ?? []) as WorkflowRow[]) ?? [],
        rules: ((rules.data ?? []) as NotificationRule[]) ?? [],
        workItems: ((workItems.data ?? []) as WorkItem[]) ?? [],
        amlAlerts: ((amlAlerts.data ?? []) as AmlAlert[]) ?? [],
        maintenance: ((maintenance.data ?? []) as Maintenance[]) ?? [],
        serviceRequests: ((serviceRequests.data ?? []) as ServiceRequest[]) ?? [],
      });
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const insights = useMemo(() => buildInsights(data), [data]);

  const toggleWorkflow = async (id: string, enabled: boolean) => {
    setData((current) =>
      current
        ? {
            ...current,
            workflows: current.workflows.map((item) =>
              item.id === id ? { ...item, enabled } : item,
            ),
          }
        : current,
    );
    const { error: updateError } = await supabase
      .from("workflows")
      .update({ enabled })
      .eq("id", id);
    if (updateError) setError(updateError.message);
  };

  const toggleRule = async (id: string, enabled: boolean) => {
    setData((current) =>
      current
        ? {
            ...current,
            rules: current.rules.map((item) => (item.id === id ? { ...item, enabled } : item)),
          }
        : current,
    );
    const { error: updateError } = await supabase
      .from("notification_rules")
      .update({ enabled })
      .eq("id", id);
    if (updateError) setError(updateError.message);
  };

  if (!data) {
    return (
      <>
        <PageHeader
          title="Automação e inteligência"
          subtitle="Carregando workflows, regras e sinais operacionais."
        />
        <Card>
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Carregando...
          </div>
        </Card>
      </>
    );
  }

  const activeWorkflows = data.workflows.filter((workflow) => workflow.enabled).length;
  const activeRules = data.rules.filter((rule) => rule.enabled).length;
  const highRiskLegal = data.workItems.filter((item) =>
    ["high", "critical"].includes(item.risk_level),
  ).length;
  const urgentMaintenance = data.maintenance.filter((item) => item.priority === "urgent").length;

  return (
    <>
      <PageHeader
        title="Automação e inteligência"
        subtitle="Centro real de regras, filas e sinais. Modelos externos podem entrar depois, sem bloquear a operação."
      >
        <Badge variant="emerald">
          <Sparkles className="mr-1 inline h-3 w-3" /> Operacional
        </Badge>
        <Link
          to="/admin/workflows"
          className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-secondary"
        >
          Gerenciar workflows
        </Link>
      </PageHeader>

      {error && (
        <Card className="mb-6 border-destructive/30 bg-destructive/5">
          <p className="text-sm text-destructive">{error}</p>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Workflows ativos" value={String(activeWorkflows)} icon={Workflow} />
        <StatCard label="Regras in-app" value={String(activeRules)} icon={Bell} accent="skyblue" />
        <StatCard label="LegalTech alto risco" value={String(highRiskLegal)} icon={Scale} />
        <StatCard
          label="Manutenção urgente"
          value={String(urgentMaintenance)}
          icon={Wrench}
          accent="skyblue"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <SectionTitle
            title="Sinais operacionais"
            action={<Brain className="h-4 w-4 text-emerald" />}
          />
          {insights.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              Nenhum sinal crítico no momento.
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {insights.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-border/50 bg-secondary/20 p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald/15 text-emerald">
                      <item.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{item.title}</div>
                      <div className="mt-1 text-xs text-muted-foreground">{item.body}</div>
                      <Badge variant={item.variant}>{item.badge}</Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <SectionTitle title="Filas conectadas" />
          <div className="space-y-3">
            <QueueLine icon={Scale} label="LegalTech" value={data.workItems.length} />
            <QueueLine icon={ShieldCheck} label="AML" value={data.amlAlerts.length} />
            <QueueLine icon={Wrench} label="Manutenção" value={data.maintenance.length} />
            <QueueLine icon={Bot} label="Marketplace" value={data.serviceRequests.length} />
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <SectionTitle title="Workflows" />
          {data.workflows.length === 0 ? (
            <EmptyLine label="Nenhum workflow cadastrado." />
          ) : (
            <div className="space-y-3">
              {data.workflows.map((workflow) => (
                <ToggleRow
                  key={workflow.id}
                  title={workflow.name}
                  subtitle={`${workflow.trigger_event} → ${workflow.action}`}
                  enabled={workflow.enabled}
                  onToggle={(enabled) => toggleWorkflow(workflow.id, enabled)}
                />
              ))}
            </div>
          )}
        </Card>

        <Card>
          <SectionTitle title="Regras de notificação in-app" />
          {data.rules.length === 0 ? (
            <EmptyLine label="Nenhuma regra cadastrada." />
          ) : (
            <div className="space-y-3">
              {data.rules.map((rule) => (
                <ToggleRow
                  key={rule.id}
                  title={rule.name}
                  subtitle={`${rule.trigger_event} · ${rule.channel}`}
                  enabled={rule.enabled}
                  onToggle={(enabled) => toggleRule(rule.id, enabled)}
                />
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card className="mt-6">
        <SectionTitle title="Pendências LegalTech e AML" />
        <div className="grid gap-3 md:grid-cols-2">
          {[...data.workItems, ...data.amlAlerts].length === 0 ? (
            <EmptyLine label="Nenhuma pendência regulatória ativa." />
          ) : (
            <>
              {data.workItems.map((item) => (
                <QueueItem
                  key={item.id}
                  title={item.title}
                  subtitle={`${item.module_key} · ${statusLabel(item.status)}`}
                  risk={item.risk_level}
                />
              ))}
              {data.amlAlerts.map((item) => (
                <QueueItem
                  key={item.id}
                  title={item.alert_type}
                  subtitle={`AML · ${statusLabel(item.status)}`}
                  risk={item.severity}
                />
              ))}
            </>
          )}
        </div>
      </Card>
    </>
  );
}

function QueueLine({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Workflow;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border/50 bg-secondary/20 px-3 py-2 text-sm">
      <span className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-emerald" /> {label}
      </span>
      <Badge variant="muted">{value}</Badge>
    </div>
  );
}

function ToggleRow({
  title,
  subtitle,
  enabled,
  onToggle,
}: {
  title: string;
  subtitle: string;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-border/50 bg-secondary/20 p-3">
      <div className="min-w-0">
        <div className="truncate text-sm font-semibold">{title}</div>
        <div className="truncate text-xs text-muted-foreground">{subtitle}</div>
      </div>
      <button
        onClick={() => onToggle(!enabled)}
        aria-pressed={enabled}
        className={`flex h-6 w-11 shrink-0 items-center rounded-full border px-0.5 transition-colors ${
          enabled
            ? "justify-end border-emerald/30 bg-emerald/80"
            : "justify-start border-glass-border bg-glass-fill"
        }`}
      >
        <span className="h-4.5 w-4.5 rounded-full bg-white shadow-sm" />
      </button>
    </div>
  );
}

function QueueItem({ title, subtitle, risk }: { title: string; subtitle: string; risk: string }) {
  const high = ["high", "critical", "urgent"].includes(risk);
  return (
    <div className="rounded-2xl border border-border/50 bg-secondary/20 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold">{title}</div>
          <div className="text-xs text-muted-foreground">{subtitle}</div>
        </div>
        <Badge variant={high ? "warn" : "muted"}>{risk}</Badge>
      </div>
    </div>
  );
}

function EmptyLine({ label }: { label: string }) {
  return <div className="py-8 text-center text-sm text-muted-foreground">{label}</div>;
}

function statusLabel(status: string) {
  return statusLabels[status] ?? status;
}

function buildInsights(data: CenterData | null) {
  if (!data) return [];
  const insights: Array<{
    id: string;
    title: string;
    body: string;
    badge: string;
    variant: "emerald" | "warn" | "muted" | "blue";
    icon: typeof Workflow;
  }> = [];

  const disabledWorkflows = data.workflows.filter((item) => !item.enabled).length;
  if (disabledWorkflows > 0) {
    insights.push({
      id: "disabled-workflows",
      title: "Workflows desativados",
      body: `${disabledWorkflows} fluxo(s) estão cadastrados mas desligados.`,
      badge: "Revisar",
      variant: "blue",
      icon: Workflow,
    });
  }

  const criticalLegal = data.workItems.filter((item) => item.risk_level === "critical").length;
  if (criticalLegal > 0) {
    insights.push({
      id: "critical-legal",
      title: "Gates críticos pendentes",
      body: `${criticalLegal} pendência(s) LegalTech exigem decisão antes de avançar ofertas ou contratos.`,
      badge: "Crítico",
      variant: "warn",
      icon: Scale,
    });
  }

  const urgentMaintenance = data.maintenance.filter((item) => item.priority === "urgent").length;
  if (urgentMaintenance > 0) {
    insights.push({
      id: "urgent-maintenance",
      title: "Manutenção urgente",
      body: `${urgentMaintenance} chamado(s) precisam de resposta operacional rápida.`,
      badge: "SLA",
      variant: "warn",
      icon: Wrench,
    });
  }

  const openServiceRequests = data.serviceRequests.filter((item) =>
    ["requested", "provider_contacted", "quoted"].includes(item.status),
  ).length;
  if (openServiceRequests > 0) {
    insights.push({
      id: "service-marketplace",
      title: "Pedidos de serviço em aberto",
      body: `${openServiceRequests} pedido(s) do marketplace aguardam avanço.`,
      badge: "Marketplace",
      variant: "emerald",
      icon: CheckCircle2,
    });
  }

  if (data.amlAlerts.length > 0) {
    insights.push({
      id: "aml-alerts",
      title: "Alertas AML",
      body: `${data.amlAlerts.length} alerta(s) precisam permanecer visíveis para compliance.`,
      badge: "AML",
      variant: "blue",
      icon: AlertTriangle,
    });
  }

  return insights;
}

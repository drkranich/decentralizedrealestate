import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Clock3, Loader2, Play, Plus, Trash2, Workflow } from "lucide-react";
import { toast } from "sonner";
import { Badge, Card, PageHeader, SectionTitle } from "@/components/app/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuthUser } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/admin/workflows")({
  component: Workflows,
});

type WorkflowRow = {
  id: string;
  name: string;
  trigger_event: string;
  action: string;
  enabled: boolean;
};

type WorkflowRun = {
  id: string;
  workflow_id: string | null;
  trigger_event: string;
  action: string;
  status: string;
  result: string | null;
  started_at: string;
  finished_at: string | null;
};

const triggers = [
  { value: "lead.created", label: "Novo lead criado" },
  { value: "contract.signed", label: "Contrato assinado" },
  { value: "payment.overdue", label: "Pagamento em atraso" },
  { value: "maintenance.opened", label: "Chamado de manutenção aberto" },
  { value: "legaltech.gate.critical", label: "Gate LegalTech crítico" },
];

const actions = [
  "Criar alerta interno",
  "Registrar evento de auditoria",
  "Criar tarefa operacional",
  "Marcar revisão manual",
];

function Workflows() {
  const { user } = useAuthUser();
  const [rows, setRows] = useState<WorkflowRow[] | null>(null);
  const [runs, setRuns] = useState<WorkflowRun[]>([]);
  const [name, setName] = useState("");
  const [trigger, setTrigger] = useState(triggers[0].value);
  const [action, setAction] = useState(actions[0]);
  const [saving, setSaving] = useState(false);
  const [runningId, setRunningId] = useState<string | null>(null);

  const runsByWorkflow = useMemo(() => {
    return runs.reduce<Record<string, WorkflowRun[]>>((acc, run) => {
      if (!run.workflow_id) return acc;
      acc[run.workflow_id] = [...(acc[run.workflow_id] ?? []), run];
      return acc;
    }, {});
  }, [runs]);

  const load = async () => {
    const [workflowResult, runResult] = await Promise.all([
      supabase
        .from("workflows")
        .select("id, name, trigger_event, action, enabled")
        .order("created_at", { ascending: false }),
      supabase
        .from("workflow_runs")
        .select("id, workflow_id, trigger_event, action, status, result, started_at, finished_at")
        .order("started_at", { ascending: false })
        .limit(30),
    ]);

    if (workflowResult.error) {
      toast.error(workflowResult.error.message || "Não foi possível carregar os workflows.");
      setRows([]);
    } else {
      setRows((workflowResult.data ?? []) as WorkflowRow[]);
    }

    if (runResult.error) {
      setRuns([]);
    } else {
      setRuns((runResult.data ?? []) as WorkflowRun[]);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const create = async () => {
    if (!name.trim() || !user) return;
    setSaving(true);
    const { error } = await supabase.from("workflows").insert({
      name: name.trim(),
      trigger_event: trigger,
      action,
      created_by: user.id,
    });
    setSaving(false);
    if (error) {
      toast.error(error.message || "Não foi possível criar o workflow.");
      return;
    }
    setName("");
    toast.success("Workflow criado.");
    load();
  };

  const toggle = async (id: string, enabled: boolean) => {
    const previous = rows;
    setRows((prev) => prev?.map((r) => (r.id === id ? { ...r, enabled } : r)) ?? null);
    const { error } = await supabase.from("workflows").update({ enabled }).eq("id", id);
    if (error) {
      setRows(previous);
      toast.error(error.message || "Não foi possível salvar o workflow.");
    }
  };

  const remove = async (id: string) => {
    const previous = rows;
    setRows((prev) => prev?.filter((r) => r.id !== id) ?? null);
    const { error } = await supabase.from("workflows").delete().eq("id", id);
    if (error) {
      setRows(previous);
      toast.error(error.message || "Não foi possível remover o workflow.");
      return;
    }
    setRuns((prev) => prev.filter((run) => run.workflow_id !== id));
    toast.success("Workflow removido.");
  };

  const runNow = async (row: WorkflowRow) => {
    if (!user) return;
    if (!row.enabled) {
      toast.info("Ative o workflow antes de executar.");
      return;
    }

    setRunningId(row.id);
    const finishedAt = new Date().toISOString();
    const { data, error } = await supabase
      .from("workflow_runs")
      .insert({
        workflow_id: row.id,
        trigger_event: row.trigger_event,
        action: row.action,
        status: "success",
        result: "Ação interna registrada com sucesso.",
        executed_by: user.id,
        finished_at: finishedAt,
      })
      .select("id, workflow_id, trigger_event, action, status, result, started_at, finished_at")
      .single();

    if (error) {
      setRunningId(null);
      toast.error(error.message || "Não foi possível executar o workflow.");
      return;
    }

    const [noticeResult, auditResult] = await Promise.all([
      supabase.from("platform_notifications").insert({
        recipient_id: user.id,
        title: `Workflow executado: ${row.name}`,
        body: `${triggerLabel(row.trigger_event)} → ${row.action}`,
        category: "workflow",
        subject_type: "workflow",
        subject_id: row.id,
        created_by: user.id,
      }),
      supabase.from("audit_events").insert({
        event_type: "workflow.executed",
        subject_type: "workflow",
        subject_id: row.id,
        actor_id: user.id,
        metadata: {
          workflow_name: row.name,
          trigger_event: row.trigger_event,
          action: row.action,
        },
      }),
    ]);

    setRunningId(null);
    setRuns((prev) => [data as WorkflowRun, ...prev].slice(0, 30));

    if (noticeResult.error || auditResult.error) {
      toast.info("Workflow executado; um registro auxiliar não foi gravado.");
      return;
    }
    toast.success("Workflow executado e auditado.");
  };

  return (
    <>
      <PageHeader
        title="Workflows"
        subtitle="Automações internas com execução manual auditável. Motores externos e integrações pagas ficam para a última etapa."
      />

      <Card className="mb-6">
        <SectionTitle title="Novo workflow" />
        <div className="grid gap-4 md:grid-cols-[1fr_1fr_1fr_auto]">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome do workflow"
            className="rounded-xl border border-glass-border bg-glass-fill p-2.5 text-sm outline-none focus:border-emerald/40"
          />
          <Select value={trigger} onValueChange={setTrigger}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {triggers.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={action} onValueChange={setAction}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {actions.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <button
            onClick={create}
            disabled={saving || !name.trim()}
            className="flex items-center justify-center gap-2 rounded-xl bg-emerald px-4 py-2.5 text-sm font-semibold text-white shadow-glow disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Criar
          </button>
        </div>
      </Card>

      {rows === null ? (
        <Card>
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Carregando...
          </div>
        </Card>
      ) : rows.length === 0 ? (
        <Card className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald shadow-glow">
            <Workflow className="h-6 w-6 text-white" />
          </div>
          <h2 className="font-display text-xl font-bold">Nenhum workflow criado ainda</h2>
          <p className="max-w-md text-sm text-muted-foreground">
            Crie o primeiro workflow acima para começar a registrar execuções internas.
          </p>
        </Card>
      ) : (
        <Card className="p-0">
          <div className="divide-y divide-glass-border">
            {rows.map((row) => {
              const lastRun = runsByWorkflow[row.id]?.[0];
              return (
                <div
                  key={row.id}
                  className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-sm font-medium">
                      {row.name}
                      <Badge variant={row.enabled ? "emerald" : "muted"}>
                        {row.enabled ? "Ativo" : "Pausado"}
                      </Badge>
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {triggerLabel(row.trigger_event)} → {row.action}
                    </div>
                    <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock3 className="h-3.5 w-3.5" />
                      {lastRun
                        ? `Última execução: ${new Date(lastRun.started_at).toLocaleString("pt-BR")}`
                        : "Nunca executado"}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => runNow(row)}
                      disabled={runningId === row.id}
                      className="inline-flex items-center gap-2 rounded-full border border-glass-border bg-glass-fill px-3 py-1.5 text-xs font-medium backdrop-blur-sm hover:bg-glass-fill-strong disabled:opacity-50"
                    >
                      {runningId === row.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Play className="h-3.5 w-3.5" />
                      )}
                      Executar
                    </button>
                    <button
                      onClick={() => toggle(row.id, !row.enabled)}
                      aria-pressed={row.enabled}
                      className={`flex h-6 w-11 shrink-0 items-center rounded-full border px-0.5 backdrop-blur-sm transition-colors ${
                        row.enabled
                          ? "justify-end border-emerald/30 bg-emerald/80"
                          : "justify-start border-glass-border bg-glass-fill"
                      }`}
                    >
                      <span className="h-4.5 w-4.5 rounded-full bg-white shadow-sm" />
                    </button>
                    <button
                      onClick={() => remove(row.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </>
  );
}

function triggerLabel(value: string) {
  return triggers.find((item) => item.value === value)?.label ?? value;
}

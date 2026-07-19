import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Workflow, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, Card, SectionTitle } from "@/components/app/ui";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useAuthUser } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/admin/workflows")({
  component: Workflows,
});

type WorkflowRow = { id: string; name: string; trigger_event: string; action: string; enabled: boolean };

const triggers = ["Novo lead criado", "Contrato assinado", "Pagamento em atraso", "Chamado de manutenção aberto"];
const actions = ["Enviar e-mail de boas-vindas", "Notificar o dono do imóvel", "Criar tarefa de follow-up", "Marcar lead como qualificado"];

function Workflows() {
  const { user } = useAuthUser();
  const [rows, setRows] = useState<WorkflowRow[] | null>(null);
  const [name, setName] = useState("");
  const [trigger, setTrigger] = useState(triggers[0]);
  const [action, setAction] = useState(actions[0]);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("workflows").select("id, name, trigger_event, action, enabled").order("created_at", { ascending: false });
    setRows(data ?? []);
  };

  useEffect(() => {
    load();
  }, []);

  const create = async () => {
    if (!name.trim() || !user) return;
    setSaving(true);
    const { error } = await supabase.from("workflows").insert({ name: name.trim(), trigger_event: trigger, action, created_by: user.id });
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
    setRows((prev) => prev?.map((r) => (r.id === id ? { ...r, enabled } : r)) ?? null);
    await supabase.from("workflows").update({ enabled }).eq("id", id);
  };

  const remove = async (id: string) => {
    setRows((prev) => prev?.filter((r) => r.id !== id) ?? null);
    await supabase.from("workflows").delete().eq("id", id);
    toast.success("Workflow removido.");
  };

  return (
    <>
      <PageHeader title="Workflows" subtitle="Automações configuradas (gatilho → ação). O motor de execução automática vem na próxima fase." />

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
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {triggers.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={action} onValueChange={setAction}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {actions.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
            </SelectContent>
          </Select>
          <button onClick={create} disabled={saving || !name.trim()} className="flex items-center justify-center gap-2 rounded-xl bg-emerald px-4 py-2.5 text-sm font-semibold text-white shadow-glow disabled:opacity-50">
            <Plus className="h-4 w-4" /> Criar
          </button>
        </div>
      </Card>

      {rows === null ? (
        <Card>
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Carregando…
          </div>
        </Card>
      ) : rows.length === 0 ? (
        <Card className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald shadow-glow">
            <Workflow className="h-6 w-6 text-white" />
          </div>
          <h2 className="font-display text-xl font-bold">Nenhum workflow criado ainda</h2>
          <p className="max-w-md text-sm text-muted-foreground">Crie o primeiro workflow acima para começar.</p>
        </Card>
      ) : (
        <Card className="p-0">
          <div className="divide-y divide-glass-border">
            {rows.map((r) => (
              <div key={r.id} className="flex items-center justify-between gap-3 p-4">
                <div>
                  <div className="text-sm font-medium">{r.name}</div>
                  <div className="text-xs text-muted-foreground">{r.trigger_event} → {r.action}</div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggle(r.id, !r.enabled)}
                    aria-pressed={r.enabled}
                    className={`flex h-6 w-11 shrink-0 items-center rounded-full border px-0.5 backdrop-blur-sm transition-colors ${
                      r.enabled ? "justify-end border-emerald/30 bg-emerald/80" : "justify-start border-glass-border bg-glass-fill"
                    }`}
                  >
                    <span className="h-4.5 w-4.5 rounded-full bg-white shadow-sm" />
                  </button>
                  <button onClick={() => remove(r.id)} className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </>
  );
}

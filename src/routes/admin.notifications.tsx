import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bell, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, Card, SectionTitle } from "@/components/app/ui";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useAuthUser } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/admin/notifications")({
  component: NotificationRules,
});

type Rule = { id: string; name: string; trigger_event: string; channel: string; enabled: boolean };

const events = ["Novo lead", "Contrato assinado", "Pagamento recebido", "Chamado de manutenção aberto", "Mensagem recebida"];
const channels = [
  { value: "email", label: "E-mail" },
  { value: "sms", label: "SMS" },
  { value: "push", label: "Push" },
  { value: "in_app", label: "No app" },
];

function NotificationRules() {
  const { user } = useAuthUser();
  const [rules, setRules] = useState<Rule[] | null>(null);
  const [name, setName] = useState("");
  const [trigger, setTrigger] = useState(events[0]);
  const [channel, setChannel] = useState("email");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("notification_rules").select("id, name, trigger_event, channel, enabled").order("created_at", { ascending: false });
    setRules(data ?? []);
  };

  useEffect(() => {
    load();
  }, []);

  const create = async () => {
    if (!name.trim() || !user) return;
    setSaving(true);
    const { error } = await supabase.from("notification_rules").insert({
      name: name.trim(),
      trigger_event: trigger,
      channel,
      created_by: user.id,
    });
    setSaving(false);
    if (error) {
      toast.error(error.message || "Não foi possível criar a regra.");
      return;
    }
    setName("");
    toast.success("Regra de notificação criada.");
    load();
  };

  const toggle = async (id: string, enabled: boolean) => {
    setRules((prev) => prev?.map((r) => (r.id === id ? { ...r, enabled } : r)) ?? null);
    await supabase.from("notification_rules").update({ enabled }).eq("id", id);
  };

  const remove = async (id: string) => {
    setRules((prev) => prev?.filter((r) => r.id !== id) ?? null);
    await supabase.from("notification_rules").delete().eq("id", id);
    toast.success("Regra removida.");
  };

  return (
    <>
      <PageHeader title="Notifications" subtitle="Regras de notificação da plataforma. O disparo automático real (envio de e-mail/SMS) vem na próxima fase." />

      <Card className="mb-6">
        <SectionTitle title="Nova regra" />
        <div className="grid gap-4 md:grid-cols-[1fr_1fr_160px_auto]">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome da regra"
            className="rounded-xl border border-glass-border bg-glass-fill p-2.5 text-sm outline-none focus:border-emerald/40"
          />
          <Select value={trigger} onValueChange={setTrigger}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {events.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={channel} onValueChange={setChannel}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {channels.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <button onClick={create} disabled={saving || !name.trim()} className="flex items-center justify-center gap-2 rounded-xl bg-emerald px-4 py-2.5 text-sm font-semibold text-white shadow-glow disabled:opacity-50">
            <Plus className="h-4 w-4" /> Criar
          </button>
        </div>
      </Card>

      {rules === null ? (
        <Card>
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Carregando…
          </div>
        </Card>
      ) : rules.length === 0 ? (
        <Card className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald shadow-glow">
            <Bell className="h-6 w-6 text-white" />
          </div>
          <h2 className="font-display text-xl font-bold">Nenhuma regra criada ainda</h2>
          <p className="max-w-md text-sm text-muted-foreground">Crie a primeira regra acima para começar.</p>
        </Card>
      ) : (
        <Card className="p-0">
          <div className="divide-y divide-glass-border">
            {rules.map((r) => (
              <div key={r.id} className="flex items-center justify-between gap-3 p-4">
                <div>
                  <div className="text-sm font-medium">{r.name}</div>
                  <div className="text-xs text-muted-foreground">{r.trigger_event} · {channels.find((c) => c.value === r.channel)?.label ?? r.channel}</div>
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

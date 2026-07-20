import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bell, Loader2, Plus, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Card, PageHeader, SectionTitle } from "@/components/app/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuthUser } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/admin/notifications")({
  component: NotificationRules,
});

type Rule = {
  id: string;
  name: string;
  trigger_event: string;
  channel: string;
  enabled: boolean;
};

const events = [
  { value: "lead.created", label: "Novo lead" },
  { value: "contract.signed", label: "Contrato assinado" },
  { value: "payment.recorded", label: "Pagamento registrado" },
  { value: "maintenance.opened", label: "Chamado de manutenção aberto" },
  { value: "message.received", label: "Mensagem recebida" },
];

const channels = [
  { value: "in_app", label: "No app" },
  { value: "internal_queue", label: "Fila interna" },
];

function NotificationRules() {
  const { user } = useAuthUser();
  const [rules, setRules] = useState<Rule[] | null>(null);
  const [name, setName] = useState("");
  const [trigger, setTrigger] = useState(events[0].value);
  const [channel, setChannel] = useState("in_app");
  const [saving, setSaving] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);

  const load = async () => {
    const { data, error } = await supabase
      .from("notification_rules")
      .select("id, name, trigger_event, channel, enabled")
      .order("created_at", { ascending: false });
    if (error) {
      toast.error(error.message || "Não foi possível carregar as regras.");
      setRules([]);
      return;
    }
    setRules((data ?? []) as Rule[]);
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
    const previous = rules;
    setRules((prev) => prev?.map((r) => (r.id === id ? { ...r, enabled } : r)) ?? null);
    const { error } = await supabase.from("notification_rules").update({ enabled }).eq("id", id);
    if (error) {
      setRules(previous);
      toast.error(error.message || "Não foi possível salvar a regra.");
    }
  };

  const remove = async (id: string) => {
    const previous = rules;
    setRules((prev) => prev?.filter((r) => r.id !== id) ?? null);
    const { error } = await supabase.from("notification_rules").delete().eq("id", id);
    if (error) {
      setRules(previous);
      toast.error(error.message || "Não foi possível remover a regra.");
      return;
    }
    toast.success("Regra removida.");
  };

  const testInternalNotice = async (rule: Rule) => {
    if (!user) return;
    setTestingId(rule.id);
    const { error } = await supabase.from("platform_notifications").insert({
      recipient_id: user.id,
      title: `Teste: ${rule.name}`,
      body: `${eventLabel(rule.trigger_event)} registrado em ${channelLabel(rule.channel)}.`,
      category: "notification_rule",
      subject_type: "notification_rule",
      subject_id: rule.id,
      created_by: user.id,
    });
    setTestingId(null);
    if (error) {
      toast.error(error.message || "Não foi possível criar o aviso interno.");
      return;
    }
    toast.success("Aviso interno criado.");
  };

  return (
    <>
      <PageHeader
        title="Notifications"
        subtitle="Regras internas funcionais para avisos no app e fila operacional. E-mail, SMS e push reais ficam para a etapa de APIs externas."
      />

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
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {events.map((event) => (
                <SelectItem key={event.value} value={event.value}>
                  {event.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={channel} onValueChange={setChannel}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {channels.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
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

      {rules === null ? (
        <Card>
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Carregando...
          </div>
        </Card>
      ) : rules.length === 0 ? (
        <Card className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald shadow-glow">
            <Bell className="h-6 w-6 text-white" />
          </div>
          <h2 className="font-display text-xl font-bold">Nenhuma regra criada ainda</h2>
          <p className="max-w-md text-sm text-muted-foreground">
            Crie a primeira regra acima para começar a registrar avisos internos.
          </p>
        </Card>
      ) : (
        <Card className="p-0">
          <div className="divide-y divide-glass-border">
            {rules.map((rule) => (
              <div
                key={rule.id}
                className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <div className="text-sm font-medium">{rule.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {eventLabel(rule.trigger_event)} · {channelLabel(rule.channel)}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => testInternalNotice(rule)}
                    disabled={testingId === rule.id}
                    className="inline-flex items-center gap-2 rounded-full border border-glass-border bg-glass-fill px-3 py-1.5 text-xs font-medium backdrop-blur-sm hover:bg-glass-fill-strong disabled:opacity-50"
                  >
                    {testingId === rule.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Send className="h-3.5 w-3.5" />
                    )}
                    Testar aviso
                  </button>
                  <button
                    onClick={() => toggle(rule.id, !rule.enabled)}
                    aria-pressed={rule.enabled}
                    className={`flex h-6 w-11 shrink-0 items-center rounded-full border px-0.5 backdrop-blur-sm transition-colors ${
                      rule.enabled
                        ? "justify-end border-emerald/30 bg-emerald/80"
                        : "justify-start border-glass-border bg-glass-fill"
                    }`}
                  >
                    <span className="h-4.5 w-4.5 rounded-full bg-white shadow-sm" />
                  </button>
                  <button
                    onClick={() => remove(rule.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
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

function eventLabel(value: string) {
  return events.find((event) => event.value === value)?.label ?? value;
}

function channelLabel(value: string) {
  return channels.find((item) => item.value === value)?.label ?? value;
}

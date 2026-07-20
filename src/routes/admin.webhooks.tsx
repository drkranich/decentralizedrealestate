import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Loader2, Plus, Send, Trash2, Webhook } from "lucide-react";
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

export const Route = createFileRoute("/admin/webhooks")({
  component: Webhooks,
});

type WebhookRow = {
  id: string;
  name: string;
  url: string;
  event: string;
  enabled: boolean;
  last_triggered_at: string | null;
};

type DeliveryAttempt = {
  id: string;
  webhook_id: string | null;
  event: string;
  status: string;
  created_at: string;
};

const eventOptions = [
  "lead.created",
  "contract.signed",
  "payment.recorded",
  "maintenance.opened",
  "message.sent",
];

function Webhooks() {
  const { user } = useAuthUser();
  const [rows, setRows] = useState<WebhookRow[] | null>(null);
  const [attempts, setAttempts] = useState<DeliveryAttempt[]>([]);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [event, setEvent] = useState(eventOptions[0]);
  const [saving, setSaving] = useState(false);
  const [queueingId, setQueueingId] = useState<string | null>(null);

  const attemptsByWebhook = useMemo(() => {
    return attempts.reduce<Record<string, DeliveryAttempt[]>>((acc, attempt) => {
      if (!attempt.webhook_id) return acc;
      acc[attempt.webhook_id] = [...(acc[attempt.webhook_id] ?? []), attempt];
      return acc;
    }, {});
  }, [attempts]);

  const load = async () => {
    const [webhookResult, attemptResult] = await Promise.all([
      supabase
        .from("webhooks")
        .select("id, name, url, event, enabled, last_triggered_at")
        .order("created_at", { ascending: false }),
      supabase
        .from("webhook_delivery_attempts")
        .select("id, webhook_id, event, status, created_at")
        .order("created_at", { ascending: false })
        .limit(40),
    ]);

    if (webhookResult.error) {
      toast.error(webhookResult.error.message || "Não foi possível carregar os webhooks.");
      setRows([]);
    } else {
      setRows((webhookResult.data ?? []) as WebhookRow[]);
    }

    if (attemptResult.error) {
      setAttempts([]);
    } else {
      setAttempts((attemptResult.data ?? []) as DeliveryAttempt[]);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const create = async () => {
    if (!name.trim() || !url.trim() || !user) return;
    if (!/^https?:\/\//i.test(url.trim())) {
      toast.error("A URL precisa começar com http:// ou https://");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("webhooks").insert({
      name: name.trim(),
      url: url.trim(),
      event,
      created_by: user.id,
    });
    setSaving(false);
    if (error) {
      toast.error(error.message || "Não foi possível criar o webhook.");
      return;
    }
    setName("");
    setUrl("");
    toast.success("Webhook criado.");
    load();
  };

  const toggle = async (id: string, enabled: boolean) => {
    const previous = rows;
    setRows((prev) => prev?.map((r) => (r.id === id ? { ...r, enabled } : r)) ?? null);
    const { error } = await supabase.from("webhooks").update({ enabled }).eq("id", id);
    if (error) {
      setRows(previous);
      toast.error(error.message || "Não foi possível salvar o webhook.");
    }
  };

  const remove = async (id: string) => {
    const previous = rows;
    setRows((prev) => prev?.filter((r) => r.id !== id) ?? null);
    const { error } = await supabase.from("webhooks").delete().eq("id", id);
    if (error) {
      setRows(previous);
      toast.error(error.message || "Não foi possível remover o webhook.");
      return;
    }
    setAttempts((prev) => prev.filter((attempt) => attempt.webhook_id !== id));
    toast.success("Webhook removido.");
  };

  const queueTest = async (row: WebhookRow) => {
    if (!user) return;
    if (!row.enabled) {
      toast.info("Ative o webhook antes de enfileirar uma tentativa.");
      return;
    }
    setQueueingId(row.id);
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from("webhook_delivery_attempts")
      .insert({
        webhook_id: row.id,
        event: row.event,
        status: "queued",
        payload: {
          source: "manual_test",
          url: row.url,
          note: "HTTP externo não executado nesta etapa.",
        },
        created_by: user.id,
      })
      .select("id, webhook_id, event, status, created_at")
      .single();

    if (error) {
      setQueueingId(null);
      toast.error(error.message || "Não foi possível enfileirar a tentativa.");
      return;
    }

    await supabase.from("webhooks").update({ last_triggered_at: now }).eq("id", row.id);
    setRows(
      (prev) =>
        prev?.map((item) => (item.id === row.id ? { ...item, last_triggered_at: now } : item)) ??
        null,
    );
    setAttempts((prev) => [data as DeliveryAttempt, ...prev].slice(0, 40));
    setQueueingId(null);
    toast.success("Tentativa enfileirada internamente.");
  };

  return (
    <>
      <PageHeader
        title="Webhooks"
        subtitle="Cadastro e fila interna de eventos. O envio HTTP real para sistemas externos fica para a etapa de APIs externas."
      />

      <Card className="mb-6">
        <SectionTitle title="Novo webhook" action={<Badge variant="blue">Fila interna</Badge>} />
        <div className="grid gap-4 md:grid-cols-[1fr_1.5fr_180px_auto]">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome"
            className="rounded-xl border border-glass-border bg-glass-fill p-2.5 text-sm outline-none focus:border-emerald/40"
          />
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://sua-api.com/webhook"
            className="rounded-xl border border-glass-border bg-glass-fill p-2.5 text-sm outline-none focus:border-emerald/40"
          />
          <Select value={event} onValueChange={setEvent}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {eventOptions.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <button
            onClick={create}
            disabled={saving || !name.trim() || !url.trim()}
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
            <Webhook className="h-6 w-6 text-white" />
          </div>
          <h2 className="font-display text-xl font-bold">Nenhum webhook configurado</h2>
          <p className="max-w-md text-sm text-muted-foreground">
            Cadastre o primeiro endpoint acima para criar a fila interna de eventos.
          </p>
        </Card>
      ) : (
        <Card className="p-0">
          <div className="divide-y divide-glass-border">
            {rows.map((row) => {
              const rowAttempts = attemptsByWebhook[row.id] ?? [];
              const lastAttempt = rowAttempts[0];
              return (
                <div
                  key={row.id}
                  className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-sm font-medium">
                      {row.name}
                      <Badge variant="muted">{row.event}</Badge>
                      <Badge variant={row.enabled ? "emerald" : "muted"}>
                        {row.enabled ? "Ativo" : "Pausado"}
                      </Badge>
                    </div>
                    <div className="truncate font-mono text-xs text-muted-foreground">
                      {row.url}
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {lastAttempt
                        ? `Última tentativa: ${statusLabel(lastAttempt.status)} em ${new Date(lastAttempt.created_at).toLocaleString("pt-BR")}`
                        : "Nenhuma tentativa enfileirada"}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <button
                      onClick={() => queueTest(row)}
                      disabled={queueingId === row.id}
                      className="inline-flex items-center gap-2 rounded-full border border-glass-border bg-glass-fill px-3 py-1.5 text-xs font-medium backdrop-blur-sm hover:bg-glass-fill-strong disabled:opacity-50"
                    >
                      {queueingId === row.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Send className="h-3.5 w-3.5" />
                      )}
                      Enfileirar teste
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

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    queued: "na fila",
    skipped_external: "sem envio externo",
    sent: "enviado",
    failed: "falhou",
  };
  return labels[status] ?? status;
}

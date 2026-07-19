import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Webhook, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, Card, SectionTitle, Badge } from "@/components/app/ui";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useAuthUser } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/admin/webhooks")({
  component: Webhooks,
});

type WebhookRow = { id: string; name: string; url: string; event: string; enabled: boolean; last_triggered_at: string | null };

const eventOptions = ["lead.created", "contract.signed", "payment.received", "maintenance.opened", "message.sent"];

function Webhooks() {
  const { user } = useAuthUser();
  const [rows, setRows] = useState<WebhookRow[] | null>(null);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [event, setEvent] = useState(eventOptions[0]);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("webhooks").select("id, name, url, event, enabled, last_triggered_at").order("created_at", { ascending: false });
    setRows(data ?? []);
  };

  useEffect(() => {
    load();
  }, []);

  const create = async () => {
    if (!name.trim() || !url.trim() || !user) return;
    if (!/^https?:\/\//.test(url.trim())) {
      toast.error("A URL precisa começar com http:// ou https://");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("webhooks").insert({ name: name.trim(), url: url.trim(), event, created_by: user.id });
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
    setRows((prev) => prev?.map((r) => (r.id === id ? { ...r, enabled } : r)) ?? null);
    await supabase.from("webhooks").update({ enabled }).eq("id", id);
  };

  const remove = async (id: string) => {
    setRows((prev) => prev?.filter((r) => r.id !== id) ?? null);
    await supabase.from("webhooks").delete().eq("id", id);
    toast.success("Webhook removido.");
  };

  return (
    <>
      <PageHeader title="Webhooks" subtitle="Endpoints configurados para receber eventos da plataforma. O disparo automático real vem na próxima fase." />

      <Card className="mb-6">
        <SectionTitle title="Novo webhook" />
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
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {eventOptions.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}
            </SelectContent>
          </Select>
          <button onClick={create} disabled={saving || !name.trim() || !url.trim()} className="flex items-center justify-center gap-2 rounded-xl bg-emerald px-4 py-2.5 text-sm font-semibold text-white shadow-glow disabled:opacity-50">
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
            <Webhook className="h-6 w-6 text-white" />
          </div>
          <h2 className="font-display text-xl font-bold">Nenhum webhook configurado</h2>
          <p className="max-w-md text-sm text-muted-foreground">Cadastre o primeiro endpoint acima para começar.</p>
        </Card>
      ) : (
        <Card className="p-0">
          <div className="divide-y divide-glass-border">
            {rows.map((r) => (
              <div key={r.id} className="flex items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    {r.name} <Badge variant="muted">{r.event}</Badge>
                  </div>
                  <div className="truncate font-mono text-xs text-muted-foreground">{r.url}</div>
                  <div className="text-xs text-muted-foreground">
                    {r.last_triggered_at ? `Último disparo: ${new Date(r.last_triggered_at).toLocaleString()}` : "Nunca disparado"}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-3">
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

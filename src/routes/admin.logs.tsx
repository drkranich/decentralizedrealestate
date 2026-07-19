import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ScrollText, Loader2, Users, FileText, CreditCard, Wrench, MessageSquare } from "lucide-react";
import { PageHeader, Card, Badge } from "@/components/app/ui";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/admin/logs")({
  component: Logs,
});

type LogEntry = {
  id: string;
  type: "lead" | "contract" | "payment" | "maintenance" | "message";
  label: string;
  at: string;
};

const typeMeta: Record<LogEntry["type"], { icon: any; badge: string; color: "emerald" | "blue" | "muted" | "warn" }> = {
  lead: { icon: Users, badge: "Lead", color: "emerald" },
  contract: { icon: FileText, badge: "Contrato", color: "blue" },
  payment: { icon: CreditCard, badge: "Pagamento", color: "emerald" },
  maintenance: { icon: Wrench, badge: "Manutenção", color: "warn" },
  message: { icon: MessageSquare, badge: "Mensagem", color: "muted" },
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "agora";
  if (mins < 60) return `${mins} min atrás`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h atrás`;
  return `${Math.floor(hours / 24)}d atrás`;
}

function Logs() {
  const [entries, setEntries] = useState<LogEntry[] | null>(null);
  const [filter, setFilter] = useState<LogEntry["type"] | "all">("all");

  useEffect(() => {
    (async () => {
      const [{ data: leads }, { data: contracts }, { data: payments }, { data: maintenance }, { data: messages }] = await Promise.all([
        supabase.from("leads").select("id, name, created_at"),
        supabase.from("contracts").select("id, status, created_at, properties(title)"),
        supabase.from("payments").select("id, amount, status, payment_date"),
        supabase.from("maintenance_requests").select("id, category, created_at, properties(title)"),
        supabase.from("messages").select("id, created_at"),
      ]);

      const all: LogEntry[] = [
        ...(leads ?? []).map((l: any) => ({ id: `lead-${l.id}`, type: "lead" as const, label: `Novo lead: ${l.name}`, at: l.created_at })),
        ...(contracts ?? []).map((c: any) => ({
          id: `contract-${c.id}`,
          type: "contract" as const,
          label: `Contrato ${c.status} — ${c.properties?.title ?? "Imóvel"}`,
          at: c.created_at,
        })),
        ...(payments ?? []).map((p: any) => ({
          id: `payment-${p.id}`,
          type: "payment" as const,
          label: `Pagamento de €${Number(p.amount ?? 0).toLocaleString("en-US")} (${p.status})`,
          at: p.payment_date,
        })),
        ...(maintenance ?? []).map((m: any) => ({
          id: `maint-${m.id}`,
          type: "maintenance" as const,
          label: `Chamado de manutenção — ${m.properties?.title ?? "Imóvel"}`,
          at: m.created_at,
        })),
        ...(messages ?? []).map((m: any) => ({ id: `msg-${m.id}`, type: "message" as const, label: "Nova mensagem enviada", at: m.created_at })),
      ].filter((e) => e.at);

      all.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
      setEntries(all.slice(0, 200));
    })();
  }, []);

  if (entries === null) {
    return (
      <>
        <PageHeader title="Logs" subtitle="Atividade recente em toda a plataforma." />
        <Card>
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Carregando…
          </div>
        </Card>
      </>
    );
  }

  const filtered = filter === "all" ? entries : entries.filter((e) => e.type === filter);

  return (
    <>
      <PageHeader title="Logs" subtitle="Atividade recente real em toda a plataforma — leads, contratos, pagamentos, manutenção e mensagens." />

      {entries.length === 0 ? (
        <Card className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald shadow-glow">
            <ScrollText className="h-6 w-6 text-white" />
          </div>
          <h2 className="font-display text-xl font-bold">Nenhuma atividade ainda</h2>
          <p className="max-w-md text-sm text-muted-foreground">
            Assim que houver leads, contratos, pagamentos, chamados ou mensagens reais, essa atividade aparecerá aqui
            em ordem cronológica.
          </p>
        </Card>
      ) : (
        <>
          <div className="mb-4 flex flex-wrap gap-2">
            {(["all", "lead", "contract", "payment", "maintenance", "message"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
                  filter === t ? "border-emerald/40 bg-emerald/10 text-emerald" : "border-glass-border bg-secondary/40"
                }`}
              >
                {t === "all" ? "Tudo" : typeMeta[t].badge}
              </button>
            ))}
          </div>
          <Card className="p-0">
            <div className="divide-y divide-glass-border">
              {filtered.map((e) => {
                const meta = typeMeta[e.type];
                return (
                  <div key={e.id} className="flex items-center justify-between gap-3 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald/15 text-emerald">
                        <meta.icon className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">{e.label}</div>
                        <div className="text-xs text-muted-foreground">{timeAgo(e.at)}</div>
                      </div>
                    </div>
                    <Badge variant={meta.color}>{meta.badge}</Badge>
                  </div>
                );
              })}
            </div>
          </Card>
        </>
      )}
    </>
  );
}

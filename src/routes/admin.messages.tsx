import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MessageSquare, Loader2, Search } from "lucide-react";
import { PageHeader, Card, Badge } from "@/components/app/ui";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/admin/messages")({
  component: AdminMessages,
});

type Msg = {
  id: string;
  contract_id: string;
  sender_id: string;
  body: string;
  created_at: string;
};

type Contract = {
  id: string;
  user_id: string;
  properties: { title: string } | null;
};

type UserLite = { id: string; name: string | null };

type Thread = {
  contractId: string;
  propertyTitle: string;
  tenantName: string;
  lastBody: string;
  lastAt: string;
  count: number;
  messages: Msg[];
};

function initials(name: string) {
  return name.split(" ").filter(Boolean).map((n) => n[0]).slice(0, 2).join("").toUpperCase() || "?";
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "agora";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

function AdminMessages() {
  const [loading, setLoading] = useState(true);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [q, setQ] = useState("");

  useEffect(() => {
    (async () => {
      const [{ data: msgs }, { data: contracts }, { data: users }] = await Promise.all([
        supabase.from("messages").select("id, contract_id, sender_id, body, created_at").order("created_at", { ascending: true }),
        supabase.from("contracts").select("id, user_id, properties(title)"),
        supabase.from("users").select("id, name"),
      ]);

      const contractsById = new Map<string, Contract>((contracts as unknown as Contract[] ?? []).map((c) => [c.id, c]));
      const usersById = new Map<string, UserLite>((users as UserLite[] ?? []).map((u) => [u.id, u]));

      const grouped = new Map<string, Msg[]>();
      for (const m of (msgs as Msg[]) ?? []) {
        const list = grouped.get(m.contract_id) ?? [];
        list.push(m);
        grouped.set(m.contract_id, list);
      }

      const built: Thread[] = [...grouped.entries()].map(([contractId, list]) => {
        const contract = contractsById.get(contractId);
        const last = list[list.length - 1];
        return {
          contractId,
          propertyTitle: contract?.properties?.title ?? "Imóvel",
          tenantName: (contract && usersById.get(contract.user_id)?.name) || "Usuário",
          lastBody: last?.body ?? "",
          lastAt: last?.created_at ?? "",
          count: list.length,
          messages: list,
        };
      });
      built.sort((a, b) => new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime());

      setThreads(built);
      setSelected(built[0]?.contractId ?? null);
      setLoading(false);
    })();
  }, []);

  const filtered = q
    ? threads.filter((t) => t.propertyTitle.toLowerCase().includes(q.toLowerCase()) || t.tenantName.toLowerCase().includes(q.toLowerCase()))
    : threads;
  const active = threads.find((t) => t.contractId === selected) ?? null;

  return (
    <>
      <PageHeader title="Messages" subtitle="Todas as conversas entre proprietários, inquilinos e a plataforma." />

      {loading ? (
        <Card>
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Carregando…
          </div>
        </Card>
      ) : threads.length === 0 ? (
        <Card className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald shadow-glow">
            <MessageSquare className="h-6 w-6 text-white" />
          </div>
          <h2 className="font-display text-xl font-bold">Nenhuma mensagem ainda</h2>
          <p className="max-w-md text-sm text-muted-foreground">
            Assim que donos e inquilinos trocarem mensagens em seus contratos, as conversas aparecerão aqui em tempo real.
          </p>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <Card className="p-0">
            <div className="border-b border-glass-border p-4">
              <div className="flex items-center gap-2 rounded-xl border border-glass-border bg-glass-fill px-3 py-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Buscar conversa…"
                  className="w-full bg-transparent text-sm outline-none"
                />
              </div>
            </div>
            <div className="max-h-[560px] overflow-y-auto">
              {filtered.map((t) => (
                <button
                  key={t.contractId}
                  onClick={() => setSelected(t.contractId)}
                  className={`flex w-full items-start gap-3 border-b border-glass-border px-4 py-3 text-left transition-colors ${
                    selected === t.contractId ? "bg-glass-fill-strong" : "hover:bg-glass-fill"
                  }`}
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald/15 text-xs font-semibold text-emerald">
                    {initials(t.tenantName)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-semibold">{t.tenantName}</span>
                      <span className="shrink-0 text-xs text-muted-foreground">{timeAgo(t.lastAt)}</span>
                    </div>
                    <div className="truncate text-xs text-muted-foreground">{t.propertyTitle}</div>
                    <div className="mt-0.5 truncate text-xs text-muted-foreground">{t.lastBody}</div>
                  </div>
                </button>
              ))}
            </div>
          </Card>

          <Card className="flex flex-col p-0">
            {active ? (
              <>
                <div className="flex items-center justify-between border-b border-glass-border p-4">
                  <div>
                    <div className="text-sm font-semibold">{active.tenantName}</div>
                    <div className="text-xs text-muted-foreground">{active.propertyTitle}</div>
                  </div>
                  <Badge variant="muted">{active.count} mensagens</Badge>
                </div>
                <div className="flex-1 space-y-3 overflow-y-auto p-4">
                  {active.messages.map((m) => (
                    <div key={m.id} className="max-w-md rounded-2xl border border-glass-border bg-glass-fill px-4 py-2.5 text-sm">
                      {m.body}
                      <div className="mt-1 text-[10px] text-muted-foreground">{new Date(m.created_at).toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-1 items-center justify-center py-16 text-sm text-muted-foreground">
                Selecione uma conversa.
              </div>
            )}
          </Card>
        </div>
      )}
    </>
  );
}

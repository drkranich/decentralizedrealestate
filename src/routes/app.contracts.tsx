import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { FileText, Search, Download, Loader2 } from "lucide-react";
import { PageHeader, Card, Badge, StatCard, DemoDataBadge } from "@/components/app/ui";
import { CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/app/contracts")({
  component: Contracts,
});

type ContractRow = {
  id: string;
  status: string | null;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  properties: { title: string; price: number | null } | null;
};

const badgeVariant: Record<string, "emerald" | "warn" | "muted" | "blue"> = {
  active: "emerald",
  pending: "warn",
  signed: "blue",
  expired: "muted",
  cancelled: "muted",
};

function fmt(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

function Contracts() {
  const [contracts, setContracts] = useState<ContractRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("contracts")
        .select("id, status, start_date, end_date, created_at, properties(title, price)")
        .order("created_at", { ascending: false });
      setContracts((data as unknown as ContractRow[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const filtered = contracts.filter((c) =>
    !q || (c.properties?.title ?? "").toLowerCase().includes(q.toLowerCase()) || c.id.includes(q)
  );

  const active = contracts.filter((c) => c.status === "active").length;
  const pending = contracts.filter((c) => c.status === "pending").length;
  const expiringSoon = contracts.filter((c) => {
    if (!c.end_date) return false;
    const days = (new Date(c.end_date).getTime() - Date.now()) / 86400000;
    return days >= 0 && days <= 30;
  }).length;

  return (
    <>
      <PageHeader title="Contracts" subtitle="Contratos reais entre proprietários e inquilinos/investidores.">
        <button className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm hover:bg-secondary">
          <Download className="h-4 w-4" /> Export
        </button>
        <button
          onClick={() => toast.info("A geração automática de contratos via IA ainda não está disponível.")}
          className="flex items-center gap-2 rounded-full bg-emerald px-4 py-2 text-sm font-semibold text-white shadow-glow"
        >
          Novo contrato
        </button>
      </PageHeader>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Ativos" value={String(active)} icon={CheckCircle2} />
        <StatCard label="Pendentes" value={String(pending)} icon={Clock} accent="skyblue" />
        <StatCard label="Vencendo em 30d" value={String(expiringSoon)} icon={AlertCircle} accent="skyblue" />
        <div className="relative">
          <StatCard label="Gerados por IA" value="—" icon={FileText} />
          <div className="absolute right-3 top-3"><DemoDataBadge /></div>
        </div>
      </div>

      <Card className="mt-6 overflow-hidden p-0">
        <div className="flex flex-wrap items-center justify-between gap-3 p-6 pb-4">
          <div className="flex flex-1 items-center gap-2 rounded-full border border-border bg-secondary/40 px-4 py-2 max-w-sm">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full bg-transparent text-sm focus:outline-none"
              placeholder="Buscar contratos…"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Carregando contratos…
          </div>
        ) : filtered.length === 0 ? (
          <div className="px-6 pb-8 text-sm text-muted-foreground">
            Nenhum contrato real encontrado. Contratos aparecerão aqui quando forem criados entre um proprietário e um interessado.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-y border-border bg-secondary/30 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-6 py-3 font-medium">Ref</th>
                <th className="px-6 py-3 font-medium">Imóvel</th>
                <th className="px-6 py-3 font-medium">Valor</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Início</th>
                <th className="px-6 py-3 font-medium">Fim</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-b border-border last:border-0 hover:bg-secondary/30">
                  <td className="px-6 py-4 font-mono text-xs">{c.id.slice(0, 8)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-emerald" />
                      <span className="font-semibold">{c.properties?.title ?? "Imóvel removido"}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-semibold">
                    {c.properties?.price != null ? `€${Number(c.properties.price).toLocaleString("en-US")}` : "—"}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={badgeVariant[c.status ?? ""] ?? "muted"}>{c.status ?? "unknown"}</Badge>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{fmt(c.start_date)}</td>
                  <td className="px-6 py-4 text-muted-foreground">{fmt(c.end_date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </>
  );
}

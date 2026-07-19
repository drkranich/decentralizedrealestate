import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeftRight, Loader2 } from "lucide-react";
import { PageHeader, Card, Badge, StatCard } from "@/components/app/ui";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/admin/transactions")({
  component: Transactions,
});

type Tx = {
  id: string;
  type: "Pagamento" | "Comissão";
  description: string;
  amount: number;
  status: string | null;
  date: string | null;
};

const statusVariant: Record<string, "emerald" | "warn" | "muted"> = {
  paid: "emerald",
  pending: "warn",
  overdue: "warn",
  cancelled: "muted",
  invoiced: "warn",
  refunded: "muted",
};

function Transactions() {
  const [txs, setTxs] = useState<Tx[] | null>(null);
  const [filter, setFilter] = useState<"all" | "Pagamento" | "Comissão">("all");

  useEffect(() => {
    (async () => {
      const [{ data: payments }, { data: commissions }] = await Promise.all([
        supabase.from("payments").select("id, amount, status, payment_date, contracts(properties(title))"),
        supabase.from("commission_ledger").select("id, amount, rate, status, created_at, contracts(properties(title))"),
      ]);

      const paymentTxs: Tx[] = (payments ?? []).map((p: any) => ({
        id: `pay-${p.id}`,
        type: "Pagamento",
        description: p.contracts?.properties?.title ?? "Imóvel",
        amount: Number(p.amount ?? 0),
        status: p.status,
        date: p.payment_date,
      }));
      const commissionTxs: Tx[] = (commissions ?? []).map((c: any) => ({
        id: `com-${c.id}`,
        type: "Comissão",
        description: `${c.contracts?.properties?.title ?? "Contrato"} · taxa ${(Number(c.rate ?? 0) * 100).toFixed(1)}%`,
        amount: Number(c.amount ?? 0),
        status: c.status,
        date: c.created_at,
      }));

      const all = [...paymentTxs, ...commissionTxs].sort(
        (a, b) => new Date(b.date ?? 0).getTime() - new Date(a.date ?? 0).getTime()
      );
      setTxs(all);
    })();
  }, []);

  if (txs === null) {
    return (
      <>
        <PageHeader title="Transactions" subtitle="Ledger completo — pagamentos e comissões da plataforma." />
        <Card>
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Carregando…
          </div>
        </Card>
      </>
    );
  }

  const totalPayments = txs.filter((t) => t.type === "Pagamento").reduce((s, t) => s + t.amount, 0);
  const totalCommissions = txs.filter((t) => t.type === "Comissão").reduce((s, t) => s + t.amount, 0);
  const filtered = filter === "all" ? txs : txs.filter((t) => t.type === filter);

  return (
    <>
      <PageHeader title="Transactions" subtitle="Ledger completo — pagamentos e comissões de toda a plataforma." />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Total em pagamentos" value={`€${totalPayments.toLocaleString("en-US")}`} icon={ArrowLeftRight} />
        <StatCard label="Total em comissões" value={`€${totalCommissions.toLocaleString("en-US")}`} icon={ArrowLeftRight} accent="skyblue" />
        <StatCard label="Transações registradas" value={String(txs.length)} icon={ArrowLeftRight} accent="emerald" />
      </div>

      {txs.length === 0 ? (
        <Card className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald shadow-glow">
            <ArrowLeftRight className="h-6 w-6 text-white" />
          </div>
          <h2 className="font-display text-xl font-bold">Nenhuma transação ainda</h2>
          <p className="max-w-md text-sm text-muted-foreground">
            Pagamentos de aluguel e comissões da plataforma aparecerão aqui assim que os primeiros contratos gerarem
            cobranças reais.
          </p>
        </Card>
      ) : (
        <>
          <div className="mb-4 flex flex-wrap gap-2">
            {(["all", "Pagamento", "Comissão"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
                  filter === s ? "border-emerald/40 bg-emerald/10 text-emerald" : "border-glass-border bg-secondary/40"
                }`}
              >
                {s === "all" ? "Todos" : s}
              </button>
            ))}
          </div>
          <Card className="overflow-x-auto p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-glass-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-5 py-3">Tipo</th>
                  <th className="px-5 py-3">Descrição</th>
                  <th className="px-5 py-3">Valor</th>
                  <th className="px-5 py-3">Data</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => (
                  <tr key={t.id} className="border-b border-glass-border last:border-0">
                    <td className="px-5 py-4">
                      <Badge variant={t.type === "Pagamento" ? "blue" : "emerald"}>{t.type}</Badge>
                    </td>
                    <td className="px-5 py-4 font-medium">{t.description}</td>
                    <td className="px-5 py-4">€{t.amount.toLocaleString("en-US")}</td>
                    <td className="px-5 py-4 text-muted-foreground">{t.date ? new Date(t.date).toLocaleDateString() : "—"}</td>
                    <td className="px-5 py-4">
                      <Badge variant={statusVariant[t.status ?? ""] ?? "muted"}>{t.status ?? "—"}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </>
      )}
    </>
  );
}

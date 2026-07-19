import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CreditCard, Loader2 } from "lucide-react";
import { PageHeader, Card, Badge, StatCard } from "@/components/app/ui";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/admin/payments")({
  component: AdminPayments,
});

type PaymentRow = {
  id: string;
  amount: number | null;
  status: string | null;
  payment_date: string | null;
  property_title: string;
  tenant_name: string;
};

const statusVariant: Record<string, "emerald" | "warn" | "muted"> = {
  paid: "emerald",
  pending: "warn",
  overdue: "warn",
  cancelled: "muted",
};

function AdminPayments() {
  const [rows, setRows] = useState<PaymentRow[] | null>(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("payments")
        .select("id, amount, status, payment_date, contract_id, contracts(user_id, properties(title), users(name))")
        .order("payment_date", { ascending: false });
      setRows(
        (data ?? []).map((p: any) => ({
          id: p.id,
          amount: p.amount,
          status: p.status,
          payment_date: p.payment_date,
          property_title: p.contracts?.properties?.title ?? "Imóvel",
          tenant_name: p.contracts?.users?.name ?? "Usuário",
        }))
      );
    })();
  }, []);

  if (rows === null) {
    return (
      <>
        <PageHeader title="Payments" subtitle="Todos os pagamentos da plataforma." />
        <Card>
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Carregando…
          </div>
        </Card>
      </>
    );
  }

  const total = rows.reduce((sum, p) => sum + Number(p.amount ?? 0), 0);
  const paid = rows.filter((p) => p.status === "paid").reduce((sum, p) => sum + Number(p.amount ?? 0), 0);
  const pending = rows.filter((p) => p.status === "pending").length;
  const statuses = ["all", ...Array.from(new Set(rows.map((r) => r.status).filter(Boolean) as string[]))];
  const filtered = filter === "all" ? rows : rows.filter((r) => r.status === filter);

  return (
    <>
      <PageHeader title="Payments" subtitle="Todos os pagamentos da plataforma, de todos os contratos." />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Total registrado" value={`€${total.toLocaleString("en-US")}`} icon={CreditCard} />
        <StatCard label="Recebido" value={`€${paid.toLocaleString("en-US")}`} icon={CreditCard} accent="emerald" />
        <StatCard label="Pendentes" value={String(pending)} icon={CreditCard} accent="skyblue" />
      </div>

      {rows.length === 0 ? (
        <Card className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald shadow-glow">
            <CreditCard className="h-6 w-6 text-white" />
          </div>
          <h2 className="font-display text-xl font-bold">Nenhum pagamento ainda</h2>
          <p className="max-w-md text-sm text-muted-foreground">
            Os pagamentos aparecerão aqui assim que os contratos de aluguel gerarem cobranças reais. O processamento de
            cartão ainda não está conectado a um provedor de pagamento.
          </p>
        </Card>
      ) : (
        <>
          <div className="mb-4 flex flex-wrap gap-2">
            {statuses.map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`rounded-full border px-3.5 py-1.5 text-xs font-medium capitalize transition-colors ${
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
                  <th className="px-5 py-3">Imóvel</th>
                  <th className="px-5 py-3">Inquilino</th>
                  <th className="px-5 py-3">Valor</th>
                  <th className="px-5 py-3">Data</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-b border-glass-border last:border-0">
                    <td className="px-5 py-4 font-medium">{p.property_title}</td>
                    <td className="px-5 py-4">{p.tenant_name}</td>
                    <td className="px-5 py-4">€{Number(p.amount ?? 0).toLocaleString("en-US")}</td>
                    <td className="px-5 py-4 text-muted-foreground">
                      {p.payment_date ? new Date(p.payment_date).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-5 py-4">
                      <Badge variant={statusVariant[p.status ?? ""] ?? "muted"}>{p.status ?? "—"}</Badge>
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

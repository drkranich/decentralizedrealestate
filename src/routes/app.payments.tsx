import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CreditCard } from "lucide-react";
import { PageHeader, Card, Badge, StatCard } from "@/components/app/ui";
import { useAuthUser } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

type PaymentRow = { id: string; amount: number | null; status: string | null; payment_date: string | null };

export const Route = createFileRoute("/app/payments")({
  component: TenantPayments,
});

function TenantPayments() {
  const { user } = useAuthUser();
  const [payments, setPayments] = useState<PaymentRow[] | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: contracts } = await supabase.from("contracts").select("id").eq("user_id", user.id);
      const contractIds = (contracts ?? []).map((c) => c.id);
      if (contractIds.length === 0) {
        setPayments([]);
        return;
      }
      const { data } = await supabase
        .from("payments")
        .select("id, amount, status, payment_date")
        .in("contract_id", contractIds)
        .order("payment_date", { ascending: false });
      setPayments(data ?? []);
    })();
  }, [user]);

  const nextDue = (payments ?? []).find((p) => p.status === "pending");

  return (
    <>
      <PageHeader title="Pagamentos" subtitle="Boletos e histórico do seu aluguel" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard
          label="Próximo vencimento"
          value={nextDue ? `€${Number(nextDue.amount ?? 0).toLocaleString("en-US")}` : "Nenhum pendente"}
          icon={CreditCard}
        />
        <StatCard label="Pagamentos registrados" value={String((payments ?? []).length)} icon={CreditCard} accent="skyblue" />
      </div>
      <Card className="mt-6">
        {payments === null ? (
          <div className="text-sm text-muted-foreground">Carregando…</div>
        ) : payments.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">Nenhum pagamento registrado ainda.</div>
        ) : (
          <div className="space-y-3">
            {payments.map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-secondary/30 px-4 py-3">
                <div className="text-sm">{p.payment_date ?? "Sem data"}</div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold">€{Number(p.amount ?? 0).toLocaleString("en-US")}</span>
                  <Badge variant={p.status === "paid" ? "emerald" : "muted"}>{p.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </>
  );
}

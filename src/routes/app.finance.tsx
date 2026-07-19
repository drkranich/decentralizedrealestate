import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Wallet, TrendingUp } from "lucide-react";
import { PageHeader, Card, StatCard, Badge } from "@/components/app/ui";
import { useAuthUser } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

type PaymentRow = {
  id: string;
  amount: number | null;
  status: string | null;
  payment_date: string | null;
  property_title: string;
};

export const Route = createFileRoute("/app/finance")({
  component: OwnerFinance,
});

function OwnerFinance() {
  const { user } = useAuthUser();
  const [payments, setPayments] = useState<PaymentRow[] | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: props } = await supabase.from("properties").select("id").eq("owner_id", user.id);
      const propertyIds = (props ?? []).map((p) => p.id);
      if (propertyIds.length === 0) {
        setPayments([]);
        return;
      }
      const { data: contracts } = await supabase
        .from("contracts")
        .select("id, properties(title)")
        .in("property_id", propertyIds);
      const contractIds = (contracts ?? []).map((c) => c.id);
      if (contractIds.length === 0) {
        setPayments([]);
        return;
      }
      const titleByContract = new Map((contracts ?? []).map((c: any) => [c.id, c.properties?.title ?? "Imóvel"]));
      const { data } = await supabase
        .from("payments")
        .select("id, amount, status, payment_date, contract_id")
        .in("contract_id", contractIds)
        .order("payment_date", { ascending: false });
      setPayments(
        (data ?? []).map((p) => ({
          id: p.id,
          amount: p.amount,
          status: p.status,
          payment_date: p.payment_date,
          property_title: titleByContract.get(p.contract_id) ?? "Imóvel",
        }))
      );
    })();
  }, [user]);

  const totalReceived = (payments ?? []).filter((p) => p.status === "paid").reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const totalPending = (payments ?? []).filter((p) => p.status === "pending").reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  return (
    <>
      <PageHeader title="Financeiro" subtitle="Recebimentos reais dos seus imóveis" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard label="Recebido" value={`€${totalReceived.toLocaleString("en-US")}`} icon={Wallet} />
        <StatCard label="Pendente" value={`€${totalPending.toLocaleString("en-US")}`} icon={TrendingUp} accent="skyblue" />
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
                <div>
                  <div className="font-medium">{p.property_title}</div>
                  <div className="text-xs text-muted-foreground">{p.payment_date ?? "Sem data"}</div>
                </div>
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

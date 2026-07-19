import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { TrendingUp, Receipt } from "lucide-react";
import { PageHeader, Card, Badge, StatCard } from "@/components/app/ui";
import { useAuthUser } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

type EarningRow = {
  id: string;
  amount: number | null;
  status: string | null;
  payment_date: string | null;
  property_title: string;
  fraction_percent: number;
  yourShare: number;
};

export const Route = createFileRoute("/app/investor-earnings")({
  component: InvestorEarnings,
});

function InvestorEarnings() {
  const { user } = useAuthUser();
  const [rows, setRows] = useState<EarningRow[] | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: tokens } = await supabase
        .from("property_tokens")
        .select("property_id, fraction_percent")
        .eq("owner_id", user.id)
        .eq("status", "active");

      const fractionByProperty = new Map<string, number>();
      for (const t of tokens ?? []) {
        const cur = fractionByProperty.get(t.property_id) ?? 0;
        fractionByProperty.set(t.property_id, cur + Number(t.fraction_percent));
      }
      const propertyIds = Array.from(fractionByProperty.keys());
      if (propertyIds.length === 0) {
        setRows([]);
        return;
      }

      const { data: contracts } = await supabase
        .from("contracts")
        .select("id, property_id, properties(title)")
        .in("property_id", propertyIds);

      const contractIds = (contracts ?? []).map((c) => c.id);
      const propertyByContract = new Map(
        (contracts ?? []).map((c: any) => [c.id, { property_id: c.property_id, title: c.properties?.title ?? "Imóvel" }])
      );

      if (contractIds.length === 0) {
        setRows([]);
        return;
      }

      const { data: payments } = await supabase
        .from("payments")
        .select("id, contract_id, amount, status, payment_date")
        .in("contract_id", contractIds)
        .order("payment_date", { ascending: false });

      const out: EarningRow[] = (payments ?? []).map((p: any) => {
        const info = propertyByContract.get(p.contract_id);
        const fraction = info ? fractionByProperty.get(info.property_id) ?? 0 : 0;
        const yourShare = (Number(p.amount ?? 0) * fraction) / 100;
        return {
          id: p.id,
          amount: p.amount,
          status: p.status,
          payment_date: p.payment_date,
          property_title: info?.title ?? "Imóvel",
          fraction_percent: fraction,
          yourShare,
        };
      });
      setRows(out);
    })();
  }, [user]);

  const totalReceived = rows?.filter((r) => r.status === "paid").reduce((s, r) => s + r.yourShare, 0) ?? 0;
  const totalPending = rows?.filter((r) => r.status !== "paid").reduce((s, r) => s + r.yourShare, 0) ?? 0;

  return (
    <>
      <PageHeader
        title="Rendimentos"
        subtitle="Sua parte proporcional nos recebimentos dos imóveis em que você investiu"
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard
          label="Recebido (sua parte)"
          value={rows ? `€${totalReceived.toLocaleString("en-US", { maximumFractionDigits: 0 })}` : "…"}
          icon={TrendingUp}
        />
        <StatCard
          label="Pendente (sua parte)"
          value={rows ? `€${totalPending.toLocaleString("en-US", { maximumFractionDigits: 0 })}` : "…"}
          icon={Receipt}
          accent="skyblue"
        />
      </div>

      {rows === null ? (
        <div className="text-sm text-muted-foreground">Carregando…</div>
      ) : rows.length === 0 ? (
        <Card className="py-12 text-center text-sm text-muted-foreground">
          Nenhum recebimento registrado para os imóveis do seu portfólio ainda.
        </Card>
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-glass-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3">Imóvel</th>
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3">Valor total</th>
                <th className="px-4 py-3">Sua fração</th>
                <th className="px-4 py-3">Sua parte</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-glass-border last:border-0">
                  <td className="px-4 py-3 font-medium">{r.property_title}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {r.payment_date ? new Date(r.payment_date).toLocaleDateString("pt-BR") : "—"}
                  </td>
                  <td className="px-4 py-3">€{Number(r.amount ?? 0).toLocaleString("en-US")}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.fraction_percent.toLocaleString("pt-BR")}%</td>
                  <td className="px-4 py-3 font-medium text-emerald">
                    €{r.yourShare.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={r.status === "paid" ? "emerald" : "muted"}>{r.status ?? "—"}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </>
  );
}

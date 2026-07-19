import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Receipt, TrendingUp } from "lucide-react";
import { PageHeader, Card, Badge, StatCard } from "@/components/app/ui";
import { useAuthUser } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

type EarningRow = {
  id: string;
  title: string;
  period: string;
  gross_amount: number;
  net_amount: number;
  currency: string;
  status: string;
  payable_at: string | null;
};

type InvestorEarningRecord = {
  id: string;
  period_start: string | null;
  period_end: string | null;
  gross_amount: number | string | null;
  net_amount: number | string | null;
  currency: string | null;
  status: string;
  payable_at: string | null;
  investment_opportunities?: { title: string | null } | null;
};

type LegacyContractRecord = {
  id: string;
  property_id: string;
  properties?: { title: string | null } | null;
};

type LegacyPaymentRecord = {
  id: string;
  contract_id: string;
  amount: number | string | null;
  status: string;
  payment_date: string | null;
};

export const Route = createFileRoute("/app/investor-earnings")({
  component: InvestorEarnings,
});

function InvestorEarnings() {
  const { user } = useAuthUser();
  const [rows, setRows] = useState<EarningRow[] | null>(null);
  const [schemaMissing, setSchemaMissing] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setSchemaMissing(false);
      const { data, error } = await supabase
        .from("investor_earnings")
        .select(
          "id, period_start, period_end, gross_amount, net_amount, currency, status, payable_at, investment_opportunities(title)",
        )
        .eq("investor_id", user.id)
        .order("payable_at", { ascending: false });

      if (!error) {
        setRows(
          ((data as InvestorEarningRecord[]) ?? []).map((item) => ({
            id: item.id,
            title: item.investment_opportunities?.title ?? "Investimento",
            period: formatPeriod(item.period_start, item.period_end),
            gross_amount: Number(item.gross_amount ?? 0),
            net_amount: Number(item.net_amount ?? 0),
            currency: item.currency ?? "USD",
            status: item.status,
            payable_at: item.payable_at,
          })),
        );
        return;
      }

      setSchemaMissing(true);
      setRows(await loadLegacyEarnings(user.id));
    })();
  }, [user]);

  const totalReceived =
    rows?.filter((row) => isPaid(row.status)).reduce((sum, row) => sum + row.net_amount, 0) ?? 0;
  const totalPending =
    rows?.filter((row) => !isPaid(row.status)).reduce((sum, row) => sum + row.net_amount, 0) ?? 0;
  const currency = rows?.[0]?.currency ?? "USD";

  return (
    <>
      <PageHeader
        title="Rendimentos"
        subtitle="Receitas, distribuições e valores pendentes vinculados às suas posições."
      />

      {schemaMissing && (
        <Card className="mb-6 border-dashed border-skyblue/30 text-sm text-muted-foreground">
          Exibindo rendimentos calculados a partir de contratos legados até a migração ser aplicada.
        </Card>
      )}

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard
          label="Recebido"
          value={rows ? formatMoney(totalReceived, currency) : "..."}
          icon={TrendingUp}
        />
        <StatCard
          label="Pendente"
          value={rows ? formatMoney(totalPending, currency) : "..."}
          icon={Receipt}
          accent="skyblue"
        />
      </div>

      {rows === null ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Carregando...
        </div>
      ) : rows.length === 0 ? (
        <Card className="py-12 text-center text-sm text-muted-foreground">
          Nenhum rendimento registrado para seu portfólio ainda.
        </Card>
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-glass-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3">Ativo</th>
                <th className="px-4 py-3">Período</th>
                <th className="px-4 py-3">Bruto</th>
                <th className="px-4 py-3">Líquido</th>
                <th className="px-4 py-3">Pagamento</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-glass-border last:border-0">
                  <td className="px-4 py-3 font-medium">{row.title}</td>
                  <td className="px-4 py-3 text-muted-foreground">{row.period}</td>
                  <td className="px-4 py-3">{formatMoney(row.gross_amount, row.currency)}</td>
                  <td className="px-4 py-3 font-medium text-emerald">
                    {formatMoney(row.net_amount, row.currency)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {row.payable_at ? new Date(row.payable_at).toLocaleDateString("pt-BR") : "-"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={isPaid(row.status) ? "emerald" : "muted"}>{row.status}</Badge>
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

async function loadLegacyEarnings(userId: string): Promise<EarningRow[]> {
  const { data: tokens } = await supabase
    .from("property_tokens")
    .select("property_id, fraction_percent")
    .eq("owner_id", userId)
    .eq("status", "active");

  const fractionByProperty = new Map<string, number>();
  for (const token of tokens ?? []) {
    const cur = fractionByProperty.get(token.property_id) ?? 0;
    fractionByProperty.set(token.property_id, cur + Number(token.fraction_percent));
  }
  const propertyIds = Array.from(fractionByProperty.keys());
  if (propertyIds.length === 0) return [];

  const { data: contracts } = await supabase
    .from("contracts")
    .select("id, property_id, properties(title)")
    .in("property_id", propertyIds);

  const contractRows = (contracts ?? []) as LegacyContractRecord[];
  const contractIds = contractRows.map((contract) => contract.id);
  const propertyByContract = new Map(
    contractRows.map((contract) => [
      contract.id,
      { property_id: contract.property_id, title: contract.properties?.title ?? "Imóvel" },
    ]),
  );

  if (contractIds.length === 0) return [];

  const { data: payments } = await supabase
    .from("payments")
    .select("id, contract_id, amount, status, payment_date")
    .in("contract_id", contractIds)
    .order("payment_date", { ascending: false });

  return ((payments as LegacyPaymentRecord[]) ?? []).map((payment) => {
    const info = propertyByContract.get(payment.contract_id);
    const fraction = info ? (fractionByProperty.get(info.property_id) ?? 0) : 0;
    const net = (Number(payment.amount ?? 0) * fraction) / 100;
    return {
      id: payment.id,
      title: info?.title ?? "Imóvel",
      period: payment.payment_date
        ? new Date(payment.payment_date).toLocaleDateString("pt-BR")
        : "-",
      gross_amount: Number(payment.amount ?? 0),
      net_amount: net,
      currency: "EUR",
      status: payment.status,
      payable_at: payment.payment_date,
    };
  });
}

function formatPeriod(start: string | null, end: string | null) {
  if (!start && !end) return "-";
  const first = start ? new Date(start).toLocaleDateString("pt-BR") : "?";
  const last = end ? new Date(end).toLocaleDateString("pt-BR") : "?";
  return `${first} - ${last}`;
}

function isPaid(status: string) {
  return ["paid", "approved", "approved_with_conditions"].includes(status);
}

function formatMoney(value: number, currency: string) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: currency || "USD",
    maximumFractionDigits: 0,
  }).format(Number(value ?? 0));
}

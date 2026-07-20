import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Banknote,
  CreditCard,
  Download,
  Loader2,
  ReceiptText,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PageHeader, StatCard, Card, SectionTitle, Badge } from "@/components/app/ui";
import { downloadTablePdf } from "@/lib/pdf";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/admin/finance")({
  component: Finance,
});

type Payment = {
  id: string;
  amount: number | null;
  status: string | null;
  payment_date: string | null;
  contracts?: { properties?: { title: string | null } | null } | null;
};

type ServiceCommission = {
  id: string;
  amount: number | null;
  currency: string;
  rate: number | null;
  status: string;
  created_at: string;
  service_provider_profiles?: { business_name: string | null } | null;
};

type InvestorEarning = {
  id: string;
  gross_amount: number | null;
  net_amount: number | null;
  currency: string;
  status: string;
  payable_at: string | null;
  paid_at: string | null;
};

type FinanceData = {
  payments: Payment[];
  serviceCommissions: ServiceCommission[];
  investorEarnings: InvestorEarning[];
};

const statusLabels: Record<string, string> = {
  paid: "Pago",
  pending: "Pendente",
  failed: "Falhou",
  refunded: "Reembolsado",
  invoiced: "Faturado",
  waived: "Isento",
  approved: "Aprovado",
  pending_review: "Em revisão",
};

function Finance() {
  const [data, setData] = useState<FinanceData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const [payments, serviceCommissions, investorEarnings] = await Promise.all([
        supabase
          .from("payments")
          .select("id, amount, status, payment_date, contracts(properties(title))")
          .order("payment_date", { ascending: false, nullsFirst: false })
          .limit(200),
        supabase
          .from("service_commission_ledger")
          .select(
            "id, amount, currency, rate, status, created_at, service_provider_profiles(business_name)",
          )
          .order("created_at", { ascending: false })
          .limit(100),
        supabase
          .from("investor_earnings")
          .select("id, gross_amount, net_amount, currency, status, payable_at, paid_at")
          .order("created_at", { ascending: false })
          .limit(100),
      ]);

      if (cancelled) return;
      const firstError = [payments, serviceCommissions, investorEarnings].find(
        (item) => item.error,
      )?.error;
      if (firstError) {
        setError(firstError.message);
        setData({ payments: [], serviceCommissions: [], investorEarnings: [] });
        return;
      }

      setError(null);
      setData({
        payments: ((payments.data ?? []) as unknown as Payment[]) ?? [],
        serviceCommissions:
          ((serviceCommissions.data ?? []) as unknown as ServiceCommission[]) ?? [],
        investorEarnings: ((investorEarnings.data ?? []) as InvestorEarning[]) ?? [],
      });
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const metrics = useMemo(() => {
    const payments = data?.payments ?? [];
    const commissions = data?.serviceCommissions ?? [];
    const earnings = data?.investorEarnings ?? [];
    const paid = payments
      .filter((payment) => payment.status === "paid")
      .reduce((sum, payment) => sum + Number(payment.amount ?? 0), 0);
    const pending = payments
      .filter((payment) => payment.status !== "paid")
      .reduce((sum, payment) => sum + Number(payment.amount ?? 0), 0);
    const serviceCommission = commissions.reduce((sum, row) => sum + Number(row.amount ?? 0), 0);
    const investorNet = earnings.reduce((sum, row) => sum + Number(row.net_amount ?? 0), 0);
    return { paid, pending, serviceCommission, investorNet };
  }, [data]);

  const monthly = useMemo(() => buildMonthly(data), [data]);
  const recentRows = [
    ...(data?.payments ?? []).map((payment) => ({
      id: `payment-${payment.id}`,
      date: payment.payment_date,
      type: "Pagamento",
      description: payment.contracts?.properties?.title ?? "Contrato",
      status: payment.status,
      amount: Number(payment.amount ?? 0),
      currency: "BRL",
    })),
    ...(data?.serviceCommissions ?? []).map((commission) => ({
      id: `commission-${commission.id}`,
      date: commission.created_at,
      type: "Comissão marketplace",
      description: commission.service_provider_profiles?.business_name ?? "Prestador",
      status: commission.status,
      amount: Number(commission.amount ?? 0),
      currency: commission.currency,
    })),
    ...(data?.investorEarnings ?? []).map((earning) => ({
      id: `earning-${earning.id}`,
      date: earning.paid_at ?? earning.payable_at,
      type: "Rendimento investidor",
      description: "Distribuição de ativo",
      status: earning.status,
      amount: Number(earning.net_amount ?? 0),
      currency: earning.currency,
    })),
  ]
    .sort((a, b) => new Date(b.date ?? 0).getTime() - new Date(a.date ?? 0).getTime())
    .slice(0, 12);

  if (!data) {
    return (
      <>
        <PageHeader
          title="Financeiro"
          subtitle="Carregando pagamentos, comissões e rendimentos internos."
        />
        <Card>
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Carregando...
          </div>
        </Card>
      </>
    );
  }

  const pdfRows = [
    ["Recebido", formatCurrency(metrics.paid)],
    ["A receber", formatCurrency(metrics.pending)],
    ["Comissões de marketplace", formatCurrency(metrics.serviceCommission)],
    ["Rendimentos de investidores", formatCurrency(metrics.investorNet)],
  ];

  return (
    <>
      <PageHeader
        title="Financeiro"
        subtitle="Ledger operacional interno: pagamentos, comissões e rendimentos. Cobrança Stripe fica para a última etapa."
      >
        <button
          onClick={() =>
            downloadTablePdf({
              title: "Resumo financeiro interno",
              subtitle: `Exportado em ${new Date().toLocaleDateString("pt-BR")}`,
              header: ["Conta", "Valor"],
              rows: pdfRows,
              filename: "financeiro-interno.pdf",
            })
          }
          className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm hover:bg-secondary"
        >
          <Download className="h-4 w-4" /> Exportar PDF
        </button>
      </PageHeader>

      {error && (
        <Card className="mb-6 border-destructive/30 bg-destructive/5">
          <p className="text-sm text-destructive">{error}</p>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Recebido" value={formatCurrency(metrics.paid)} icon={Banknote} />
        <StatCard
          label="A receber"
          value={formatCurrency(metrics.pending)}
          icon={CreditCard}
          accent="skyblue"
        />
        <StatCard
          label="Comissões"
          value={formatCurrency(metrics.serviceCommission)}
          icon={ReceiptText}
        />
        <StatCard
          label="Rendimentos"
          value={formatCurrency(metrics.investorNet)}
          icon={TrendingUp}
          accent="skyblue"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <SectionTitle title="Fluxo interno por mês" />
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.08} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} />
                <YAxis tickLine={false} axisLine={false} fontSize={11} />
                <Tooltip
                  formatter={(value) => formatCurrency(Number(value))}
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid var(--border)",
                    background: "var(--card)",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar
                  dataKey="payments"
                  name="Pagamentos"
                  fill="var(--emerald)"
                  radius={[6, 6, 0, 0]}
                />
                <Bar
                  dataKey="commissions"
                  name="Comissões"
                  fill="var(--skyblue)"
                  radius={[6, 6, 0, 0]}
                />
                <Bar
                  dataKey="earnings"
                  name="Rendimentos"
                  fill="var(--emerald-glow)"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <SectionTitle title="Saúde do ledger" />
          <div className="space-y-3">
            <LedgerHealth
              label="Pagamentos registrados"
              value={data.payments.length}
              icon={CreditCard}
            />
            <LedgerHealth
              label="Comissões pendentes"
              value={data.serviceCommissions.filter((row) => row.status === "pending").length}
              icon={TrendingDown}
            />
            <LedgerHealth
              label="Distribuições"
              value={data.investorEarnings.length}
              icon={TrendingUp}
            />
          </div>
        </Card>
      </div>

      <Card className="mt-6 overflow-hidden p-0">
        <div className="flex items-center justify-between p-6 pb-4">
          <h2 className="font-display text-lg font-semibold">Movimentos recentes</h2>
          <Badge variant="muted">{recentRows.length} registros</Badge>
        </div>
        {recentRows.length === 0 ? (
          <div className="px-6 pb-10 text-sm text-muted-foreground">
            Nenhum movimento financeiro foi registrado ainda. Assim que contratos, comissões ou
            rendimentos forem lançados, eles aparecerão aqui.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-y border-border bg-secondary/30 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-6 py-3 font-medium">Data</th>
                <th className="px-6 py-3 font-medium">Tipo</th>
                <th className="px-6 py-3 font-medium">Descrição</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 text-right font-medium">Valor</th>
              </tr>
            </thead>
            <tbody>
              {recentRows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-border last:border-0 hover:bg-secondary/30"
                >
                  <td className="px-6 py-4 text-muted-foreground">
                    {row.date ? new Date(row.date).toLocaleDateString("pt-BR") : "-"}
                  </td>
                  <td className="px-6 py-4 font-medium">{row.type}</td>
                  <td className="px-6 py-4 text-muted-foreground">{row.description}</td>
                  <td className="px-6 py-4">
                    <Badge
                      variant={
                        row.status === "paid" || row.status === "paid_out" ? "emerald" : "muted"
                      }
                    >
                      {statusLabel(row.status)}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right font-semibold">
                    {formatCurrency(row.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </>
  );
}

function LedgerHealth({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: typeof CreditCard;
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-border/50 bg-secondary/20 p-3">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald/15 text-emerald">
          <Icon className="h-4 w-4" />
        </div>
        <span className="text-sm font-medium">{label}</span>
      </div>
      <Badge variant="muted">{value}</Badge>
    </div>
  );
}

function statusLabel(status: string | null | undefined) {
  return status ? (statusLabels[status] ?? status) : "Sem status";
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);
}

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function buildMonthly(data: FinanceData | null) {
  const base = Array.from({ length: 6 }, (_, index) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - index));
    return {
      key: monthKey(date),
      label: date.toLocaleDateString("pt-BR", { month: "short" }),
      payments: 0,
      commissions: 0,
      earnings: 0,
    };
  });
  const byKey = new Map(base.map((item) => [item.key, item]));

  for (const payment of data?.payments ?? []) {
    if (!payment.payment_date) continue;
    const bucket = byKey.get(monthKey(new Date(payment.payment_date)));
    if (bucket) bucket.payments += Number(payment.amount ?? 0);
  }
  for (const commission of data?.serviceCommissions ?? []) {
    const bucket = byKey.get(monthKey(new Date(commission.created_at)));
    if (bucket) bucket.commissions += Number(commission.amount ?? 0);
  }
  for (const earning of data?.investorEarnings ?? []) {
    const date = earning.paid_at ?? earning.payable_at;
    if (!date) continue;
    const bucket = byKey.get(monthKey(new Date(date)));
    if (bucket) bucket.earnings += Number(earning.net_amount ?? 0);
  }

  return base;
}

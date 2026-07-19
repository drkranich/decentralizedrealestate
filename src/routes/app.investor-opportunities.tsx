import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Building2, CalendarClock, Coins, Loader2, ShieldCheck, Ticket } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, Card, Badge, StatCard } from "@/components/app/ui";
import { useAuthUser } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/app/investor-opportunities")({
  component: InvestorOpportunities,
});

type Opportunity = {
  id: string;
  title: string;
  location: string | null;
  token_symbol: string;
  status: string;
  summary: string | null;
  target_amount: number;
  raised_amount: number;
  min_ticket: number;
  currency: string;
  expected_yield_percent: number | null;
  risk_level: "low" | "medium" | "high" | "critical";
  available_to_retail: boolean;
  closing_date: string | null;
};

type Order = {
  id: string;
  opportunity_id: string;
  status: string;
  amount: number;
};

function InvestorOpportunities() {
  const { user } = useAuthUser();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [schemaMissing, setSchemaMissing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setSchemaMissing(false);

    const { data, error } = await supabase
      .from("investment_opportunities")
      .select(
        "id, title, location, token_symbol, status, summary, target_amount, raised_amount, min_ticket, currency, expected_yield_percent, risk_level, available_to_retail, closing_date",
      )
      .in("status", ["approved", "approved_with_conditions"])
      .order("published_at", { ascending: false });

    if (error) {
      setSchemaMissing(true);
      setOpportunities([]);
      setOrders([]);
      setLoading(false);
      return;
    }

    setOpportunities((data as Opportunity[]) ?? []);

    if (user) {
      const { data: orderRows } = await supabase
        .from("investor_orders")
        .select("id, opportunity_id, status, amount")
        .eq("investor_id", user.id)
        .order("created_at", { ascending: false });
      setOrders((orderRows as Order[]) ?? []);
    }

    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const orderByOpportunity = useMemo(
    () => new Map(orders.map((order) => [order.opportunity_id, order])),
    [orders],
  );

  const totalTarget = opportunities.reduce((sum, item) => sum + Number(item.target_amount ?? 0), 0);
  const totalRaised = opportunities.reduce((sum, item) => sum + Number(item.raised_amount ?? 0), 0);

  const registerInterest = async (opportunity: Opportunity) => {
    if (!user) {
      toast.error("Sessão não encontrada.");
      return;
    }

    const existing = orderByOpportunity.get(opportunity.id);
    if (existing) {
      toast.info("Você já registrou interesse nesta oportunidade.");
      return;
    }

    const { error } = await supabase.from("investor_orders").insert({
      investor_id: user.id,
      opportunity_id: opportunity.id,
      status: "pending_compliance",
      amount: opportunity.min_ticket,
      unit_price: opportunity.min_ticket,
      units: 1,
      currency: opportunity.currency,
    });

    if (error) {
      toast.error(error.message || "Não foi possível registrar interesse.");
      return;
    }

    toast.success("Interesse registrado. O próximo passo é compliance/KYC.");
    load();
  };

  return (
    <>
      <PageHeader
        title="Oportunidades"
        subtitle="Ofertas tokenizadas publicadas para análise do investidor antes de qualquer aporte."
      />

      {schemaMissing && (
        <Card className="mb-6 border-dashed border-destructive/30 text-sm text-muted-foreground">
          A migração LegalTech/Investidor ainda não foi aplicada no Supabase.
        </Card>
      )}

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Oportunidades"
          value={loading ? "..." : String(opportunities.length)}
          icon={Building2}
        />
        <StatCard
          label="Meta total"
          value={loading ? "..." : formatMoney(totalTarget, "USD")}
          icon={Coins}
          accent="skyblue"
        />
        <StatCard
          label="Captado"
          value={loading ? "..." : formatMoney(totalRaised, "USD")}
          icon={Ticket}
        />
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Carregando oportunidades...
        </div>
      ) : opportunities.length === 0 ? (
        <Card className="py-12 text-center text-sm text-muted-foreground">
          Nenhuma oportunidade publicada para investidores neste momento.
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {opportunities.map((opportunity) => {
            const order = orderByOpportunity.get(opportunity.id);
            const progress =
              opportunity.target_amount > 0
                ? Math.min(
                    100,
                    (Number(opportunity.raised_amount) / Number(opportunity.target_amount)) * 100,
                  )
                : 0;

            return (
              <Card key={opportunity.id}>
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-md bg-secondary/70 px-2 py-1 font-mono text-xs font-semibold">
                        {opportunity.token_symbol}
                      </span>
                      <Badge variant={riskVariant(opportunity.risk_level)}>
                        Risco {riskLabel(opportunity.risk_level)}
                      </Badge>
                      {!opportunity.available_to_retail && (
                        <Badge variant="warn">Suitability</Badge>
                      )}
                    </div>
                    <h2 className="mt-3 font-display text-lg font-semibold">{opportunity.title}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">{opportunity.summary}</p>
                  </div>
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald/15 text-emerald">
                    <Building2 className="h-5 w-5" />
                  </div>
                </div>

                <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                  <Metric label="Local" value={opportunity.location ?? "-"} />
                  <Metric
                    label="Yield esperado"
                    value={
                      opportunity.expected_yield_percent != null
                        ? `${Number(opportunity.expected_yield_percent).toLocaleString("pt-BR")}%`
                        : "-"
                    }
                  />
                  <Metric
                    label="Ticket mínimo"
                    value={formatMoney(opportunity.min_ticket, opportunity.currency)}
                  />
                </div>

                <div className="mt-4">
                  <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                    <span>
                      {formatMoney(opportunity.raised_amount, opportunity.currency)} captados
                    </span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-emerald"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-glass-border pt-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CalendarClock className="h-3.5 w-3.5" />
                    {opportunity.closing_date
                      ? `Fecha em ${new Date(opportunity.closing_date).toLocaleDateString("pt-BR")}`
                      : "Fechamento a definir"}
                  </div>
                  {order ? (
                    <Badge variant="blue">
                      <ShieldCheck className="mr-1 h-3.5 w-3.5" />
                      {order.status}
                    </Badge>
                  ) : (
                    <button
                      type="button"
                      onClick={() => registerInterest(opportunity)}
                      className="rounded-full bg-emerald px-4 py-2 text-sm font-semibold text-white shadow-glow"
                    >
                      Registrar interesse
                    </button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-glass-border bg-glass-fill p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 truncate font-semibold">{value}</div>
    </div>
  );
}

function formatMoney(value: number, currency: string) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: currency || "USD",
    maximumFractionDigits: 0,
  }).format(Number(value ?? 0));
}

function riskLabel(risk: Opportunity["risk_level"]) {
  return risk === "critical"
    ? "crítico"
    : risk === "high"
      ? "alto"
      : risk === "medium"
        ? "médio"
        : "baixo";
}

function riskVariant(risk: Opportunity["risk_level"]) {
  if (risk === "critical" || risk === "high") return "warn" as const;
  if (risk === "medium") return "blue" as const;
  return "emerald" as const;
}

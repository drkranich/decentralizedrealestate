import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Building2, Coins, Loader2, WalletCards } from "lucide-react";
import { PageHeader, Card, Badge, StatCard } from "@/components/app/ui";
import { useAuthUser } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

type Holding = {
  id: string;
  token_code: string;
  title: string;
  location: string;
  units: number;
  fraction_percent: number;
  principal_amount: number;
  currency: string;
  status: string;
  acquired_at: string;
};

type InvestorPositionRow = {
  id: string;
  token_code: string;
  units: number | string | null;
  fraction_percent: number | string | null;
  principal_amount: number | string | null;
  currency: string | null;
  status: string;
  acquired_at: string;
  investment_opportunities?: { title: string | null; location: string | null } | null;
};

type LegacyTokenRow = {
  id: string;
  token_code: string;
  fraction_percent: number | string | null;
  status: string;
  created_at: string;
  properties?: {
    title: string | null;
    price: number | string | null;
    city: string | null;
    state: string | null;
  } | null;
};

export const Route = createFileRoute("/app/investor-portfolio")({
  component: InvestorPortfolio,
});

function InvestorPortfolio() {
  const { user } = useAuthUser();
  const [holdings, setHoldings] = useState<Holding[] | null>(null);
  const [schemaMissing, setSchemaMissing] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setSchemaMissing(false);
      const { data, error } = await supabase
        .from("investor_positions")
        .select(
          "id, token_code, units, fraction_percent, principal_amount, currency, status, acquired_at, investment_opportunities(title, location)",
        )
        .eq("investor_id", user.id)
        .order("acquired_at", { ascending: false });

      if (!error) {
        setHoldings(
          ((data as InvestorPositionRow[]) ?? []).map((row) => ({
            id: row.id,
            token_code: row.token_code,
            title: row.investment_opportunities?.title ?? row.token_code,
            location: row.investment_opportunities?.location ?? "Local não informado",
            units: Number(row.units ?? 0),
            fraction_percent: Number(row.fraction_percent ?? 0),
            principal_amount: Number(row.principal_amount ?? 0),
            currency: row.currency ?? "USD",
            status: row.status,
            acquired_at: row.acquired_at,
          })),
        );
        return;
      }

      setSchemaMissing(true);
      const { data: legacy } = await supabase
        .from("property_tokens")
        .select(
          "id, token_code, ownership_type, fraction_percent, status, created_at, property_id, properties(title, price, listing_type, city, state, status)",
        )
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false });

      setHoldings(
        ((legacy as LegacyTokenRow[]) ?? []).map((row) => {
          const principal =
            (Number(row.properties?.price ?? 0) * Number(row.fraction_percent ?? 0)) / 100;
          return {
            id: row.id,
            token_code: row.token_code,
            title: row.properties?.title ?? "Imóvel",
            location:
              [row.properties?.city, row.properties?.state].filter(Boolean).join(", ") ||
              "Endereço não informado",
            units: 1,
            fraction_percent: Number(row.fraction_percent ?? 0),
            principal_amount: principal,
            currency: "EUR",
            status: row.status,
            acquired_at: row.created_at,
          };
        }),
      );
    })();
  }, [user]);

  const totalValue = holdings?.reduce((sum, holding) => sum + holding.principal_amount, 0) ?? 0;
  const activeCount = holdings?.filter((holding) => isActive(holding.status)).length ?? 0;

  return (
    <>
      <PageHeader
        title="Meu portfólio"
        subtitle="Posições, tokens e frações registradas em seu nome."
      />

      {schemaMissing && (
        <Card className="mb-6 border-dashed border-skyblue/30 text-sm text-muted-foreground">
          Exibindo dados legados de `property_tokens` até a migração de investidor ser aplicada.
        </Card>
      )}

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Tokens ativos"
          value={holdings ? String(activeCount) : "..."}
          icon={Coins}
        />
        <StatCard
          label="Valor principal"
          value={holdings ? formatMoney(totalValue, holdings[0]?.currency ?? "USD") : "..."}
          icon={Building2}
          accent="skyblue"
        />
        <StatCard
          label="Total de posições"
          value={holdings ? String(holdings.length) : "..."}
          icon={WalletCards}
        />
      </div>

      {holdings === null ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Carregando...
        </div>
      ) : holdings.length === 0 ? (
        <Card className="py-12 text-center text-sm text-muted-foreground">
          Nenhuma posição de investimento registrada em seu nome ainda.
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {holdings.map((holding) => (
            <Card key={holding.id}>
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald/15 text-emerald">
                  <Building2 className="h-5 w-5" />
                </div>
                <Badge variant={isActive(holding.status) ? "emerald" : "muted"}>
                  {holding.status}
                </Badge>
              </div>
              <div className="mt-3 font-display text-lg font-semibold">{holding.title}</div>
              <div className="text-xs text-muted-foreground">{holding.location}</div>
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Token</span>
                <span className="font-mono text-xs font-semibold">{holding.token_code}</span>
              </div>
              <div className="mt-1 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Unidades</span>
                <span className="font-medium">{holding.units.toLocaleString("pt-BR")}</span>
              </div>
              <div className="mt-1 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Fração</span>
                <span className="font-medium">
                  {holding.fraction_percent.toLocaleString("pt-BR")}%
                </span>
              </div>
              <div className="mt-1 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Principal</span>
                <span className="font-medium">
                  {formatMoney(holding.principal_amount, holding.currency)}
                </span>
              </div>
              <div className="mt-3 border-t border-glass-border pt-2 text-[11px] text-muted-foreground">
                Adquirido em {new Date(holding.acquired_at).toLocaleDateString("pt-BR")}
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}

function isActive(status: string) {
  return ["active", "approved", "approved_with_conditions"].includes(status);
}

function formatMoney(value: number, currency: string) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: currency || "USD",
    maximumFractionDigits: 0,
  }).format(Number(value ?? 0));
}

import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Coins, Building2 } from "lucide-react";
import { PageHeader, Card, Badge, StatCard } from "@/components/app/ui";
import { useAuthUser } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

type Holding = {
  id: string;
  token_code: string;
  ownership_type: string;
  fraction_percent: number;
  status: string;
  created_at: string;
  property_id: string;
  property: { title: string; price: number | null; listing_type: string; city: string | null; state: string | null; status: string | null } | null;
};

export const Route = createFileRoute("/app/investor-portfolio")({
  component: InvestorPortfolio,
});

function InvestorPortfolio() {
  const { user } = useAuthUser();
  const [holdings, setHoldings] = useState<Holding[] | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("property_tokens")
      .select(
        "id, token_code, ownership_type, fraction_percent, status, created_at, property_id, properties(title, price, listing_type, city, state, status)"
      )
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setHoldings((data as any) ?? []));
  }, [user]);

  const totalValue =
    holdings?.reduce((sum, h) => sum + (Number(h.property?.price ?? 0) * Number(h.fraction_percent)) / 100, 0) ?? 0;
  const activeCount = holdings?.filter((h) => h.status === "active").length ?? 0;

  return (
    <>
      <PageHeader title="Meu portfólio" subtitle="Frações de imóveis registradas em seu nome" />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Tokens ativos" value={holdings ? String(activeCount) : "…"} icon={Coins} />
        <StatCard
          label="Valor total (sua parte)"
          value={holdings ? `€${totalValue.toLocaleString("en-US", { maximumFractionDigits: 0 })}` : "…"}
          icon={Building2}
          accent="skyblue"
        />
        <StatCard label="Total de posições" value={holdings ? String(holdings.length) : "…"} icon={Coins} />
      </div>

      {holdings === null ? (
        <div className="text-sm text-muted-foreground">Carregando…</div>
      ) : holdings.length === 0 ? (
        <Card className="py-12 text-center text-sm text-muted-foreground">
          Nenhuma fração de imóvel registrada em seu nome ainda.
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {holdings.map((h) => {
            const yourValue = (Number(h.property?.price ?? 0) * Number(h.fraction_percent)) / 100;
            return (
              <Card key={h.id}>
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald/15 text-emerald">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <Badge variant={h.status === "active" ? "emerald" : "muted"}>{h.status}</Badge>
                </div>
                <div className="mt-3 font-display text-lg font-semibold">{h.property?.title ?? "Imóvel"}</div>
                <div className="text-xs text-muted-foreground">
                  {[h.property?.city, h.property?.state].filter(Boolean).join(", ") || "Endereço não informado"}
                </div>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Sua fração</span>
                  <span className="font-medium">{Number(h.fraction_percent).toLocaleString("pt-BR")}%</span>
                </div>
                <div className="mt-1 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Seu valor</span>
                  <span className="font-medium">€{yourValue.toLocaleString("en-US", { maximumFractionDigits: 0 })}</span>
                </div>
                <div className="mt-1 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Tipo</span>
                  <span className="font-medium">{h.ownership_type === "fractional" ? "Fracionário" : "Integral"}</span>
                </div>
                <div className="mt-3 border-t border-glass-border pt-2 text-[11px] text-muted-foreground">
                  Token {h.token_code} · adquirido em {new Date(h.created_at).toLocaleDateString("pt-BR")}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}

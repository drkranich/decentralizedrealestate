import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Activity, AlertTriangle, ArrowRight, Loader2, Sparkles, TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PageHeader, Card, Badge, StatCard, SectionTitle } from "@/components/app/ui";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/admin/smart-pricing")({
  component: SmartPricing,
});

type PropertyRow = {
  id: string;
  title: string;
  price: number | null;
  nightly_rate: number | null;
  cleaning_fee: number | null;
  listing_type: string;
  city: string | null;
  status: string | null;
  created_at: string | null;
};

type LeadRow = { id: string; property_id: string | null; status: string | null };
type MaintenanceRow = { id: string; property_id: string | null; status: string; priority: string };

type PricingData = {
  properties: PropertyRow[];
  leads: LeadRow[];
  maintenance: MaintenanceRow[];
};

function SmartPricing() {
  const [data, setData] = useState<PricingData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const [properties, leads, maintenance] = await Promise.all([
        supabase
          .from("properties")
          .select(
            "id, title, price, nightly_rate, cleaning_fee, listing_type, city, status, created_at",
          )
          .order("created_at", { ascending: false }),
        supabase.from("leads").select("id, property_id, status"),
        supabase.from("maintenance_requests").select("id, property_id, status, priority"),
      ]);

      if (cancelled) return;
      const firstError = [properties, leads, maintenance].find((item) => item.error)?.error;
      if (firstError) {
        setError(firstError.message);
        setData({ properties: [], leads: [], maintenance: [] });
        return;
      }

      setError(null);
      setData({
        properties: ((properties.data ?? []) as PropertyRow[]) ?? [],
        leads: ((leads.data ?? []) as LeadRow[]) ?? [],
        maintenance: ((maintenance.data ?? []) as MaintenanceRow[]) ?? [],
      });
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const pricedProperties = (data?.properties ?? []).filter(
    (property) => currentPrice(property) > 0,
  );
  const missingPrice = (data?.properties ?? []).length - pricedProperties.length;
  const averagePrice = pricedProperties.length
    ? pricedProperties.reduce((sum, property) => sum + currentPrice(property), 0) /
      pricedProperties.length
    : 0;
  const recommendations = useMemo(() => buildRecommendations(data), [data]);
  const chartData = pricedProperties.slice(0, 12).map((property) => ({
    name: property.title.length > 18 ? `${property.title.slice(0, 18)}...` : property.title,
    price: currentPrice(property),
  }));

  if (!data) {
    return (
      <>
        <PageHeader
          title="Revisão de preços"
          subtitle="Carregando imóveis e sinais operacionais."
        />
        <Card>
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Carregando...
          </div>
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Revisão de preços"
        subtitle="Sugestões calculadas com dados internos de imóveis, leads e manutenção. IA externa fica fora desta etapa."
      >
        <Badge variant="emerald">
          <Sparkles className="mr-1 inline h-3 w-3" /> Regras internas
        </Badge>
      </PageHeader>

      {error && (
        <Card className="mb-6 border-destructive/30 bg-destructive/5">
          <p className="text-sm text-destructive">{error}</p>
        </Card>
      )}

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Preço médio" value={formatCurrency(averagePrice)} icon={TrendingUp} />
        <StatCard
          label="Imóveis precificados"
          value={String(pricedProperties.length)}
          icon={Activity}
          accent="skyblue"
        />
        <StatCard label="Sem preço" value={String(missingPrice)} icon={AlertTriangle} />
        <StatCard
          label="Revisões sugeridas"
          value={String(recommendations.length)}
          icon={Sparkles}
          accent="skyblue"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <SectionTitle title="Preço atual por imóvel" />
          {chartData.length === 0 ? (
            <div className="py-16 text-center text-sm text-muted-foreground">
              Cadastre preço ou diária nos imóveis para gerar análise.
            </div>
          ) : (
            <div className="h-72">
              <ResponsiveContainer>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.08} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={11} />
                  <YAxis tickLine={false} axisLine={false} fontSize={11} />
                  <Tooltip
                    formatter={(value) => formatCurrency(Number(value))}
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid var(--border)",
                      background: "var(--card)",
                    }}
                  />
                  <Bar dataKey="price" fill="var(--emerald)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <Card>
          <SectionTitle title="Sinais usados" />
          <div className="space-y-3 text-sm">
            <Signal label="Leads vinculados" value={data.leads.length} />
            <Signal
              label="Chamados abertos"
              value={
                data.maintenance.filter((item) => ["open", "in_progress"].includes(item.status))
                  .length
              }
            />
            <Signal
              label="Imóveis disponíveis"
              value={data.properties.filter((p) => p.status === "available").length}
            />
            <Signal
              label="Cidades preenchidas"
              value={data.properties.filter((p) => !!p.city).length}
            />
          </div>
        </Card>
      </div>

      <Card className="mt-6">
        <SectionTitle title="Recomendações operacionais" />
        {recommendations.length === 0 ? (
          <div className="py-10 text-center text-sm text-muted-foreground">
            Nenhuma revisão urgente. Conforme leads, contratos e manutenção forem registrados, as
            recomendações aparecerão aqui.
          </div>
        ) : (
          <div className="space-y-3">
            {recommendations.map((item) => (
              <div
                key={`${item.property.id}-${item.kind}`}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/50 bg-secondary/20 p-4"
              >
                <div>
                  <div className="font-semibold">{item.property.title}</div>
                  <div className="text-sm text-muted-foreground">{item.reason}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={item.variant}>{item.action}</Badge>
                  <Link
                    to="/admin/properties/$id"
                    params={{ id: item.property.id }}
                    search={{ q: "", add: "" }}
                    className="flex items-center gap-1 rounded-full border border-glass-border bg-glass-fill px-3 py-1.5 text-xs font-medium hover:bg-secondary"
                  >
                    Editar <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </>
  );
}

function Signal({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border/50 bg-secondary/20 px-3 py-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}

function currentPrice(property: PropertyRow) {
  return Number(property.nightly_rate ?? property.price ?? 0);
}

function buildRecommendations(data: PricingData | null) {
  if (!data) return [];
  return data.properties
    .flatMap((property) => {
      const price = currentPrice(property);
      const leads = data.leads.filter((lead) => lead.property_id === property.id).length;
      const openMaintenance = data.maintenance.filter(
        (item) => item.property_id === property.id && ["open", "in_progress"].includes(item.status),
      ).length;
      const items: Array<{
        property: PropertyRow;
        kind: string;
        reason: string;
        action: string;
        variant: "emerald" | "warn" | "muted" | "blue";
      }> = [];

      if (price <= 0) {
        items.push({
          property,
          kind: "missing-price",
          reason: "O imóvel ainda não tem preço ou diária cadastrada.",
          action: "Cadastrar preço",
          variant: "warn",
        });
      }
      if (!property.city) {
        items.push({
          property,
          kind: "missing-city",
          reason: "A cidade não está preenchida; isso enfraquece busca, mapa e comparação.",
          action: "Completar dados",
          variant: "muted",
        });
      }
      if (leads >= 3 && openMaintenance === 0 && price > 0) {
        items.push({
          property,
          kind: "demand",
          reason: `${leads} leads vinculados e nenhum chamado aberto. Vale revisar preço ou destaque.`,
          action: "Revisar alta",
          variant: "emerald",
        });
      }
      if (openMaintenance > 0) {
        items.push({
          property,
          kind: "maintenance",
          reason: `${openMaintenance} chamado(s) aberto(s). Evite aumento até resolver pendências.`,
          action: "Manter preço",
          variant: "blue",
        });
      }

      return items;
    })
    .slice(0, 10);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);
}

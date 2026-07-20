import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Activity, Building2, Loader2, TrendingUp, Users, Wrench } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PageHeader, Card, StatCard, SectionTitle, Badge } from "@/components/app/ui";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/admin/properties-analytics")({
  component: PropertiesAnalytics,
});

type PropertyRow = {
  id: string;
  title: string;
  status: string | null;
  listing_type: string | null;
  price: number | null;
  city: string | null;
  country: string | null;
  created_at: string | null;
};

type LeadRow = {
  id: string;
  property_id: string | null;
  status: string | null;
  created_at: string | null;
};

type ContractRow = {
  id: string;
  property_id: string | null;
  status: string | null;
};

type MaintenanceRow = {
  id: string;
  property_id: string | null;
  status: string;
  priority: string;
};

type AnalyticsData = {
  properties: PropertyRow[];
  leads: LeadRow[];
  contracts: ContractRow[];
  maintenance: MaintenanceRow[];
};

const colors = ["var(--emerald)", "var(--skyblue)", "var(--emerald-glow)", "var(--muted)"];

function PropertiesAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const [properties, leads, contracts, maintenance] = await Promise.all([
        supabase
          .from("properties")
          .select("id, title, status, listing_type, price, city, country, created_at")
          .order("created_at", { ascending: false }),
        supabase.from("leads").select("id, property_id, status, created_at"),
        supabase.from("contracts").select("id, property_id, status"),
        supabase.from("maintenance_requests").select("id, property_id, status, priority"),
      ]);

      if (cancelled) return;
      const firstError = [properties, leads, contracts, maintenance].find(
        (item) => item.error,
      )?.error;
      if (firstError) {
        setError(firstError.message);
        setData({ properties: [], leads: [], contracts: [], maintenance: [] });
        return;
      }

      setError(null);
      setData({
        properties: ((properties.data ?? []) as PropertyRow[]) ?? [],
        leads: ((leads.data ?? []) as LeadRow[]) ?? [],
        contracts: ((contracts.data ?? []) as ContractRow[]) ?? [],
        maintenance: ((maintenance.data ?? []) as MaintenanceRow[]) ?? [],
      });
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const metrics = useMemo(() => {
    const properties = data?.properties ?? [];
    const totalValue = properties.reduce((sum, property) => sum + Number(property.price ?? 0), 0);
    const avgPrice = properties.length ? totalValue / properties.length : 0;
    const available = properties.filter((property) => property.status === "available").length;
    const openMaintenance = (data?.maintenance ?? []).filter((item) =>
      ["open", "in_progress"].includes(item.status),
    ).length;
    return {
      totalValue,
      avgPrice,
      available,
      openMaintenance,
    };
  }, [data]);

  const listingMix = useMemo(
    () => groupBy(data?.properties ?? [], (property) => property.listing_type ?? "sem_tipo"),
    [data],
  );
  const statusMix = useMemo(
    () => groupBy(data?.properties ?? [], (property) => property.status ?? "sem_status"),
    [data],
  );
  const cityMix = useMemo(
    () => groupBy(data?.properties ?? [], (property) => property.city ?? "Sem cidade").slice(0, 8),
    [data],
  );
  const propertyScores = useMemo(() => {
    const properties = data?.properties ?? [];
    return properties
      .map((property) => {
        const leads = (data?.leads ?? []).filter((lead) => lead.property_id === property.id).length;
        const contracts = (data?.contracts ?? []).filter(
          (contract) => contract.property_id === property.id,
        ).length;
        const maintenance = (data?.maintenance ?? []).filter(
          (item) => item.property_id === property.id,
        ).length;
        return {
          property,
          leads,
          contracts,
          maintenance,
          score: leads * 2 + contracts * 4 - maintenance,
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);
  }, [data]);

  if (!data) {
    return (
      <>
        <PageHeader
          title="Analytics de imóveis"
          subtitle="Carregando métricas reais de portfólio."
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
        title="Analytics de imóveis"
        subtitle="Performance operacional baseada em imóveis, leads, contratos e manutenção reais."
      />

      {error && (
        <Card className="mb-6 border-destructive/30 bg-destructive/5">
          <p className="text-sm text-destructive">{error}</p>
        </Card>
      )}

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Valor cadastrado"
          value={formatCurrency(metrics.totalValue)}
          icon={TrendingUp}
        />
        <StatCard label="Preço médio" value={formatCurrency(metrics.avgPrice)} icon={Activity} />
        <StatCard
          label="Disponíveis"
          value={String(metrics.available)}
          icon={Users}
          accent="skyblue"
        />
        <StatCard
          label="Manutenção aberta"
          value={String(metrics.openMaintenance)}
          icon={Wrench}
          accent="skyblue"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <SectionTitle title="Tipo de anúncio" />
          <PiePanel data={listingMix} />
        </Card>
        <Card>
          <SectionTitle title="Status dos imóveis" />
          <PiePanel data={statusMix} />
        </Card>
        <Card>
          <SectionTitle title="Cidades" />
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={cityMix} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.08} />
                <XAxis
                  type="number"
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                />
                <YAxis
                  dataKey="label"
                  type="category"
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                  width={90}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid var(--border)",
                    background: "var(--card)",
                  }}
                />
                <Bar dataKey="value" fill="var(--emerald)" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="mt-6 overflow-hidden p-0">
        <div className="flex items-center justify-between p-6 pb-4">
          <h2 className="font-display text-lg font-semibold">Score operacional por imóvel</h2>
          <Badge variant="muted">{propertyScores.length} imóveis</Badge>
        </div>
        {propertyScores.length === 0 ? (
          <div className="px-6 pb-10 text-sm text-muted-foreground">
            Nenhum imóvel cadastrado para análise.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-y border-border bg-secondary/30 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-6 py-3 font-medium">Imóvel</th>
                <th className="px-6 py-3 font-medium">Local</th>
                <th className="px-6 py-3 font-medium">Leads</th>
                <th className="px-6 py-3 font-medium">Contratos</th>
                <th className="px-6 py-3 font-medium">Manutenção</th>
                <th className="px-6 py-3 text-right font-medium">Ação</th>
              </tr>
            </thead>
            <tbody>
              {propertyScores.map(({ property, leads, contracts, maintenance }) => (
                <tr
                  key={property.id}
                  className="border-b border-border last:border-0 hover:bg-secondary/30"
                >
                  <td className="px-6 py-4 font-medium">{property.title}</td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {property.city ?? property.country ?? "Sem localização"}
                  </td>
                  <td className="px-6 py-4">{leads}</td>
                  <td className="px-6 py-4">{contracts}</td>
                  <td className="px-6 py-4">{maintenance}</td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      to="/admin/properties/$id"
                      params={{ id: property.id }}
                      search={{ q: "", add: "" }}
                      className="inline-flex items-center gap-2 rounded-full border border-glass-border bg-secondary/40 px-3 py-1.5 text-xs font-medium hover:bg-secondary"
                    >
                      <Building2 className="h-3.5 w-3.5" /> Abrir
                    </Link>
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

function PiePanel({ data }: { data: { label: string; value: number }[] }) {
  if (!data.length) {
    return <div className="py-16 text-center text-sm text-muted-foreground">Sem dados.</div>;
  }

  return (
    <>
      <div className="h-56">
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              innerRadius={50}
              outerRadius={78}
              paddingAngle={4}
            >
              {data.map((_, index) => (
                <Cell key={index} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: "1px solid var(--border)",
                background: "var(--card)",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 space-y-1.5 text-xs">
        {data.map((item, index) => (
          <div key={item.label} className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded"
                style={{ background: colors[index % colors.length] }}
              />{" "}
              {labelize(item.label)}
            </span>
            <span className="font-semibold">{item.value}</span>
          </div>
        ))}
      </div>
    </>
  );
}

function groupBy<T>(items: T[], getKey: (item: T) => string) {
  const map = new Map<string, number>();
  for (const item of items) {
    const key = getKey(item);
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
}

function labelize(value: string) {
  const labels: Record<string, string> = {
    aluguel: "Aluguel",
    venda: "Venda",
    available: "Disponível",
    pending: "Pendente",
    sold: "Vendido",
    rented: "Alugado",
    sem_tipo: "Sem tipo",
    sem_status: "Sem status",
  };
  return labels[value] ?? value;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);
}

import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DollarSign, Home, Loader2, MessageSquare, Users, Wrench } from "lucide-react";
import { PageHeader, StatCard, Card, SectionTitle, Badge } from "@/components/app/ui";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/admin/owner")({
  component: OwnerHub,
});

type OwnerRow = {
  id: string;
  name: string | null;
  email: string | null;
  created_at: string | null;
};

type PropertyRow = {
  id: string;
  owner_id: string | null;
  title: string;
  status: string | null;
  price: number | null;
};

type ContractRow = {
  id: string;
  property_id: string | null;
  status: string | null;
};

type MaintenanceRow = {
  id: string;
  property_id: string | null;
  title: string | null;
  category: string | null;
  status: string | null;
  priority: string | null;
  created_at: string | null;
};

type MessageRow = {
  id: string;
  contract_id: string | null;
  created_at: string | null;
};

type PaymentRow = {
  id: string;
  contract_id: string | null;
  amount: number | null;
  status: string | null;
  payment_date: string | null;
};

type OwnerData = {
  owners: OwnerRow[];
  properties: PropertyRow[];
  contracts: ContractRow[];
  maintenance: MaintenanceRow[];
  messages: MessageRow[];
  payments: PaymentRow[];
};

type OwnerStats = {
  ownerId: string;
  ownerName: string;
  email: string | null;
  propertyCount: number;
  availableCount: number;
  contractCount: number;
  openMaintenance: number;
  messageCount: number;
  paidRevenue: number;
};

const openStatuses = new Set(["open", "in_progress", "pending"]);

function OwnerHub() {
  const [data, setData] = useState<OwnerData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const [owners, properties, contracts, maintenance, messages, payments] = await Promise.all([
        supabase
          .from("users")
          .select("id, name, email, created_at")
          .eq("role", "owner")
          .order("created_at", { ascending: false }),
        supabase
          .from("properties")
          .select("id, owner_id, title, status, price")
          .order("created_at", { ascending: false }),
        supabase.from("contracts").select("id, property_id, status"),
        supabase
          .from("maintenance_requests")
          .select("id, property_id, title, category, status, priority, created_at")
          .order("created_at", { ascending: false }),
        supabase
          .from("messages")
          .select("id, contract_id, created_at")
          .order("created_at", { ascending: false }),
        supabase
          .from("payments")
          .select("id, contract_id, amount, status, payment_date")
          .order("payment_date", { ascending: false, nullsFirst: false }),
      ]);

      if (cancelled) return;

      const firstError = [owners, properties, contracts, maintenance, messages, payments].find(
        (result) => result.error,
      )?.error;
      if (firstError) {
        setError(firstError.message);
        setData({
          owners: [],
          properties: [],
          contracts: [],
          maintenance: [],
          messages: [],
          payments: [],
        });
        return;
      }

      setError(null);
      setData({
        owners: (owners.data ?? []) as OwnerRow[],
        properties: (properties.data ?? []) as PropertyRow[],
        contracts: (contracts.data ?? []) as ContractRow[],
        maintenance: (maintenance.data ?? []) as MaintenanceRow[],
        messages: (messages.data ?? []) as MessageRow[],
        payments: (payments.data ?? []) as PaymentRow[],
      });
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = useMemo(() => buildOwnerStats(data), [data]);
  const revenueSeries = useMemo(() => buildRevenueSeries(data), [data]);
  const openMaintenance = (data?.maintenance ?? []).filter((item) =>
    openStatuses.has(item.status ?? ""),
  );
  const paidRevenue = stats.reduce((sum, owner) => sum + owner.paidRevenue, 0);

  if (!data) {
    return (
      <>
        <PageHeader
          title="Donos de imóveis"
          subtitle="Carregando imóveis, contratos e operação dos proprietários."
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
        title="Donos de imóveis"
        subtitle="Painel real para acompanhar proprietários, imóveis, contratos, chamados e mensagens."
      />

      {error && (
        <Card className="mb-6 border-destructive/30 bg-destructive/5">
          <p className="text-sm text-destructive">{error}</p>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Donos cadastrados" value={String(stats.length)} icon={Users} />
        <StatCard
          label="Imóveis vinculados"
          value={String(data.properties.length)}
          icon={Home}
          accent="skyblue"
        />
        <StatCard label="Chamados abertos" value={String(openMaintenance.length)} icon={Wrench} />
        <StatCard
          label="Receita registrada"
          value={formatCurrency(paidRevenue)}
          icon={DollarSign}
          accent="skyblue"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <SectionTitle title="Receita paga por mês" />
          {revenueSeries.length === 0 ? (
            <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
              Nenhum pagamento pago foi registrado para imóveis de proprietários.
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer>
                <AreaChart data={revenueSeries}>
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
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="var(--emerald)"
                    strokeWidth={2.5}
                    fill="var(--emerald)"
                    fillOpacity={0.18}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <Card>
          <SectionTitle title="Chamados recentes" />
          {openMaintenance.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum chamado aberto no momento.</p>
          ) : (
            <div className="space-y-3">
              {openMaintenance.slice(0, 5).map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-border/50 bg-secondary/30 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold">
                        {item.title ?? item.category ?? "Chamado"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {item.created_at
                          ? new Date(item.created_at).toLocaleDateString("pt-BR")
                          : "Sem data"}
                      </div>
                    </div>
                    <Badge variant={item.priority === "urgent" ? "warn" : "muted"}>
                      {item.status ?? "aberto"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card className="mt-6 overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-glass-border bg-secondary/30 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-5 py-3 font-medium">Proprietário</th>
              <th className="px-5 py-3 font-medium">Imóveis</th>
              <th className="px-5 py-3 font-medium">Contratos</th>
              <th className="px-5 py-3 font-medium">Chamados</th>
              <th className="px-5 py-3 font-medium">Mensagens</th>
              <th className="px-5 py-3 font-medium text-right">Receita paga</th>
            </tr>
          </thead>
          <tbody>
            {stats.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-muted-foreground">
                  Nenhum proprietário ou imóvel vinculado ainda.
                </td>
              </tr>
            ) : (
              stats.map((owner) => (
                <tr key={owner.ownerId} className="border-b border-glass-border last:border-0">
                  <td className="px-5 py-4">
                    <div className="font-semibold">{owner.ownerName}</div>
                    <div className="text-xs text-muted-foreground">
                      {owner.email ?? "Sem e-mail"}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    {owner.propertyCount}
                    <span className="ml-2 text-xs text-muted-foreground">
                      {owner.availableCount} disponíveis
                    </span>
                  </td>
                  <td className="px-5 py-4">{owner.contractCount}</td>
                  <td className="px-5 py-4">{owner.openMaintenance}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      {owner.messageCount}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right font-semibold">
                    {formatCurrency(owner.paidRevenue)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>
    </>
  );
}

function buildOwnerStats(data: OwnerData | null): OwnerStats[] {
  if (!data) return [];

  const ownerById = new Map(data.owners.map((owner) => [owner.id, owner]));
  const propertyById = new Map(data.properties.map((property) => [property.id, property]));
  const contractById = new Map(data.contracts.map((contract) => [contract.id, contract]));
  const ownerIds = new Set<string>();
  data.owners.forEach((owner) => ownerIds.add(owner.id));
  data.properties.forEach((property) => {
    if (property.owner_id) ownerIds.add(property.owner_id);
  });

  const rows = Array.from(ownerIds).map((ownerId) => {
    const owner = ownerById.get(ownerId);
    const ownerProperties = data.properties.filter((property) => property.owner_id === ownerId);
    const propertyIds = new Set(ownerProperties.map((property) => property.id));
    const ownerContracts = data.contracts.filter(
      (contract) => contract.property_id && propertyIds.has(contract.property_id),
    );
    const contractIds = new Set(ownerContracts.map((contract) => contract.id));
    const paidRevenue = data.payments
      .filter((payment) => payment.status === "paid" && payment.contract_id)
      .filter((payment) => contractIds.has(payment.contract_id as string))
      .reduce((sum, payment) => sum + Number(payment.amount ?? 0), 0);
    const messageCount = data.messages.filter(
      (message) => message.contract_id && contractIds.has(message.contract_id),
    ).length;
    const openMaintenance = data.maintenance.filter(
      (item) =>
        item.property_id &&
        propertyIds.has(item.property_id) &&
        openStatuses.has(item.status ?? ""),
    ).length;

    return {
      ownerId,
      ownerName: owner?.name ?? "Proprietário sem perfil",
      email: owner?.email ?? null,
      propertyCount: ownerProperties.length,
      availableCount: ownerProperties.filter((property) => property.status === "available").length,
      contractCount: ownerContracts.length,
      openMaintenance,
      messageCount,
      paidRevenue,
    };
  });

  return rows.sort((a, b) => b.propertyCount - a.propertyCount || b.paidRevenue - a.paidRevenue);
}

function buildRevenueSeries(data: OwnerData | null) {
  if (!data) return [];
  const propertyById = new Map(data.properties.map((property) => [property.id, property]));
  const contractById = new Map(data.contracts.map((contract) => [contract.id, contract]));
  const totals = new Map<string, number>();

  for (const payment of data.payments) {
    if (payment.status !== "paid" || !payment.payment_date || !payment.contract_id) continue;
    const contract = contractById.get(payment.contract_id);
    if (!contract?.property_id || !propertyById.get(contract.property_id)?.owner_id) continue;
    const date = new Date(payment.payment_date);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    totals.set(key, (totals.get(key) ?? 0) + Number(payment.amount ?? 0));
  }

  return Array.from(totals.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12)
    .map(([key, value]) => {
      const [year, month] = key.split("-");
      return { label: `${month}/${year.slice(2)}`, value };
    });
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);
}

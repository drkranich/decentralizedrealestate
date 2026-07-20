import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowUpRight,
  Bell,
  Building2,
  FileDown,
  FileSpreadsheet,
  Home,
  Landmark,
  Loader2,
  MessageSquare,
  Scale,
  ShieldCheck,
  ShoppingBag,
  TrendingUp,
  Users,
  Wallet,
  Workflow,
  Wrench,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PageHeader, StatCard, Card, SectionTitle, Badge } from "@/components/app/ui";
import { useBrand } from "@/components/brand/BrandProvider";
import { supabase } from "@/lib/supabase";
import { useAuthUser } from "@/lib/auth";
import { downloadTablePdf } from "@/lib/pdf";

export const Route = createFileRoute("/admin/dashboard")({
  component: Dashboard,
});

type CountState = {
  properties: number;
  availableProperties: number;
  saleProperties: number;
  rentProperties: number;
  leads: number;
  contracts: number;
  payments: number;
  pendingPayments: number;
  maintenanceOpen: number;
  messages: number;
  providers: number;
  serviceRequests: number;
  investmentOpportunities: number;
  investorOrders: number;
  legalWorkItems: number;
  workflows: number;
  notificationRules: number;
};

type LeadRow = {
  id: string;
  name: string | null;
  email: string | null;
  status: string | null;
  created_at: string | null;
  properties?: { title: string | null } | null;
};

type MaintenanceRow = {
  id: string;
  title: string | null;
  category: string;
  description: string;
  priority: string;
  status: string;
  created_at: string;
  properties?: { title: string | null } | null;
};

type AuditRow = {
  id: string;
  event_type: string;
  subject_type: string;
  created_at: string;
};

type PaymentRow = {
  id: string;
  amount: number | null;
  status: string | null;
  payment_date: string | null;
};

type PropertyRow = {
  id: string;
  title: string;
  status: string | null;
  listing_type: string | null;
  price: number | null;
  created_at: string | null;
};

type DashboardData = {
  counts: CountState;
  properties: PropertyRow[];
  payments: PaymentRow[];
  leads: LeadRow[];
  maintenance: MaintenanceRow[];
  audit: AuditRow[];
};

const emptyCounts: CountState = {
  properties: 0,
  availableProperties: 0,
  saleProperties: 0,
  rentProperties: 0,
  leads: 0,
  contracts: 0,
  payments: 0,
  pendingPayments: 0,
  maintenanceOpen: 0,
  messages: 0,
  providers: 0,
  serviceRequests: 0,
  investmentOpportunities: 0,
  investorOrders: 0,
  legalWorkItems: 0,
  workflows: 0,
  notificationRules: 0,
};

const statusLabels: Record<string, string> = {
  available: "Disponível",
  pending: "Pendente",
  open: "Aberto",
  in_progress: "Em andamento",
  resolved: "Resolvido",
  approved: "Aprovado",
  approved_with_conditions: "Aprovado com condições",
  pending_review: "Em revisão",
  legal_review: "Revisão jurídica",
  requested: "Solicitado",
  accepted: "Aceito",
  completed: "Concluído",
};

function Dashboard() {
  const brand = useBrand();
  const { user } = useAuthUser();
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const [
        props,
        avail,
        sale,
        rent,
        leads,
        contracts,
        payments,
        pendingPayments,
        maintenanceOpen,
        messages,
        providers,
        serviceRequests,
        opportunities,
        investorOrders,
        legalWorkItems,
        workflows,
        notificationRules,
        propertyRows,
        paymentRows,
        leadRows,
        maintenanceRows,
        auditRows,
      ] = await Promise.all([
        supabase.from("properties").select("id", { count: "exact", head: true }),
        supabase
          .from("properties")
          .select("id", { count: "exact", head: true })
          .eq("status", "available"),
        supabase
          .from("properties")
          .select("id", { count: "exact", head: true })
          .eq("listing_type", "venda"),
        supabase
          .from("properties")
          .select("id", { count: "exact", head: true })
          .eq("listing_type", "aluguel"),
        supabase.from("leads").select("id", { count: "exact", head: true }),
        supabase.from("contracts").select("id", { count: "exact", head: true }),
        supabase.from("payments").select("id", { count: "exact", head: true }),
        supabase
          .from("payments")
          .select("id", { count: "exact", head: true })
          .eq("status", "pending"),
        supabase
          .from("maintenance_requests")
          .select("id", { count: "exact", head: true })
          .in("status", ["open", "in_progress"]),
        supabase.from("messages").select("id", { count: "exact", head: true }),
        supabase
          .from("service_provider_profiles")
          .select("id", { count: "exact", head: true })
          .eq("status", "approved"),
        supabase.from("service_requests").select("id", { count: "exact", head: true }),
        supabase
          .from("investment_opportunities")
          .select("id", { count: "exact", head: true })
          .in("status", ["approved", "approved_with_conditions"]),
        supabase.from("investor_orders").select("id", { count: "exact", head: true }),
        supabase
          .from("legaltech_work_items")
          .select("id", { count: "exact", head: true })
          .in("status", ["pending_review", "legal_review"]),
        supabase.from("workflows").select("id", { count: "exact", head: true }).eq("enabled", true),
        supabase
          .from("notification_rules")
          .select("id", { count: "exact", head: true })
          .eq("enabled", true),
        supabase
          .from("properties")
          .select("id, title, status, listing_type, price, created_at")
          .order("created_at", { ascending: false })
          .limit(12),
        supabase
          .from("payments")
          .select("id, amount, status, payment_date")
          .order("payment_date", { ascending: false, nullsFirst: false })
          .limit(100),
        supabase
          .from("leads")
          .select("id, name, email, status, created_at, properties(title)")
          .order("created_at", { ascending: false })
          .limit(6),
        supabase
          .from("maintenance_requests")
          .select(
            "id, title, category, description, priority, status, created_at, properties(title)",
          )
          .order("created_at", { ascending: false })
          .limit(6),
        supabase
          .from("audit_events")
          .select("id, event_type, subject_type, created_at")
          .order("created_at", { ascending: false })
          .limit(8),
      ]);

      const firstError = [
        props,
        avail,
        sale,
        rent,
        leads,
        contracts,
        payments,
        pendingPayments,
        maintenanceOpen,
        messages,
        providers,
        serviceRequests,
        opportunities,
        investorOrders,
        legalWorkItems,
        workflows,
        notificationRules,
        propertyRows,
        paymentRows,
        leadRows,
        maintenanceRows,
        auditRows,
      ].find((result) => result.error)?.error;

      if (cancelled) return;
      if (firstError) {
        setError(firstError.message);
        setData({
          counts: emptyCounts,
          properties: [],
          payments: [],
          leads: [],
          maintenance: [],
          audit: [],
        });
        return;
      }

      setError(null);
      setData({
        counts: {
          properties: props.count ?? 0,
          availableProperties: avail.count ?? 0,
          saleProperties: sale.count ?? 0,
          rentProperties: rent.count ?? 0,
          leads: leads.count ?? 0,
          contracts: contracts.count ?? 0,
          payments: payments.count ?? 0,
          pendingPayments: pendingPayments.count ?? 0,
          maintenanceOpen: maintenanceOpen.count ?? 0,
          messages: messages.count ?? 0,
          providers: providers.count ?? 0,
          serviceRequests: serviceRequests.count ?? 0,
          investmentOpportunities: opportunities.count ?? 0,
          investorOrders: investorOrders.count ?? 0,
          legalWorkItems: legalWorkItems.count ?? 0,
          workflows: workflows.count ?? 0,
          notificationRules: notificationRules.count ?? 0,
        },
        properties: ((propertyRows.data ?? []) as PropertyRow[]) ?? [],
        payments: ((paymentRows.data ?? []) as PaymentRow[]) ?? [],
        leads: ((leadRows.data ?? []) as unknown as LeadRow[]) ?? [],
        maintenance: ((maintenanceRows.data ?? []) as unknown as MaintenanceRow[]) ?? [],
        audit: ((auditRows.data ?? []) as AuditRow[]) ?? [],
      });
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const displayName = (user?.user_metadata?.name as string | undefined)?.split(" ")[0] ?? "Gustavo";
  const counts = data?.counts ?? emptyCounts;
  const paidAmount = useMemo(
    () =>
      (data?.payments ?? [])
        .filter((payment) => payment.status === "paid")
        .reduce((sum, payment) => sum + Number(payment.amount ?? 0), 0),
    [data],
  );
  const pendingAmount = useMemo(
    () =>
      (data?.payments ?? [])
        .filter((payment) => payment.status !== "paid")
        .reduce((sum, payment) => sum + Number(payment.amount ?? 0), 0),
    [data],
  );
  const monthly = useMemo(
    () => buildMonthlySeries(data?.payments ?? [], data?.leads ?? [], data?.properties ?? []),
    [data],
  );
  const listingMix = useMemo(
    () => [
      { label: "Aluguel", value: counts.rentProperties },
      { label: "Venda", value: counts.saleProperties },
      {
        label: "Outros",
        value: Math.max(0, counts.properties - counts.rentProperties - counts.saleProperties),
      },
    ],
    [counts],
  );

  const exportRows: [string, string | number][] = [
    ["Total de imóveis", counts.properties],
    ["Imóveis disponíveis", counts.availableProperties],
    ["Leads", counts.leads],
    ["Contratos", counts.contracts],
    ["Pagamentos registrados", counts.payments],
    ["Chamados abertos", counts.maintenanceOpen],
    ["Prestadores aprovados", counts.providers],
    ["Oportunidades de investimento", counts.investmentOpportunities],
    ["Pendências LegalTech", counts.legalWorkItems],
    ["Workflows ativos", counts.workflows],
  ];

  if (!data) {
    return (
      <>
        <PageHeader
          title="Dashboard operacional"
          subtitle={`Carregando os dados reais da ${brand.name}.`}
        />
        <Card>
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Carregando operação...
          </div>
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={`Bom dia, ${displayName}`}
        subtitle={`Cockpit real da ${brand.name}: imóveis, leads, contratos, LegalTech, marketplace e automações.`}
      >
        <button
          onClick={() => exportCsv(exportRows)}
          className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm hover:bg-secondary"
        >
          <FileSpreadsheet className="h-4 w-4" /> CSV
        </button>
        <button
          onClick={() =>
            downloadTablePdf({
              title: "Resumo operacional",
              subtitle: `Exportado em ${new Date().toLocaleDateString("pt-BR")}`,
              header: ["Métrica", "Valor"],
              rows: exportRows,
              filename: "resumo-operacional.pdf",
            })
          }
          className="flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background"
        >
          <FileDown className="h-4 w-4" /> PDF
        </button>
      </PageHeader>

      {error && (
        <Card className="mb-6 border-destructive/30 bg-destructive/5">
          <p className="text-sm text-destructive">{error}</p>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Imóveis" value={String(counts.properties)} icon={Home} />
        <StatCard label="Leads" value={String(counts.leads)} icon={Users} accent="skyblue" />
        <StatCard label="Contratos" value={String(counts.contracts)} icon={TrendingUp} />
        <StatCard
          label="Chamados abertos"
          value={String(counts.maintenanceOpen)}
          icon={Wrench}
          accent="skyblue"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <SectionTitle title="Movimento dos últimos 6 meses" />
          <div className="h-72">
            <ResponsiveContainer>
              <AreaChart data={monthly}>
                <defs>
                  <linearGradient id="dashPayments" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--emerald)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--emerald)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="dashLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--skyblue)" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="var(--skyblue)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.08} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} />
                <YAxis tickLine={false} axisLine={false} fontSize={11} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid var(--border)",
                    background: "var(--card)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="payments"
                  name="Pagamentos"
                  stroke="var(--emerald)"
                  fill="url(#dashPayments)"
                  strokeWidth={2.5}
                />
                <Area
                  type="monotone"
                  dataKey="leads"
                  name="Leads"
                  stroke="var(--skyblue)"
                  fill="url(#dashLeads)"
                  strokeWidth={2.5}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <SectionTitle title="Mix de imóveis" />
          <div className="h-56">
            <ResponsiveContainer>
              <BarChart data={listingMix}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.08} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={11} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid var(--border)",
                    background: "var(--card)",
                  }}
                />
                <Bar dataKey="value" fill="var(--emerald)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <MetricPill label="Disponíveis" value={counts.availableProperties} />
            <MetricPill label="Mensagens" value={counts.messages} />
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-4">
        <OperationalCard
          title="Financeiro"
          icon={Landmark}
          to="/admin/finance"
          lines={[
            ["Recebido", formatCurrency(paidAmount)],
            ["A receber", formatCurrency(pendingAmount)],
            ["Pagamentos", counts.payments],
          ]}
        />
        <OperationalCard
          title="Marketplace"
          icon={ShoppingBag}
          to="/admin/marketplace"
          lines={[
            ["Prestadores aprovados", counts.providers],
            ["Pedidos", counts.serviceRequests],
            ["Workflows", counts.workflows],
          ]}
        />
        <OperationalCard
          title="Investidores"
          icon={Wallet}
          to="/admin/investor"
          lines={[
            ["Oportunidades", counts.investmentOpportunities],
            ["Ordens", counts.investorOrders],
            ["Regras in-app", counts.notificationRules],
          ]}
        />
        <OperationalCard
          title="LegalTech"
          icon={Scale}
          to="/admin/legal-compliance"
          lines={[
            ["Pendências", counts.legalWorkItems],
            ["Auditoria", data.audit.length],
            ["Contratos", counts.contracts],
          ]}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card>
          <SectionTitle
            title="Leads recentes"
            action={
              <Link to="/admin/crm" className="text-xs font-medium text-emerald hover:underline">
                Abrir CRM
              </Link>
            }
          />
          <ListEmptyAware empty={!data.leads.length} label="Nenhum lead recebido ainda.">
            {data.leads.map((lead) => (
              <div
                key={lead.id}
                className="rounded-2xl border border-border/50 bg-secondary/20 p-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold">
                      {lead.name ?? "Lead sem nome"}
                    </div>
                    <div className="truncate text-xs text-muted-foreground">
                      {lead.email ?? "Sem e-mail"} ·{" "}
                      {lead.properties?.title ?? "Imóvel não informado"}
                    </div>
                  </div>
                  <Badge variant="muted">{statusLabel(lead.status)}</Badge>
                </div>
              </div>
            ))}
          </ListEmptyAware>
        </Card>

        <Card>
          <SectionTitle
            title="Manutenção"
            action={
              <Link
                to="/admin/maintenance"
                className="text-xs font-medium text-emerald hover:underline"
              >
                Ver chamados
              </Link>
            }
          />
          <ListEmptyAware empty={!data.maintenance.length} label="Nenhum chamado registrado.">
            {data.maintenance.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-border/50 bg-secondary/20 p-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold">
                      {item.title || item.properties?.title || "Chamado"}
                    </div>
                    <div className="line-clamp-2 text-xs text-muted-foreground">
                      {item.description}
                    </div>
                  </div>
                  <Badge variant={item.priority === "urgent" ? "warn" : "muted"}>
                    {item.priority}
                  </Badge>
                </div>
              </div>
            ))}
          </ListEmptyAware>
        </Card>

        <Card>
          <SectionTitle
            title="Trilha operacional"
            action={<Activity className="h-4 w-4 text-emerald" />}
          />
          <ListEmptyAware empty={!data.audit.length} label="Nenhum evento de auditoria recente.">
            {data.audit.map((event) => (
              <div key={event.id} className="flex gap-3 rounded-2xl border border-border/50 p-3">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-emerald" />
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">{event.event_type}</div>
                  <div className="text-xs text-muted-foreground">
                    {event.subject_type} · {new Date(event.created_at).toLocaleString("pt-BR")}
                  </div>
                </div>
              </div>
            ))}
          </ListEmptyAware>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-4">
        <QuickLink
          to="/admin/workflows"
          icon={Workflow}
          label="Workflows"
          value={counts.workflows}
        />
        <QuickLink
          to="/admin/notifications"
          icon={Bell}
          label="Notificações"
          value={counts.notificationRules}
        />
        <QuickLink
          to="/admin/messages"
          icon={MessageSquare}
          label="Mensagens"
          value={counts.messages}
        />
        <QuickLink
          to="/admin/identity-aml"
          icon={ShieldCheck}
          label="Compliance"
          value={counts.legalWorkItems}
        />
      </div>
    </>
  );
}

function OperationalCard({
  title,
  icon: Icon,
  to,
  lines,
}: {
  title: string;
  icon: typeof Building2;
  to: string;
  lines: [string, string | number][];
}) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald/15 text-emerald">
          <Icon className="h-5 w-5" />
        </div>
        <Link to={to} className="text-muted-foreground hover:text-emerald">
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
      <h2 className="mt-4 font-display text-lg font-semibold">{title}</h2>
      <div className="mt-3 space-y-2">
        {lines.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{label}</span>
            <span className="font-semibold">{value}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function MetricPill({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-glass-border bg-glass-fill px-3 py-2">
      <div className="text-muted-foreground">{label}</div>
      <div className="font-display text-xl font-semibold">{value}</div>
    </div>
  );
}

function QuickLink({
  to,
  icon: Icon,
  label,
  value,
}: {
  to: string;
  icon: typeof Building2;
  label: string;
  value: number;
}) {
  return (
    <Link
      to={to}
      className="flex items-center justify-between rounded-2xl border border-glass-border bg-card/60 p-4 shadow-soft backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-emerald/30"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald/15 text-emerald">
          <Icon className="h-4 w-4" />
        </div>
        <span className="text-sm font-semibold">{label}</span>
      </div>
      <Badge variant="muted">{value}</Badge>
    </Link>
  );
}

function ListEmptyAware({
  empty,
  label,
  children,
}: {
  empty: boolean;
  label: string;
  children: React.ReactNode;
}) {
  if (empty) {
    return <div className="py-10 text-center text-sm text-muted-foreground">{label}</div>;
  }
  return <div className="space-y-3">{children}</div>;
}

function statusLabel(status: string | null | undefined) {
  return status ? (statusLabels[status] ?? status) : "Novo";
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

function buildMonthlySeries(payments: PaymentRow[], leads: LeadRow[], properties: PropertyRow[]) {
  const base = Array.from({ length: 6 }, (_, index) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - index));
    return {
      key: monthKey(date),
      label: date.toLocaleDateString("pt-BR", { month: "short" }),
      payments: 0,
      leads: 0,
      properties: 0,
    };
  });
  const byKey = new Map(base.map((item) => [item.key, item]));

  for (const payment of payments) {
    if (!payment.payment_date) continue;
    const bucket = byKey.get(monthKey(new Date(payment.payment_date)));
    if (bucket) bucket.payments += Number(payment.amount ?? 0);
  }
  for (const lead of leads) {
    if (!lead.created_at) continue;
    const bucket = byKey.get(monthKey(new Date(lead.created_at)));
    if (bucket) bucket.leads += 1;
  }
  for (const property of properties) {
    if (!property.created_at) continue;
    const bucket = byKey.get(monthKey(new Date(property.created_at)));
    if (bucket) bucket.properties += 1;
  }

  return base;
}

function exportCsv(rows: [string, string | number][]) {
  const csv = [["metrica", "valor"], ...rows.map(([label, value]) => [label, String(value)])]
    .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "resumo-operacional.csv";
  anchor.click();
  URL.revokeObjectURL(url);
}

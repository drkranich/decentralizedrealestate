import { createFileRoute, Link } from "@tanstack/react-router";
import { type ComponentType, useEffect, useState } from "react";
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  Coins,
  CreditCard,
  FileText,
  TrendingUp,
  WalletCards,
  Wrench,
} from "lucide-react";
import { Card, PageHeader, StatCard } from "@/components/app/ui";
import { useAuthUser, useUserRole } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/app/dashboard")({
  component: UserDashboard,
});

type LegacyTokenSummary = {
  property_id: string | null;
  fraction_percent: number | string | null;
  properties?: { price: number | string | null } | null;
};

type InvestorPositionSummary = {
  property_id: string | null;
  principal_amount: number | string | null;
};

type InvestorEarningSummary = {
  net_amount: number | string | null;
  status: string | null;
};

type InvestorProfileSummary = {
  onboarding_status: string | null;
};

type TenantContractSummary = {
  id: string;
  status: string;
  end_date: string | null;
  properties?: { title: string | null } | null;
};

type ServiceProviderProfileSummary = {
  id: string;
  status: string;
  subscription_status: string;
  service_marketplace_plans?: { name: string | null; currency: string | null } | null;
};

type ServiceCommissionSummary = {
  amount: number | string | null;
  currency: string | null;
};

function UserDashboard() {
  const { user } = useAuthUser();
  const { role, loading: roleLoading } = useUserRole();
  const displayName = (user?.user_metadata?.name as string | undefined) ?? user?.email ?? "";

  if (roleLoading) {
    return <div className="p-8 text-sm text-muted-foreground">Carregando...</div>;
  }

  return (
    <>
      <PageHeader
        title={`Olá, ${displayName.split(" ")[0] || displayName}`}
        subtitle={
          role === "owner"
            ? "Resumo dos seus imóveis"
            : role === "investor"
              ? "Resumo do seu portfólio"
              : role === "service_provider"
                ? "Resumo dos seus serviços"
                : "Resumo do seu aluguel"
        }
      />
      {role === "owner" ? (
        <OwnerDashboard userId={user?.id ?? null} />
      ) : role === "investor" ? (
        <InvestorDashboard userId={user?.id ?? null} />
      ) : role === "service_provider" ? (
        <ServiceProviderDashboard userId={user?.id ?? null} />
      ) : (
        <TenantDashboard userId={user?.id ?? null} />
      )}
    </>
  );
}

function OwnerDashboard({ userId }: { userId: string | null }) {
  const [stats, setStats] = useState<{
    properties: number;
    available: number;
    contracts: number;
    openMaintenance: number;
  } | null>(null);

  useEffect(() => {
    if (!userId) return;

    (async () => {
      const [
        { count: properties },
        { count: available },
        { count: contracts },
        { count: openMaintenance },
      ] = await Promise.all([
        supabase
          .from("properties")
          .select("id", { count: "exact", head: true })
          .eq("owner_id", userId),
        supabase
          .from("properties")
          .select("id", { count: "exact", head: true })
          .eq("owner_id", userId)
          .eq("status", "available"),
        supabase
          .from("contracts")
          .select("id, properties!inner(owner_id)", { count: "exact", head: true })
          .eq("properties.owner_id", userId),
        supabase
          .from("maintenance_requests")
          .select("id, properties!inner(owner_id)", { count: "exact", head: true })
          .eq("properties.owner_id", userId)
          .eq("status", "open"),
      ]);

      setStats({
        properties: properties ?? 0,
        available: available ?? 0,
        contracts: contracts ?? 0,
        openMaintenance: openMaintenance ?? 0,
      });
    })();
  }, [userId]);

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Meus imóveis"
          value={stats ? String(stats.properties) : "..."}
          icon={Building2}
        />
        <StatCard
          label="Disponíveis"
          value={stats ? String(stats.available) : "..."}
          icon={Building2}
          accent="skyblue"
        />
        <StatCard
          label="Contratos ativos"
          value={stats ? String(stats.contracts) : "..."}
          icon={FileText}
        />
        <StatCard
          label="Manutenções abertas"
          value={stats ? String(stats.openMaintenance) : "..."}
          icon={Wrench}
          accent="skyblue"
        />
      </div>
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <QuickLink
          to="/app/properties"
          icon={Building2}
          title="Meus imóveis"
          subtitle="Ver e gerenciar seus imóveis"
        />
        <QuickLink
          to="/app/calendar"
          icon={FileText}
          title="Calendário"
          subtitle="Ocupação e reservas"
        />
        <QuickLink
          to="/app/finance"
          icon={CreditCard}
          title="Financeiro"
          subtitle="Seus recebimentos"
        />
        <QuickLink
          to="/app/maintenance"
          icon={Wrench}
          title="Manutenção"
          subtitle="Solicitar serviços"
        />
        <QuickLink
          to="/app/service-marketplace"
          icon={BriefcaseBusiness}
          title="Marketplace"
          subtitle="Contratar prestadores"
        />
      </div>
    </>
  );
}

function InvestorDashboard({ userId }: { userId: string | null }) {
  const [stats, setStats] = useState<{
    properties: number;
    invested: number;
    pendingIncome: number;
    opportunities: number;
    compliance: string;
  } | null>(null);

  useEffect(() => {
    if (!userId) return;

    (async () => {
      const [
        { data: positions, error: positionsError },
        { count: opportunities },
        { data: earnings },
        { data: profile },
      ] = await Promise.all([
        supabase
          .from("investor_positions")
          .select("property_id, principal_amount, status")
          .eq("investor_id", userId)
          .in("status", ["approved", "approved_with_conditions"]),
        supabase
          .from("investment_opportunities")
          .select("id", { count: "exact", head: true })
          .in("status", ["approved", "approved_with_conditions"]),
        supabase.from("investor_earnings").select("net_amount, status").eq("investor_id", userId),
        supabase
          .from("investor_profiles")
          .select("onboarding_status")
          .eq("user_id", userId)
          .maybeSingle(),
      ]);

      if (positionsError) {
        const { data: tokens } = await supabase
          .from("property_tokens")
          .select("fraction_percent, status, property_id, properties(price)")
          .eq("owner_id", userId)
          .eq("status", "active");
        const rows = (tokens ?? []) as unknown as LegacyTokenSummary[];
        const propertyIds = Array.from(new Set(rows.map((row) => row.property_id)));
        const invested = rows.reduce((sum, row) => {
          const price = Number(row.properties?.price ?? 0);
          return sum + price * (Number(row.fraction_percent) / 100);
        }, 0);

        setStats({
          properties: propertyIds.length,
          invested,
          pendingIncome: 0,
          opportunities: 0,
          compliance: "Pendente",
        });
        return;
      }

      const positionRows = (positions ?? []) as unknown as InvestorPositionSummary[];
      const propertyIds = Array.from(
        new Set(positionRows.map((row) => row.property_id).filter(Boolean)),
      );
      const invested = positionRows.reduce(
        (sum, row) => sum + Number(row.principal_amount ?? 0),
        0,
      );
      const pendingIncome = ((earnings ?? []) as unknown as InvestorEarningSummary[])
        .filter((row) => row.status !== "approved")
        .reduce((sum, row) => sum + Number(row.net_amount ?? 0), 0);

      setStats({
        properties: propertyIds.length,
        invested,
        pendingIncome,
        opportunities: opportunities ?? 0,
        compliance: statusLabel(
          (profile as unknown as InvestorProfileSummary | null)?.onboarding_status,
        ),
      });
    })();
  }, [userId]);

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Imóveis investidos"
          value={stats ? String(stats.properties) : "..."}
          icon={Building2}
        />
        <StatCard
          label="Valor investido"
          value={
            stats
              ? `€${stats.invested.toLocaleString("en-US", { maximumFractionDigits: 0 })}`
              : "..."
          }
          icon={Coins}
          accent="skyblue"
        />
        <StatCard
          label="Oportunidades"
          value={stats ? String(stats.opportunities) : "..."}
          icon={TrendingUp}
        />
        <StatCard
          label="Compliance"
          value={stats?.compliance ?? "..."}
          icon={FileText}
          accent="skyblue"
        />
      </div>
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        <QuickLink
          to="/app/investor-opportunities"
          icon={TrendingUp}
          title="Oportunidades"
          subtitle="Ofertas e interesse"
        />
        <QuickLink
          to="/app/investor-portfolio"
          icon={Coins}
          title="Meu portfólio"
          subtitle="Suas frações e imóveis"
        />
        <QuickLink
          to="/app/investor-earnings"
          icon={TrendingUp}
          title="Rendimentos"
          subtitle="Sua parte nos recebimentos"
        />
        <QuickLink
          to="/app/investor-documents"
          icon={FileText}
          title="Documentos"
          subtitle="Contratos dos imóveis"
        />
        <QuickLink
          to="/app/investor-compliance"
          icon={FileText}
          title="Compliance"
          subtitle="KYC e carteiras"
        />
      </div>
    </>
  );
}

function statusLabel(status: string | null | undefined) {
  const labels: Record<string, string> = {
    draft: "Rascunho",
    pending_review: "Revisão",
    legal_review: "Jurídico",
    approved: "Aprovado",
    approved_with_conditions: "Condicionado",
    blocked: "Bloqueado",
    archived: "Arquivado",
    not_started: "Não iniciado",
    trialing: "Teste",
    active: "Ativo",
    past_due: "Atrasado",
    cancelled: "Cancelado",
  };
  return status ? (labels[status] ?? status) : "Pendente";
}

function ServiceProviderDashboard({ userId }: { userId: string | null }) {
  const [stats, setStats] = useState<{
    profileStatus: string;
    subscriptionStatus: string;
    plan: string;
    activeListings: number;
    openLeads: number;
    commission: number;
    currency: string;
  } | null>(null);

  useEffect(() => {
    if (!userId) return;

    (async () => {
      const { data: profileData, error } = await supabase
        .from("service_provider_profiles")
        .select("id, status, subscription_status, service_marketplace_plans(name, currency)")
        .eq("user_id", userId)
        .maybeSingle();

      if (error || !profileData) {
        setStats({
          profileStatus: "Pendente",
          subscriptionStatus: "Não iniciado",
          plan: "Sem plano",
          activeListings: 0,
          openLeads: 0,
          commission: 0,
          currency: "BRL",
        });
        return;
      }

      const profile = profileData as unknown as ServiceProviderProfileSummary;
      const [{ count: activeListings }, { count: openLeads }, { data: commissionRows }] =
        await Promise.all([
          supabase
            .from("service_listings")
            .select("id", { count: "exact", head: true })
            .eq("provider_id", profile.id)
            .eq("status", "approved"),
          supabase
            .from("service_requests")
            .select("id, service_listings!inner(provider_id)", { count: "exact", head: true })
            .eq("service_listings.provider_id", profile.id)
            .in("status", ["requested", "provider_contacted", "quoted"]),
          supabase
            .from("service_commission_ledger")
            .select("amount, currency")
            .eq("provider_id", profile.id),
        ]);

      const rows = (commissionRows as ServiceCommissionSummary[]) ?? [];
      setStats({
        profileStatus: statusLabel(profile.status),
        subscriptionStatus: statusLabel(profile.subscription_status),
        plan: profile.service_marketplace_plans?.name ?? "Sem plano",
        activeListings: activeListings ?? 0,
        openLeads: openLeads ?? 0,
        commission: rows.reduce((sum, row) => sum + Number(row.amount ?? 0), 0),
        currency: rows[0]?.currency ?? profile.service_marketplace_plans?.currency ?? "BRL",
      });
    })();
  }, [userId]);

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Cadastro" value={stats?.profileStatus ?? "..."} icon={BriefcaseBusiness} />
        <StatCard label="Plano" value={stats?.plan ?? "..."} icon={WalletCards} accent="skyblue" />
        <StatCard
          label="Serviços ativos"
          value={stats ? String(stats.activeListings) : "..."}
          icon={BriefcaseBusiness}
        />
        <StatCard
          label="Leads abertos"
          value={stats ? String(stats.openLeads) : "..."}
          icon={FileText}
          accent="skyblue"
        />
      </div>
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <QuickLink
          to="/app/service-provider"
          icon={BriefcaseBusiness}
          title="Painel do prestador"
          subtitle="Cadastro, serviços e propostas"
        />
        <QuickLink
          to="/app/service-provider"
          icon={WalletCards}
          title="Comissões"
          subtitle={`Total gerado: ${
            stats ? formatMoney(stats.commission, stats.currency) : "..."
          }`}
        />
        <QuickLink to="/app/profile" icon={FileText} title="Perfil" subtitle="Dados da sua conta" />
      </div>
    </>
  );
}

function TenantDashboard({ userId }: { userId: string | null }) {
  const [contract, setContract] = useState<
    | { id: string; status: string; end_date: string | null; property_title: string }
    | null
    | undefined
  >(undefined);
  const [openMaintenance, setOpenMaintenance] = useState<number | null>(null);

  useEffect(() => {
    if (!userId) return;

    (async () => {
      const { data } = await supabase
        .from("contracts")
        .select("id, status, end_date, properties(title)")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      const row = data as TenantContractSummary | null;

      setContract(
        row
          ? {
              id: row.id,
              status: row.status,
              end_date: row.end_date,
              property_title: row.properties?.title ?? "Imóvel",
            }
          : null,
      );

      const { count } = await supabase
        .from("maintenance_requests")
        .select("id", { count: "exact", head: true })
        .eq("requested_by", userId)
        .eq("status", "open");
      setOpenMaintenance(count ?? 0);
    })();
  }, [userId]);

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Contrato"
          value={contract === undefined ? "..." : contract ? contract.status : "Nenhum"}
          icon={FileText}
        />
        <StatCard
          label="Chamados abertos"
          value={openMaintenance === null ? "..." : String(openMaintenance)}
          icon={Wrench}
          accent="skyblue"
        />
        <StatCard
          label="Imóvel"
          value={contract === undefined ? "..." : (contract?.property_title ?? "-")}
          icon={Building2}
        />
      </div>
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <QuickLink
          to="/app/contract"
          icon={FileText}
          title="Meu contrato"
          subtitle="Detalhes do aluguel"
        />
        <QuickLink
          to="/app/payments"
          icon={CreditCard}
          title="Pagamentos"
          subtitle="Boletos e histórico"
        />
        <QuickLink
          to="/app/maintenance"
          icon={Wrench}
          title="Manutenção"
          subtitle="Abrir chamado"
        />
        <QuickLink
          to="/app/service-marketplace"
          icon={BriefcaseBusiness}
          title="Marketplace"
          subtitle="Contratar prestadores"
        />
        <QuickLink
          to="/app/messages"
          icon={FileText}
          title="Mensagens"
          subtitle="Falar com o dono"
        />
      </div>
    </>
  );
}

function formatMoney(value: number, currency: string) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: currency || "BRL",
    maximumFractionDigits: 0,
  });
}

function QuickLink({
  to,
  icon: Icon,
  title,
  subtitle,
}: {
  to: string;
  icon: ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
}) {
  return (
    <Link to={to}>
      <Card className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald/15 text-emerald">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <div className="font-medium">{title}</div>
            <div className="text-xs text-muted-foreground">{subtitle}</div>
          </div>
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground" />
      </Card>
    </Link>
  );
}

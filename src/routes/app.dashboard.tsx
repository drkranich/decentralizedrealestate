import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Building2, FileText, Wrench, CreditCard, ArrowRight } from "lucide-react";
import { PageHeader, Card, StatCard } from "@/components/app/ui";
import { useAuthUser, useUserRole } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/app/dashboard")({
  component: UserDashboard,
});

function UserDashboard() {
  const { user } = useAuthUser();
  const { role, loading: roleLoading } = useUserRole();
  const displayName = (user?.user_metadata?.name as string | undefined) ?? user?.email ?? "";

  if (roleLoading) {
    return <div className="p-8 text-sm text-muted-foreground">Carregando…</div>;
  }

  return (
    <>
      <PageHeader
        title={`Olá, ${displayName.split(" ")[0] || displayName}`}
        subtitle={role === "owner" ? "Resumo dos seus imóveis" : "Resumo do seu aluguel"}
      />
      {role === "owner" ? <OwnerDashboard userId={user?.id ?? null} /> : <TenantDashboard userId={user?.id ?? null} />}
    </>
  );
}

function OwnerDashboard({ userId }: { userId: string | null }) {
  const [stats, setStats] = useState<{ properties: number; available: number; contracts: number; openMaintenance: number } | null>(null);

  useEffect(() => {
    if (!userId) return;
    (async () => {
      const [{ count: properties }, { count: available }, { count: contracts }, { count: openMaintenance }] = await Promise.all([
        supabase.from("properties").select("id", { count: "exact", head: true }).eq("owner_id", userId),
        supabase.from("properties").select("id", { count: "exact", head: true }).eq("owner_id", userId).eq("status", "available"),
        supabase.from("contracts").select("id, properties!inner(owner_id)", { count: "exact", head: true }).eq("properties.owner_id", userId),
        supabase.from("maintenance_requests").select("id, properties!inner(owner_id)", { count: "exact", head: true }).eq("properties.owner_id", userId).eq("status", "open"),
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
        <StatCard label="Meus imóveis" value={stats ? String(stats.properties) : "…"} icon={Building2} />
        <StatCard label="Disponíveis" value={stats ? String(stats.available) : "…"} icon={Building2} accent="skyblue" />
        <StatCard label="Contratos ativos" value={stats ? String(stats.contracts) : "…"} icon={FileText} />
        <StatCard label="Manutenções abertas" value={stats ? String(stats.openMaintenance) : "…"} icon={Wrench} accent="skyblue" />
      </div>
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <QuickLink to="/app/properties" icon={Building2} title="Meus imóveis" subtitle="Ver e gerenciar seus imóveis" />
        <QuickLink to="/app/calendar" icon={FileText} title="Calendário" subtitle="Ocupação e reservas" />
        <QuickLink to="/app/finance" icon={CreditCard} title="Financeiro" subtitle="Seus recebimentos" />
        <QuickLink to="/app/maintenance" icon={Wrench} title="Manutenção" subtitle="Solicitar serviços" />
      </div>
    </>
  );
}

function TenantDashboard({ userId }: { userId: string | null }) {
  const [contract, setContract] = useState<{ id: string; status: string; end_date: string | null; property_title: string } | null | undefined>(undefined);
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
      setContract(
        data
          ? { id: data.id, status: data.status, end_date: data.end_date, property_title: (data as any).properties?.title ?? "Imóvel" }
          : null
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
          value={contract === undefined ? "…" : contract ? contract.status : "Nenhum"}
          icon={FileText}
        />
        <StatCard label="Chamados abertos" value={openMaintenance === null ? "…" : String(openMaintenance)} icon={Wrench} accent="skyblue" />
        <StatCard label="Imóvel" value={contract?.property_title ?? (contract === undefined ? "…" : "—")} icon={Building2} />
      </div>
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <QuickLink to="/app/contract" icon={FileText} title="Meu contrato" subtitle="Detalhes do aluguel" />
        <QuickLink to="/app/payments" icon={CreditCard} title="Pagamentos" subtitle="Boletos e histórico" />
        <QuickLink to="/app/maintenance" icon={Wrench} title="Manutenção" subtitle="Abrir chamado" />
        <QuickLink to="/app/messages" icon={FileText} title="Mensagens" subtitle="Falar com o dono" />
      </div>
    </>
  );
}

function QuickLink({ to, icon: Icon, title, subtitle }: { to: string; icon: any; title: string; subtitle: string }) {
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

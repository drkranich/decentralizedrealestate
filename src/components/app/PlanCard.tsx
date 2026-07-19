import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Check } from "lucide-react";
import { Card, SectionTitle, Badge } from "@/components/app/ui";
import { useAuthUser, useUserRole } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

type Subscription = {
  plan: string;
  status: string;
  current_period_end: string | null;
};

const planLabels: Record<string, string> = {
  tenant_free: "Inquilino — Grátis",
  tenant_plus: "Inquilino Plus",
  advertiser_basic: "Anunciante Básico",
  advertiser_pro: "Anunciante Pro",
  advertiser_portfolio: "Anunciante Portfólio",
};

const statusLabels: Record<string, { label: string; variant: "emerald" | "muted" | "warn" }> = {
  active: { label: "Ativo", variant: "emerald" },
  trialing: { label: "Período de teste", variant: "emerald" },
  past_due: { label: "Pagamento pendente", variant: "warn" },
  canceled: { label: "Cancelado", variant: "muted" },
};

const tenantTiers = [
  { id: "tenant_free", name: "Grátis", blurb: "Abrir chamados de manutenção, ver contrato e pagamentos." },
  { id: "tenant_plus", name: "Plus", blurb: "Prioridade no atendimento de manutenção e mensagens ilimitadas." },
];

const ownerTiers = [
  { id: "advertiser_basic", name: "Básico", blurb: "Anuncie até alguns imóveis com o essencial de gestão." },
  { id: "advertiser_pro", name: "Pro", blurb: "Mais imóveis, financeiro completo e relatórios." },
  { id: "advertiser_portfolio", name: "Portfólio", blurb: "Para quem gerencia um portfólio maior de imóveis." },
];

export function PlanCard() {
  const { user } = useAuthUser();
  const { role } = useUserRole();
  const [subscription, setSubscription] = useState<Subscription | null | undefined>(undefined);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("subscriptions")
      .select("plan, status, current_period_end")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => setSubscription(data ?? null));
  }, [user]);

  if (role === "admin") {
    return (
      <Card>
        <SectionTitle title="Plano" />
        <div className="text-sm text-muted-foreground">
          Como super admin, sua conta não usa um plano de assinatura — você tem acesso completo à plataforma.
        </div>
      </Card>
    );
  }

  const tiers = role === "owner" ? ownerTiers : tenantTiers;
  const currentTierId = subscription?.plan ?? (role === "owner" ? undefined : "tenant_free");
  const statusInfo = subscription ? statusLabels[subscription.status] : undefined;

  const selectPlan = (tierName: string) => {
    toast.info(`Assinar o plano ${tierName} ainda não está conectado a um provedor de pagamento real.`);
  };

  return (
    <Card>
      <SectionTitle
        title="Plano"
        action={
          subscription === undefined ? null : (
            <Badge variant={statusInfo?.variant ?? "muted"}>
              {statusInfo?.label ?? (currentTierId ? "Sem cobrança" : "Nenhum plano")}
            </Badge>
          )
        }
      />

      {subscription === undefined ? (
        <div className="text-sm text-muted-foreground">Carregando…</div>
      ) : (
        <>
          <div className="rounded-2xl border border-emerald/20 bg-emerald/5 p-4">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Plano atual</div>
            <div className="mt-1 font-display text-xl font-bold">
              {currentTierId ? planLabels[currentTierId] ?? currentTierId : "Nenhum plano ativo"}
            </div>
            {subscription?.current_period_end && (
              <div className="mt-1 text-xs text-muted-foreground">
                Renova em {new Date(subscription.current_period_end).toLocaleDateString("pt-BR")}
              </div>
            )}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {tiers.map((tier) => {
              const isCurrent = tier.id === currentTierId;
              return (
                <div
                  key={tier.id}
                  className={`rounded-2xl border p-4 ${isCurrent ? "border-emerald/40 bg-emerald/5" : "border-border/60 bg-secondary/20"}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-semibold">{tier.name}</div>
                    {isCurrent && <Check className="h-4 w-4 text-emerald" />}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">{tier.blurb}</div>
                  <button
                    onClick={() => selectPlan(tier.name)}
                    disabled={isCurrent}
                    className="mt-3 w-full rounded-full border border-border py-1.5 text-xs font-medium hover:bg-secondary disabled:opacity-50"
                  >
                    {isCurrent ? "Plano atual" : "Selecionar"}
                  </button>
                </div>
              );
            })}
          </div>
          <div className="mt-3 text-[11px] text-muted-foreground">
            Preços ainda não foram configurados — a cobrança real depende da integração com um provedor de pagamento.
          </div>
        </>
      )}
    </Card>
  );
}

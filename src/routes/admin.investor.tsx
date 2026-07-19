import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  BadgeCheck,
  Coins,
  Loader2,
  Plus,
  Save,
  ShieldCheck,
  Ticket,
  Users,
  WalletCards,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader, StatCard, Card, SectionTitle, Badge } from "@/components/app/ui";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/admin/investor")({
  component: InvestorAdmin,
});

type InvestorUser = {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  created_at: string;
};

type InvestorProfile = {
  user_id: string;
  onboarding_status: string;
  kyc_status: string;
  suitability_status: string;
  risk_profile: string;
  preferred_currency: string;
};

type Opportunity = {
  id: string;
  title: string;
  location: string | null;
  token_symbol: string;
  status: string;
  target_amount: number;
  raised_amount: number;
  min_ticket: number;
  currency: string;
  expected_yield_percent: number | null;
  risk_level: "low" | "medium" | "high" | "critical";
  published_at: string | null;
};

type Order = {
  id: string;
  investor_id: string;
  opportunity_id: string;
  status: string;
  amount: number;
  currency: string;
  created_at: string;
  users?: { name: string | null; email: string | null } | null;
  investment_opportunities?: { title: string; token_symbol: string } | null;
};

type Position = {
  id: string;
  investor_id: string;
  token_code: string;
  principal_amount: number;
  currency: string;
  status: string;
};

function InvestorAdmin() {
  const [investors, setInvestors] = useState<InvestorUser[]>([]);
  const [profiles, setProfiles] = useState<InvestorProfile[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [schemaMissing, setSchemaMissing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    location: "",
    token_symbol: "",
    target_amount: "",
    min_ticket: "",
    currency: "USD",
    expected_yield_percent: "",
    risk_level: "high",
    summary: "",
  });

  const load = async () => {
    setLoading(true);
    setSchemaMissing(false);

    const [
      { data: users },
      { data: profileRows, error: profileError },
      { data: opportunityRows, error: opportunityError },
      { data: orderRows },
      { data: positionRows },
    ] = await Promise.all([
      supabase
        .from("users")
        .select("id, name, email, role, created_at")
        .eq("role", "investor")
        .order("created_at", { ascending: false }),
      supabase
        .from("investor_profiles")
        .select(
          "user_id, onboarding_status, kyc_status, suitability_status, risk_profile, preferred_currency",
        ),
      supabase
        .from("investment_opportunities")
        .select(
          "id, title, location, token_symbol, status, target_amount, raised_amount, min_ticket, currency, expected_yield_percent, risk_level, published_at",
        )
        .order("created_at", { ascending: false }),
      supabase
        .from("investor_orders")
        .select(
          "id, investor_id, opportunity_id, status, amount, currency, created_at, users(name, email), investment_opportunities(title, token_symbol)",
        )
        .order("created_at", { ascending: false })
        .limit(12),
      supabase
        .from("investor_positions")
        .select("id, investor_id, token_code, principal_amount, currency, status"),
    ]);

    if (profileError || opportunityError) {
      setSchemaMissing(true);
    }

    setInvestors((users as InvestorUser[]) ?? []);
    setProfiles((profileRows as InvestorProfile[]) ?? []);
    setOpportunities((opportunityRows as Opportunity[]) ?? []);
    setOrders((orderRows as Order[]) ?? []);
    setPositions((positionRows as Position[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const createOpportunity = async () => {
    if (!form.title.trim() || !form.token_symbol.trim()) {
      toast.error("Título e token são obrigatórios.");
      return;
    }

    setSaving(true);
    const { error } = await supabase.from("investment_opportunities").insert({
      title: form.title.trim(),
      location: form.location.trim() || null,
      token_symbol: form.token_symbol.trim().toUpperCase(),
      status: "draft",
      summary: form.summary.trim() || null,
      target_amount: Number(form.target_amount || 0),
      raised_amount: 0,
      min_ticket: Number(form.min_ticket || 0),
      currency: form.currency,
      expected_yield_percent: form.expected_yield_percent
        ? Number(form.expected_yield_percent)
        : null,
      risk_level: form.risk_level,
      available_to_retail: false,
    });
    setSaving(false);

    if (error) {
      toast.error(error.message || "Não foi possível criar a oportunidade.");
      return;
    }

    toast.success("Oportunidade criada como rascunho.");
    setForm({
      title: "",
      location: "",
      token_symbol: "",
      target_amount: "",
      min_ticket: "",
      currency: "USD",
      expected_yield_percent: "",
      risk_level: "high",
      summary: "",
    });
    load();
  };

  const setOpportunityStatus = async (opportunity: Opportunity, status: string) => {
    const patch = {
      status,
      published_at:
        status === "approved" || status === "approved_with_conditions"
          ? (opportunity.published_at ?? new Date().toISOString())
          : null,
    };
    const { error } = await supabase
      .from("investment_opportunities")
      .update(patch)
      .eq("id", opportunity.id);
    if (error) {
      toast.error(error.message || "Não foi possível atualizar a oportunidade.");
      return;
    }
    toast.success("Oportunidade atualizada.");
    load();
  };

  const setOrderStatus = async (order: Order, status: string) => {
    const { error } = await supabase.from("investor_orders").update({ status }).eq("id", order.id);
    if (error) {
      toast.error(error.message || "Não foi possível atualizar a ordem.");
      return;
    }
    toast.success("Ordem atualizada.");
    load();
  };

  const totalPrincipal = positions.reduce(
    (sum, position) => sum + Number(position.principal_amount ?? 0),
    0,
  );
  const pendingCompliance = orders.filter((order) => order.status === "pending_compliance").length;
  const approvedProfiles = profiles.filter(
    (profile) =>
      profile.kyc_status === "approved" || profile.kyc_status === "approved_with_conditions",
  ).length;

  return (
    <>
      <PageHeader
        title="Investor Command Center"
        subtitle="Gestão real de investidores, oportunidades tokenizadas, ordens, KYC e posições."
      >
        <button
          type="button"
          onClick={createOpportunity}
          disabled={saving || schemaMissing}
          className="flex items-center gap-2 rounded-full bg-emerald px-4 py-2 text-sm font-semibold text-white shadow-glow disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Criar oportunidade
        </button>
      </PageHeader>

      {schemaMissing && (
        <Card className="mb-6 border-dashed border-destructive/30 text-sm text-muted-foreground">
          A migração LegalTech/Investidor ainda não foi aplicada; algumas tabelas podem aparecer
          vazias.
        </Card>
      )}

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Investidores"
          value={loading ? "..." : String(investors.length)}
          icon={Users}
        />
        <StatCard
          label="KYC aprovado"
          value={loading ? "..." : String(approvedProfiles)}
          icon={ShieldCheck}
          accent="skyblue"
        />
        <StatCard
          label="Ordens em compliance"
          value={loading ? "..." : String(pendingCompliance)}
          icon={BadgeCheck}
        />
        <StatCard
          label="Principal em posições"
          value={loading ? "..." : formatMoney(totalPrincipal, "USD")}
          icon={Coins}
          accent="skyblue"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <SectionTitle
            title="Nova oportunidade"
            action={<Ticket className="h-4 w-4 text-emerald" />}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Título" wide>
              <input
                value={form.title}
                onChange={(event) => setFormValue("title", event.target.value, setForm)}
                className="input"
              />
            </Field>
            <Field label="Local">
              <input
                value={form.location}
                onChange={(event) => setFormValue("location", event.target.value, setForm)}
                className="input"
              />
            </Field>
            <Field label="Token">
              <input
                value={form.token_symbol}
                onChange={(event) => setFormValue("token_symbol", event.target.value, setForm)}
                className="input"
              />
            </Field>
            <Field label="Meta">
              <input
                type="number"
                value={form.target_amount}
                onChange={(event) => setFormValue("target_amount", event.target.value, setForm)}
                className="input"
              />
            </Field>
            <Field label="Ticket mínimo">
              <input
                type="number"
                value={form.min_ticket}
                onChange={(event) => setFormValue("min_ticket", event.target.value, setForm)}
                className="input"
              />
            </Field>
            <Field label="Moeda">
              <select
                value={form.currency}
                onChange={(event) => setFormValue("currency", event.target.value, setForm)}
                className="input"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="BRL">BRL</option>
              </select>
            </Field>
            <Field label="Yield esperado">
              <input
                type="number"
                value={form.expected_yield_percent}
                onChange={(event) =>
                  setFormValue("expected_yield_percent", event.target.value, setForm)
                }
                className="input"
              />
            </Field>
            <Field label="Risco">
              <select
                value={form.risk_level}
                onChange={(event) => setFormValue("risk_level", event.target.value, setForm)}
                className="input"
              >
                <option value="low">Baixo</option>
                <option value="medium">Médio</option>
                <option value="high">Alto</option>
                <option value="critical">Crítico</option>
              </select>
            </Field>
            <Field label="Resumo" wide>
              <textarea
                value={form.summary}
                onChange={(event) => setFormValue("summary", event.target.value, setForm)}
                rows={4}
                className="input min-h-24 resize-none"
              />
            </Field>
          </div>
        </Card>

        <Card className="overflow-hidden p-0">
          <div className="p-6 pb-4">
            <SectionTitle
              title="Oportunidades"
              action={<WalletCards className="h-4 w-4 text-emerald" />}
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-y border-border bg-secondary/30 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-5 py-3">Token</th>
                  <th className="px-5 py-3">Oportunidade</th>
                  <th className="px-5 py-3">Meta</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Publicação</th>
                </tr>
              </thead>
              <tbody>
                {opportunities.map((opportunity) => (
                  <tr key={opportunity.id} className="border-b border-border last:border-0">
                    <td className="px-5 py-4 font-mono text-xs">{opportunity.token_symbol}</td>
                    <td className="px-5 py-4">
                      <div className="font-medium">{opportunity.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {opportunity.location ?? "-"}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      {formatMoney(opportunity.target_amount, opportunity.currency)}
                    </td>
                    <td className="px-5 py-4">
                      <select
                        value={opportunity.status}
                        onChange={(event) => setOpportunityStatus(opportunity, event.target.value)}
                        className="rounded-full border border-glass-border bg-glass-fill px-3 py-1 text-xs"
                      >
                        <option value="draft">Rascunho</option>
                        <option value="pending_review">Revisão</option>
                        <option value="legal_review">Jurídico</option>
                        <option value="approved_with_conditions">Condicionado</option>
                        <option value="approved">Aprovado</option>
                        <option value="blocked">Bloqueado</option>
                        <option value="archived">Arquivado</option>
                      </select>
                    </td>
                    <td className="px-5 py-4">
                      <Badge variant={opportunity.published_at ? "emerald" : "muted"}>
                        {opportunity.published_at ? "Publicado" : "Não publicado"}
                      </Badge>
                    </td>
                  </tr>
                ))}
                {opportunities.length === 0 && (
                  <tr>
                    <td className="px-5 py-8 text-sm text-muted-foreground" colSpan={5}>
                      Nenhuma oportunidade cadastrada.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card className="overflow-hidden p-0">
          <div className="p-6 pb-4">
            <SectionTitle title="Ordens recentes" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-y border-border bg-secondary/30 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-5 py-3">Investidor</th>
                  <th className="px-5 py-3">Oportunidade</th>
                  <th className="px-5 py-3">Valor</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-border last:border-0">
                    <td className="px-5 py-4">
                      {order.users?.name ?? order.users?.email ?? order.investor_id.slice(0, 8)}
                    </td>
                    <td className="px-5 py-4">
                      {order.investment_opportunities?.token_symbol ?? "-"}
                    </td>
                    <td className="px-5 py-4">{formatMoney(order.amount, order.currency)}</td>
                    <td className="px-5 py-4">
                      <select
                        value={order.status}
                        onChange={(event) => setOrderStatus(order, event.target.value)}
                        className="rounded-full border border-glass-border bg-glass-fill px-3 py-1 text-xs"
                      >
                        <option value="pending_compliance">Compliance</option>
                        <option value="pending_payment">Pagamento</option>
                        <option value="funded">Funded</option>
                        <option value="settled">Liquidada</option>
                        <option value="blocked">Bloqueada</option>
                        <option value="cancelled">Cancelada</option>
                        <option value="refunded">Devolvida</option>
                      </select>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td className="px-5 py-8 text-sm text-muted-foreground" colSpan={4}>
                      Nenhuma ordem registrada.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="overflow-hidden p-0">
          <div className="p-6 pb-4">
            <SectionTitle title="Investidores" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-y border-border bg-secondary/30 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-5 py-3">Nome</th>
                  <th className="px-5 py-3">KYC</th>
                  <th className="px-5 py-3">Suitability</th>
                  <th className="px-5 py-3">Risco</th>
                </tr>
              </thead>
              <tbody>
                {investors.map((investor) => {
                  const profile = profiles.find((item) => item.user_id === investor.id);
                  return (
                    <tr key={investor.id} className="border-b border-border last:border-0">
                      <td className="px-5 py-4">
                        <div className="font-medium">{investor.name ?? "Investidor"}</div>
                        <div className="text-xs text-muted-foreground">{investor.email}</div>
                      </td>
                      <td className="px-5 py-4">
                        <Badge variant={statusVariant(profile?.kyc_status)}>
                          {statusLabel(profile?.kyc_status)}
                        </Badge>
                      </td>
                      <td className="px-5 py-4">
                        <Badge variant={statusVariant(profile?.suitability_status)}>
                          {statusLabel(profile?.suitability_status)}
                        </Badge>
                      </td>
                      <td className="px-5 py-4">{profile?.risk_profile ?? "-"}</td>
                    </tr>
                  );
                })}
                {investors.length === 0 && (
                  <tr>
                    <td className="px-5 py-8 text-sm text-muted-foreground" colSpan={4}>
                      Nenhum usuário investidor cadastrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </>
  );
}

function Field({
  label,
  wide,
  children,
}: {
  label: string;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className={wide ? "sm:col-span-2" : ""}>
      <span className="mb-1 block text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function setFormValue(
  key: string,
  value: string,
  setForm: React.Dispatch<React.SetStateAction<Record<string, string>>>,
) {
  setForm((prev) => ({ ...prev, [key]: value }));
}

function formatMoney(value: number, currency: string) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: currency || "USD",
    maximumFractionDigits: 0,
  }).format(Number(value ?? 0));
}

function statusLabel(status: string | null | undefined) {
  const labels: Record<string, string> = {
    draft: "Rascunho",
    pending_review: "Revisão",
    legal_review: "Jurídico",
    approved: "Aprovado",
    approved_with_conditions: "Condicionado",
    blocked: "Bloqueado",
    expired: "Expirado",
    archived: "Arquivado",
  };
  return status ? (labels[status] ?? status) : "Pendente";
}

function statusVariant(status: string | null | undefined) {
  if (status === "approved" || status === "approved_with_conditions") return "emerald" as const;
  if (status === "blocked" || status === "expired") return "warn" as const;
  if (status === "pending_review" || status === "legal_review") return "blue" as const;
  return "muted" as const;
}

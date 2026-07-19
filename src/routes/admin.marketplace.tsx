import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  BriefcaseBusiness,
  ClipboardList,
  Loader2,
  Plus,
  Search,
  ShieldCheck,
  WalletCards,
} from "lucide-react";
import { toast } from "sonner";
import { Badge, Card, PageHeader, SectionTitle, StatCard } from "@/components/app/ui";
import { useAuthUser } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/admin/marketplace")({
  component: AdminServiceMarketplace,
});

type Plan = {
  id: string;
  slug: string;
  name: string;
  billing_model: string;
  monthly_fee_cents: number;
  commission_rate: number | string;
  currency: string;
  description: string | null;
  features: string[];
  active: boolean;
};

type Category = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon_key: string;
  sort_order: number;
  active: boolean;
};

type ProviderProfile = {
  id: string;
  user_id: string;
  plan_id: string | null;
  business_name: string;
  legal_name: string | null;
  contact_email: string | null;
  phone: string | null;
  country: string | null;
  city: string | null;
  service_area: string | null;
  status: string;
  subscription_status: string;
  verification_notes: string | null;
  created_at: string;
  service_marketplace_plans?: { name: string | null; billing_model: string | null } | null;
};

type Listing = {
  id: string;
  title: string;
  summary: string;
  pricing_model: string;
  starting_price: number | string | null;
  currency: string;
  coverage_area: string | null;
  status: string;
  featured: boolean;
  published_at: string | null;
  created_at: string;
  service_marketplace_categories?: { name: string | null } | null;
  service_provider_profiles?: { business_name: string | null; status: string | null } | null;
};

type RequestRow = {
  id: string;
  title: string;
  details: string | null;
  budget_amount: number | string | null;
  currency: string;
  status: string;
  created_at: string;
  service_listings?: {
    title: string | null;
    service_provider_profiles?: { business_name: string | null } | null;
  } | null;
};

type LedgerRow = {
  id: string;
  amount: number | string;
  currency: string;
  rate: number | string;
  status: string;
  created_at: string;
  service_provider_profiles?: { business_name: string | null } | null;
};

function AdminServiceMarketplace() {
  const { user } = useAuthUser();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [providers, setProviders] = useState<ProviderProfile[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [ledger, setLedger] = useState<LedgerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [schemaMissing, setSchemaMissing] = useState(false);
  const [providerQuery, setProviderQuery] = useState("");
  const [listingStatus, setListingStatus] = useState("pending_review");
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    slug: "",
    description: "",
    icon_key: "sparkles",
  });

  const load = useCallback(async () => {
    setLoading(true);
    setSchemaMissing(false);
    const [
      plansResult,
      categoriesResult,
      providersResult,
      listingsResult,
      requestsResult,
      ledgerResult,
    ] = await Promise.all([
      supabase
        .from("service_marketplace_plans")
        .select(
          "id, slug, name, billing_model, monthly_fee_cents, commission_rate, currency, description, features, active",
        )
        .order("monthly_fee_cents", { ascending: true }),
      supabase
        .from("service_marketplace_categories")
        .select("id, slug, name, description, icon_key, sort_order, active")
        .order("sort_order", { ascending: true }),
      supabase
        .from("service_provider_profiles")
        .select(
          "id, user_id, plan_id, business_name, legal_name, contact_email, phone, country, city, service_area, status, subscription_status, verification_notes, created_at, service_marketplace_plans(name, billing_model)",
        )
        .order("created_at", { ascending: false }),
      supabase
        .from("service_listings")
        .select(
          "id, title, summary, pricing_model, starting_price, currency, coverage_area, status, featured, published_at, created_at, service_marketplace_categories(name), service_provider_profiles(business_name, status)",
        )
        .order("created_at", { ascending: false }),
      supabase
        .from("service_requests")
        .select(
          "id, title, details, budget_amount, currency, status, created_at, service_listings(title, service_provider_profiles(business_name))",
        )
        .order("created_at", { ascending: false })
        .limit(20),
      supabase
        .from("service_commission_ledger")
        .select(
          "id, amount, currency, rate, status, created_at, service_provider_profiles(business_name)",
        )
        .order("created_at", { ascending: false }),
    ]);

    if (
      plansResult.error ||
      categoriesResult.error ||
      providersResult.error ||
      listingsResult.error ||
      requestsResult.error ||
      ledgerResult.error
    ) {
      setSchemaMissing(true);
      setLoading(false);
      return;
    }

    setPlans((plansResult.data as Plan[]) ?? []);
    setCategories((categoriesResult.data as Category[]) ?? []);
    setProviders((providersResult.data as ProviderProfile[]) ?? []);
    setListings((listingsResult.data as Listing[]) ?? []);
    setRequests((requestsResult.data as RequestRow[]) ?? []);
    setLedger((ledgerResult.data as LedgerRow[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filteredProviders = useMemo(() => {
    const q = providerQuery.trim().toLowerCase();
    return providers.filter((provider) => {
      if (!q) return true;
      return [
        provider.business_name,
        provider.legal_name,
        provider.contact_email,
        provider.city,
        provider.country,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [providerQuery, providers]);

  const filteredListings =
    listingStatus === "all"
      ? listings
      : listings.filter((listing) => listing.status === listingStatus);

  const updateProvider = async (id: string, values: Partial<ProviderProfile>, message: string) => {
    const { error } = await supabase.from("service_provider_profiles").update(values).eq("id", id);
    if (error) {
      toast.error(error.message || "Não foi possível atualizar o prestador.");
      return;
    }
    toast.success(message);
    load();
  };

  const updateListing = async (id: string, values: Partial<Listing>, message: string) => {
    const { error } = await supabase.from("service_listings").update(values).eq("id", id);
    if (error) {
      toast.error(error.message || "Não foi possível atualizar o serviço.");
      return;
    }
    toast.success(message);
    load();
  };

  const createCategory = async () => {
    if (!categoryForm.name.trim()) {
      toast.error("Informe o nome da categoria.");
      return;
    }
    const slug = (categoryForm.slug || slugify(categoryForm.name)).trim();
    const { error } = await supabase.from("service_marketplace_categories").insert({
      name: categoryForm.name.trim(),
      slug,
      description: categoryForm.description.trim() || null,
      icon_key: categoryForm.icon_key.trim() || "sparkles",
      sort_order: categories.length * 10 + 10,
      active: true,
    });
    if (error) {
      toast.error(error.message || "Não foi possível criar a categoria.");
      return;
    }
    toast.success("Categoria criada.");
    setCategoryForm({ name: "", slug: "", description: "", icon_key: "sparkles" });
    load();
  };

  const toggleCategory = async (category: Category) => {
    const { error } = await supabase
      .from("service_marketplace_categories")
      .update({ active: !category.active })
      .eq("id", category.id);
    if (error) {
      toast.error(error.message || "Não foi possível atualizar a categoria.");
      return;
    }
    load();
  };

  if (loading) {
    return (
      <>
        <PageHeader
          title="Service Marketplace"
          subtitle="Operação de prestadores, anúncios, planos, leads e comissões."
        />
        <Card>
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Carregando marketplace...
          </div>
        </Card>
      </>
    );
  }

  const pendingProviders = providers.filter(
    (provider) => provider.status === "pending_review",
  ).length;
  const approvedProviders = providers.filter((provider) => provider.status === "approved").length;
  const pendingListings = listings.filter((listing) => listing.status === "pending_review").length;
  const approvedListings = listings.filter((listing) => listing.status === "approved").length;
  const pendingCommission = ledger
    .filter((row) => row.status !== "paid")
    .reduce((sum, row) => sum + Number(row.amount ?? 0), 0);
  const ledgerCurrency = ledger[0]?.currency ?? plans[0]?.currency ?? "BRL";

  return (
    <>
      <PageHeader
        title="Service Marketplace"
        subtitle="Mesa de controle para aprovar fornecedores, publicar serviços e acompanhar receita por comissão."
      />

      {schemaMissing && (
        <Card className="mb-6 border-dashed border-destructive/30 text-sm text-muted-foreground">
          A infraestrutura do Service Marketplace ainda não foi aplicada no Supabase.
        </Card>
      )}

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Prestadores" value={String(providers.length)} icon={BriefcaseBusiness} />
        <StatCard
          label="Pendentes"
          value={String(pendingProviders)}
          icon={ShieldCheck}
          accent="skyblue"
        />
        <StatCard label="Serviços aprovados" value={String(approvedListings)} icon={BadgeCheck} />
        <StatCard
          label="Comissão pendente"
          value={formatMoney(pendingCommission, ledgerCurrency)}
          icon={WalletCards}
          accent="skyblue"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <SectionTitle
            title="Prestadores"
            action={<Badge variant="blue">{approvedProviders} aprovados</Badge>}
          />
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-glass-border bg-glass-fill px-3 py-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={providerQuery}
              onChange={(event) => setProviderQuery(event.target.value)}
              className="w-full bg-transparent text-sm outline-none"
              placeholder="Buscar por empresa, cidade, país ou e-mail..."
            />
          </div>
          {filteredProviders.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum prestador encontrado.</p>
          ) : (
            <div className="space-y-3">
              {filteredProviders.map((provider) => (
                <div
                  key={provider.id}
                  className="rounded-2xl border border-glass-border bg-glass-fill p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="font-medium">{provider.business_name}</div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {[provider.city, provider.country].filter(Boolean).join(", ") ||
                          "Local não informado"}{" "}
                        · {provider.service_marketplace_plans?.name ?? "Sem plano"}
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {provider.contact_email || "Sem e-mail"} · {formatDate(provider.created_at)}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant={statusVariant(provider.status)}>
                        {statusLabel(provider.status)}
                      </Badge>
                      <Badge variant={statusVariant(provider.subscription_status)}>
                        {statusLabel(provider.subscription_status)}
                      </Badge>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        updateProvider(
                          provider.id,
                          {
                            status: "approved",
                            subscription_status: "active",
                            approved_by: user?.id,
                          } as Partial<ProviderProfile>,
                          "Prestador aprovado.",
                        )
                      }
                      className="rounded-full bg-emerald px-3 py-1.5 text-xs font-semibold text-white"
                    >
                      Aprovar
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        updateProvider(provider.id, { status: "blocked" }, "Prestador bloqueado.")
                      }
                      className="rounded-full border border-destructive/30 bg-destructive/10 px-3 py-1.5 text-xs font-semibold text-destructive"
                    >
                      Bloquear
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        updateProvider(provider.id, { status: "archived" }, "Prestador arquivado.")
                      }
                      className="rounded-full border border-glass-border bg-glass-fill px-3 py-1.5 text-xs font-medium hover:bg-secondary"
                    >
                      Arquivar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <SectionTitle
            title="Planos comerciais"
            action={<WalletCards className="h-4 w-4 text-emerald" />}
          />
          <div className="space-y-3">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className="rounded-2xl border border-glass-border bg-glass-fill p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-medium">{plan.name}</div>
                    <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
                  </div>
                  <Badge variant={plan.active ? "emerald" : "muted"}>
                    {plan.active ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge variant="blue">{billingLabel(plan.billing_model)}</Badge>
                  <Badge variant="emerald">{planSummary(plan)}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Card>
          <SectionTitle title="Categorias" action={<Plus className="h-4 w-4 text-emerald" />} />
          <div className="mb-4 grid gap-3 sm:grid-cols-2">
            <Field label="Nome">
              <input
                value={categoryForm.name}
                onChange={(event) =>
                  setCategoryForm((prev) => ({ ...prev, name: event.target.value }))
                }
                className="input"
                placeholder="Vistoria"
              />
            </Field>
            <Field label="Slug">
              <input
                value={categoryForm.slug}
                onChange={(event) =>
                  setCategoryForm((prev) => ({ ...prev, slug: event.target.value }))
                }
                className="input"
                placeholder="vistoria"
              />
            </Field>
            <Field label="Ícone">
              <input
                value={categoryForm.icon_key}
                onChange={(event) =>
                  setCategoryForm((prev) => ({ ...prev, icon_key: event.target.value }))
                }
                className="input"
              />
            </Field>
            <Field label="Descrição" wide>
              <input
                value={categoryForm.description}
                onChange={(event) =>
                  setCategoryForm((prev) => ({ ...prev, description: event.target.value }))
                }
                className="input"
                placeholder="Serviços de vistoria, laudos e inventário."
              />
            </Field>
          </div>
          <button
            type="button"
            onClick={createCategory}
            className="mb-4 flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            Criar categoria
          </button>
          <div className="space-y-2">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-glass-border bg-glass-fill px-3 py-2 text-sm"
              >
                <div>
                  <div className="font-medium">{category.name}</div>
                  <div className="text-xs text-muted-foreground">{category.slug}</div>
                </div>
                <button
                  type="button"
                  onClick={() => toggleCategory(category)}
                  className="rounded-full border border-glass-border bg-background/50 px-3 py-1.5 text-xs font-medium hover:bg-secondary"
                >
                  {category.active ? "Arquivar" : "Reativar"}
                </button>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <SectionTitle
            title="Serviços anunciados"
            action={<Badge variant="blue">{pendingListings} pendentes</Badge>}
          />
          <div className="mb-4 flex flex-wrap gap-2">
            {["pending_review", "approved", "blocked", "archived", "all"].map((status) => (
              <button
                type="button"
                key={status}
                onClick={() => setListingStatus(status)}
                className={filterClass(listingStatus === status)}
              >
                {status === "all" ? "Todos" : statusLabel(status)}
              </button>
            ))}
          </div>
          {filteredListings.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum serviço neste status.</p>
          ) : (
            <div className="space-y-3">
              {filteredListings.map((listing) => (
                <div
                  key={listing.id}
                  className="rounded-2xl border border-glass-border bg-glass-fill p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="font-medium">{listing.title}</div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {listing.service_provider_profiles?.business_name ?? "Prestador"} ·{" "}
                        {listing.service_marketplace_categories?.name ?? "Sem categoria"} ·{" "}
                        {listing.starting_price
                          ? formatMoney(listing.starting_price, listing.currency)
                          : "Sob orçamento"}
                      </div>
                    </div>
                    <Badge variant={statusVariant(listing.status)}>
                      {statusLabel(listing.status)}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{listing.summary}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        updateListing(listing.id, { status: "approved" }, "Serviço aprovado.")
                      }
                      className="rounded-full bg-emerald px-3 py-1.5 text-xs font-semibold text-white"
                    >
                      Aprovar
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        updateListing(listing.id, { status: "blocked" }, "Serviço bloqueado.")
                      }
                      className="rounded-full border border-destructive/30 bg-destructive/10 px-3 py-1.5 text-xs font-semibold text-destructive"
                    >
                      Bloquear
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        updateListing(listing.id, { status: "archived" }, "Serviço arquivado.")
                      }
                      className="rounded-full border border-glass-border bg-background/50 px-3 py-1.5 text-xs font-medium hover:bg-secondary"
                    >
                      Arquivar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card>
          <SectionTitle
            title="Leads recentes"
            action={<ClipboardList className="h-4 w-4 text-emerald" />}
          />
          {requests.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum pedido enviado ainda.</p>
          ) : (
            <div className="space-y-3">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="rounded-2xl border border-glass-border bg-glass-fill p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="font-medium">{request.title}</div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {request.service_listings?.title ?? "Serviço"} ·{" "}
                        {request.service_listings?.service_provider_profiles?.business_name ??
                          "Prestador"}
                      </div>
                    </div>
                    <Badge variant={statusVariant(request.status)}>
                      {statusLabel(request.status)}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {request.details || "Sem detalhes adicionais."}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <SectionTitle
            title="Comissões"
            action={<WalletCards className="h-4 w-4 text-skyblue" />}
          />
          {ledger.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              As comissões aparecem quando propostas são aceitas.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-glass-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-3 py-2">Prestador</th>
                    <th className="px-3 py-2">Valor</th>
                    <th className="px-3 py-2">Taxa</th>
                    <th className="px-3 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {ledger.map((row) => (
                    <tr key={row.id} className="border-b border-glass-border last:border-0">
                      <td className="px-3 py-3">
                        {row.service_provider_profiles?.business_name ?? "Prestador"}
                      </td>
                      <td className="px-3 py-3 font-medium">
                        {formatMoney(row.amount, row.currency)}
                      </td>
                      <td className="px-3 py-3 text-muted-foreground">{formatPercent(row.rate)}</td>
                      <td className="px-3 py-3">
                        <Badge variant={statusVariant(row.status)}>{statusLabel(row.status)}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
    <label className={wide ? "sm:col-span-2" : "block"}>
      <span className="mb-1 block text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function statusLabel(status: string | undefined | null) {
  const labels: Record<string, string> = {
    draft: "Rascunho",
    pending_review: "Em revisão",
    approved: "Aprovado",
    blocked: "Bloqueado",
    archived: "Arquivado",
    not_started: "Não iniciado",
    trialing: "Teste",
    active: "Ativo",
    past_due: "Atrasado",
    cancelled: "Cancelado",
    requested: "Solicitado",
    provider_contacted: "Contato iniciado",
    quoted: "Com proposta",
    accepted: "Aceito",
    completed: "Concluído",
    sent: "Enviada",
    declined: "Recusada",
    pending: "Pendente",
    invoiced: "Faturado",
    paid: "Pago",
    waived: "Dispensado",
  };
  return status ? (labels[status] ?? status) : "Pendente";
}

function statusVariant(status: string) {
  if (["approved", "active", "accepted", "completed", "paid"].includes(status))
    return "emerald" as const;
  if (
    [
      "pending_review",
      "requested",
      "provider_contacted",
      "quoted",
      "sent",
      "pending",
      "invoiced",
    ].includes(status)
  ) {
    return "blue" as const;
  }
  if (["blocked", "cancelled", "declined", "past_due"].includes(status)) return "warn" as const;
  return "muted" as const;
}

function filterClass(active: boolean) {
  return `rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
    active
      ? "border-emerald/40 bg-emerald/10 text-emerald"
      : "border-glass-border bg-secondary/40 hover:bg-secondary"
  }`;
}

function billingLabel(value: string) {
  const labels: Record<string, string> = {
    commission: "Por comissão",
    subscription: "Mensalidade",
    hybrid: "Mensalidade + comissão",
  };
  return labels[value] ?? value;
}

function planSummary(plan: Plan) {
  const fee = plan.monthly_fee_cents
    ? formatMoney(plan.monthly_fee_cents / 100, plan.currency)
    : "sem mensalidade";
  return `${fee} · ${formatPercent(plan.commission_rate)} comissão`;
}

function formatMoney(value: number | string, currency: string) {
  return Number(value).toLocaleString("pt-BR", {
    style: "currency",
    currency: currency || "BRL",
    maximumFractionDigits: 0,
  });
}

function formatPercent(value: number | string) {
  return `${(Number(value) * 100).toLocaleString("pt-BR", { maximumFractionDigits: 2 })}%`;
}

function formatDate(date: string | null) {
  return date ? new Date(date).toLocaleDateString("pt-BR") : "-";
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

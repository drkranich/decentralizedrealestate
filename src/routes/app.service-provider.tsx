import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  BriefcaseBusiness,
  CalendarClock,
  ClipboardList,
  Loader2,
  Plus,
  Save,
  Send,
  WalletCards,
} from "lucide-react";
import { toast } from "sonner";
import { Badge, Card, PageHeader, SectionTitle, StatCard } from "@/components/app/ui";
import { useAuthUser } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/app/service-provider")({
  component: ServiceProviderPanel,
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
};

type Category = {
  id: string;
  slug: string;
  name: string;
};

type ProviderProfile = {
  id: string;
  user_id: string;
  plan_id: string | null;
  business_name: string;
  legal_name: string | null;
  tax_id: string | null;
  contact_email: string | null;
  phone: string | null;
  website: string | null;
  country: string | null;
  city: string | null;
  service_area: string | null;
  status: string;
  subscription_status: string;
  verification_notes: string | null;
  service_marketplace_plans?: Plan | null;
};

type ServiceListing = {
  id: string;
  category_id: string | null;
  title: string;
  summary: string;
  description: string | null;
  pricing_model: string;
  starting_price: number | string | null;
  currency: string;
  coverage_area: string | null;
  response_sla: string | null;
  status: string;
  featured: boolean;
  created_at: string;
  service_marketplace_categories?: { name: string | null } | null;
};

type Lead = {
  id: string;
  title: string;
  details: string | null;
  desired_date: string | null;
  budget_amount: number | string | null;
  currency: string;
  status: string;
  created_at: string;
  service_listings?: { id: string; title: string | null; provider_id: string } | null;
};

type Quote = {
  id: string;
  request_id: string;
  amount: number | string;
  currency: string;
  commission_rate: number | string;
  commission_amount: number | string | null;
  status: string;
  notes: string | null;
  valid_until: string | null;
  created_at: string;
};

type Ledger = {
  id: string;
  amount: number | string;
  currency: string;
  rate: number | string;
  status: string;
  notes: string | null;
  created_at: string;
};

type QuoteDraft = {
  amount: string;
  notes: string;
  valid_until: string;
};

function ServiceProviderPanel() {
  const { user } = useAuthUser();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [profile, setProfile] = useState<ProviderProfile | null>(null);
  const [listings, setListings] = useState<ServiceListing[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [ledger, setLedger] = useState<Ledger[]>([]);
  const [loading, setLoading] = useState(true);
  const [schemaMissing, setSchemaMissing] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingListing, setSavingListing] = useState(false);
  const [quoteDrafts, setQuoteDrafts] = useState<Record<string, QuoteDraft>>({});
  const [profileForm, setProfileForm] = useState({
    plan_id: "",
    business_name: "",
    legal_name: "",
    tax_id: "",
    contact_email: "",
    phone: "",
    website: "",
    country: "Brasil",
    city: "",
    service_area: "",
  });
  const [listingForm, setListingForm] = useState({
    category_id: "",
    title: "",
    summary: "",
    description: "",
    pricing_model: "quote",
    starting_price: "",
    currency: "BRL",
    coverage_area: "",
    response_sla: "",
  });

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setSchemaMissing(false);

    const [plansResult, categoriesResult, profileResult] = await Promise.all([
      supabase
        .from("service_marketplace_plans")
        .select(
          "id, slug, name, billing_model, monthly_fee_cents, commission_rate, currency, description, features",
        )
        .eq("active", true)
        .order("monthly_fee_cents", { ascending: true }),
      supabase
        .from("service_marketplace_categories")
        .select("id, slug, name")
        .eq("active", true)
        .order("sort_order", { ascending: true }),
      supabase
        .from("service_provider_profiles")
        .select(
          "id, user_id, plan_id, business_name, legal_name, tax_id, contact_email, phone, website, country, city, service_area, status, subscription_status, verification_notes, service_marketplace_plans(id, slug, name, billing_model, monthly_fee_cents, commission_rate, currency, description, features)",
        )
        .eq("user_id", user.id)
        .maybeSingle(),
    ]);

    if (plansResult.error || categoriesResult.error || profileResult.error) {
      setSchemaMissing(true);
      setLoading(false);
      return;
    }

    const nextPlans = (plansResult.data as Plan[]) ?? [];
    const nextCategories = (categoriesResult.data as Category[]) ?? [];
    const nextProfile = profileResult.data as unknown as ProviderProfile | null;

    setPlans(nextPlans);
    setCategories(nextCategories);
    setProfile(nextProfile);
    setProfileForm({
      plan_id: nextProfile?.plan_id ?? nextPlans[0]?.id ?? "",
      business_name: nextProfile?.business_name ?? "",
      legal_name: nextProfile?.legal_name ?? "",
      tax_id: nextProfile?.tax_id ?? "",
      contact_email: nextProfile?.contact_email ?? user.email ?? "",
      phone: nextProfile?.phone ?? "",
      website: nextProfile?.website ?? "",
      country: nextProfile?.country ?? "Brasil",
      city: nextProfile?.city ?? "",
      service_area: nextProfile?.service_area ?? "",
    });

    if (!nextProfile) {
      setListings([]);
      setLeads([]);
      setQuotes([]);
      setLedger([]);
      setLoading(false);
      return;
    }

    const [listingsResult, leadsResult, quotesResult, ledgerResult] = await Promise.all([
      supabase
        .from("service_listings")
        .select(
          "id, category_id, title, summary, description, pricing_model, starting_price, currency, coverage_area, response_sla, status, featured, created_at, service_marketplace_categories(name)",
        )
        .eq("provider_id", nextProfile.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("service_requests")
        .select(
          "id, title, details, desired_date, budget_amount, currency, status, created_at, service_listings!inner(id, title, provider_id)",
        )
        .eq("service_listings.provider_id", nextProfile.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("service_quotes")
        .select(
          "id, request_id, amount, currency, commission_rate, commission_amount, status, notes, valid_until, created_at",
        )
        .eq("provider_id", nextProfile.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("service_commission_ledger")
        .select("id, amount, currency, rate, status, notes, created_at")
        .eq("provider_id", nextProfile.id)
        .order("created_at", { ascending: false }),
    ]);

    setListings((listingsResult.data as unknown as ServiceListing[]) ?? []);
    setLeads((leadsResult.data as unknown as Lead[]) ?? []);
    setQuotes((quotesResult.data as Quote[]) ?? []);
    setLedger((ledgerResult.data as Ledger[]) ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const activePlan = useMemo(
    () =>
      profile?.service_marketplace_plans ??
      plans.find((plan) => plan.id === profileForm.plan_id) ??
      null,
    [plans, profile, profileForm.plan_id],
  );

  const saveProfile = async () => {
    if (!user) return;
    if (!profileForm.business_name.trim()) {
      toast.error("Informe o nome comercial.");
      return;
    }

    setSavingProfile(true);
    const payload = {
      user_id: user.id,
      plan_id: profileForm.plan_id || null,
      business_name: profileForm.business_name.trim(),
      legal_name: profileForm.legal_name.trim() || null,
      tax_id: profileForm.tax_id.trim() || null,
      contact_email: profileForm.contact_email.trim() || user.email || null,
      phone: profileForm.phone.trim() || null,
      website: profileForm.website.trim() || null,
      country: profileForm.country.trim() || null,
      city: profileForm.city.trim() || null,
      service_area: profileForm.service_area.trim() || null,
    };

    const result = profile
      ? await supabase.from("service_provider_profiles").update(payload).eq("id", profile.id)
      : await supabase.from("service_provider_profiles").insert({
          ...payload,
          status: "pending_review",
        });

    setSavingProfile(false);

    if (result.error) {
      toast.error(result.error.message || "Não foi possível salvar o cadastro.");
      return;
    }

    toast.success(profile ? "Cadastro atualizado." : "Cadastro enviado para aprovação.");
    load();
  };

  const saveListing = async () => {
    if (!profile) return;
    if (!listingForm.title.trim() || !listingForm.summary.trim()) {
      toast.error("Informe título e resumo do serviço.");
      return;
    }

    setSavingListing(true);
    const { error } = await supabase.from("service_listings").insert({
      provider_id: profile.id,
      category_id: listingForm.category_id || categories[0]?.id || null,
      title: listingForm.title.trim(),
      summary: listingForm.summary.trim(),
      description: listingForm.description.trim() || null,
      pricing_model: listingForm.pricing_model,
      starting_price: listingForm.starting_price ? Number(listingForm.starting_price) : null,
      currency: listingForm.currency || "BRL",
      coverage_area: listingForm.coverage_area.trim() || null,
      response_sla: listingForm.response_sla.trim() || null,
      status: "pending_review",
    });
    setSavingListing(false);

    if (error) {
      toast.error(error.message || "Não foi possível cadastrar o serviço.");
      return;
    }

    toast.success("Serviço cadastrado para aprovação.");
    setListingForm({
      category_id: categories[0]?.id ?? "",
      title: "",
      summary: "",
      description: "",
      pricing_model: "quote",
      starting_price: "",
      currency: "BRL",
      coverage_area: "",
      response_sla: "",
    });
    load();
  };

  const archiveListing = async (id: string) => {
    const { error } = await supabase
      .from("service_listings")
      .update({ status: "archived" })
      .eq("id", id);
    if (error) {
      toast.error(error.message || "Não foi possível arquivar o serviço.");
      return;
    }
    toast.success("Serviço arquivado.");
    load();
  };

  const setLeadStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("service_requests").update({ status }).eq("id", id);
    if (error) {
      toast.error(error.message || "Não foi possível atualizar o lead.");
      return;
    }
    load();
  };

  const sendQuote = async (lead: Lead) => {
    if (!profile) return;
    const draft = quoteDrafts[lead.id] ?? { amount: "", notes: "", valid_until: "" };
    const amount = Number(draft.amount || 0);
    if (!amount || amount <= 0) {
      toast.error("Informe o valor da proposta.");
      return;
    }

    const commissionRate = Number(activePlan?.commission_rate ?? 0);
    const { error } = await supabase.from("service_quotes").insert({
      request_id: lead.id,
      provider_id: profile.id,
      amount,
      currency: lead.currency || activePlan?.currency || "BRL",
      commission_rate: commissionRate,
      notes: draft.notes.trim() || null,
      valid_until: draft.valid_until || null,
      status: "sent",
    });

    if (error) {
      toast.error(error.message || "Não foi possível enviar a proposta.");
      return;
    }

    await supabase.from("service_requests").update({ status: "quoted" }).eq("id", lead.id);
    toast.success("Proposta enviada.");
    setQuoteDrafts((prev) => ({
      ...prev,
      [lead.id]: { amount: "", notes: "", valid_until: "" },
    }));
    load();
  };

  if (loading) {
    return (
      <>
        <PageHeader
          title="Painel do prestador"
          subtitle="Cadastro, serviços, leads e propostas do Service Marketplace."
        />
        <Card>
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Carregando painel...
          </div>
        </Card>
      </>
    );
  }

  const approvedListings = listings.filter((listing) => listing.status === "approved").length;
  const pendingLeads = leads.filter((lead) =>
    ["requested", "provider_contacted"].includes(lead.status),
  ).length;
  const acceptedQuotes = quotes.filter((quote) => quote.status === "accepted").length;
  const totalCommission = ledger.reduce((sum, row) => sum + Number(row.amount ?? 0), 0);
  const defaultCurrency = activePlan?.currency ?? "BRL";

  return (
    <>
      <PageHeader
        title="Painel do prestador"
        subtitle="Cadastre serviços, escolha o plano comercial e responda pedidos de proprietários e inquilinos."
      />

      {schemaMissing && (
        <Card className="mb-6 border-dashed border-destructive/30 text-sm text-muted-foreground">
          A infraestrutura do Service Marketplace ainda não foi aplicada no Supabase.
        </Card>
      )}

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Status do cadastro"
          value={statusLabel(profile?.status)}
          icon={BadgeCheck}
        />
        <StatCard
          label="Serviços aprovados"
          value={String(approvedListings)}
          icon={BriefcaseBusiness}
          accent="skyblue"
        />
        <StatCard label="Leads em aberto" value={String(pendingLeads)} icon={ClipboardList} />
        <StatCard
          label="Comissão gerada"
          value={formatMoney(totalCommission, defaultCurrency)}
          icon={WalletCards}
          accent="skyblue"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Card>
          <SectionTitle
            title="Cadastro comercial"
            action={
              <Badge variant={statusVariant(profile?.status ?? "draft")}>
                {statusLabel(profile?.status)}
              </Badge>
            }
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Plano">
              <select
                value={profileForm.plan_id}
                onChange={(event) =>
                  setProfileForm((prev) => ({ ...prev, plan_id: event.target.value }))
                }
                className="input"
              >
                {plans.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name} · {planSummary(plan)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Nome comercial">
              <input
                value={profileForm.business_name}
                onChange={(event) =>
                  setProfileForm((prev) => ({ ...prev, business_name: event.target.value }))
                }
                className="input"
                placeholder="Ex.: Seravie Repairs"
              />
            </Field>
            <Field label="Razão social">
              <input
                value={profileForm.legal_name}
                onChange={(event) =>
                  setProfileForm((prev) => ({ ...prev, legal_name: event.target.value }))
                }
                className="input"
              />
            </Field>
            <Field label="Documento fiscal">
              <input
                value={profileForm.tax_id}
                onChange={(event) =>
                  setProfileForm((prev) => ({ ...prev, tax_id: event.target.value }))
                }
                className="input"
              />
            </Field>
            <Field label="E-mail comercial">
              <input
                type="email"
                value={profileForm.contact_email}
                onChange={(event) =>
                  setProfileForm((prev) => ({ ...prev, contact_email: event.target.value }))
                }
                className="input"
              />
            </Field>
            <Field label="Telefone">
              <input
                value={profileForm.phone}
                onChange={(event) =>
                  setProfileForm((prev) => ({ ...prev, phone: event.target.value }))
                }
                className="input"
              />
            </Field>
            <Field label="Site">
              <input
                value={profileForm.website}
                onChange={(event) =>
                  setProfileForm((prev) => ({ ...prev, website: event.target.value }))
                }
                className="input"
                placeholder="https://"
              />
            </Field>
            <Field label="País">
              <input
                value={profileForm.country}
                onChange={(event) =>
                  setProfileForm((prev) => ({ ...prev, country: event.target.value }))
                }
                className="input"
              />
            </Field>
            <Field label="Cidade">
              <input
                value={profileForm.city}
                onChange={(event) =>
                  setProfileForm((prev) => ({ ...prev, city: event.target.value }))
                }
                className="input"
              />
            </Field>
            <Field label="Área de atendimento" wide>
              <textarea
                value={profileForm.service_area}
                onChange={(event) =>
                  setProfileForm((prev) => ({ ...prev, service_area: event.target.value }))
                }
                className="input min-h-20 resize-none"
                placeholder="Bairros, cidades, raio de entrega ou atendimento remoto."
              />
            </Field>
          </div>

          {activePlan && (
            <div className="mt-4 rounded-2xl border border-emerald/20 bg-emerald/5 p-4 text-sm">
              <div className="font-semibold">{activePlan.name}</div>
              <p className="mt-1 text-muted-foreground">{activePlan.description}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge variant="emerald">{billingLabel(activePlan.billing_model)}</Badge>
                <Badge variant="blue">{planSummary(activePlan)}</Badge>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={saveProfile}
            disabled={savingProfile || schemaMissing}
            className="mt-4 flex items-center gap-2 rounded-full bg-emerald px-4 py-2 text-sm font-semibold text-white shadow-glow disabled:opacity-60"
          >
            {savingProfile ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {profile ? "Salvar cadastro" : "Enviar cadastro"}
          </button>
        </Card>

        <Card>
          <SectionTitle
            title="Cadastrar serviço"
            action={<Plus className="h-4 w-4 text-emerald" />}
          />
          {!profile ? (
            <p className="text-sm text-muted-foreground">
              Salve o cadastro comercial para liberar a criação dos serviços.
            </p>
          ) : (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Categoria">
                  <select
                    value={listingForm.category_id || categories[0]?.id || ""}
                    onChange={(event) =>
                      setListingForm((prev) => ({ ...prev, category_id: event.target.value }))
                    }
                    className="input"
                  >
                    {categories.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Modelo de preço">
                  <select
                    value={listingForm.pricing_model}
                    onChange={(event) =>
                      setListingForm((prev) => ({ ...prev, pricing_model: event.target.value }))
                    }
                    className="input"
                  >
                    <option value="quote">Sob orçamento</option>
                    <option value="fixed">Preço fechado</option>
                    <option value="hourly">Por hora</option>
                    <option value="subscription">Recorrente</option>
                  </select>
                </Field>
                <Field label="Título">
                  <input
                    value={listingForm.title}
                    onChange={(event) =>
                      setListingForm((prev) => ({ ...prev, title: event.target.value }))
                    }
                    className="input"
                    placeholder="Instalação de fechadura digital"
                  />
                </Field>
                <Field label="Preço inicial">
                  <input
                    type="number"
                    value={listingForm.starting_price}
                    onChange={(event) =>
                      setListingForm((prev) => ({ ...prev, starting_price: event.target.value }))
                    }
                    className="input"
                    placeholder="350"
                  />
                </Field>
                <Field label="Resumo" wide>
                  <input
                    value={listingForm.summary}
                    onChange={(event) =>
                      setListingForm((prev) => ({ ...prev, summary: event.target.value }))
                    }
                    className="input"
                    placeholder="Serviço aprovado para imóveis residenciais e comerciais."
                  />
                </Field>
                <Field label="Descrição" wide>
                  <textarea
                    value={listingForm.description}
                    onChange={(event) =>
                      setListingForm((prev) => ({ ...prev, description: event.target.value }))
                    }
                    className="input min-h-24 resize-none"
                  />
                </Field>
                <Field label="Moeda">
                  <select
                    value={listingForm.currency}
                    onChange={(event) =>
                      setListingForm((prev) => ({ ...prev, currency: event.target.value }))
                    }
                    className="input"
                  >
                    <option value="BRL">BRL</option>
                    <option value="EUR">EUR</option>
                    <option value="USD">USD</option>
                  </select>
                </Field>
                <Field label="SLA de resposta">
                  <input
                    value={listingForm.response_sla}
                    onChange={(event) =>
                      setListingForm((prev) => ({ ...prev, response_sla: event.target.value }))
                    }
                    className="input"
                    placeholder="Até 24h"
                  />
                </Field>
                <Field label="Cobertura" wide>
                  <input
                    value={listingForm.coverage_area}
                    onChange={(event) =>
                      setListingForm((prev) => ({ ...prev, coverage_area: event.target.value }))
                    }
                    className="input"
                    placeholder="São Paulo, Lisboa, atendimento remoto..."
                  />
                </Field>
              </div>
              <button
                type="button"
                onClick={saveListing}
                disabled={savingListing || schemaMissing}
                className="mt-4 flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background hover:opacity-90 disabled:opacity-60"
              >
                {savingListing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                Enviar para aprovação
              </button>
            </>
          )}
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <SectionTitle
            title="Meus serviços"
            action={<Badge variant="blue">{listings.length}</Badge>}
          />
          {listings.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum serviço cadastrado ainda.</p>
          ) : (
            <div className="space-y-3">
              {listings.map((listing) => (
                <div
                  key={listing.id}
                  className="rounded-2xl border border-glass-border bg-glass-fill p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium">{listing.title}</div>
                      <div className="mt-1 text-xs text-muted-foreground">
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
                  {listing.status !== "archived" && (
                    <button
                      type="button"
                      onClick={() => archiveListing(listing.id)}
                      className="mt-3 rounded-full border border-glass-border bg-glass-fill px-3 py-1.5 text-xs font-medium hover:bg-secondary"
                    >
                      Arquivar
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <SectionTitle
            title="Leads e propostas"
            action={<CalendarClock className="h-4 w-4 text-emerald" />}
          />
          {leads.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Os pedidos enviados para seus serviços aparecerão aqui.
            </p>
          ) : (
            <div className="space-y-4">
              {leads.map((lead) => {
                const draft = quoteDrafts[lead.id] ?? { amount: "", notes: "", valid_until: "" };
                const leadQuotes = quotes.filter((quote) => quote.request_id === lead.id);
                return (
                  <div
                    key={lead.id}
                    className="rounded-2xl border border-glass-border bg-glass-fill p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="font-medium">{lead.title}</div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {lead.service_listings?.title ?? "Serviço"} ·{" "}
                          {formatDate(lead.created_at)}
                        </div>
                      </div>
                      <Badge variant={statusVariant(lead.status)}>{statusLabel(lead.status)}</Badge>
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">
                      {lead.details || "Sem detalhes adicionais."}
                    </p>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      <Metric
                        label="Data desejada"
                        value={lead.desired_date ? formatDate(lead.desired_date) : "A combinar"}
                      />
                      <Metric
                        label="Orçamento do cliente"
                        value={
                          lead.budget_amount
                            ? formatMoney(lead.budget_amount, lead.currency)
                            : "Não informado"
                        }
                      />
                    </div>

                    {lead.status === "requested" && (
                      <button
                        type="button"
                        onClick={() => setLeadStatus(lead.id, "provider_contacted")}
                        className="mt-3 rounded-full border border-glass-border bg-glass-fill px-3 py-1.5 text-xs font-medium hover:bg-secondary"
                      >
                        Marcar contato iniciado
                      </button>
                    )}

                    <div className="mt-4 rounded-2xl border border-emerald/20 bg-emerald/5 p-3">
                      <div className="grid gap-3 sm:grid-cols-[120px_1fr_140px]">
                        <Field label="Valor">
                          <input
                            type="number"
                            value={draft.amount}
                            onChange={(event) =>
                              setQuoteDrafts((prev) => ({
                                ...prev,
                                [lead.id]: { ...draft, amount: event.target.value },
                              }))
                            }
                            className="input"
                            placeholder="750"
                          />
                        </Field>
                        <Field label="Notas">
                          <input
                            value={draft.notes}
                            onChange={(event) =>
                              setQuoteDrafts((prev) => ({
                                ...prev,
                                [lead.id]: { ...draft, notes: event.target.value },
                              }))
                            }
                            className="input"
                            placeholder="Inclui visita técnica e materiais básicos."
                          />
                        </Field>
                        <Field label="Validade">
                          <input
                            type="date"
                            value={draft.valid_until}
                            onChange={(event) =>
                              setQuoteDrafts((prev) => ({
                                ...prev,
                                [lead.id]: { ...draft, valid_until: event.target.value },
                              }))
                            }
                            className="input"
                          />
                        </Field>
                      </div>
                      <button
                        type="button"
                        onClick={() => sendQuote(lead)}
                        className="mt-3 flex items-center gap-2 rounded-full bg-emerald px-4 py-2 text-xs font-semibold text-white shadow-glow"
                      >
                        <Send className="h-3.5 w-3.5" />
                        Enviar proposta
                      </button>
                    </div>

                    {leadQuotes.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {leadQuotes.map((quote) => (
                          <div
                            key={quote.id}
                            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-glass-border bg-background/40 px-3 py-2 text-sm"
                          >
                            <span className="font-medium">
                              {formatMoney(quote.amount, quote.currency)}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              Comissão: {formatMoney(quote.commission_amount ?? 0, quote.currency)}
                            </span>
                            <Badge variant={statusVariant(quote.status)}>
                              {statusLabel(quote.status)}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      <Card className="mt-6">
        <SectionTitle title="Comissões" action={<WalletCards className="h-4 w-4 text-skyblue" />} />
        {ledger.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Quando uma proposta for aceita, a comissão será gerada automaticamente aqui.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-glass-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-3 py-2">Data</th>
                  <th className="px-3 py-2">Valor</th>
                  <th className="px-3 py-2">Taxa</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {ledger.map((row) => (
                  <tr key={row.id} className="border-b border-glass-border last:border-0">
                    <td className="px-3 py-3 text-muted-foreground">
                      {formatDate(row.created_at)}
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

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-glass-border bg-background/40 px-3 py-2">
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-sm font-semibold">{value}</div>
    </div>
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

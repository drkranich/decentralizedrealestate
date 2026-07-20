import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Calendar,
  CheckCircle2,
  ClipboardList,
  Loader2,
  MapPin,
  Search,
  Send,
  Sparkles,
  Star,
  WalletCards,
} from "lucide-react";
import { toast } from "sonner";
import { Badge, Card, PageHeader, SectionTitle, StatCard } from "@/components/app/ui";
import { useAuthUser, useUserRole } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/app/service-marketplace")({
  component: ServiceMarketplace,
});

type Category = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon_key: string;
};

type ProviderPublic = {
  business_name: string | null;
  city: string | null;
  country: string | null;
  status: string | null;
};

type Listing = {
  id: string;
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
  published_at: string | null;
  service_marketplace_categories?: Category | null;
  service_provider_profiles?: ProviderPublic | null;
};

type Quote = {
  id: string;
  amount: number | string;
  currency: string;
  commission_amount: number | string | null;
  status: string;
  notes: string | null;
  valid_until: string | null;
  created_at: string;
};

type RequestRow = {
  id: string;
  title: string;
  details: string | null;
  desired_date: string | null;
  budget_amount: number | string | null;
  currency: string;
  status: string;
  created_at: string;
  service_listings?: {
    title: string | null;
    service_provider_profiles?: ProviderPublic | null;
  } | null;
  service_quotes?: Quote[] | null;
};

const allCategories = "all";

function ServiceMarketplace() {
  const { user } = useAuthUser();
  const { role } = useUserRole();
  const [categories, setCategories] = useState<Category[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [schemaMissing, setSchemaMissing] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(allCategories);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [saving, setSaving] = useState(false);
  const [requestDraft, setRequestDraft] = useState({
    title: "",
    details: "",
    desired_date: "",
    budget_amount: "",
  });

  const load = useCallback(async () => {
    setLoading(true);
    setSchemaMissing(false);

    const [categoryResult, listingResult, requestResult] = await Promise.all([
      supabase
        .from("service_marketplace_categories")
        .select("id, slug, name, description, icon_key")
        .eq("active", true)
        .order("sort_order", { ascending: true }),
      supabase
        .from("service_listings")
        .select(
          "id, title, summary, description, pricing_model, starting_price, currency, coverage_area, response_sla, status, featured, published_at, service_marketplace_categories(id, slug, name, description, icon_key), service_provider_profiles(business_name, city, country, status)",
        )
        .eq("status", "approved")
        .order("featured", { ascending: false })
        .order("published_at", { ascending: false }),
      user
        ? supabase
            .from("service_requests")
            .select(
              "id, title, details, desired_date, budget_amount, currency, status, created_at, service_listings(title, service_provider_profiles(business_name, city, country, status)), service_quotes(id, amount, currency, commission_amount, status, notes, valid_until, created_at)",
            )
            .eq("requester_id", user.id)
            .order("created_at", { ascending: false })
        : Promise.resolve({ data: [], error: null }),
    ]);

    if (categoryResult.error || listingResult.error || requestResult.error) {
      setSchemaMissing(true);
      setLoading(false);
      return;
    }

    setCategories((categoryResult.data as Category[]) ?? []);
    setListings((listingResult.data as unknown as Listing[]) ?? []);
    setRequests((requestResult.data as unknown as RequestRow[]) ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const filteredListings = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return listings.filter((listing) => {
      const matchesCategory =
        category === allCategories || listing.service_marketplace_categories?.slug === category;
      const text = [
        listing.title,
        listing.summary,
        listing.description,
        listing.coverage_area,
        listing.service_provider_profiles?.business_name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return matchesCategory && (!normalizedQuery || text.includes(normalizedQuery));
    });
  }, [category, listings, query]);

  const openRequestForm = (listing: Listing) => {
    setSelectedListing(listing);
    setRequestDraft({
      title: listing.title,
      details: "",
      desired_date: "",
      budget_amount: listing.starting_price ? String(listing.starting_price) : "",
    });
  };

  const submitRequest = async () => {
    if (!user || !selectedListing || !(role === "owner" || role === "tenant")) return;
    if (!requestDraft.title.trim()) {
      toast.error("Informe um título para o pedido.");
      return;
    }

    setSaving(true);
    const { error } = await supabase.from("service_requests").insert({
      listing_id: selectedListing.id,
      requester_id: user.id,
      requester_role: role,
      title: requestDraft.title.trim(),
      details: requestDraft.details.trim() || null,
      desired_date: requestDraft.desired_date || null,
      budget_amount: requestDraft.budget_amount ? Number(requestDraft.budget_amount) : null,
      currency: selectedListing.currency || "BRL",
      status: "requested",
    });
    setSaving(false);

    if (error) {
      toast.error(error.message || "Não foi possível enviar o pedido.");
      return;
    }

    toast.success("Pedido enviado ao prestador.");
    setSelectedListing(null);
    setRequestDraft({ title: "", details: "", desired_date: "", budget_amount: "" });
    load();
  };

  const updateQuoteStatus = async (
    requestId: string,
    quoteId: string,
    status: "accepted" | "declined",
  ) => {
    const { error } = await supabase.from("service_quotes").update({ status }).eq("id", quoteId);
    if (error) {
      toast.error(error.message || "Não foi possível atualizar a proposta.");
      return;
    }

    await supabase
      .from("service_requests")
      .update({ status: status === "accepted" ? "accepted" : "requested" })
      .eq("id", requestId);
    toast.success(status === "accepted" ? "Proposta aceita." : "Proposta recusada.");
    load();
  };

  if (loading) {
    return (
      <>
        <PageHeader
          title="Marketplace de serviços"
          subtitle="Prestadores aprovados para apoiar imóveis, contratos e mudanças."
        />
        <Card>
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Carregando serviços...
          </div>
        </Card>
      </>
    );
  }

  const quotedRequests = requests.filter((request) =>
    request.service_quotes?.some((quote) => quote.status === "sent"),
  ).length;

  return (
    <>
      <PageHeader
        title="Marketplace de serviços"
        subtitle="Encontre fornecedores para manutenção, mudança, limpeza, segurança, documentação e operação imobiliária."
      />

      {schemaMissing && (
        <Card className="mb-6 border-dashed border-destructive/30 text-sm text-muted-foreground">
          A infraestrutura do Service Marketplace ainda não foi aplicada no Supabase.
        </Card>
      )}

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Serviços ativos" value={String(listings.length)} icon={Sparkles} />
        <StatCard
          label="Categorias"
          value={String(categories.length)}
          icon={ClipboardList}
          accent="skyblue"
        />
        <StatCard label="Pedidos enviados" value={String(requests.length)} icon={Send} />
        <StatCard
          label="Propostas abertas"
          value={String(quotedRequests)}
          icon={WalletCards}
          accent="skyblue"
        />
      </div>

      <Card className="mb-6">
        <div className="flex flex-col gap-3 lg:flex-row">
          <div className="flex flex-1 items-center gap-2 rounded-full border border-glass-border bg-glass-fill px-4 py-2.5">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar serviço, cidade, fornecedor..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setCategory(allCategories)}
              className={filterClass(category === allCategories)}
            >
              Todos
            </button>
            {categories.map((item) => (
              <button
                type="button"
                key={item.id}
                onClick={() => setCategory(item.slug)}
                className={filterClass(category === item.slug)}
              >
                {item.name}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="grid gap-5 md:grid-cols-2">
          {filteredListings.map((listing) => (
            <Card key={listing.id} className="flex flex-col gap-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-display text-lg font-semibold">{listing.title}</h2>
                    {listing.featured && <Badge variant="emerald">Destaque</Badge>}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{listing.summary}</p>
                </div>
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald/15 text-emerald">
                  <Sparkles className="h-5 w-5" />
                </div>
              </div>

              <div className="grid gap-3 text-sm sm:grid-cols-2">
                <Metric
                  label="Categoria"
                  value={listing.service_marketplace_categories?.name ?? "-"}
                />
                <Metric label="Modelo" value={pricingLabel(listing.pricing_model)} />
                <Metric
                  label="Preço inicial"
                  value={
                    listing.starting_price
                      ? formatMoney(listing.starting_price, listing.currency)
                      : "Sob orçamento"
                  }
                />
                <Metric label="SLA" value={listing.response_sla || "A combinar"} />
              </div>

              <div className="rounded-2xl border border-glass-border bg-glass-fill p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      {listing.service_provider_profiles?.business_name ?? "Prestador"}
                      <CheckCircle2 className="h-4 w-4 text-emerald" />
                    </div>
                    <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                      {[
                        listing.service_provider_profiles?.city,
                        listing.service_provider_profiles?.country,
                      ]
                        .filter(Boolean)
                        .join(", ") ||
                        listing.coverage_area ||
                        "Atendimento sob consulta"}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-semibold text-amber-600">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    Verificado
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => openRequestForm(listing)}
                disabled={schemaMissing || !(role === "owner" || role === "tenant")}
                className="mt-auto flex items-center justify-center gap-2 rounded-full bg-foreground px-4 py-2.5 text-sm font-semibold text-background hover:opacity-90 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                Solicitar orçamento
              </button>
            </Card>
          ))}

          {filteredListings.length === 0 && (
            <Card className="md:col-span-2">
              <div className="py-12 text-center text-sm text-muted-foreground">
                Nenhum serviço aprovado encontrado para este filtro.
              </div>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <SectionTitle
              title={selectedListing ? "Novo pedido" : "Escolha um serviço"}
              action={<Calendar className="h-4 w-4 text-emerald" />}
            />
            {selectedListing ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Envie o contexto para{" "}
                  <span className="font-medium text-foreground">
                    {selectedListing.service_provider_profiles?.business_name ??
                      selectedListing.title}
                  </span>
                  .
                </p>
                <Field label="Título">
                  <input
                    value={requestDraft.title}
                    onChange={(event) =>
                      setRequestDraft((prev) => ({ ...prev, title: event.target.value }))
                    }
                    className="input"
                  />
                </Field>
                <Field label="Detalhes">
                  <textarea
                    value={requestDraft.details}
                    onChange={(event) =>
                      setRequestDraft((prev) => ({ ...prev, details: event.target.value }))
                    }
                    className="input min-h-28 resize-none"
                    placeholder="Explique o imóvel, urgência, local, tamanho e qualquer requisito."
                  />
                </Field>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Data desejada">
                    <input
                      type="date"
                      value={requestDraft.desired_date}
                      onChange={(event) =>
                        setRequestDraft((prev) => ({ ...prev, desired_date: event.target.value }))
                      }
                      className="input"
                    />
                  </Field>
                  <Field label="Orçamento estimado">
                    <input
                      type="number"
                      value={requestDraft.budget_amount}
                      onChange={(event) =>
                        setRequestDraft((prev) => ({ ...prev, budget_amount: event.target.value }))
                      }
                      className="input"
                      placeholder="500"
                    />
                  </Field>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={submitRequest}
                    disabled={saving}
                    className="flex items-center gap-2 rounded-full bg-emerald px-4 py-2 text-sm font-semibold text-white shadow-glow disabled:opacity-60"
                  >
                    {saving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    Enviar pedido
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedListing(null)}
                    className="rounded-full border border-glass-border bg-glass-fill px-4 py-2 text-sm font-medium hover:bg-secondary"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Selecione um fornecedor aprovado para abrir uma solicitação. As respostas aparecem
                aqui quando o prestador enviar uma proposta.
              </p>
            )}
          </Card>

          <Card>
            <SectionTitle
              title="Meus pedidos"
              action={<Badge variant="blue">{requests.length}</Badge>}
            />
            {requests.length === 0 ? (
              <p className="text-sm text-muted-foreground">Você ainda não enviou pedidos.</p>
            ) : (
              <div className="space-y-3">
                {requests.map((request) => (
                  <div
                    key={request.id}
                    className="rounded-2xl border border-glass-border bg-glass-fill p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-medium">{request.title}</div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {request.service_listings?.title ?? "Serviço"} ·{" "}
                          {formatDate(request.created_at)}
                        </div>
                      </div>
                      <Badge variant={statusVariant(request.status)}>
                        {statusLabel(request.status)}
                      </Badge>
                    </div>

                    {(request.service_quotes ?? []).length > 0 && (
                      <div className="mt-3 space-y-2">
                        {(request.service_quotes ?? []).map((quote) => (
                          <div
                            key={quote.id}
                            className="rounded-xl border border-emerald/20 bg-emerald/5 p-3"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <div className="text-sm font-semibold">
                                  {formatMoney(quote.amount, quote.currency)}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {quote.notes || "Proposta enviada pelo prestador."}
                                </div>
                              </div>
                              <Badge variant={statusVariant(quote.status)}>
                                {statusLabel(quote.status)}
                              </Badge>
                            </div>
                            {quote.status === "sent" && (
                              <div className="mt-3 flex flex-wrap gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateQuoteStatus(request.id, quote.id, "accepted")
                                  }
                                  className="rounded-full bg-emerald px-3 py-1.5 text-xs font-semibold text-white"
                                >
                                  Aceitar
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateQuoteStatus(request.id, quote.id, "declined")
                                  }
                                  className="rounded-full border border-glass-border bg-glass-fill px-3 py-1.5 text-xs font-medium hover:bg-secondary"
                                >
                                  Recusar
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-glass-border bg-glass-fill px-3 py-2">
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-sm font-semibold">{value}</div>
    </div>
  );
}

function filterClass(active: boolean) {
  return `rounded-full border px-3.5 py-2 text-xs font-medium transition-colors ${
    active
      ? "border-emerald/40 bg-emerald/10 text-emerald"
      : "border-glass-border bg-secondary/40 hover:bg-secondary"
  }`;
}

function pricingLabel(value: string) {
  const labels: Record<string, string> = {
    fixed: "Preço fechado",
    hourly: "Por hora",
    quote: "Sob orçamento",
    subscription: "Recorrente",
  };
  return labels[value] ?? value;
}

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    requested: "Solicitado",
    provider_contacted: "Em contato",
    quoted: "Com proposta",
    accepted: "Aceito",
    completed: "Concluído",
    cancelled: "Cancelado",
    sent: "Enviada",
    declined: "Recusada",
    expired: "Expirada",
  };
  return labels[status] ?? status;
}

function statusVariant(status: string) {
  if (status === "accepted" || status === "completed") return "emerald" as const;
  if (status === "quoted" || status === "sent" || status === "provider_contacted") {
    return "blue" as const;
  }
  if (status === "cancelled" || status === "declined" || status === "expired")
    return "warn" as const;
  return "muted" as const;
}

function formatMoney(value: number | string, currency: string) {
  return Number(value).toLocaleString("pt-BR", {
    style: "currency",
    currency: currency || "BRL",
    maximumFractionDigits: 0,
  });
}

function formatDate(date: string | null) {
  return date ? new Date(date).toLocaleDateString("pt-BR") : "-";
}

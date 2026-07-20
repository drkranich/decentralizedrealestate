import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Bath,
  Bed,
  Calendar,
  FileText,
  ImageOff,
  Loader2,
  MapPin,
  Maximize,
  Wrench,
} from "lucide-react";
import { Card, Badge, SectionTitle, StatCard } from "@/components/app/ui";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/admin/properties/$id")({
  component: PropertyDetails,
  notFoundComponent: () => (
    <div className="py-16 text-center">
      <h2 className="font-display text-2xl font-bold">Imóvel não encontrado</h2>
      <Link
        to="/admin/properties"
        search={{ q: "", add: "" }}
        className="mt-4 inline-block text-sm text-emerald hover:underline"
      >
        Voltar para imóveis
      </Link>
    </div>
  ),
});

type PropertyDetail = {
  id: string;
  title: string;
  description: string | null;
  price: number | null;
  status: string | null;
  listing_type: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  area_sqm: number | null;
  year_built: number | null;
  formatted_address: string | null;
  latitude: number | null;
  longitude: number | null;
  owner_id: string | null;
  property_media: { storage_path: string; media_type: string; position: number }[];
};

type ContractRow = {
  id: string;
  status: string | null;
  start_date: string | null;
  end_date: string | null;
  created_at: string | null;
};

type PaymentRow = {
  id: string;
  contract_id: string | null;
  amount: number | null;
  status: string | null;
  payment_date: string | null;
};

type MaintenanceRow = {
  id: string;
  title: string | null;
  category: string | null;
  description: string | null;
  priority: string | null;
  status: string | null;
  created_at: string | null;
};

type DetailData = {
  property: PropertyDetail;
  contracts: ContractRow[];
  payments: PaymentRow[];
  maintenance: MaintenanceRow[];
};

const statusLabels: Record<string, string> = {
  available: "Disponível",
  unavailable: "Indisponível",
  archived: "Arquivado",
  active: "Ativo",
  pending: "Pendente",
  paid: "Pago",
  open: "Aberto",
  in_progress: "Em andamento",
  resolved: "Resolvido",
};

function PropertyDetails() {
  const { id } = Route.useParams();
  const [data, setData] = useState<DetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("overview");
  const [activePhoto, setActivePhoto] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      const { data: property } = await supabase
        .from("properties")
        .select(
          "id, title, description, price, status, listing_type, bedrooms, bathrooms, area_sqm, year_built, formatted_address, latitude, longitude, owner_id, property_media(storage_path, media_type, position)",
        )
        .eq("id", id)
        .maybeSingle();

      if (!property) {
        if (!cancelled) {
          setData(null);
          setLoading(false);
        }
        return;
      }

      const [contractsResult, maintenanceResult] = await Promise.all([
        supabase
          .from("contracts")
          .select("id, status, start_date, end_date, created_at")
          .eq("property_id", id)
          .order("created_at", { ascending: false }),
        supabase
          .from("maintenance_requests")
          .select("id, title, category, description, priority, status, created_at")
          .eq("property_id", id)
          .order("created_at", { ascending: false }),
      ]);

      const contracts = (contractsResult.data ?? []) as ContractRow[];
      const contractIds = contracts.map((contract) => contract.id);
      const paymentsResult = contractIds.length
        ? await supabase
            .from("payments")
            .select("id, contract_id, amount, status, payment_date")
            .in("contract_id", contractIds)
            .order("payment_date", { ascending: false, nullsFirst: false })
        : { data: [] };

      if (!cancelled) {
        setData({
          property: property as PropertyDetail,
          contracts,
          payments: (paymentsResult.data ?? []) as PaymentRow[],
          maintenance: (maintenanceResult.data ?? []) as MaintenanceRow[],
        });
        setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const metrics = useMemo(() => {
    const payments = data?.payments ?? [];
    const paid = payments
      .filter((payment) => payment.status === "paid")
      .reduce((sum, payment) => sum + Number(payment.amount ?? 0), 0);
    const pending = payments
      .filter((payment) => payment.status !== "paid")
      .reduce((sum, payment) => sum + Number(payment.amount ?? 0), 0);
    return { paid, pending };
  }, [data]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Carregando imóvel...
      </div>
    );
  }
  if (!data) throw notFound();

  const { property, contracts, payments, maintenance } = data;
  const photos = (property.property_media ?? [])
    .filter((media) => media.media_type === "photo")
    .sort((a, b) => a.position - b.position);
  const photoUrls = photos.map(
    (photo) =>
      supabase.storage.from("property-media").getPublicUrl(photo.storage_path).data.publicUrl,
  );

  return (
    <>
      <Link
        to="/admin/properties"
        search={{ q: "", add: "" }}
        className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar para imóveis
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="relative aspect-[16/10] overflow-hidden rounded-3xl bg-secondary/40">
            {photoUrls.length > 0 ? (
              <img src={photoUrls[activePhoto]} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground">
                <ImageOff className="h-8 w-8" />
                <span className="text-xs">Nenhuma foto enviada ainda</span>
              </div>
            )}
            {photoUrls.length > 1 && (
              <div className="absolute bottom-4 left-4 flex gap-2">
                {photoUrls.map((url, index) => (
                  <button
                    key={url}
                    onClick={() => setActivePhoto(index)}
                    className={`h-14 w-20 overflow-hidden rounded-xl border-2 ${index === activePhoto ? "border-emerald" : "border-transparent"}`}
                  >
                    <img src={url} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex flex-wrap gap-1.5">
                <Badge variant={property.status === "available" ? "emerald" : "muted"}>
                  {labelFor(property.status)} · #{property.id.slice(0, 8)}
                </Badge>
                {property.listing_type && (
                  <Badge variant={property.listing_type === "venda" ? "warn" : "blue"}>
                    {property.listing_type}
                  </Badge>
                )}
              </div>
              <h1 className="mt-2 font-display text-3xl font-bold">{property.title}</h1>
              {property.formatted_address && (
                <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" /> {property.formatted_address}
                  </span>
                </div>
              )}
            </div>
            {property.price != null && (
              <div className="text-right">
                <div className="font-display text-3xl font-bold">
                  {formatCurrency(Number(property.price))}
                </div>
                <div className="text-xs text-muted-foreground">
                  {property.listing_type === "venda" ? "preço de venda" : "valor mensal"}
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 flex gap-6 overflow-x-auto border-b border-glass-border">
            {[
              ["overview", "Visão geral"],
              ["analytics", "Financeiro"],
              ["documents", "Contratos"],
              ["maintenance", "Manutenção"],
              ["operations", "Operação"],
            ].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`relative whitespace-nowrap pb-3 text-sm font-medium ${tab === key ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                {label}
                {tab === key && (
                  <span className="absolute -bottom-px left-0 right-0 h-0.5 rounded-full bg-emerald" />
                )}
              </button>
            ))}
          </div>

          <div className="mt-6 space-y-6">
            {tab === "overview" && (
              <>
                <Card>
                  <SectionTitle title="Descrição" />
                  <p className="text-sm text-muted-foreground">
                    {property.description || "Nenhuma descrição cadastrada ainda."}
                  </p>
                </Card>

                <Card>
                  <SectionTitle title="Características" />
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    {[
                      {
                        i: Bed,
                        l: "Quartos",
                        v: property.bedrooms != null ? String(property.bedrooms) : "—",
                      },
                      {
                        i: Bath,
                        l: "Banheiros",
                        v: property.bathrooms != null ? String(property.bathrooms) : "—",
                      },
                      {
                        i: Maximize,
                        l: "Área",
                        v: property.area_sqm != null ? `${property.area_sqm} m²` : "—",
                      },
                      {
                        i: Calendar,
                        l: "Construção",
                        v: property.year_built != null ? String(property.year_built) : "—",
                      },
                    ].map((item) => (
                      <div
                        key={item.l}
                        className="rounded-2xl border border-glass-border bg-secondary/30 p-4"
                      >
                        <item.i className="h-4 w-4 text-emerald" />
                        <div className="mt-2 font-display text-lg font-bold">{item.v}</div>
                        <div className="text-xs text-muted-foreground">{item.l}</div>
                      </div>
                    ))}
                  </div>
                </Card>

                {property.latitude != null && property.longitude != null && (
                  <Card>
                    <SectionTitle title="Localização" />
                    <div className="rounded-2xl border border-glass-border bg-secondary/30 p-4 text-sm">
                      <div className="font-semibold">
                        {property.latitude}, {property.longitude}
                      </div>
                      <a
                        className="mt-1 inline-block text-xs text-emerald hover:underline"
                        target="_blank"
                        rel="noreferrer"
                        href={`https://www.openstreetmap.org/?mlat=${property.latitude}&mlon=${property.longitude}#map=16/${property.latitude}/${property.longitude}`}
                      >
                        Abrir no OpenStreetMap
                      </a>
                    </div>
                  </Card>
                )}
              </>
            )}

            {tab === "analytics" && (
              <>
                <div className="grid gap-4 sm:grid-cols-3">
                  <StatCard label="Recebido" value={formatCurrency(metrics.paid)} icon={FileText} />
                  <StatCard
                    label="A receber"
                    value={formatCurrency(metrics.pending)}
                    icon={FileText}
                    accent="skyblue"
                  />
                  <StatCard label="Pagamentos" value={String(payments.length)} icon={FileText} />
                </div>
                <Card>
                  <SectionTitle title="Pagamentos registrados" />
                  {payments.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Nenhum pagamento foi registrado para contratos deste imóvel.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {payments.slice(0, 8).map((payment) => (
                        <div
                          key={payment.id}
                          className="flex items-center justify-between rounded-xl border border-border/50 bg-secondary/30 p-3 text-sm"
                        >
                          <span>
                            {payment.payment_date
                              ? new Date(payment.payment_date).toLocaleDateString("pt-BR")
                              : "Sem data"}
                          </span>
                          <div className="flex items-center gap-3">
                            <Badge variant={payment.status === "paid" ? "emerald" : "muted"}>
                              {labelFor(payment.status)}
                            </Badge>
                            <span className="font-semibold">
                              {formatCurrency(Number(payment.amount ?? 0))}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </>
            )}

            {tab === "documents" && (
              <Card>
                <SectionTitle title="Contratos" />
                {contracts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Nenhum contrato vinculado a este imóvel ainda.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {contracts.map((contract) => (
                      <div
                        key={contract.id}
                        className="flex items-center justify-between rounded-xl border border-border/50 bg-secondary/30 p-3 text-sm"
                      >
                        <div>
                          <div className="font-semibold">Contrato #{contract.id.slice(0, 8)}</div>
                          <div className="text-xs text-muted-foreground">
                            {formatDate(contract.start_date)} até {formatDate(contract.end_date)}
                          </div>
                        </div>
                        <Badge variant={contract.status === "active" ? "emerald" : "muted"}>
                          {labelFor(contract.status)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            )}

            {tab === "maintenance" && (
              <Card>
                <SectionTitle title="Histórico de manutenção" />
                {maintenance.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Nenhum chamado de manutenção registrado para este imóvel.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {maintenance.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-xl border border-border/50 bg-secondary/30 p-3 text-sm"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="font-semibold">
                              {item.title ?? item.category ?? "Chamado"}
                            </div>
                            <div className="mt-1 text-xs text-muted-foreground">
                              {item.description ?? "Sem descrição."}
                            </div>
                          </div>
                          <Badge variant={item.priority === "urgent" ? "warn" : "muted"}>
                            {labelFor(item.status)}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            )}

            {tab === "operations" && (
              <Card>
                <SectionTitle title="Operação" />
                <div className="grid gap-3 sm:grid-cols-2">
                  <InfoTile label="Contratos ativos" value={String(activeContracts(contracts))} />
                  <InfoTile
                    label="Chamados abertos"
                    value={String(
                      maintenance.filter((item) =>
                        ["open", "in_progress", "pending"].includes(item.status ?? ""),
                      ).length,
                    )}
                  />
                </div>
              </Card>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <Card>
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              Preço listado
            </div>
            <div className="mt-2 font-display text-3xl font-bold">
              {property.price != null ? formatCurrency(Number(property.price)) : "—"}
            </div>
            <div className="text-xs text-muted-foreground">
              Métricas financeiras são calculadas pelos pagamentos reais vinculados a contratos.
            </div>
          </Card>

          <Card>
            <SectionTitle title="Sinais operacionais" />
            <div className="space-y-2 text-xs">
              <div className="rounded-xl border border-glass-border bg-secondary/30 p-3">
                <div className="flex items-center gap-1 font-semibold">
                  <Wrench className="h-3 w-3" />
                  {maintenance.length === 0 ? "Sem chamados" : `${maintenance.length} chamados`}
                </div>
                <div className="mt-1 text-muted-foreground">
                  Use o histórico de manutenção para acompanhar recorrência e qualidade do ativo.
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}

function labelFor(value: string | null) {
  return statusLabels[value ?? ""] ?? value ?? "Sem status";
}

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleDateString("pt-BR") : "sem data";
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);
}

function activeContracts(contracts: ContractRow[]) {
  return contracts.filter((contract) => contract.status === "active").length;
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-glass-border bg-secondary/30 p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 font-display text-2xl font-bold">{value}</div>
    </div>
  );
}

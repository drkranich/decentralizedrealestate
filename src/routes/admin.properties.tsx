import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Plus,
  Filter,
  Grid3x3,
  List,
  MapPin,
  Building2,
  Loader2,
  ImageOff,
  Share2,
} from "lucide-react";
import { PageHeader, Card, Badge, StatCard } from "@/components/app/ui";
import { AddPropertyModal } from "@/components/properties/AddPropertyModal";
import {
  EditPropertyModal,
  type EditableProperty,
} from "@/components/properties/EditPropertyModal";
import { PropertyActionsMenu } from "@/components/properties/PropertyActionsMenu";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

function shareProperty(id: string, title: string) {
  const url = `${window.location.origin}/listing/${id}`;
  if (navigator.share) {
    navigator.share({ title, url }).catch(() => {});
    return;
  }
  navigator.clipboard.writeText(url).then(
    () => toast.success("Link copiado para a área de transferência."),
    () => toast.error("Não foi possível copiar o link."),
  );
}

export const Route = createFileRoute("/admin/properties")({
  validateSearch: (s: Record<string, unknown>) => ({
    q: typeof s.q === "string" ? s.q : "",
    add: typeof s.add === "string" ? s.add : "",
  }),
  component: Properties,
});

type PropertyRow = {
  id: string;
  title: string;
  description: string | null;
  street: string | null;
  number: string | null;
  complement: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
  formatted_address: string | null;
  latitude: number | null;
  longitude: number | null;
  property_type: string | null;
  price: number | null;
  nightly_rate: number | null;
  min_stay_nights: number | null;
  cleaning_fee: number | null;
  status: string | null;
  listing_type: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  area_sqm: number | null;
  year_built: number | null;
  owner_id: string;
  cover_url: string | null;
};

const statusLabels: Record<string, string> = {
  available: "Disponível",
  unavailable: "Indisponível",
  archived: "Arquivado",
  pending: "Pendente",
};

function statusLabel(status: string | null) {
  return statusLabels[status ?? ""] ?? status ?? "Sem status";
}

function formatPrice(value: number | null) {
  if (value == null) return "—";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(Number(value));
}

function Properties() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const [view, setView] = useState<"grid" | "list">("grid");
  const [filter, setFilter] = useState("All");
  const [listingFilter, setListingFilter] = useState("Todos");
  const [showFilters, setShowFilters] = useState(false);
  const [textQuery, setTextQuery] = useState(search.q ?? "");
  const [open, setOpen] = useState(search.add === "1");
  const [editing, setEditing] = useState<EditableProperty | null>(null);

  useEffect(() => {
    if (search.add === "1") setOpen(true);
  }, [search.add]);
  const [rows, setRows] = useState<PropertyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data: userData } = await supabase.auth.getUser();
    setUserId(userData?.user?.id ?? null);

    const { data, error } = await supabase
      .from("properties")
      .select(
        "id, title, description, street, number, complement, neighborhood, city, state, postal_code, country, formatted_address, latitude, longitude, property_type, price, nightly_rate, min_stay_nights, cleaning_fee, status, listing_type, bedrooms, bathrooms, area_sqm, year_built, owner_id, property_media(storage_path, media_type, position)",
      )
      .order("created_at", { ascending: false });

    if (!error && data) {
      const mapped: PropertyRow[] = data.map((p: any) => {
        const cover = (p.property_media ?? [])
          .filter((m: any) => m.media_type === "photo")
          .sort((a: any, b: any) => a.position - b.position)[0];
        const cover_url = cover
          ? supabase.storage.from("property-media").getPublicUrl(cover.storage_path).data.publicUrl
          : null;
        return { ...p, cover_url };
      });
      setRows(mapped);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const byStatus =
    filter === "All"
      ? rows
      : rows.filter((p) => (p.status ?? "").toLowerCase() === filter.toLowerCase());
  const byListing =
    listingFilter === "Todos"
      ? byStatus
      : byStatus.filter((p) => p.listing_type === listingFilter.toLowerCase());
  const filtered = textQuery
    ? byListing.filter((p) => p.title.toLowerCase().includes(textQuery.toLowerCase()))
    : byListing;
  const total = rows.length;
  const available = rows.filter((p) => p.status === "available").length;
  const own = userId ? rows.filter((p) => p.owner_id === userId).length : 0;

  return (
    <>
      <PageHeader
        title="Imóveis"
        subtitle={
          loading
            ? "Carregando portfólio..."
            : `${filtered.length} ${filtered.length === 1 ? "imóvel" : "imóveis"} na plataforma agora.`
        }
      >
        <button
          onClick={() => setShowFilters((v) => !v)}
          className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${showFilters ? "border-emerald/40 bg-emerald/10 text-emerald" : "border-glass-border bg-card hover:bg-secondary"}`}
        >
          <Filter className="h-4 w-4" /> Filtros
        </button>
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 rounded-full bg-emerald px-4 py-2 text-sm font-semibold text-white shadow-glow"
        >
          <Plus className="h-4 w-4" /> Novo imóvel
        </button>
      </PageHeader>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Total de imóveis" value={String(total)} icon={Building2} />
        <StatCard label="Disponíveis" value={String(available)} icon={Building2} accent="skyblue" />
        <StatCard label="Seus imóveis" value={String(own)} icon={Building2} />
      </div>

      {textQuery && (
        <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
          Buscando por "{textQuery}"
          <button
            onClick={() => setTextQuery("")}
            className="font-medium text-emerald hover:underline"
          >
            Limpar
          </button>
        </div>
      )}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {["All", "available", "unavailable"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium capitalize transition-all ${
                filter === s
                  ? "bg-foreground text-background"
                  : "border border-glass-border bg-card text-muted-foreground hover:bg-secondary"
              }`}
            >
              {s === "All" ? "Todos" : statusLabel(s)}
            </button>
          ))}
          {showFilters && (
            <>
              <span className="mx-1 h-4 w-px bg-glass-fill-strong" />
              {["Todos", "Aluguel", "Venda"].map((s) => (
                <button
                  key={s}
                  onClick={() => setListingFilter(s)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                    listingFilter === s
                      ? "bg-emerald text-white"
                      : "border border-glass-border bg-card text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  {s}
                </button>
              ))}
            </>
          )}
        </div>
        <div className="flex rounded-full border border-glass-border bg-card p-0.5">
          <button
            onClick={() => setView("grid")}
            className={`flex h-8 w-8 items-center justify-center rounded-full ${view === "grid" ? "bg-secondary" : ""}`}
          >
            <Grid3x3 className="h-4 w-4" />
          </button>
          <button
            onClick={() => setView("list")}
            className={`flex h-8 w-8 items-center justify-center rounded-full ${view === "list" ? "bg-secondary" : ""}`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24 text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Carregando imóveis do Supabase...
        </div>
      ) : filtered.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 py-16 text-center">
          <Building2 className="h-8 w-8 text-muted-foreground" />
          <div className="font-display text-lg font-semibold">Nenhum imóvel ainda</div>
          <p className="max-w-sm text-sm text-muted-foreground">
            Os imóveis publicados na plataforma aparecerão aqui com dados reais.
          </p>
          <button
            onClick={() => setOpen(true)}
            className="mt-2 rounded-full bg-emerald px-5 py-2 text-sm font-semibold text-white"
          >
            Cadastrar primeiro imóvel
          </button>
        </Card>
      ) : view === "grid" ? (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <Link
              key={p.id}
              to="/admin/properties/$id"
              params={{ id: p.id }}
              search={{ q: search.q, add: "" }}
              className="group overflow-hidden rounded-3xl border border-glass-border bg-card/60 shadow-soft backdrop-blur-xl transition-all hover:-translate-y-1 hover:border-emerald/20 hover:shadow-elegant"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-secondary/40">
                {p.cover_url ? (
                  <img src={p.cover_url} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                    <ImageOff className="h-6 w-6" />
                  </div>
                )}
                <div className="absolute left-4 top-4 flex gap-1.5">
                  <Badge variant={p.status === "available" ? "emerald" : "muted"}>
                    {statusLabel(p.status)}
                  </Badge>
                  {p.listing_type && (
                    <Badge variant={p.listing_type === "venda" ? "warn" : "blue"}>
                      {p.listing_type}
                    </Badge>
                  )}
                </div>
                <div className="absolute right-3 top-3 flex gap-1.5">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      shareProperty(p.id, p.title);
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
                    aria-label="Compartilhar imóvel"
                  >
                    <Share2 className="h-4 w-4" />
                  </button>
                  <PropertyActionsMenu
                    propertyId={p.id}
                    title={p.title}
                    status={p.status}
                    onEdit={() => setEditing(p)}
                    onChanged={load}
                  />
                </div>
                {p.price != null && (
                  <div className="absolute bottom-3 left-3 rounded-xl glass-strong px-2.5 py-1 text-[10px] font-semibold">
                    {formatPrice(p.price)}
                    {p.listing_type === "venda" ? "" : "/mês"}
                  </div>
                )}
              </div>
              <div className="p-5">
                <h3 className="font-display text-base font-semibold">{p.title}</h3>
                <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />{" "}
                  {[p.city, p.country].filter(Boolean).join(", ") || "Localização não informada"}
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-glass-border pt-3 text-xs">
                  <span className="text-muted-foreground">
                    {p.bedrooms ?? "—"} quartos · {p.bathrooms ?? "—"} banheiros ·{" "}
                    {p.area_sqm ?? "—"} m²
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <Card className="overflow-hidden bg-card/50 p-0 backdrop-blur-2xl">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-glass-border bg-glass-fill-strong text-left text-xs uppercase tracking-wide text-muted-foreground backdrop-blur-xl">
                <th className="px-5 py-3 font-medium">Imóvel</th>
                <th className="px-5 py-3 font-medium">Localização</th>
                <th className="px-5 py-3 font-medium">Anúncio</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right">Preço</th>
                <th className="px-5 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-glass-border bg-glass-fill/40 backdrop-blur-sm transition-colors last:border-0 hover:bg-glass-fill-strong"
                >
                  <td className="px-5 py-4">
                    <Link
                      to="/admin/properties/$id"
                      params={{ id: p.id }}
                      search={{ q: search.q, add: "" }}
                      className="font-semibold"
                    >
                      {p.title}
                    </Link>
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">
                    {[p.city, p.country].filter(Boolean).join(", ") || "—"}
                  </td>
                  <td className="px-5 py-4">
                    {p.listing_type && (
                      <Badge variant={p.listing_type === "venda" ? "warn" : "blue"}>
                        {p.listing_type}
                      </Badge>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <Badge variant={p.status === "available" ? "emerald" : "muted"}>
                      {statusLabel(p.status)}
                    </Badge>
                  </td>
                  <td className="px-5 py-4 text-right font-semibold">{formatPrice(p.price)}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => shareProperty(p.id, p.title)}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                        aria-label="Compartilhar imóvel"
                      >
                        <Share2 className="h-4 w-4" />
                      </button>
                      <PropertyActionsMenu
                        propertyId={p.id}
                        title={p.title}
                        status={p.status}
                        onEdit={() => setEditing(p)}
                        onChanged={load}
                        triggerClassName="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <AddPropertyModal
        open={open}
        onClose={() => {
          setOpen(false);
          load();
          if (search.add) navigate({ to: "/admin/properties", search: { q: textQuery } as any });
        }}
      />

      <EditPropertyModal
        property={editing}
        onClose={() => setEditing(null)}
        onSaved={() => {
          setEditing(null);
          load();
        }}
      />
    </>
  );
}

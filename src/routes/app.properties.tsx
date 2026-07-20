import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Building2, Plus, Share2 } from "lucide-react";
import { PageHeader, Card, Badge } from "@/components/app/ui";
import { AddPropertyModal } from "@/components/properties/AddPropertyModal";
import {
  EditPropertyModal,
  type EditableProperty,
} from "@/components/properties/EditPropertyModal";
import { PropertyActionsMenu } from "@/components/properties/PropertyActionsMenu";
import { useAuthUser } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

type Property = {
  id: string;
  title: string;
  description: string | null;
  status: string | null;
  price: number | null;
  nightly_rate: number | null;
  min_stay_nights: number | null;
  cleaning_fee: number | null;
  listing_type: string;
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
  bedrooms: number | null;
  bathrooms: number | null;
  area_sqm: number | null;
  year_built: number | null;
};

export const Route = createFileRoute("/app/properties")({
  component: OwnerProperties,
});

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

const statusLabels: Record<string, string> = {
  available: "Disponível",
  unavailable: "Indisponível",
  archived: "Arquivado",
  pending: "Pendente",
};

function formatPrice(value: number | null, listingType: string) {
  if (value == null) return "Sem preço";
  const amount = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(Number(value));
  return listingType === "venda" ? `${amount} (venda)` : `${amount}/mês`;
}

function OwnerProperties() {
  const { user } = useAuthUser();
  const [properties, setProperties] = useState<Property[] | null>(null);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<EditableProperty | null>(null);

  const load = () => {
    if (!user) return;
    supabase
      .from("properties")
      .select(
        "id, title, description, status, price, nightly_rate, min_stay_nights, cleaning_fee, listing_type, street, number, complement, neighborhood, city, state, postal_code, country, formatted_address, latitude, longitude, property_type, bedrooms, bathrooms, area_sqm, year_built",
      )
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setProperties(data ?? []));
  };

  useEffect(() => {
    load();
  }, [user]);

  return (
    <>
      <PageHeader title="Meus imóveis" subtitle="Imóveis cadastrados na sua conta">
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-2 rounded-full bg-emerald px-4 py-2 text-sm font-medium text-white shadow-glow"
        >
          <Plus className="h-4 w-4" /> Novo imóvel
        </button>
      </PageHeader>

      {properties === null ? (
        <div className="text-sm text-muted-foreground">Carregando…</div>
      ) : properties.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 py-12 text-center text-sm text-muted-foreground">
          <Building2 className="h-8 w-8" />
          <div>Nenhum imóvel vinculado à sua conta ainda.</div>
          <button
            onClick={() => setAdding(true)}
            className="rounded-full bg-emerald px-5 py-2 text-sm font-semibold text-white"
          >
            Cadastrar primeiro imóvel
          </button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((p) => (
            <Card key={p.id} className="bg-card/55 backdrop-blur-2xl">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald/15 text-emerald">
                  <Building2 className="h-5 w-5" />
                </div>
                <div className="flex items-center gap-1.5">
                  <Badge variant={p.status === "available" ? "emerald" : "muted"}>
                    {statusLabels[p.status ?? ""] ?? p.status ?? "Sem status"}
                  </Badge>
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
              </div>
              <div className="mt-3 font-display text-lg font-semibold">{p.title}</div>
              <div className="text-xs text-muted-foreground">
                {[p.city, p.state].filter(Boolean).join(", ") || "Endereço não informado"}
              </div>
              <div className="mt-2 text-sm font-medium">{formatPrice(p.price, p.listing_type)}</div>
              <Link
                to="/app/calendar"
                className="mt-3 inline-block text-xs font-medium text-emerald hover:underline"
              >
                Ver calendário →
              </Link>
            </Card>
          ))}
        </div>
      )}

      <AddPropertyModal
        open={adding}
        onClose={() => {
          setAdding(false);
          load();
        }}
        onCreated={load}
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

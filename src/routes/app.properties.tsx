import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Building2, Plus } from "lucide-react";
import { PageHeader, Card, Badge } from "@/components/app/ui";
import { useAuthUser } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

type Property = {
  id: string;
  title: string;
  status: string | null;
  price: number | null;
  listing_type: string;
  city: string | null;
  state: string | null;
};

export const Route = createFileRoute("/app/properties")({
  component: OwnerProperties,
});

function OwnerProperties() {
  const { user } = useAuthUser();
  const [properties, setProperties] = useState<Property[] | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("properties")
      .select("id, title, status, price, listing_type, city, state")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setProperties(data ?? []));
  }, [user]);

  return (
    <>
      <PageHeader title="Meus imóveis" subtitle="Imóveis cadastrados na sua conta">
        <button
          onClick={() => toast.info("Cadastro de imóveis pelo painel do dono ainda não está disponível — fale com a imobiliária.")}
          className="flex items-center gap-2 rounded-full bg-emerald px-4 py-2 text-sm font-medium text-white shadow-glow"
        >
          <Plus className="h-4 w-4" /> Novo imóvel
        </button>
      </PageHeader>

      {properties === null ? (
        <div className="text-sm text-muted-foreground">Carregando…</div>
      ) : properties.length === 0 ? (
        <Card className="py-12 text-center text-sm text-muted-foreground">
          Nenhum imóvel vinculado à sua conta ainda.
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((p) => (
            <Card key={p.id}>
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald/15 text-emerald">
                  <Building2 className="h-5 w-5" />
                </div>
                <Badge variant={p.status === "available" ? "emerald" : "muted"}>{p.status ?? "—"}</Badge>
              </div>
              <div className="mt-3 font-display text-lg font-semibold">{p.title}</div>
              <div className="text-xs text-muted-foreground">
                {[p.city, p.state].filter(Boolean).join(", ") || "Endereço não informado"}
              </div>
              <div className="mt-2 text-sm font-medium">
                {p.price != null ? `€${Number(p.price).toLocaleString("en-US")}` : "—"}
                {p.listing_type === "venda" ? " (venda)" : "/mês"}
              </div>
              <Link to="/app/calendar" className="mt-3 inline-block text-xs font-medium text-emerald hover:underline">
                Ver calendário →
              </Link>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, MapPin, Bed, Bath, Maximize, ImageOff, Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Card, Badge } from "@/components/app/ui";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/listing/$id")({
  component: PublicListing,
});

type PublicProperty = {
  id: string;
  title: string;
  description: string | null;
  price: number | null;
  status: string | null;
  listing_type: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  area_sqm: number | null;
  city: string | null;
  country: string | null;
  formatted_address: string | null;
  property_media: { storage_path: string; media_type: string; position: number }[];
};

function PublicListing() {
  const { id } = Route.useParams();
  const [property, setProperty] = useState<PublicProperty | null | undefined>(undefined);
  const [activePhoto, setActivePhoto] = useState(0);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    supabase
      .from("properties")
      .select("id, title, description, price, status, listing_type, bedrooms, bathrooms, area_sqm, city, country, formatted_address, property_media(storage_path, media_type, position)")
      .eq("id", id)
      .maybeSingle()
      .then(({ data }) => setProperty((data as PublicProperty) ?? null));
  }, [id]);

  const sendInterest = async () => {
    if (!name.trim()) {
      toast.error("Informe seu nome.");
      return;
    }
    setSending(true);
    const { error } = await supabase.from("leads").insert({
      name: name.trim(),
      email: email.trim() || null,
      phone: phone.trim() || null,
      property_id: id,
    });
    setSending(false);
    if (error) {
      toast.error(error.message || "Não foi possível enviar seu contato.");
      return;
    }
    setSent(true);
    toast.success("Interesse enviado! Entraremos em contato em breve.");
  };

  if (property === undefined) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center py-32 text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Carregando imóvel…
        </div>
        <Footer />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="mx-auto max-w-xl px-4 py-32 text-center">
          <h1 className="font-display text-2xl font-bold">Imóvel não encontrado</h1>
          <p className="mt-2 text-sm text-muted-foreground">Este link pode estar incorreto, ou o imóvel não está mais disponível.</p>
          <Link to="/" className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-emerald hover:underline">
            <ArrowLeft className="h-4 w-4" /> Voltar para a página inicial
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const photos = (property.property_media ?? []).filter((m) => m.media_type === "photo").sort((a, b) => a.position - b.position);
  const photoUrls = photos.map((p) => supabase.storage.from("property-media").getPublicUrl(p.storage_path).data.publicUrl);
  const location = property.formatted_address || [property.city, property.country].filter(Boolean).join(", ");

  return (
    <div className="min-h-screen overflow-x-hidden">
      <Navbar />

      <div className="mx-auto max-w-6xl px-4 py-10">
        <Link to="/" className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Link>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="relative aspect-[16/10] overflow-hidden rounded-3xl bg-secondary/40">
              {photoUrls.length > 0 ? (
                <img src={photoUrls[activePhoto]} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground">
                  <ImageOff className="h-8 w-8" />
                  <span className="text-xs">Sem fotos ainda</span>
                </div>
              )}
              {photoUrls.length > 1 && (
                <div className="absolute bottom-4 left-4 flex gap-2">
                  {photoUrls.map((url, i) => (
                    <button
                      key={url}
                      onClick={() => setActivePhoto(i)}
                      className={`h-14 w-20 overflow-hidden rounded-xl border-2 ${i === activePhoto ? "border-emerald" : "border-transparent"}`}
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
                  {property.listing_type && (
                    <Badge variant={property.listing_type === "venda" ? "warn" : "blue"}>{property.listing_type}</Badge>
                  )}
                </div>
                <h1 className="mt-2 font-display text-3xl font-bold">{property.title}</h1>
                {location && (
                  <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" /> {location}
                  </div>
                )}
              </div>
              {property.price != null && (
                <div className="text-right">
                  <div className="font-display text-3xl font-bold">€{Number(property.price).toLocaleString("en-US")}</div>
                  <div className="text-xs text-muted-foreground">{property.listing_type === "venda" ? "preço de venda" : "/ mês"}</div>
                </div>
              )}
            </div>

            <div className="mt-5 flex gap-6 rounded-2xl border border-glass-border bg-card/60 px-5 py-4 text-sm">
              <span className="flex items-center gap-1.5"><Bed className="h-4 w-4 text-muted-foreground" /> {property.bedrooms ?? "—"} quartos</span>
              <span className="flex items-center gap-1.5"><Bath className="h-4 w-4 text-muted-foreground" /> {property.bathrooms ?? "—"} banheiros</span>
              <span className="flex items-center gap-1.5"><Maximize className="h-4 w-4 text-muted-foreground" /> {property.area_sqm ?? "—"} m²</span>
            </div>

            {property.description && (
              <div className="mt-6">
                <h2 className="font-display text-lg font-semibold">Sobre o imóvel</h2>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{property.description}</p>
              </div>
            )}
          </div>

          <div>
            <Card className="sticky top-24">
              <h2 className="font-display text-lg font-semibold">Tenho interesse</h2>
              <p className="mt-1 text-xs text-muted-foreground">Deixe seus dados e a imobiliária entra em contato.</p>

              {sent ? (
                <div className="mt-4 rounded-2xl border border-emerald/30 bg-emerald/10 p-4 text-sm text-emerald">
                  Recebemos seu contato — obrigado pelo interesse!
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome"
                    className="w-full rounded-xl border border-glass-border bg-glass-fill p-2.5 text-sm outline-none focus:border-emerald/40"
                  />
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="E-mail"
                    type="email"
                    className="w-full rounded-xl border border-glass-border bg-glass-fill p-2.5 text-sm outline-none focus:border-emerald/40"
                  />
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Telefone"
                    className="w-full rounded-xl border border-glass-border bg-glass-fill p-2.5 text-sm outline-none focus:border-emerald/40"
                  />
                  <button
                    onClick={sendInterest}
                    disabled={sending}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-emerald px-4 py-2.5 text-sm font-semibold text-white shadow-glow disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" /> {sending ? "Enviando…" : "Enviar interesse"}
                  </button>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

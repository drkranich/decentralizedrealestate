import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowLeft, MapPin, Bed, Bath, Maximize, Calendar, Loader2, ImageOff,
  FileText, Wrench, Lock, Thermometer, Camera, Lightbulb, Activity, Sparkles,
} from "lucide-react";
import { Card, Badge, SectionTitle, StatCard, DemoDataBadge } from "@/components/app/ui";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/app/properties/$id")({
  component: PropertyDetails,
  notFoundComponent: () => (
    <div className="py-16 text-center">
      <h2 className="font-display text-2xl font-bold">Property not found</h2>
      <Link to="/app/properties" className="mt-4 inline-block text-sm text-emerald hover:underline">Back to properties</Link>
    </div>
  ),
});

type PropertyDetail = {
  id: string;
  title: string;
  description: string | null;
  price: number | null;
  status: string | null;
  property_type: string | null;
  listing_type: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  area_sqm: number | null;
  year_built: number | null;
  formatted_address: string | null;
  latitude: number | null;
  longitude: number | null;
  owner_id: string;
  property_media: { storage_path: string; media_type: string; position: number }[];
};

function PropertyDetails() {
  const { id } = Route.useParams();
  const [property, setProperty] = useState<PropertyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("overview");
  const [activePhoto, setActivePhoto] = useState(0);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("properties")
        .select("id, title, description, price, status, property_type, listing_type, bedrooms, bathrooms, area_sqm, year_built, formatted_address, latitude, longitude, owner_id, property_media(storage_path, media_type, position)")
        .eq("id", id)
        .maybeSingle();
      setProperty(data as PropertyDetail | null);
      setLoading(false);
    })();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading property…
      </div>
    );
  }
  if (!property) throw notFound();

  const photos = (property.property_media ?? []).filter((m) => m.media_type === "photo").sort((a, b) => a.position - b.position);
  const photoUrls = photos.map((p) => supabase.storage.from("property-media").getPublicUrl(p.storage_path).data.publicUrl);

  return (
    <>
      <Link to="/app/properties" className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to properties
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="relative aspect-[16/10] overflow-hidden rounded-3xl bg-secondary/40">
            {photoUrls.length > 0 ? (
              <img src={photoUrls[activePhoto]} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground">
                <ImageOff className="h-8 w-8" />
                <span className="text-xs">No photos uploaded yet</span>
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
                <Badge variant={property.status === "available" ? "emerald" : "muted"}>
                  {property.status ?? "unknown"} · #{property.id.slice(0, 8)}
                </Badge>
                {property.listing_type && (
                  <Badge variant={property.listing_type === "venda" ? "warn" : "blue"}>{property.listing_type}</Badge>
                )}
              </div>
              <h1 className="mt-2 font-display text-3xl font-bold">{property.title}</h1>
              {property.formatted_address && (
                <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {property.formatted_address}</span>
                </div>
              )}
            </div>
            {property.price != null && (
              <div className="text-right">
                <div className="font-display text-3xl font-bold">€{Number(property.price).toLocaleString("en-US")}</div>
                <div className="text-xs text-muted-foreground">/ month</div>
              </div>
            )}
          </div>

          <div className="mt-6 flex gap-6 overflow-x-auto border-b border-white/10">
            {["overview", "analytics", "documents", "maintenance", "smart devices", "bookings"].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`relative whitespace-nowrap pb-3 text-sm font-medium capitalize ${tab === t ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                {t}
                {tab === t && <span className="absolute -bottom-px left-0 right-0 h-0.5 rounded-full bg-emerald" />}
              </button>
            ))}
          </div>

          <div className="mt-6 space-y-6">
            {tab === "overview" && (
              <>
                <Card>
                  <SectionTitle title="Description" />
                  <p className="text-sm text-muted-foreground">{property.description || "No description provided yet."}</p>
                </Card>

                <Card>
                  <SectionTitle title="Specs" />
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    {[
                      { i: Bed, l: "Bedrooms", v: property.bedrooms != null ? String(property.bedrooms) : "—" },
                      { i: Bath, l: "Bathrooms", v: property.bathrooms != null ? String(property.bathrooms) : "—" },
                      { i: Maximize, l: "Area", v: property.area_sqm != null ? `${property.area_sqm} m²` : "—" },
                      { i: Calendar, l: "Built", v: property.year_built != null ? String(property.year_built) : "—" },
                    ].map((s) => (
                      <div key={s.l} className="rounded-2xl border border-white/10 bg-secondary/30 p-4">
                        <s.i className="h-4 w-4 text-emerald" />
                        <div className="mt-2 font-display text-lg font-bold">{s.v}</div>
                        <div className="text-xs text-muted-foreground">{s.l}</div>
                      </div>
                    ))}
                  </div>
                </Card>

                {property.latitude != null && property.longitude != null && (
                  <Card>
                    <SectionTitle title="Location" />
                    <div className="rounded-2xl border border-white/10 bg-secondary/30 p-4 text-sm">
                      <div className="font-semibold">{property.latitude}, {property.longitude}</div>
                      <a
                        className="mt-1 inline-block text-xs text-emerald hover:underline"
                        target="_blank" rel="noreferrer"
                        href={`https://www.openstreetmap.org/?mlat=${property.latitude}&mlon=${property.longitude}#map=16/${property.latitude}/${property.longitude}`}
                      >
                        Open in OpenStreetMap →
                      </a>
                    </div>
                  </Card>
                )}
              </>
            )}

            {tab === "analytics" && (
              <>
                <div className="flex justify-end"><DemoDataBadge /></div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <StatCard label="Revenue YTD" value="€38.4k" icon={Activity} />
                  <StatCard label="Net margin" value="68%" icon={Activity} />
                  <StatCard label="Avg stay" value="6.2 nights" icon={Activity} accent="skyblue" />
                </div>
                <Card>
                  <p className="text-sm text-muted-foreground">
                    Análise de receita real depende de reservas e pagamentos processados pela plataforma —
                    ainda não existem transações reais para este imóvel, então nenhum gráfico é mostrado aqui.
                  </p>
                </Card>
              </>
            )}

            {tab === "documents" && (
              <Card>
                <SectionTitle title="Contracts & documents" action={<DemoDataBadge />} />
                <p className="text-sm text-muted-foreground">Nenhum documento real anexado ainda. O upload de contratos ainda não está conectado ao Supabase Storage.</p>
              </Card>
            )}

            {tab === "maintenance" && (
              <Card>
                <SectionTitle title="Maintenance history" action={<DemoDataBadge />} />
                <p className="text-sm text-muted-foreground">Ainda não existe uma tabela de manutenção real — nada foi registrado para este imóvel.</p>
              </Card>
            )}

            {tab === "smart devices" && (
              <Card>
                <SectionTitle title="Smart devices" action={<DemoDataBadge />} />
                <div className="grid gap-3 sm:grid-cols-2 opacity-60">
                  {[
                    { i: Lock, l: "Front door" }, { i: Thermometer, l: "Climate" },
                    { i: Lightbulb, l: "Living lights" }, { i: Camera, l: "Entry camera" },
                  ].map((d) => (
                    <div key={d.l} className="rounded-2xl border border-white/10 bg-secondary/30 p-4">
                      <div className="flex items-center gap-2"><d.i className="h-4 w-4 text-muted-foreground" /><span className="text-sm font-semibold">{d.l}</span></div>
                      <div className="mt-2 text-xs text-muted-foreground">Nenhum dispositivo pareado</div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {tab === "bookings" && (
              <Card>
                <SectionTitle title="Upcoming bookings" action={<DemoDataBadge />} />
                <p className="text-sm text-muted-foreground">Ainda não existe um sistema de reservas real conectado — nenhuma reserva de fato foi feita para este imóvel.</p>
              </Card>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <Card>
            <div className="flex items-center justify-between">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Preço listado</div>
            </div>
            <div className="mt-2 font-display text-3xl font-bold">
              {property.price != null ? `€${Number(property.price).toLocaleString("en-US")}` : "—"}
            </div>
            <div className="text-xs text-muted-foreground">Sem histórico de pagamentos ainda — ROI e ocupação aparecerão aqui quando houver reservas reais.</div>
          </Card>

          <Card>
            <SectionTitle title="AI insights" action={<DemoDataBadge />} />
            <div className="space-y-2 text-xs opacity-70">
              <div className="rounded-xl border border-white/10 bg-secondary/30 p-3">
                <div className="font-semibold flex items-center gap-1"><Sparkles className="h-3 w-3" /> Sem dados suficientes</div>
                <div className="mt-1 text-muted-foreground">Insights de IA precisam de histórico real de preços e ocupação.</div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}

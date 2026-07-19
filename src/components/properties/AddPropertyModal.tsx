import { useEffect, useRef, useState } from "react";
import { X, Sparkles, Upload, MapPin, Loader2, Trash2, Film } from "lucide-react";
import { toast } from "sonner";
import { propertyTypes } from "@/data/properties";
import { supabase } from "@/lib/supabase";

type Props = { open: boolean; onClose: () => void };

type GeoSuggestion = {
  display_name: string;
  lat: string;
  lon: string;
  address: Record<string, string>;
};

type MediaFile = { file: File; url: string; kind: "photo" | "video" };

const emptyForm = {
  title: "",
  description: "",
  listingType: "aluguel" as "aluguel" | "venda",
  type: "Short stay",
  addressQuery: "",
  street: "",
  number: "",
  complement: "",
  neighborhood: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
  formattedAddress: "",
  lat: "",
  lng: "",
  nightly: "",
  monthly: "",
  minStay: "1",
  cleaningFee: "",
};

export function AddPropertyModal({ open, onClose }: Props) {
  const [step, setStep] = useState(1);
  const [generating, setGenerating] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [suggestions, setSuggestions] = useState<GeoSuggestion[]>([]);
  const [searching, setSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!open) return null;
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const reset = () => {
    setForm(emptyForm);
    setMedia([]);
    setStep(1);
    setSuggestions([]);
  };

  const generateDescription = () => {
    setGenerating(true);
    setTimeout(() => {
      set("description", `${form.title || "This property"} offers a premium stay in a sought-after location. Stylish interiors, high-end finishes, and seamless smart-home integration. Ideal for both short stays and longer relocations.`);
      setGenerating(false);
    }, 900);
  };

  // ===== World GPS autocomplete via OpenStreetMap Nominatim (no API key needed) =====
  const onAddressQueryChange = (v: string) => {
    set("addressQuery", v);
    setShowSuggestions(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (v.trim().length < 3) {
      setSuggestions([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const params = new URLSearchParams({
          format: "jsonv2",
          addressdetails: "1",
          limit: "5",
          q: v,
        });
        const res = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
          headers: { Accept: "application/json" },
        });
        const data = (await res.json()) as GeoSuggestion[];
        setSuggestions(data ?? []);
      } catch {
        setSuggestions([]);
      } finally {
        setSearching(false);
      }
    }, 450);
  };

  const applySuggestion = (s: GeoSuggestion) => {
    const a = s.address ?? {};
    setForm((f) => ({
      ...f,
      addressQuery: s.display_name,
      formattedAddress: s.display_name,
      street: a.road ?? a.pedestrian ?? f.street,
      number: a.house_number ?? f.number,
      neighborhood: a.suburb ?? a.neighbourhood ?? a.quarter ?? f.neighborhood,
      city: a.city ?? a.town ?? a.village ?? a.municipality ?? f.city,
      state: a.state ?? a.region ?? f.state,
      postalCode: a.postcode ?? f.postalCode,
      country: a.country ?? f.country,
      lat: s.lat,
      lng: s.lon,
    }));
    setShowSuggestions(false);
    setSuggestions([]);
  };

  // ===== Photos & video =====
  const onFilesSelected = (files: FileList | null) => {
    if (!files) return;
    const next: MediaFile[] = [];
    Array.from(files).forEach((file) => {
      const isVideo = file.type.startsWith("video/");
      if (!isVideo && !file.type.startsWith("image/")) return;
      if (file.size > 25 * 1024 * 1024) {
        toast.error(`${file.name} ultrapassa 25 MB e foi ignorado.`);
        return;
      }
      next.push({ file, url: URL.createObjectURL(file), kind: isVideo ? "video" : "photo" });
    });
    setMedia((m) => [...m, ...next]);
  };

  const removeMedia = (url: string) => {
    setMedia((m) => m.filter((item) => item.url !== url));
    URL.revokeObjectURL(url);
  };

  // ===== Publish: real Supabase insert + storage upload =====
  const publish = async () => {
    setPublishing(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;
      if (!user) {
        toast.error("Você precisa estar logado para publicar um imóvel.");
        return;
      }

      const priceValue = form.monthly || form.nightly;
      const { data: propertyRow, error: insertError } = await supabase
        .from("properties")
        .insert({
          title: form.title || "Untitled property",
          description: form.description || null,
          price: priceValue ? Number(String(priceValue).replace(/[^\d.]/g, "")) || null : null,
          status: "available",
          owner_id: user.id,
          listing_type: form.listingType,
          property_type: form.type,
          street: form.street || null,
          number: form.number || null,
          complement: form.complement || null,
          neighborhood: form.neighborhood || null,
          city: form.city || null,
          state: form.state || null,
          postal_code: form.postalCode || null,
          country: form.country || null,
          formatted_address: form.formattedAddress || form.addressQuery || null,
          latitude: form.lat ? Number(form.lat) : null,
          longitude: form.lng ? Number(form.lng) : null,
          nightly_rate: form.nightly ? Number(String(form.nightly).replace(/[^\d.]/g, "")) || null : null,
          min_stay_nights: form.minStay ? Number(form.minStay) || null : null,
          cleaning_fee: form.cleaningFee ? Number(String(form.cleaningFee).replace(/[^\d.]/g, "")) || null : null,
        })
        .select("id")
        .single();

      if (insertError) throw insertError;
      const propertyId = propertyRow.id as string;

      for (let i = 0; i < media.length; i++) {
        const item = media[i];
        const ext = item.file.name.split(".").pop();
        const path = `${user.id}/${propertyId}/${crypto.randomUUID()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("property-media")
          .upload(path, item.file, { upsert: false });
        if (uploadError) {
          toast.error(`Falha ao enviar ${item.file.name}: ${uploadError.message}`);
          continue;
        }
        await supabase.from("property_media").insert({
          property_id: propertyId,
          media_type: item.kind,
          storage_path: path,
          position: i,
        });
      }

      toast.success("Imóvel publicado com sucesso.");
      reset();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível publicar o imóvel.");
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in" onClick={onClose}>
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-card/90 shadow-elegant backdrop-blur-2xl animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div>
            <h3 className="font-display text-xl font-bold">Add property</h3>
            <p className="text-xs text-muted-foreground">Step {step} of 3</p>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-secondary">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[65vh] overflow-y-auto px-6 py-5">
          {step === 1 && (
            <div className="space-y-4">
              <Field label="Title">
                <input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Príncipe Real Loft" className="input" />
              </Field>
              <Field label="Description">
                <div className="relative">
                  <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={4} className="input resize-none pr-10" placeholder="Tell investors and tenants what makes this place special…" />
                  <button type="button" onClick={generateDescription} className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-emerald px-2.5 py-1 text-[10px] font-semibold text-white">
                    <Sparkles className="h-3 w-3" /> {generating ? "Writing…" : "AI"}
                  </button>
                </div>
              </Field>
              <Field label="Listing type">
                <div className="flex flex-wrap gap-2">
                  {(["aluguel", "venda"] as const).map((lt) => (
                    <button
                      key={lt}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, listingType: lt }))}
                      className={`rounded-full px-3.5 py-1.5 text-xs font-medium capitalize transition-colors ${form.listingType === lt ? "bg-emerald text-white" : "border border-white/10 bg-secondary/40"}`}
                    >
                      {lt === "aluguel" ? "Aluguel" : "Venda"}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Property type">
                <div className="flex flex-wrap gap-2">
                  {propertyTypes.map((t) => (
                    <button key={t} type="button" onClick={() => set("type", t)} className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${form.type === t ? "bg-foreground text-background" : "border border-white/10 bg-secondary/40"}`}>{t}</button>
                  ))}
                </div>
              </Field>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <Field label="Search address (auto-fills everything below via world GPS)">
                <div className="relative">
                  <div className="relative">
                    <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      value={form.addressQuery}
                      onChange={(e) => onAddressQueryChange(e.target.value)}
                      onFocus={() => setShowSuggestions(true)}
                      placeholder="Start typing a street, city or landmark…"
                      className="input pl-9"
                    />
                    {searching && <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />}
                  </div>
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute z-10 mt-1 max-h-56 w-full overflow-y-auto rounded-2xl border border-white/10 bg-card/95 p-1 shadow-elegant backdrop-blur-xl">
                      {suggestions.map((s, i) => (
                        <button
                          type="button"
                          key={i}
                          onClick={() => applySuggestion(s)}
                          className="block w-full rounded-xl px-3 py-2 text-left text-xs transition-colors hover:bg-secondary/60"
                        >
                          {s.display_name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Street"><input value={form.street} onChange={(e) => set("street", e.target.value)} className="input" /></Field>
                <Field label="Number"><input value={form.number} onChange={(e) => set("number", e.target.value)} className="input" /></Field>
                <Field label="Complement"><input value={form.complement} onChange={(e) => set("complement", e.target.value)} placeholder="Apt, floor…" className="input" /></Field>
                <Field label="Neighborhood"><input value={form.neighborhood} onChange={(e) => set("neighborhood", e.target.value)} className="input" /></Field>
                <Field label="City"><input value={form.city} onChange={(e) => set("city", e.target.value)} className="input" /></Field>
                <Field label="State / Province"><input value={form.state} onChange={(e) => set("state", e.target.value)} className="input" /></Field>
                <Field label="Postal code"><input value={form.postalCode} onChange={(e) => set("postalCode", e.target.value)} className="input" /></Field>
                <Field label="Country"><input value={form.country} onChange={(e) => set("country", e.target.value)} className="input" /></Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Latitude"><input value={form.lat} onChange={(e) => set("lat", e.target.value)} placeholder="38.7178" className="input" /></Field>
                <Field label="Longitude"><input value={form.lng} onChange={(e) => set("lng", e.target.value)} placeholder="-9.1486" className="input" /></Field>
              </div>

              <Field label="Photos & video">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/png,image/jpeg,image/webp,video/mp4"
                  className="hidden"
                  onChange={(e) => onFilesSelected(e.target.files)}
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => { e.preventDefault(); onFilesSelected(e.dataTransfer.files); }}
                  className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-white/15 bg-secondary/30 px-6 py-8 text-center transition-colors hover:border-emerald/40"
                >
                  <Upload className="h-5 w-5 text-muted-foreground" />
                  <div className="text-sm font-medium">Drop files or click to upload</div>
                  <div className="text-xs text-muted-foreground">JPG, PNG, MP4 — up to 25 MB each</div>
                </div>
                {media.length > 0 && (
                  <div className="mt-3 grid grid-cols-4 gap-2">
                    {media.map((m) => (
                      <div key={m.url} className="group relative aspect-square overflow-hidden rounded-xl border border-white/10 bg-secondary/40">
                        {m.kind === "photo" ? (
                          <img src={m.url} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <Film className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => removeMedia(m.url)}
                          className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </Field>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Nightly rate"><input value={form.nightly} onChange={(e) => set("nightly", e.target.value)} placeholder="€145" className="input" /></Field>
                <Field label="Monthly rate"><input value={form.monthly} onChange={(e) => set("monthly", e.target.value)} placeholder="€2,450" className="input" /></Field>
                <Field label="Min stay (nights)"><input value={form.minStay} onChange={(e) => set("minStay", e.target.value)} className="input" /></Field>
                <Field label="Cleaning fee"><input value={form.cleaningFee} onChange={(e) => set("cleaningFee", e.target.value)} placeholder="€60" className="input" /></Field>
              </div>
              <div className="rounded-2xl border border-dashed border-skyblue/30 bg-skyblue/5 p-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-skyblue"><Sparkles className="h-3.5 w-3.5" /> Estimativa de ROI por IA</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Ainda não disponível — a estimativa de retorno exige um histórico real de imóveis comparáveis na plataforma, que ainda não existe.
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-white/10 px-6 py-4">
          <button onClick={() => (step === 1 ? onClose() : setStep(step - 1))} className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            {step === 1 ? "Cancel" : "Back"}
          </button>
          <button
            disabled={publishing}
            onClick={() => (step < 3 ? setStep(step + 1) : publish())}
            className="flex items-center gap-2 rounded-full bg-emerald px-5 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {publishing && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {step < 3 ? "Continue" : publishing ? "Publishing…" : "Publish property"}
          </button>
        </div>
      </div>

      <style>{`.input{width:100%;border-radius:.875rem;border:1px solid oklch(1 0 0 / 0.1);background:color-mix(in oklab, var(--secondary) 40%, transparent);padding:.625rem .75rem;font-size:.875rem;outline:none}.input:focus{border-color:var(--emerald)}`}</style>
    </div>
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

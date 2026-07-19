import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, SectionTitle } from "@/components/app/ui";
import { useAuthUser } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { COUNTRIES, LANGUAGES, CURRENCIES, countryFlagEmoji } from "@/lib/geo-data";
import { WorldMapPicker } from "@/components/app/WorldMapPicker";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

type AddressState = {
  street: string;
  street_number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  postal_code: string;
  country_code: string;
  latitude: number | null;
  longitude: number | null;
  preferred_language: string;
  preferred_timezone: string;
  preferred_currency: string;
};

const empty: AddressState = {
  street: "",
  street_number: "",
  complement: "",
  neighborhood: "",
  city: "",
  state: "",
  postal_code: "",
  country_code: "",
  latitude: null,
  longitude: null,
  preferred_language: "",
  preferred_timezone: "",
  preferred_currency: "USD",
};

const selectClass =
  "mt-1 w-full rounded-xl border border-white/10 bg-white/[0.03] p-2.5 text-sm backdrop-blur-sm outline-none focus:border-emerald/40";
const inputClass = selectClass;
const labelClass = "text-xs font-medium text-muted-foreground";

export function AddressCard() {
  const { user } = useAuthUser();
  const [data, setData] = useState<AddressState>(empty);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [timezones, setTimezones] = useState<string[]>([]);

  useEffect(() => {
    try {
      const supported = (Intl as any).supportedValuesOf?.("timeZone");
      setTimezones(Array.isArray(supported) && supported.length ? supported : fallbackTimezones());
    } catch {
      setTimezones(fallbackTimezones());
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("users")
      .select(
        "street, street_number, complement, neighborhood, city, state, postal_code, country_code, latitude, longitude, preferred_language, preferred_timezone, preferred_currency"
      )
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data: row }) => {
        if (row) {
          setData({
            street: row.street ?? "",
            street_number: row.street_number ?? "",
            complement: row.complement ?? "",
            neighborhood: row.neighborhood ?? "",
            city: row.city ?? "",
            state: row.state ?? "",
            postal_code: row.postal_code ?? "",
            country_code: row.country_code ?? "",
            latitude: row.latitude ?? null,
            longitude: row.longitude ?? null,
            preferred_language: row.preferred_language ?? "",
            preferred_timezone: row.preferred_timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
            preferred_currency: row.preferred_currency ?? "USD",
          });
        } else {
          setData({ ...empty, preferred_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone });
        }
        setLoading(false);
      });
  }, [user]);

  const set = <K extends keyof AddressState>(key: K, value: AddressState[K]) =>
    setData((prev) => ({ ...prev, [key]: value }));

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("users").update(data).eq("id", user.id);
    setSaving(false);
    if (error) {
      toast.error(error.message || "Não foi possível salvar o endereço.");
      return;
    }
    toast.success("Endereço e preferências salvos.");
  };

  if (loading) {
    return (
      <Card>
        <div className="text-sm text-muted-foreground">Carregando…</div>
      </Card>
    );
  }

  return (
    <Card>
      <SectionTitle title="Endereço e localização" />

      <WorldMapPicker
        latitude={data.latitude}
        longitude={data.longitude}
        onChange={(lat, lng) => setData((prev) => ({ ...prev, latitude: lat, longitude: lng }))}
      />

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2">
          <label className={labelClass}>Rua</label>
          <input value={data.street} onChange={(e) => set("street", e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Número</label>
          <input value={data.street_number} onChange={(e) => set("street_number", e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Complemento</label>
          <input value={data.complement} onChange={(e) => set("complement", e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Bairro</label>
          <input value={data.neighborhood} onChange={(e) => set("neighborhood", e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Cidade</label>
          <input value={data.city} onChange={(e) => set("city", e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Estado / Província</label>
          <input value={data.state} onChange={(e) => set("state", e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>CEP / Postal code</label>
          <input value={data.postal_code} onChange={(e) => set("postal_code", e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>País</label>
          <Select value={data.country_code || undefined} onValueChange={(v) => set("country_code", v)}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Selecione…" />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              {COUNTRIES.map((c) => (
                <SelectItem key={c.code} value={c.code}>
                  {countryFlagEmoji(c.code)} {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <div>
          <label className={labelClass}>Idioma preferido</label>
          <Select value={data.preferred_language || undefined} onValueChange={(v) => set("preferred_language", v)}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Selecione…" />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              {LANGUAGES.map((l) => (
                <SelectItem key={l.code} value={l.code}>
                  {l.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className={labelClass}>Fuso horário preferido</label>
          <Select value={data.preferred_timezone || undefined} onValueChange={(v) => set("preferred_timezone", v)}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Selecione…" />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              {timezones.map((tz) => (
                <SelectItem key={tz} value={tz}>
                  {tz.replace(/_/g, " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className={labelClass}>Moeda preferida</label>
          <Select value={data.preferred_currency || undefined} onValueChange={(v) => set("preferred_currency", v)}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Selecione…" />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              {CURRENCIES.map((c) => (
                <SelectItem key={c.code} value={c.code}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <button
        onClick={save}
        disabled={saving}
        className="mt-6 rounded-xl bg-emerald px-5 py-2.5 text-sm font-semibold text-white shadow-glow backdrop-blur-sm disabled:opacity-50"
      >
        {saving ? "Salvando…" : "Salvar endereço e preferências"}
      </button>
    </Card>
  );
}

function fallbackTimezones(): string[] {
  return [
    "UTC",
    "America/Sao_Paulo",
    "America/New_York",
    "America/Chicago",
    "America/Denver",
    "America/Los_Angeles",
    "America/Mexico_City",
    "America/Bogota",
    "America/Buenos_Aires",
    "Europe/Lisbon",
    "Europe/London",
    "Europe/Madrid",
    "Europe/Paris",
    "Europe/Berlin",
    "Europe/Rome",
    "Africa/Luanda",
    "Africa/Johannesburg",
    "Asia/Dubai",
    "Asia/Kolkata",
    "Asia/Shanghai",
    "Asia/Tokyo",
    "Asia/Singapore",
    "Australia/Sydney",
    "Pacific/Auckland",
  ];
}

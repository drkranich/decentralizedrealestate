import { useEffect, useRef, useState } from "react";
import { Loader2, MapPin, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export type EditableProperty = {
  id: string;
  title: string;
  description: string | null;
  price: number | null;
  status: string | null;
  listing_type: string | null;
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
  nightly_rate: number | null;
  min_stay_nights: number | null;
  cleaning_fee: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  area_sqm: number | null;
  year_built: number | null;
};

type Props = {
  property: EditableProperty | null;
  onClose: () => void;
  onSaved: () => void;
};

type GeoSuggestion = {
  place_id?: number;
  display_name: string;
  lat: string;
  lon: string;
  address?: Record<string, string | undefined>;
};

const listingTypes = ["aluguel", "venda"] as const;
const statusOptions = [
  { value: "available", label: "Disponível" },
  { value: "unavailable", label: "Indisponível" },
  { value: "pending", label: "Pendente" },
  { value: "archived", label: "Arquivado" },
];

const inputClass =
  "w-full rounded-xl border border-glass-border bg-glass-fill p-2.5 text-sm outline-none backdrop-blur-sm focus:border-emerald/40 focus:ring-1 focus:ring-emerald/20";

function parseMoney(value: string) {
  const cleaned = value.trim().replace(/[^\d,.]/g, "");
  if (!cleaned) return null;
  const normalized = cleaned.includes(",")
    ? cleaned.replace(/\./g, "").replace(",", ".")
    : cleaned.replace(/,/g, "");
  const amount = Number(normalized);
  return Number.isFinite(amount) ? amount : null;
}

function parseDecimal(value: string) {
  const cleaned = value.trim().replace(/[^\d,.-]/g, "");
  if (!cleaned) return null;
  const normalized = cleaned.includes(",")
    ? cleaned.replace(/\./g, "").replace(",", ".")
    : cleaned.replace(/,/g, "");
  const amount = Number(normalized);
  return Number.isFinite(amount) ? amount : null;
}

function parseInteger(value: string) {
  if (!value.trim()) return null;
  const amount = Number(value.trim().replace(/[^\d-]/g, ""));
  return Number.isInteger(amount) ? amount : null;
}

function buildFormattedAddress(parts: {
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}) {
  const streetLine = [parts.street, parts.number].filter(Boolean).join(", ");
  return [streetLine, parts.neighborhood, parts.city, parts.state, parts.postalCode, parts.country]
    .filter(Boolean)
    .join(" - ");
}

export function EditPropertyModal({ property, onClose, onSaved }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [listingType, setListingType] = useState<"aluguel" | "venda">("aluguel");
  const [status, setStatus] = useState("available");
  const [propertyType, setPropertyType] = useState("");
  const [price, setPrice] = useState("");
  const [nightlyRate, setNightlyRate] = useState("");
  const [minStayNights, setMinStayNights] = useState("");
  const [cleaningFee, setCleaningFee] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [areaSqm, setAreaSqm] = useState("");
  const [yearBuilt, setYearBuilt] = useState("");
  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [complement, setComplement] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("");
  const [formattedAddress, setFormattedAddress] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [suggestions, setSuggestions] = useState<GeoSuggestion[]>([]);
  const [searchingAddress, setSearchingAddress] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!property) return;
    setTitle(property.title ?? "");
    setDescription(property.description ?? "");
    setListingType(property.listing_type === "venda" ? "venda" : "aluguel");
    setStatus(property.status ?? "available");
    setPropertyType(property.property_type ?? "");
    setPrice(property.price != null ? String(property.price) : "");
    setNightlyRate(property.nightly_rate != null ? String(property.nightly_rate) : "");
    setMinStayNights(property.min_stay_nights != null ? String(property.min_stay_nights) : "");
    setCleaningFee(property.cleaning_fee != null ? String(property.cleaning_fee) : "");
    setBedrooms(property.bedrooms != null ? String(property.bedrooms) : "");
    setBathrooms(property.bathrooms != null ? String(property.bathrooms) : "");
    setAreaSqm(property.area_sqm != null ? String(property.area_sqm) : "");
    setYearBuilt(property.year_built != null ? String(property.year_built) : "");
    setStreet(property.street ?? "");
    setNumber(property.number ?? "");
    setComplement(property.complement ?? "");
    setNeighborhood(property.neighborhood ?? "");
    setCity(property.city ?? "");
    setState(property.state ?? "");
    setPostalCode(property.postal_code ?? "");
    setCountry(property.country ?? "");
    setFormattedAddress(property.formatted_address ?? "");
    setLatitude(property.latitude != null ? String(property.latitude) : "");
    setLongitude(property.longitude != null ? String(property.longitude) : "");
    setSuggestions([]);
    setShowSuggestions(false);
  }, [property]);

  if (!property) return null;

  const searchAddress = (value: string) => {
    setFormattedAddress(value);
    setShowSuggestions(true);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.trim().length < 3) {
      setSuggestions([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setSearchingAddress(true);
      try {
        const params = new URLSearchParams({
          format: "jsonv2",
          addressdetails: "1",
          limit: "6",
          q: value,
        });
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?${params.toString()}`,
          { headers: { Accept: "application/json" } },
        );
        const data = (await response.json()) as GeoSuggestion[];
        setSuggestions(data ?? []);
      } catch {
        setSuggestions([]);
      } finally {
        setSearchingAddress(false);
      }
    }, 450);
  };

  const applySuggestion = (suggestion: GeoSuggestion) => {
    const address = suggestion.address ?? {};
    setFormattedAddress(suggestion.display_name);
    setStreet(address.road ?? address.pedestrian ?? address.footway ?? address.path ?? "");
    setNumber(address.house_number ?? "");
    setNeighborhood(
      address.suburb ??
        address.neighbourhood ??
        address.quarter ??
        address.city_district ??
        address.district ??
        "",
    );
    setCity(address.city ?? address.town ?? address.village ?? address.municipality ?? "");
    setState(address.state ?? address.region ?? "");
    setPostalCode(address.postcode ?? "");
    setCountry(address.country ?? "");
    setLatitude(suggestion.lat);
    setLongitude(suggestion.lon);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const save = async () => {
    if (!title.trim()) {
      toast.error("O título é obrigatório.");
      return;
    }

    setSaving(true);
    const { error } = await supabase
      .from("properties")
      .update({
        title: title.trim(),
        description: description.trim() || null,
        status,
        listing_type: listingType,
        property_type: propertyType.trim() || null,
        price: parseMoney(price),
        nightly_rate: parseMoney(nightlyRate),
        min_stay_nights: parseInteger(minStayNights),
        cleaning_fee: parseMoney(cleaningFee),
        bedrooms: parseInteger(bedrooms),
        bathrooms: parseInteger(bathrooms),
        area_sqm: parseDecimal(areaSqm),
        year_built: parseInteger(yearBuilt),
        street: street.trim() || null,
        number: number.trim() || null,
        complement: complement.trim() || null,
        neighborhood: neighborhood.trim() || null,
        city: city.trim() || null,
        state: state.trim() || null,
        postal_code: postalCode.trim() || null,
        country: country.trim() || null,
        formatted_address:
          formattedAddress.trim() ||
          buildFormattedAddress({
            street,
            number,
            neighborhood,
            city,
            state,
            postalCode,
            country,
          }) ||
          null,
        latitude: parseDecimal(latitude),
        longitude: parseDecimal(longitude),
      })
      .eq("id", property.id);

    setSaving(false);
    if (error) {
      toast.error(error.message || "Não foi possível salvar as alterações.");
      return;
    }

    toast.success("Imóvel atualizado.");
    onSaved();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-3xl border border-glass-border bg-card/90 shadow-elegant backdrop-blur-2xl animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-glass-border px-6 py-4">
          <h3 className="font-display text-xl font-bold">Editar imóvel</h3>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-secondary"
            aria-label="Fechar edição"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[72vh] space-y-6 overflow-y-auto px-6 py-5">
          <section className="rounded-2xl border border-glass-border bg-glass-fill p-4 backdrop-blur-xl">
            <h4 className="mb-4 font-display text-base font-semibold">Dados principais</h4>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Título" value={title} onChange={setTitle} />
              <Field
                label="Tipo do imóvel"
                value={propertyType}
                onChange={setPropertyType}
                placeholder="Apartamento, casa, hotel, fazenda..."
              />
              <div className="md:col-span-2">
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  Descrição
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className={`${inputClass} resize-none`}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  Tipo de listagem
                </label>
                <div className="flex flex-wrap gap-2">
                  {listingTypes.map((lt) => (
                    <button
                      key={lt}
                      type="button"
                      onClick={() => setListingType(lt)}
                      className={`rounded-full px-3.5 py-1.5 text-xs font-medium capitalize transition-colors ${
                        listingType === lt
                          ? "bg-emerald text-white"
                          : "border border-glass-border bg-secondary/40"
                      }`}
                    >
                      {lt === "aluguel" ? "Aluguel" : "Venda"}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  Status
                </label>
                <div className="flex flex-wrap gap-2">
                  {statusOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setStatus(option.value)}
                      className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                        status === option.value
                          ? "bg-foreground text-background"
                          : "border border-glass-border bg-secondary/40"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-glass-border bg-glass-fill p-4 backdrop-blur-xl">
            <h4 className="mb-4 font-display text-base font-semibold">Endereço</h4>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  Endereço completo
                </label>
                <div className="relative">
                  <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={formattedAddress}
                    onChange={(event) => searchAddress(event.target.value)}
                    onFocus={() => setShowSuggestions(true)}
                    placeholder="Rua, número, bairro, cidade, país"
                    className={`${inputClass} pl-9 pr-9`}
                  />
                  {searchingAddress && (
                    <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                  )}
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute z-20 mt-2 max-h-64 w-full overflow-y-auto rounded-2xl border border-glass-border bg-card/95 p-1 shadow-elegant backdrop-blur-2xl">
                      {suggestions.map((suggestion) => (
                        <button
                          key={`${suggestion.place_id ?? suggestion.display_name}`}
                          type="button"
                          onClick={() => applySuggestion(suggestion)}
                          className="block w-full rounded-xl px-3 py-2 text-left text-xs leading-relaxed transition-colors hover:bg-glass-fill-strong"
                        >
                          {suggestion.display_name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <Field label="Rua" value={street} onChange={setStreet} />
              <Field label="Número" value={number} onChange={setNumber} />
              <Field label="Complemento" value={complement} onChange={setComplement} />
              <Field label="Bairro" value={neighborhood} onChange={setNeighborhood} />
              <Field label="Cidade" value={city} onChange={setCity} />
              <Field label="Estado / província" value={state} onChange={setState} />
              <Field label="CEP / código postal" value={postalCode} onChange={setPostalCode} />
              <Field label="País" value={country} onChange={setCountry} />
              <Field label="Latitude" value={latitude} onChange={setLatitude} inputMode="decimal" />
              <Field
                label="Longitude"
                value={longitude}
                onChange={setLongitude}
                inputMode="decimal"
              />
            </div>
          </section>

          <section className="rounded-2xl border border-glass-border bg-glass-fill p-4 backdrop-blur-xl">
            <h4 className="mb-4 font-display text-base font-semibold">Características e valores</h4>
            <div className="grid gap-4 md:grid-cols-4">
              <Field label="Quartos" value={bedrooms} onChange={setBedrooms} inputMode="numeric" />
              <Field
                label="Banheiros"
                value={bathrooms}
                onChange={setBathrooms}
                inputMode="numeric"
              />
              <Field label="Área (m²)" value={areaSqm} onChange={setAreaSqm} inputMode="decimal" />
              <Field
                label="Ano de construção"
                value={yearBuilt}
                onChange={setYearBuilt}
                inputMode="numeric"
              />
              <Field label="Preço" value={price} onChange={setPrice} inputMode="decimal" />
              <Field
                label="Diária"
                value={nightlyRate}
                onChange={setNightlyRate}
                inputMode="decimal"
              />
              <Field
                label="Estadia mínima"
                value={minStayNights}
                onChange={setMinStayNights}
                inputMode="numeric"
              />
              <Field
                label="Taxa de limpeza"
                value={cleaningFee}
                onChange={setCleaningFee}
                inputMode="decimal"
              />
            </div>
          </section>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-glass-border px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-full border border-glass-border bg-secondary/40 px-4 py-2 text-sm font-medium hover:bg-secondary"
          >
            Cancelar
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="rounded-full bg-emerald px-4 py-2 text-sm font-semibold text-white shadow-glow disabled:opacity-50"
          >
            {saving ? "Salvando..." : "Salvar alterações"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  inputMode,
  placeholder,
  wide = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  inputMode?: "text" | "decimal" | "numeric";
  placeholder?: string;
  wide?: boolean;
}) {
  return (
    <div className={wide ? "md:col-span-2" : undefined}>
      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        inputMode={inputMode}
        placeholder={placeholder}
        className={inputClass}
      />
    </div>
  );
}

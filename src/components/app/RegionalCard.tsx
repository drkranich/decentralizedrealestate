import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, SectionTitle } from "@/components/app/ui";
import { useAuthUser } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { LANGUAGES, CURRENCIES } from "@/lib/geo-data";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

const labelClass = "text-xs font-medium text-muted-foreground";

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

export function RegionalCard() {
  const { user } = useAuthUser();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [timezones, setTimezones] = useState<string[]>([]);
  const [language, setLanguage] = useState("");
  const [timezone, setTimezone] = useState("");
  const [currency, setCurrency] = useState("USD");

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
      .select("preferred_language, preferred_timezone, preferred_currency")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data: row }) => {
        setLanguage(row?.preferred_language ?? "");
        setTimezone(row?.preferred_timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone);
        setCurrency(row?.preferred_currency ?? "USD");
        setLoading(false);
      });
  }, [user]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("users")
      .update({ preferred_language: language, preferred_timezone: timezone, preferred_currency: currency })
      .eq("id", user.id);
    setSaving(false);
    if (error) {
      toast.error(error.message || "Não foi possível salvar as preferências.");
      return;
    }
    toast.success("Preferências regionais salvas.");
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
      <SectionTitle title="Idioma e moeda" />
      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className={labelClass}>Idioma</label>
          <Select value={language || undefined} onValueChange={setLanguage}>
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
          <label className={labelClass}>Moeda</label>
          <Select value={currency || undefined} onValueChange={setCurrency}>
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
        <div>
          <label className={labelClass}>Timezone</label>
          <Select value={timezone || undefined} onValueChange={setTimezone}>
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
      </div>

      <button
        onClick={save}
        disabled={saving}
        className="mt-6 rounded-xl bg-emerald px-5 py-2.5 text-sm font-semibold text-white shadow-glow backdrop-blur-sm disabled:opacity-50"
      >
        {saving ? "Salvando…" : "Salvar preferências"}
      </button>
    </Card>
  );
}

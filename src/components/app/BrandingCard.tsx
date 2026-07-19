import { useEffect, useRef, useState } from "react";
import { ImageIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Card, SectionTitle } from "@/components/app/ui";
import { supabase } from "@/lib/supabase";
import { useBrand } from "@/components/brand/BrandProvider";

export function BrandingCard() {
  const brand = useBrand();
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [faviconUrl, setFaviconUrl] = useState<string | null>(null);
  const [heroImageUrl, setHeroImageUrl] = useState<string | null>(null);
  const [brandName, setBrandName] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingName, setSavingName] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const [uploadingHero, setUploadingHero] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);
  const heroInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase
      .from("app_settings")
      .select("logo_url, favicon_url, brand_name, hero_image_url")
      .eq("id", true)
      .maybeSingle()
      .then(({ data }) => {
        setLogoUrl(data?.logo_url ?? null);
        setFaviconUrl(data?.favicon_url ?? null);
        setHeroImageUrl(data?.hero_image_url ?? null);
        setBrandName(data?.brand_name ?? "");
        setLoading(false);
      });
  }, []);

  const saveName = async () => {
    setSavingName(true);
    const { error } = await supabase
      .from("app_settings")
      .update({ brand_name: brandName.trim() || null, updated_at: new Date().toISOString() })
      .eq("id", true);
    setSavingName(false);
    if (error) {
      toast.error(error.message || "Não foi possível salvar o nome.");
      return;
    }
    toast.success("Nome da plataforma atualizado para toda a plataforma.");
  };

  const upload = async (
    file: File,
    kind: "logo" | "favicon" | "hero",
    setUploading: (v: boolean) => void,
    setUrl: (v: string) => void,
    column: "logo_url" | "favicon_url" | "hero_image_url",
    maxMb = 2
  ) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Selecione um arquivo de imagem.");
      return;
    }
    if (file.size > maxMb * 1024 * 1024) {
      toast.error(`A imagem deve ter no máximo ${maxMb}MB.`);
      return;
    }
    setUploading(true);
    const ext = file.name.split(".").pop() || "png";
    const path = `${kind}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("branding")
      .upload(path, file, { upsert: true, cacheControl: "3600" });
    if (uploadError) {
      setUploading(false);
      toast.error(uploadError.message || "Não foi possível enviar a imagem.");
      return;
    }
    const { data: pub } = supabase.storage.from("branding").getPublicUrl(path);
    const cacheBustedUrl = `${pub.publicUrl}?t=${Date.now()}`;
    const { error: dbError } = await supabase
      .from("app_settings")
      .update({ [column]: cacheBustedUrl, updated_at: new Date().toISOString() })
      .eq("id", true);
    setUploading(false);
    if (dbError) {
      toast.error(dbError.message || "Imagem enviada, mas não foi possível salvar a referência.");
      return;
    }
    setUrl(cacheBustedUrl);
    const labels = { logo: "Logo", favicon: "Favicon", hero: "Imagem de capa" };
    toast.success(`${labels[kind]} atualizado(a) para toda a plataforma.`);
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
      <SectionTitle title="Marca (nome, logo, favicon e capa)" />
      <p className="mb-6 -mt-2 text-xs text-muted-foreground">
        Alterações aqui valem para toda a plataforma — admin, painel de donos/inquilinos e site público.
      </p>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="text-xs font-medium text-muted-foreground">Logo</label>
          <div className="mt-2 flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-glass-border bg-glass-fill">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="h-full w-full object-contain" />
              ) : (
                <ImageIcon className="h-6 w-6 text-muted-foreground" />
              )}
            </div>
            <div>
              <button
                onClick={() => logoInputRef.current?.click()}
                disabled={uploadingLogo}
                className="rounded-xl border border-glass-border bg-glass-fill px-4 py-2 text-sm font-medium backdrop-blur-sm disabled:opacity-50"
              >
                {uploadingLogo ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enviar logo"}
              </button>
              <p className="mt-1 text-xs text-muted-foreground">PNG/SVG, fundo transparente, até 2MB.</p>
            </div>
          </div>
          <input
            ref={logoInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) upload(f, "logo", setUploadingLogo, setLogoUrl, "logo_url");
              e.target.value = "";
            }}
          />
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground">Favicon</label>
          <div className="mt-2 flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-glass-border bg-glass-fill">
              {faviconUrl ? (
                <img src={faviconUrl} alt="Favicon" className="h-8 w-8 object-contain" />
              ) : (
                <ImageIcon className="h-6 w-6 text-muted-foreground" />
              )}
            </div>
            <div>
              <button
                onClick={() => faviconInputRef.current?.click()}
                disabled={uploadingFavicon}
                className="rounded-xl border border-glass-border bg-glass-fill px-4 py-2 text-sm font-medium backdrop-blur-sm disabled:opacity-50"
              >
                {uploadingFavicon ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enviar favicon"}
              </button>
              <p className="mt-1 text-xs text-muted-foreground">Quadrado, PNG/ICO, até 2MB.</p>
            </div>
          </div>
          <input
            ref={faviconInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) upload(f, "favicon", setUploadingFavicon, setFaviconUrl, "favicon_url");
              e.target.value = "";
            }}
          />
        </div>
      </div>

      <div className="mt-6">
        <label className="text-xs font-medium text-muted-foreground">Imagem de capa (Hero da página pública)</label>
        <div className="mt-2 flex items-center gap-4">
          <div className="flex h-16 w-28 items-center justify-center overflow-hidden rounded-2xl border border-glass-border bg-glass-fill">
            {heroImageUrl ? (
              <img src={heroImageUrl} alt="Capa" className="h-full w-full object-cover" />
            ) : (
              <ImageIcon className="h-6 w-6 text-muted-foreground" />
            )}
          </div>
          <div>
            <button
              onClick={() => heroInputRef.current?.click()}
              disabled={uploadingHero}
              className="rounded-xl border border-glass-border bg-glass-fill px-4 py-2 text-sm font-medium backdrop-blur-sm disabled:opacity-50"
            >
              {uploadingHero ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enviar imagem de capa"}
            </button>
            <p className="mt-1 text-xs text-muted-foreground">Paisagem, JPG/PNG, até 8MB. Aparece atrás do título na página inicial.</p>
          </div>
        </div>
        <input
          ref={heroInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) upload(f, "hero", setUploadingHero, setHeroImageUrl, "hero_image_url", 8);
            e.target.value = "";
          }}
        />
      </div>

      <div className="mt-6">
        <label className="text-xs font-medium text-muted-foreground">Nome da plataforma</label>
        <div className="mt-2 flex max-w-md items-center gap-2">
          <input
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
            placeholder={brand.name}
            className="w-full rounded-xl border border-glass-border bg-glass-fill p-2.5 text-sm outline-none focus:border-emerald/40"
          />
          <button
            onClick={saveName}
            disabled={savingName}
            className="shrink-0 rounded-xl bg-emerald px-4 py-2.5 text-sm font-semibold text-white shadow-glow disabled:opacity-60"
          >
            {savingName ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar"}
          </button>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">Aparece no logo, título da aba e em toda a página pública.</p>
      </div>
    </Card>
  );
}

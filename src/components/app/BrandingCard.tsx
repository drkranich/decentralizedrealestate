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
  const [loading, setLoading] = useState(true);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase
      .from("app_settings")
      .select("logo_url, favicon_url")
      .eq("id", true)
      .maybeSingle()
      .then(({ data }) => {
        setLogoUrl(data?.logo_url ?? null);
        setFaviconUrl(data?.favicon_url ?? null);
        setLoading(false);
      });
  }, []);

  const upload = async (
    file: File,
    kind: "logo" | "favicon",
    setUploading: (v: boolean) => void,
    setUrl: (v: string) => void,
    column: "logo_url" | "favicon_url"
  ) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Selecione um arquivo de imagem.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 2MB.");
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
    toast.success(kind === "logo" ? "Logo atualizado para toda a plataforma." : "Favicon atualizado para toda a plataforma.");
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
      <SectionTitle title="Marca (logo e favicon)" />
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

      <p className="mt-6 text-xs text-muted-foreground">
        Nome atual da plataforma: <span className="font-medium text-foreground">{brand.name}</span>
      </p>
    </Card>
  );
}

import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { BrandConfig, defaultBrand } from "@/config/brand";
import { supabase } from "@/lib/supabase";

const BrandContext = createContext<BrandConfig>(defaultBrand);

export function useBrand() {
  return useContext(BrandContext);
}

type Props = { brand?: Partial<BrandConfig>; children: ReactNode };

export function BrandProvider({ brand, children }: Props) {
  // Global, DB-backed overrides (logo/favicon) set by the super admin in
  // /admin/settings → Branding. Applies platform-wide, to every visitor,
  // regardless of role or auth state.
  const [globalOverride, setGlobalOverride] = useState<{
    logo_url?: string | null;
    favicon_url?: string | null;
    brand_name?: string | null;
    hero_image_url?: string | null;
  }>({});

  useEffect(() => {
    let cancelled = false;
    supabase
      .from("app_settings")
      .select("logo_url, favicon_url, brand_name, hero_image_url")
      .eq("id", true)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled && data) setGlobalOverride(data);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<BrandConfig>(() => {
    const base: BrandConfig = !brand
      ? defaultBrand
      : {
          ...defaultBrand,
          ...brand,
          theme: {
            ...defaultBrand.theme,
            ...(brand.theme ?? {}),
            colors: { ...defaultBrand.theme.colors, ...(brand.theme?.colors ?? {}) },
            typography: { ...defaultBrand.theme.typography, ...(brand.theme?.typography ?? {}) },
          },
          logo: { ...defaultBrand.logo, ...(brand.logo ?? {}) },
          legal: { ...defaultBrand.legal, ...(brand.legal ?? {}) },
        };

    const nameOverridden = Boolean(globalOverride.brand_name);
    return {
      ...base,
      name: globalOverride.brand_name || base.name,
      // A custom name typed by the admin won't match the default's
      // hardcoded plain/accent split (e.g. "Property" + "OS"), so drop it
      // and render the custom name as one plain string instead of a stale
      // split that no longer matches.
      nameParts: nameOverridden ? undefined : base.nameParts,
      logo: globalOverride.logo_url ? { ...base.logo, src: globalOverride.logo_url } : base.logo,
    };
  }, [brand, globalOverride]);

  // Inject brand tokens into CSS variables so Tailwind utilities (bg-primary,
  // text-emerald, etc.) reflect the active brand without code changes.
  useEffect(() => {
    const root = document.documentElement;
    const c = value.theme.colors;
    root.style.setProperty("--primary", `oklch(${c.primary})`);
    root.style.setProperty("--ring", `oklch(${c.primary})`);
    root.style.setProperty("--accent", `oklch(${c.accent})`);
    root.style.setProperty("--destructive", `oklch(${c.danger})`);
    root.style.setProperty("--emerald", `oklch(${c.primary})`);
    root.style.setProperty("--emerald-glow", `oklch(${c.primaryGlow})`);
    root.style.setProperty("--emerald-deep", `oklch(${c.primaryDeep})`);
    root.style.setProperty("--skyblue", `oklch(${c.accent})`);
    root.style.setProperty("--silver", `oklch(${c.neutral})`);
    root.style.setProperty("--radius", value.theme.radius);
    root.style.setProperty("--font-sans", value.theme.typography.sans);
    root.style.setProperty("--font-display", value.theme.typography.display);
    document.title = `${value.name} — ${value.tagline}`;
  }, [value]);

  // Global favicon override — creates/updates the <link rel="icon"> tag.
  useEffect(() => {
    const href = globalOverride.favicon_url;
    if (!href) return;
    let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = href;
  }, [globalOverride.favicon_url]);

  return <BrandContext.Provider value={value}>{children}</BrandContext.Provider>;
}

/**
 * Public-site cover image (Hero background), set by the super admin in
 * /admin/settings → Branding. Falls back to the bundled default image when
 * no override has been uploaded yet.
 */
export function useHeroImageUrl(): string | null {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    supabase
      .from("app_settings")
      .select("hero_image_url")
      .eq("id", true)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) setUrl(data?.hero_image_url ?? null);
      });
    return () => {
      cancelled = true;
    };
  }, []);
  return url;
}


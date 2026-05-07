import { createContext, useContext, useEffect, useMemo, ReactNode } from "react";
import { BrandConfig, defaultBrand } from "@/config/brand";

const BrandContext = createContext<BrandConfig>(defaultBrand);

export function useBrand() {
  return useContext(BrandContext);
}

type Props = { brand?: Partial<BrandConfig>; children: ReactNode };

export function BrandProvider({ brand, children }: Props) {
  const value = useMemo<BrandConfig>(() => {
    if (!brand) return defaultBrand;
    return {
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
  }, [brand]);

  // Inject brand tokens into CSS variables so Tailwind utilities (bg-primary,
  // text-emerald, etc.) reflect the active brand without code changes.
  useEffect(() => {
    const root = document.documentElement;
    const c = value.theme.colors;
    root.style.setProperty("--primary", `oklch(${c.primary})`);
    root.style.setProperty("--ring", `oklch(${c.primary})`);
    root.style.setProperty("--accent", `oklch(${c.accent})`);
    root.style.setProperty("--emerald", `oklch(${c.primary})`);
    root.style.setProperty("--emerald-glow", `oklch(${c.primaryGlow})`);
    root.style.setProperty("--skyblue", `oklch(${c.accent})`);
    root.style.setProperty("--silver", `oklch(${c.neutral})`);
    root.style.setProperty("--radius", value.theme.radius);
    root.style.setProperty("--font-sans", value.theme.typography.sans);
    root.style.setProperty("--font-display", value.theme.typography.display);
    document.title = `${value.name} — ${value.tagline}`;
  }, [value]);

  return <BrandContext.Provider value={value}>{children}</BrandContext.Provider>;
}

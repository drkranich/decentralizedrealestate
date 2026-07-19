// ============================================================
// GLOBAL BRANDING CONFIG
// Edit this file to rebrand the entire platform.
// All UI components consume values from here via <BrandProvider>.
// ============================================================

export type BrandTheme = {
  // Colors are OKLCH strings (no oklch() wrapper) so they can be injected
  // as CSS variables at runtime. Format: "L C H" e.g. "0.62 0.16 160".
  colors: {
    primary: string;
    primaryGlow: string;
    primaryDeep: string; // darkest gradient stop for metallic/gold surfaces
    accent: string; // secondary brand color - baby blue
    danger: string; // alert / dispute / CTA color - red
    neutral: string; // silver / gray
  };
  typography: {
    sans: string; // body font stack
    display: string; // heading font stack
    googleFontsHref?: string;
  };
  radius: string; // base radius e.g. "1rem"
};

export type BrandConfig = {
  name: string; // full app name e.g. "Seravie Heritage"
  nameParts?: { plain: string; accent: string }; // optional split for gradient styling
  tagline: string;
  shortName: string; // 2-3 letters for monogram
  domain: string;
  logo: {
    // lucide-react icon name OR a URL/imported asset path
    icon: string; // lucide icon name (default mark)
    src?: string; // optional image asset that replaces the icon
  };
  theme: BrandTheme;
  social: { label: string; href: string; icon: string }[];
  legal: { copyright: string; certifications: string[] };
};

export const defaultBrand: BrandConfig = {
  name: "Seravie Heritage",
  nameParts: { plain: "Seravie", accent: "Heritage" },
  tagline: "Global real estate infrastructure.",
  shortName: "SH",
  domain: "decentralizedrealestate.ciclonovo2022.workers.dev",
  logo: { icon: "Building2" },
  theme: {
    colors: {
      // Ouro (gold) - primary brand color, rendered as a metallic gradient
      // (light -> mid -> deep) on solid surfaces via .bg-emerald/.bg-primary
      primary: "0.76 0.12 88",
      primaryGlow: "0.9 0.08 92",
      primaryDeep: "0.58 0.11 72",
      // Baby blue - secondary brand color, used for secondary actions/data
      accent: "0.83 0.055 235",
      // Red - alerts, disputes, CTAs
      danger: "0.58 0.22 25",
      neutral: "0.78 0.01 240",
    },
    typography: {
      // Plus Jakarta Sans: warm, humanist, modern, less corporate than Inter.
      sans: '"Plus Jakarta Sans", system-ui, sans-serif',
      // Cormorant Garamond: heritage editorial display face for institutional headings.
      display: '"Cormorant Garamond", "Plus Jakarta Sans", system-ui, serif',
      googleFontsHref:
        "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,500&display=swap",
    },
    radius: "1rem",
  },
  social: [
    { label: "Twitter", href: "#", icon: "Twitter" },
    { label: "GitHub", href: "#", icon: "Github" },
    { label: "LinkedIn", href: "#", icon: "Linkedin" },
  ],
  legal: {
    copyright: "(c) 2026 Seravie Heritage. All rights reserved.",
    certifications: ["SOC 2 Type II", "GDPR", "ISO 27001"],
  },
};

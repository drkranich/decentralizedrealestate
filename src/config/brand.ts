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
    accent: string;       // secondary brand color (e.g. sky blue)
    neutral: string;      // silver / gray
  };
  typography: {
    sans: string;         // body font stack
    display: string;      // heading font stack
    googleFontsHref?: string;
  };
  radius: string;         // base radius e.g. "1rem"
};

export type BrandConfig = {
  name: string;           // full app name e.g. "Property OS"
  nameParts?: { plain: string; accent: string }; // optional split for gradient styling
  tagline: string;
  shortName: string;      // 2-3 letters for monogram
  domain: string;
  logo: {
    // lucide-react icon name OR a URL/imported asset path
    icon: string;         // lucide icon name (default mark)
    src?: string;         // optional image asset that replaces the icon
  };
  theme: BrandTheme;
  social: { label: string; href: string; icon: string }[];
  legal: { copyright: string; certifications: string[] };
};

export const defaultBrand: BrandConfig = {
  name: "Property OS",
  nameParts: { plain: "Property", accent: "OS" },
  tagline: "The global operating system for real estate.",
  shortName: "PO",
  domain: "propertyos.com",
  logo: { icon: "Building2" },
  theme: {
    colors: {
      primary: "0.62 0.16 160",
      primaryGlow: "0.78 0.18 158",
      accent: "0.72 0.13 230",
      neutral: "0.78 0.01 240",
    },
    typography: {
      sans: '"Inter", "SF Pro Display", system-ui, sans-serif',
      display: '"Space Grotesk", "Inter", system-ui, sans-serif',
      googleFontsHref:
        "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap",
    },
    radius: "1rem",
  },
  social: [
    { label: "Twitter", href: "#", icon: "Twitter" },
    { label: "GitHub", href: "#", icon: "Github" },
    { label: "LinkedIn", href: "#", icon: "Linkedin" },
  ],
  legal: {
    copyright: "© 2026 Property OS. All rights reserved.",
    certifications: ["SOC 2 Type II", "GDPR", "ISO 27001"],
  },
};

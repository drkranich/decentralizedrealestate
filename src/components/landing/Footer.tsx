import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/brand/Logo";
import { useBrand } from "@/components/brand/BrandProvider";
import { usePublicContent } from "@/lib/siteContent";

const iconMap = Icons as unknown as Record<string, LucideIcon>;

const cols = [
  {
    title: "Plataforma",
    links: [
      { label: "Marketplace", href: "/#platform" },
      { label: "Tokenização", href: "/#token" },
      { label: "Investimentos", href: "/#invest" },
      { label: "Mercado secundário", href: "/#exchange" },
      { label: "Gestão patrimonial", href: "/#infrastructure" },
      { label: "Internacional", href: "/#international" },
    ],
  },
  {
    title: "Infraestrutura",
    links: [
      { label: "API", to: "/api" },
      { label: "Documentação", to: "/docs" },
      { label: "SDKs", to: "/sdks" },
      { label: "Webhooks", to: "/webhooks" },
      { label: "Status", to: "/status" },
      { label: "Changelog", to: "/changelog" },
    ],
  },
  {
    title: "Empresa",
    links: [
      { label: "Sobre", to: "/about" },
      { label: "Carreiras", to: "/careers" },
      { label: "Blog", to: "/blog" },
      { label: "Imprensa", to: "/press" },
      { label: "Relações com investidores", to: "/investor-relations" },
      { label: "White-label", to: "/white-label" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Termos", to: "/terms" },
      { label: "Privacidade", to: "/privacy" },
      { label: "Cookies", to: "/cookies" },
      { label: "Compliance", to: "/compliance" },
      { label: "Licenças", to: "/licenses" },
      { label: "Segurança", to: "/security" },
    ],
  },
];

const footerCtaDefaults = {
  heading_prefix: "Construa patrimônio imobiliário",
  heading_emphasis: "com infraestrutura digital.",
  subheading:
    "A Seravie Heritage conecta ativos reais, capital global e tecnologia para a próxima geração do mercado imobiliário.",
};

export function Footer() {
  const brand = useBrand();
  const c = usePublicContent("footer_cta", footerCtaDefaults);
  return (
    <footer id="cta" className="border-t border-border">
      <div className="mx-auto max-w-7xl px-4 py-16">
        <div className="rounded-[2rem] bg-skyblue/5 p-10 md:p-14">
          <div className="grid items-center gap-8 lg:grid-cols-2">
            <div>
              <h3 className="font-display text-3xl font-bold md:text-4xl">
                {c.heading_prefix} <span className="text-emerald">{c.heading_emphasis}</span>
              </h3>
              <p className="mt-3 text-muted-foreground">{c.subheading}</p>
            </div>
            <div className="flex flex-wrap gap-3 lg:justify-end">
              <Link
                to="/signup"
                className="rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background hover:opacity-90"
              >
                Criar conta
              </Link>
              <Link to="/login" className="rounded-full glass px-6 py-3 text-sm font-medium">
                Acessar plataforma
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-16 grid gap-10 md:grid-cols-6">
          <div className="md:col-span-2">
            <Logo />
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">{brand.tagline}</p>
            <div className="mt-5 flex gap-2">
              {brand.social.map((s) => {
                const I = iconMap[s.icon] ?? Icons.Link;
                return (
                  <a
                    key={s.label}
                    href={s.href}
                    aria-label={s.label}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-border hover:bg-secondary"
                  >
                    <I className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </div>
          {cols.map((c) => (
            <div key={c.title}>
              <div className="font-display text-sm font-semibold">{c.title}</div>
              <ul className="mt-4 space-y-2.5">
                {c.links.map((l) => (
                  <li key={l.label}>
                    {"to" in l ? (
                      <Link
                        to={l.to}
                        className="text-sm text-muted-foreground hover:text-foreground"
                      >
                        {l.label}
                      </Link>
                    ) : (
                      <a
                        href={l.href}
                        className="text-sm text-muted-foreground hover:text-foreground"
                      >
                        {l.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground md:flex-row md:items-center">
          <div>{brand.legal.copyright}</div>
          <div className="flex gap-4">
            {brand.legal.certifications.map((c) => (
              <span key={c}>{c}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

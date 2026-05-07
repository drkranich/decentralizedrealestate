import * as Icons from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { useBrand } from "@/components/brand/BrandProvider";

const cols = [
  { title: "Product", links: ["Properties", "Invest", "Manage", "Marketplace", "AI", "Pricing"] },
  { title: "Developers", links: ["API", "Documentation", "SDKs", "Webhooks", "Status", "Changelog"] },
  { title: "Company", links: ["About", "Careers", "Blog", "Press", "Investor relations", "White-label"] },
  { title: "Legal", links: ["Terms", "Privacy", "Cookies", "Compliance", "Licenses", "Security"] },
];

export function Footer() {
  const brand = useBrand();
  return (
    <footer id="cta" className="border-t border-border">
      <div className="mx-auto max-w-7xl px-4 py-16">
        <div className="rounded-[2rem] bg-gradient-to-br from-emerald/10 via-skyblue/5 to-transparent p-10 md:p-14">
          <div className="grid items-center gap-8 lg:grid-cols-2">
            <div>
              <h3 className="font-display text-3xl font-bold md:text-4xl">Ready to operate real estate <span className="gradient-text">like a global tech company?</span></h3>
              <p className="mt-3 text-muted-foreground">Join 84,000+ owners, hosts and investors using {brand.name}.</p>
            </div>
            <div className="flex flex-wrap gap-3 lg:justify-end">
              <button className="rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background hover:opacity-90">Start free</button>
              <button className="rounded-full glass px-6 py-3 text-sm font-medium">Talk to sales</button>
            </div>
          </div>
        </div>

        <div className="mt-16 grid gap-10 md:grid-cols-6">
          <div className="md:col-span-2">
            <Logo />
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">{brand.tagline}</p>
            <div className="mt-5 flex gap-2">
              {brand.social.map((s) => {
                const I = (Icons as any)[s.icon] ?? Icons.Link;
                return (
                  <a key={s.label} href={s.href} aria-label={s.label} className="flex h-9 w-9 items-center justify-center rounded-full border border-border hover:bg-secondary">
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
                  <li key={l}>
                    <a href="#" className="text-sm text-muted-foreground hover:text-foreground">{l}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground md:flex-row md:items-center">
          <div>{brand.legal.copyright}</div>
          <div className="flex gap-4">
            {brand.legal.certifications.map((c) => <span key={c}>{c}</span>)}
          </div>
        </div>
      </div>
    </footer>
  );
}

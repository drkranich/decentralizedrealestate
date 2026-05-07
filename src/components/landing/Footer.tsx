import { Building2, Github, Twitter, Linkedin } from "lucide-react";

const cols = [
  { title: "Product", links: ["Properties", "Invest", "Manage", "Marketplace", "AI", "Pricing"] },
  { title: "Developers", links: ["API", "Documentation", "SDKs", "Webhooks", "Status", "Changelog"] },
  { title: "Company", links: ["About", "Careers", "Blog", "Press", "Investor relations", "White-label"] },
  { title: "Legal", links: ["Terms", "Privacy", "Cookies", "Compliance", "Licenses", "Security"] },
];

export function Footer() {
  return (
    <footer id="cta" className="border-t border-border">
      <div className="mx-auto max-w-7xl px-4 py-16">
        <div className="rounded-[2rem] bg-gradient-to-br from-emerald/10 via-skyblue/5 to-transparent p-10 md:p-14">
          <div className="grid items-center gap-8 lg:grid-cols-2">
            <div>
              <h3 className="font-display text-3xl font-bold md:text-4xl">Ready to operate real estate <span className="gradient-text">like a global tech company?</span></h3>
              <p className="mt-3 text-muted-foreground">Join 84,000+ owners, hosts and investors using Property OS.</p>
            </div>
            <div className="flex flex-wrap gap-3 lg:justify-end">
              <button className="rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background hover:opacity-90">Start free</button>
              <button className="rounded-full glass px-6 py-3 text-sm font-medium">Talk to sales</button>
            </div>
          </div>
        </div>

        <div className="mt-16 grid gap-10 md:grid-cols-6">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald to-skyblue">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <span className="font-display text-lg font-bold">Property<span className="gradient-text">OS</span></span>
            </div>
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">The global operating system for real estate. Invest, host, manage — anywhere.</p>
            <div className="mt-5 flex gap-2">
              {[Twitter, Github, Linkedin].map((I, i) => (
                <a key={i} href="#" className="flex h-9 w-9 items-center justify-center rounded-full border border-border hover:bg-secondary">
                  <I className="h-4 w-4" />
                </a>
              ))}
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
          <div>© 2026 Property OS. All rights reserved.</div>
          <div className="flex gap-4">
            <span>SOC 2 Type II</span>
            <span>GDPR</span>
            <span>ISO 27001</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

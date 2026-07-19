import { Languages, DollarSign, CreditCard, Globe2 } from "lucide-react";
import { useBrand } from "@/components/brand/BrandProvider";
import { usePublicContent } from "@/lib/siteContent";

const features = [
  { icon: Languages, title: "32 languages", desc: "Localized end-to-end across the platform." },
  { icon: DollarSign, title: "48 currencies", desc: "Live FX, hedged payouts, multi-currency wallets." },
  { icon: CreditCard, title: "Stripe & Wise", desc: "Native rails for cards, ACH, SEPA, and global wires." },
  { icon: Globe2, title: "84 countries", desc: "Local compliance, KYC, and tax handled per jurisdiction." },
];

const internationalDefaults = {
  badge: "Global by default",
  heading_prefix: "Built for a",
  heading_emphasis: "borderless",
  heading_suffix: "real estate market.",
  subheading: "From Lisbon to Tokyo, Property OS speaks your language, your currency, and your rules.",
};

export function International() {
  const brand = useBrand();
  const c = usePublicContent("international", internationalDefaults);
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-4">
        <div className="rounded-[2rem] border border-border bg-foreground p-10 text-background md:p-16">
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-background/15 px-4 py-1.5 text-xs font-medium">
                <Globe2 className="h-3.5 w-3.5 text-emerald" /> {c.badge}
              </div>
              <h2 className="mt-4 font-display text-4xl font-bold md:text-5xl">{c.heading_prefix} <span className="text-emerald">{c.heading_emphasis}</span> {c.heading_suffix}</h2>
              <p className="mt-4 max-w-md text-background/70">{c.subheading}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {features.map((f, i) => (
                <div
                  key={f.title}
                  className="rounded-2xl border border-background/10 bg-background/5 p-5 backdrop-blur-sm"
                >
                  <f.icon className="h-5 w-5 text-emerald" />
                  <div className="mt-3 font-display text-base font-semibold">{f.title}</div>
                  <div className="mt-1 text-xs text-background/60">{f.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

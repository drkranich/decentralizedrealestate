import { FileSignature, BrainCircuit, CreditCard, Wrench, Sparkles, KeyRound, Globe } from "lucide-react";

const features = [
  { icon: FileSignature, title: "Automated contracts", desc: "Smart leases generated, signed and enforced automatically across jurisdictions." },
  { icon: BrainCircuit, title: "AI dynamic pricing", desc: "Models that re-price daily based on demand, events and competitor data." },
  { icon: CreditCard, title: "Payment automation", desc: "Multi-currency rent collection, instant payouts, programmable splits." },
  { icon: Wrench, title: "Maintenance pipeline", desc: "Tenant requests routed to vetted local pros with photo verification." },
  { icon: Sparkles, title: "Cleaning orchestration", desc: "Turnover cleaning auto-scheduled around bookings with QC inspections." },
  { icon: KeyRound, title: "Smart lock integration", desc: "Generate, share and revoke digital keys per stay. Yale, August, Nuki." },
  { icon: Globe, title: "International tenants", desc: "KYC, background, and credit checks across 80+ countries in seconds." },
];

export function Manage() {
  return (
    <section id="manage" className="py-24">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <div className="text-sm font-medium text-emerald">Operations</div>
          <h2 className="mt-2 font-display text-4xl font-bold md:text-5xl">A complete <span className="text-emerald">management ecosystem</span></h2>
          <p className="mt-4 text-muted-foreground">Every workflow your portfolio needs — automated, observable, accountable.</p>
        </div>

        <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="group relative overflow-hidden rounded-3xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-emerald/40 hover:shadow-elegant"
            >
              <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-emerald/10 opacity-0 blur-2xl transition-opacity group-hover:opacity-100" />
              <div className="relative">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald/15">
                  <f.icon className="h-5 w-5 text-emerald" />
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold">{f.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

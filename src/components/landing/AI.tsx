import { motion } from "framer-motion";
import { Bot, Lightbulb, Activity, UserCheck, Sparkles } from "lucide-react";
import { useBrand } from "@/components/brand/BrandProvider";

const features = [
  { icon: Bot, title: "AI Assistant", desc: "24/7 conversational concierge for tenants, owners and investors." },
  { icon: Lightbulb, title: "Smart recommendations", desc: "Personalized listings, optimal pricing and renovation suggestions." },
  { icon: Activity, title: "Predictive analytics", desc: "Forecast occupancy, churn and yield with 92% accuracy." },
  { icon: UserCheck, title: "Tenant scoring", desc: "Risk assessment combining KYC, behavior and on-platform history." },
];

export function AI() {
  const brand = useBrand();
  return (
    <section id="ai" className="relative overflow-hidden py-24">
      <div className="absolute inset-0 -z-10 bg-skyblue/5" />
      <div className="absolute inset-0 -z-10 grid-bg opacity-30" />
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-medium">
              <Sparkles className="h-3.5 w-3.5 text-emerald" />
              Powered by AI
            </div>
            <h2 className="mt-4 font-display text-4xl font-bold md:text-5xl">Intelligence at <span className="text-emerald">every layer</span></h2>
            <p className="mt-4 text-muted-foreground">{brand.name} embeds proprietary models across pricing, risk, recommendation and operations — so the platform learns and improves with every transaction.</p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {features.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="rounded-2xl border border-border bg-card p-5 transition-all hover:border-emerald/40"
                >
                  <f.icon className="h-5 w-5 text-emerald" />
                  <div className="mt-3 font-display text-base font-semibold">{f.title}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{f.desc}</div>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="rounded-3xl glass-strong p-6 shadow-elegant">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald shadow-glow">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="font-semibold">{brand.name} AI</div>
                  <div className="text-xs text-muted-foreground">Online · Global concierge</div>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <div className="ml-auto max-w-[80%] rounded-2xl rounded-tr-sm bg-foreground p-3 text-sm text-background">
                  Find me a 2-bed in Lisbon under €2,500 with high ROI.
                </div>
                <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-secondary p-3 text-sm">
                  I found 14 matches. Top pick: <span className="font-semibold">Príncipe Real Loft</span> — €2,450/mo, 14.2% projected ROI, 92% occupancy. Want to schedule a virtual tour?
                </div>
                <div className="flex flex-wrap gap-2">
                  {["Schedule tour", "Show ROI breakdown", "Compare 3"].map((c) => (
                    <button key={c} className="rounded-full border border-border bg-background/50 px-3 py-1.5 text-xs font-medium hover:border-emerald/40">
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="absolute -inset-4 -z-10 rounded-3xl bg-emerald/20 blur-3xl" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

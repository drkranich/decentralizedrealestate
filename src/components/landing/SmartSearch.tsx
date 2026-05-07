import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Globe, Building2, Calendar, Sofa, TrendingUp, Map } from "lucide-react";

const filters = [
  { icon: MapPin, label: "City" },
  { icon: Globe, label: "Country" },
  { icon: Building2, label: "Property type" },
  { icon: Calendar, label: "Short stay" },
  { icon: Calendar, label: "Long stay" },
  { icon: Sofa, label: "Furnished" },
  { icon: TrendingUp, label: "Investment" },
];

export function SmartSearch() {
  const [active, setActive] = useState("City");
  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-4xl font-bold md:text-5xl">Smart search, <span className="gradient-text">infinite results</span></h2>
          <p className="mt-4 text-muted-foreground">Filter across 84 countries, with live map data and AI-curated matches.</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-12 overflow-hidden rounded-3xl glass-strong shadow-elegant"
        >
          <div className="flex flex-wrap gap-2 border-b border-border/50 p-4">
            {filters.map((f) => (
              <button
                key={f.label}
                onClick={() => setActive(f.label)}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  active === f.label
                    ? "bg-foreground text-background shadow-soft"
                    : "text-muted-foreground hover:bg-secondary"
                }`}
              >
                <f.icon className="h-3.5 w-3.5" />
                {f.label}
              </button>
            ))}
          </div>

          <div className="grid gap-0 md:grid-cols-2">
            <div className="space-y-3 p-6">
              {["Lisbon, Portugal", "Tokyo, Japan", "New York, USA", "Bali, Indonesia"].map((c, i) => (
                <div key={c} className="flex items-center justify-between rounded-2xl border border-border/50 bg-card/50 p-4 transition-all hover:border-emerald/40 hover:shadow-soft">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald/15 to-skyblue/15">
                      <MapPin className="h-4 w-4 text-emerald" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{c}</div>
                      <div className="text-xs text-muted-foreground">{1240 - i * 213} active listings</div>
                    </div>
                  </div>
                  <div className="text-xs font-medium text-emerald">+{12 + i}% YoY</div>
                </div>
              ))}
            </div>

            <div className="relative overflow-hidden bg-gradient-to-br from-emerald/10 via-skyblue/5 to-transparent p-6">
              <div className="absolute inset-0 grid-bg opacity-50" />
              <div className="relative flex h-full min-h-[280px] flex-col items-center justify-center text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl glass-strong shadow-glow">
                  <Map className="h-6 w-6 text-emerald" />
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold">Live map preview</h3>
                <p className="mt-2 max-w-xs text-sm text-muted-foreground">Real-time pins across continents. Heatmaps for ROI, occupancy, and pricing.</p>
                <div className="mt-6 flex gap-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-2 w-2 rounded-full bg-emerald animate-pulse-glow" style={{ animationDelay: `${i * 0.2}s` }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

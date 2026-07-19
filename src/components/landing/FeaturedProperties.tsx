import { motion } from "framer-motion";
import { Heart, Star, TrendingUp, Users } from "lucide-react";
import { useState } from "react";

const properties = [
  { city: "Lisbon", country: "Portugal", price: "€2,450", roi: 14.2, income: "€3,200", occ: 92, rating: 4.9, gradient: "emerald/40" },
  { city: "Tokyo", country: "Japan", price: "¥320,000", roi: 11.8, income: "¥480k", occ: 88, rating: 4.8, gradient: "skyblue/40" },
  { city: "Tulum", country: "Mexico", price: "$1,850", roi: 16.5, income: "$2,900", occ: 95, rating: 5.0, gradient: "emerald-glow/50" },
  { city: "Dubai", country: "UAE", price: "AED 8,200", roi: 13.1, income: "AED 12k", occ: 90, rating: 4.9, gradient: "silver/40" },
  { city: "Barcelona", country: "Spain", price: "€2,100", roi: 12.4, income: "€2,750", occ: 89, rating: 4.7, gradient: "skyblue/40" },
  { city: "Bali", country: "Indonesia", price: "$1,250", roi: 17.8, income: "$2,100", occ: 94, rating: 4.9, gradient: "emerald/50" },
];

export function FeaturedProperties() {
  const [favs, setFavs] = useState<Set<number>>(new Set());
  const toggle = (i: number) => {
    setFavs((s) => {
      const n = new Set(s);
      n.has(i) ? n.delete(i) : n.add(i);
      return n;
    });
  };

  return (
    <section id="properties" className="py-24">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex flex-col items-end justify-between gap-6 md:flex-row">
          <div>
            <div className="text-sm font-medium text-emerald">Featured</div>
            <h2 className="mt-2 font-display text-4xl font-bold md:text-5xl">Premium properties <br />curated globally</h2>
          </div>
          <p className="max-w-md text-muted-foreground">Hand-picked listings with verified yields, occupancy data, and instant booking.</p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {properties.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="group overflow-hidden rounded-3xl border border-border bg-card shadow-soft transition-all hover:-translate-y-1 hover:shadow-elegant"
            >
              <div className={`relative aspect-[4/3] overflow-hidden bg-${p.gradient}`}>
                <div className="absolute inset-0 grid-bg opacity-40" />
                <button
                  onClick={() => toggle(i)}
                  className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full glass-strong transition-transform hover:scale-110"
                  aria-label="Favorite"
                >
                  <Heart className={`h-4 w-4 transition-colors ${favs.has(i) ? "fill-emerald text-emerald" : ""}`} />
                </button>
                <div className="absolute bottom-4 left-4 rounded-full glass-strong px-3 py-1 text-xs font-semibold">
                  ROI {p.roi}%
                </div>
                <div className="absolute right-4 bottom-4 flex items-center gap-1 rounded-full glass-strong px-3 py-1 text-xs font-semibold">
                  <Star className="h-3 w-3 fill-emerald text-emerald" />
                  {p.rating}
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-display text-lg font-semibold">{p.city}</h3>
                    <p className="text-sm text-muted-foreground">{p.country}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-display text-lg font-bold">{p.price}</div>
                    <div className="text-xs text-muted-foreground">/ month</div>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 border-t border-border/50 pt-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-3.5 w-3.5 text-emerald" />
                    <div>
                      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Income</div>
                      <div className="text-xs font-semibold">{p.income}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-3.5 w-3.5 text-skyblue" />
                    <div>
                      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Occupancy</div>
                      <div className="text-xs font-semibold">{p.occ}%</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

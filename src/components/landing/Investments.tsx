import { motion } from "framer-motion";
import { LineChart, Line, ResponsiveContainer, Area, AreaChart } from "recharts";
import { TrendingUp, Coins, PieChart } from "lucide-react";
import { Button } from "@/components/ui/button";

const data = Array.from({ length: 12 }, (_, i) => ({ x: i, y: 100 + i * 8 + Math.sin(i) * 6 }));

const tokens = [
  { name: "Lisbon Luxury Loft", token: "LIS-LX01", yield: 9.4, raised: 78, target: "€420K", color: "from-emerald to-emerald-glow" },
  { name: "Tokyo Skyline Tower", token: "TKY-SK22", yield: 7.8, raised: 92, target: "¥85M", color: "from-skyblue to-emerald" },
  { name: "Bali Beach Villa", token: "BAL-BV09", yield: 12.1, raised: 64, target: "$280K", color: "from-emerald-glow to-skyblue" },
];

export function Investments() {
  return (
    <section id="invest" className="relative py-24">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-emerald/5 to-transparent" />
      <div className="mx-auto max-w-7xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <div className="text-sm font-medium text-emerald">Invest</div>
          <h2 className="mt-2 font-display text-4xl font-bold md:text-5xl">Tokenized real estate. <br /><span className="gradient-text">Fractional ownership.</span></h2>
          <p className="mt-4 text-muted-foreground">Buy fractions of premium properties starting at $50. Earn monthly rental yield. Sell anytime on the secondary market.</p>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {tokens.map((t, i) => (
            <motion.div
              key={t.token}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-soft transition-all hover:shadow-elegant"
            >
              <div className={`absolute -right-20 -top-20 h-48 w-48 rounded-full bg-gradient-to-br ${t.color} opacity-20 blur-3xl transition-opacity group-hover:opacity-40`} />

              <div className="relative">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Coins className="h-4 w-4 text-emerald" />
                    <span className="text-xs font-mono font-medium text-muted-foreground">{t.token}</span>
                  </div>
                  <div className="rounded-full bg-emerald/10 px-2.5 py-1 text-xs font-semibold text-emerald">
                    {t.yield}% APY
                  </div>
                </div>
                <h3 className="mt-3 font-display text-xl font-semibold">{t.name}</h3>

                <div className="mt-4 h-20">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                      <defs>
                        <linearGradient id={`g-${i}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="oklch(0.62 0.16 160)" stopOpacity={0.5} />
                          <stop offset="100%" stopColor="oklch(0.62 0.16 160)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Area type="monotone" dataKey="y" stroke="oklch(0.62 0.16 160)" strokeWidth={2} fill={`url(#g-${i})`} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-4">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Raised</span>
                    <span className="font-semibold">{t.raised}% of {t.target}</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary">
                    <div className={`h-full rounded-full bg-gradient-to-r ${t.color}`} style={{ width: `${t.raised}%` }} />
                  </div>
                </div>

                <Button className="mt-5 w-full rounded-full bg-foreground text-background hover:bg-foreground/90">
                  <TrendingUp className="h-4 w-4" />
                  Invest now
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
          <div className="flex items-center gap-2"><PieChart className="h-4 w-4 text-emerald" /> 12,400+ active investors</div>
          <div className="flex items-center gap-2"><LineChart className="h-4 w-4 text-emerald" /> $84M assets tokenized</div>
          <div className="flex items-center gap-2"><Coins className="h-4 w-4 text-emerald" /> Avg 11.2% annual yield</div>
        </div>
      </div>
    </section>
  );
}

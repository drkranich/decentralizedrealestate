import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bar, BarChart, ResponsiveContainer, Line, LineChart } from "recharts";
import { User, Building, TrendingUp, Shield } from "lucide-react";

const tabs = [
  { id: "tenant", label: "Tenant", icon: User },
  { id: "owner", label: "Owner", icon: Building },
  { id: "investor", label: "Investor", icon: TrendingUp },
  { id: "admin", label: "Admin", icon: Shield },
];

const data = Array.from({ length: 12 }, (_, i) => ({ x: i, y: 40 + Math.random() * 60 }));

export function DashboardPreview() {
  const [tab, setTab] = useState("owner");
  const stats: Record<string, { label: string; value: string }[]> = {
    tenant: [
      { label: "Next rent", value: "€2,100" },
      { label: "Days left", value: "18" },
      { label: "Open requests", value: "1" },
    ],
    owner: [
      { label: "Monthly income", value: "€42,800" },
      { label: "Occupancy", value: "94%" },
      { label: "Properties", value: "12" },
    ],
    investor: [
      { label: "Portfolio value", value: "$184K" },
      { label: "Avg yield", value: "11.4%" },
      { label: "Tokens held", value: "27" },
    ],
    admin: [
      { label: "Active users", value: "84.2K" },
      { label: "GMV (mo)", value: "$12.4M" },
      { label: "Uptime", value: "99.99%" },
    ],
  };

  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <div className="text-sm font-medium text-emerald">Dashboards</div>
          <h2 className="mt-2 font-display text-4xl font-bold md:text-5xl">One platform. <span className="gradient-text">Every role.</span></h2>
          <p className="mt-4 text-muted-foreground">Tailored interfaces for tenants, owners, investors and platform admins.</p>
        </div>

        <div className="mt-12 flex justify-center">
          <div className="inline-flex rounded-full glass-strong p-1.5 shadow-soft">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  tab === t.id ? "bg-foreground text-background shadow-soft" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <t.icon className="h-3.5 w-3.5" />
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="mt-10 overflow-hidden rounded-3xl border border-border bg-card shadow-elegant"
          >
            <div className="flex items-center gap-2 border-b border-border/50 px-5 py-3">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-destructive/60" />
                <div className="h-3 w-3 rounded-full bg-yellow-500/60" />
                <div className="h-3 w-3 rounded-full bg-emerald/60" />
              </div>
              <div className="ml-3 font-mono text-xs text-muted-foreground">propertyos.app/{tab}</div>
            </div>

            <div className="grid gap-6 p-6 md:grid-cols-3">
              {stats[tab].map((s) => (
                <div key={s.label} className="rounded-2xl border border-border/50 bg-secondary/30 p-5">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">{s.label}</div>
                  <div className="mt-2 font-display text-3xl font-bold">{s.value}</div>
                  <div className="mt-1 text-xs text-emerald">+12.4% vs last month</div>
                </div>
              ))}
            </div>

            <div className="grid gap-6 px-6 pb-6 md:grid-cols-2">
              <div className="rounded-2xl border border-border/50 bg-secondary/30 p-5">
                <div className="text-sm font-semibold">Revenue trend</div>
                <div className="mt-3 h-40">
                  <ResponsiveContainer>
                    <LineChart data={data}>
                      <Line type="monotone" dataKey="y" stroke="oklch(0.62 0.16 160)" strokeWidth={2.5} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="rounded-2xl border border-border/50 bg-secondary/30 p-5">
                <div className="text-sm font-semibold">Occupancy by property</div>
                <div className="mt-3 h-40">
                  <ResponsiveContainer>
                    <BarChart data={data}>
                      <Bar dataKey="y" fill="oklch(0.72 0.13 230)" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

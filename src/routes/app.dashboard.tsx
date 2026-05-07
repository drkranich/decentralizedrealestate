import { createFileRoute } from "@tanstack/react-router";
import { Area, AreaChart, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, DollarSign, Home, Users, Activity, ArrowUpRight } from "lucide-react";
import { PageHeader, StatCard, Card, SectionTitle, Badge } from "@/components/app/ui";

export const Route = createFileRoute("/app/dashboard")({
  component: Dashboard,
});

const revenue = Array.from({ length: 12 }, (_, i) => ({
  month: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][i],
  rev: 28000 + i * 1800 + Math.sin(i) * 4000,
  exp: 12000 + i * 600,
}));

const occupancy = [
  { name: "Lisbon Loft", v: 96 },
  { name: "Tokyo Tower", v: 88 },
  { name: "Bali Villa", v: 94 },
  { name: "NYC Studio", v: 82 },
  { name: "Dubai Penthouse", v: 91 },
];

const split = [
  { name: "Short stay", v: 48, c: "oklch(0.62 0.16 160)" },
  { name: "Long stay", v: 32, c: "oklch(0.72 0.13 230)" },
  { name: "Tokenized", v: 20, c: "oklch(0.78 0.18 158)" },
];

const activity = [
  { who: "Sofia M.", what: "Signed contract for Lisbon Loft 3B", when: "2m ago", color: "emerald" },
  { who: "AI Engine", what: "Adjusted Tokyo Tower price +€42/night", when: "12m ago", color: "blue" },
  { who: "Carlos R.", what: "Paid €2,450 rent (NYC Studio)", when: "1h ago", color: "emerald" },
  { who: "System", what: "Cleaning scheduled — Bali Villa turnover", when: "3h ago", color: "muted" },
  { who: "Investor", what: "Bought 14 tokens of LIS-LX01", when: "5h ago", color: "blue" },
];

function Dashboard() {
  return (
    <>
      <PageHeader title="Good morning, Jordan" subtitle="Here's what's happening with your portfolio today.">
        <button className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-secondary">Last 30 days</button>
        <button className="rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background">Export</button>
      </PageHeader>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Monthly revenue" value="€84,290" change="+18.2% MoM" icon={DollarSign} />
        <StatCard label="Occupancy" value="92.4%" change="+3.1%" icon={Home} accent="skyblue" />
        <StatCard label="Active tenants" value="148" change="+12 new" icon={Users} />
        <StatCard label="Avg ROI" value="13.8%" change="+0.4%" icon={TrendingUp} accent="skyblue" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <SectionTitle
            title="Revenue & expenses"
            action={
              <div className="flex gap-3 text-xs">
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald" />Revenue</span>
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-skyblue" />Expenses</span>
              </div>
            }
          />
          <div className="h-72">
            <ResponsiveContainer>
              <AreaChart data={revenue}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.62 0.16 160)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="oklch(0.62 0.16 160)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.72 0.13 230)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="oklch(0.72 0.13 230)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={11} stroke="currentColor" opacity={0.4} />
                <YAxis tickLine={false} axisLine={false} fontSize={11} stroke="currentColor" opacity={0.4} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--card)" }} />
                <Area type="monotone" dataKey="rev" stroke="oklch(0.62 0.16 160)" strokeWidth={2.5} fill="url(#g1)" />
                <Area type="monotone" dataKey="exp" stroke="oklch(0.72 0.13 230)" strokeWidth={2.5} fill="url(#g2)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <SectionTitle title="Portfolio mix" />
          <div className="h-48">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={split} dataKey="v" innerRadius={50} outerRadius={75} paddingAngle={4}>
                  {split.map((s) => <Cell key={s.name} fill={s.c} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 space-y-2">
            {split.map((s) => (
              <div key={s.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.c }} />
                  {s.name}
                </div>
                <span className="font-semibold">{s.v}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <SectionTitle title="Occupancy by property" action={<button className="text-xs font-medium text-emerald hover:underline">View all</button>} />
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={occupancy}>
                <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={11} stroke="currentColor" opacity={0.5} />
                <YAxis tickLine={false} axisLine={false} fontSize={11} stroke="currentColor" opacity={0.5} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--card)" }} />
                <Bar dataKey="v" fill="oklch(0.62 0.16 160)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <SectionTitle title="Live activity" action={<Activity className="h-4 w-4 text-emerald animate-pulse-glow" />} />
          <div className="space-y-4">
            {activity.map((a, i) => (
              <div key={i} className="flex gap-3">
                <div className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${a.color === "emerald" ? "bg-emerald" : a.color === "blue" ? "bg-skyblue" : "bg-muted-foreground"}`} />
                <div className="min-w-0 flex-1">
                  <div className="text-sm"><span className="font-semibold">{a.who}</span> {a.what}</div>
                  <div className="text-xs text-muted-foreground">{a.when}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-3">
        {[
          { label: "Outstanding payments", value: "€8,420", note: "3 overdue", color: "warn" as const },
          { label: "Pending contracts", value: "7", note: "2 awaiting signature", color: "blue" as const },
          { label: "Maintenance requests", value: "12", note: "4 urgent", color: "emerald" as const },
        ].map((q) => (
          <Card key={q.label}>
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wide text-muted-foreground">{q.label}</span>
              <Badge variant={q.color}>{q.note}</Badge>
            </div>
            <div className="mt-3 flex items-end justify-between">
              <span className="font-display text-3xl font-bold">{q.value}</span>
              <button className="flex items-center gap-1 text-sm font-medium text-emerald hover:underline">
                Resolve <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}

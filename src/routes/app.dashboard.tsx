import { createFileRoute, Link } from "@tanstack/react-router";
import { Area, AreaChart, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import {
  TrendingUp, DollarSign, Home, Users, Activity, ArrowUpRight, Wrench, Wallet,
  Sparkles, Bell, MessageSquare, Brush, Hammer, Sofa, ShieldCheck, Zap, AlertTriangle,
} from "lucide-react";
import { PageHeader, StatCard, Card, SectionTitle, Badge } from "@/components/app/ui";
import { useBrand } from "@/components/brand/BrandProvider";

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
  { name: "Short stay", v: 48, c: "var(--emerald)" },
  { name: "Long stay", v: 32, c: "var(--skyblue)" },
  { name: "Tokenized", v: 20, c: "var(--emerald-glow)" },
];

const roiTrend = Array.from({ length: 12 }, (_, i) => ({
  m: i,
  roi: 9 + Math.sin(i / 1.5) * 1.6 + i * 0.35,
}));

const payouts = [
  { date: "Dec 01", amount: 24800, status: "Paid" },
  { date: "Nov 01", amount: 22150, status: "Paid" },
  { date: "Oct 01", amount: 21030, status: "Paid" },
  { date: "Sep 01", amount: 19880, status: "Paid" },
];

const maintenance = [
  { p: "Tokyo Tower", t: "AC compressor failure", sev: "Urgent" as const, eta: "Today 18:00" },
  { p: "Bali Villa", t: "Pool filtration error", sev: "High" as const, eta: "Tomorrow" },
  { p: "Lisbon Loft", t: "Smart lock offline", sev: "Low" as const, eta: "Dec 15" },
];

const tenantRequests = [
  { who: "Sofia M.", p: "Lisbon Loft", msg: "Requesting late check-out (Sun)", t: "5m ago" },
  { who: "Carlos R.", p: "NYC Studio", msg: "Wi-Fi router replacement", t: "1h ago" },
  { who: "Anna K.", p: "Dubai Penthouse", msg: "Extra cleaning before guests", t: "3h ago" },
];

const aiInsights = [
  { icon: TrendingUp, title: "Increase Tokyo Tower nightly rate", detail: "Demand +28% next 14 days. Suggested +€42/night.", impact: "+€1.2k" },
  { icon: ShieldCheck, title: "Renew insurance — Bali Villa", detail: "Policy expires in 9 days. Auto-quote ready.", impact: "Save 14%" },
  { icon: Zap, title: "Bundle 3 cleaning contracts", detail: "Switch to weekly plan to cut turnover cost.", impact: "−€380/mo" },
];

const services = [
  { icon: Brush, label: "Cleaning", note: "12 partners" },
  { icon: Hammer, label: "Repairs", note: "On-demand" },
  { icon: Sofa, label: "Interior", note: "Design studios" },
  { icon: ShieldCheck, label: "Insurance", note: "3 plans" },
];

const activity = [
  { who: "Sofia M.", what: "Signed contract for Lisbon Loft 3B", when: "2m ago", color: "emerald" },
  { who: "AI Engine", what: "Adjusted Tokyo Tower price +€42/night", when: "12m ago", color: "blue" },
  { who: "Carlos R.", what: "Paid €2,450 rent (NYC Studio)", when: "1h ago", color: "emerald" },
  { who: "System", what: "Cleaning scheduled — Bali Villa turnover", when: "3h ago", color: "muted" },
  { who: "Investor", what: "Bought 14 tokens of LIS-LX01", when: "5h ago", color: "blue" },
];

function Dashboard() {
  const brand = useBrand();
  return (
    <>
      <PageHeader title="Good morning, Jordan" subtitle={`Welcome back to ${brand.name}. Here's your portfolio today.`}>
        <button className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-secondary">Last 30 days</button>
        <button className="rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background">Export</button>
      </PageHeader>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total revenue" value="€84,290" change="+18.2% MoM" icon={DollarSign} />
        <StatCard label="Occupancy" value="92.4%" change="+3.1%" icon={Home} accent="skyblue" />
        <StatCard label="Active properties" value="24" change="+2 onboarded" icon={Activity} />
        <StatCard label="Avg ROI" value="13.8%" change="+0.4%" icon={TrendingUp} accent="skyblue" />
      </div>

      {/* Revenue + Mix */}
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
                    <stop offset="0%" stopColor="var(--emerald)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--emerald)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--skyblue)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="var(--skyblue)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={11} stroke="currentColor" opacity={0.4} />
                <YAxis tickLine={false} axisLine={false} fontSize={11} stroke="currentColor" opacity={0.4} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--card)" }} />
                <Area type="monotone" dataKey="rev" stroke="var(--emerald)" strokeWidth={2.5} fill="url(#g1)" />
                <Area type="monotone" dataKey="exp" stroke="var(--skyblue)" strokeWidth={2.5} fill="url(#g2)" />
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

      {/* Occupancy + AI Insights */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <SectionTitle title="Occupancy by property" action={<Link to="/app/properties-analytics" className="text-xs font-medium text-emerald hover:underline">View all</Link>} />
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={occupancy}>
                <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={11} stroke="currentColor" opacity={0.5} />
                <YAxis tickLine={false} axisLine={false} fontSize={11} stroke="currentColor" opacity={0.5} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--card)" }} />
                <Bar dataKey="v" fill="var(--emerald)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-emerald/20 blur-3xl" />
          <SectionTitle
            title="AI insights"
            action={<span className="flex items-center gap-1 text-xs text-emerald"><Sparkles className="h-3.5 w-3.5" /> Live</span>}
          />
          <div className="relative space-y-3">
            {aiInsights.map((a, i) => (
              <div key={i} className="rounded-2xl border border-border/60 bg-background/60 p-3 backdrop-blur">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald text-white">
                    <a.icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-sm font-semibold">{a.title}</div>
                      <Badge variant="emerald">{a.impact}</Badge>
                    </div>
                    <div className="mt-0.5 text-xs text-muted-foreground">{a.detail}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ROI + Smart pricing */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <SectionTitle
            title="ROI analytics"
            action={<Link to="/app/finance" className="text-xs font-medium text-emerald hover:underline">Open finance</Link>}
          />
          <div className="h-56">
            <ResponsiveContainer>
              <LineChart data={roiTrend}>
                <XAxis dataKey="m" tickLine={false} axisLine={false} fontSize={11} stroke="currentColor" opacity={0.4} />
                <YAxis tickLine={false} axisLine={false} fontSize={11} stroke="currentColor" opacity={0.4} unit="%" />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--card)" }} />
                <Line type="monotone" dataKey="roi" stroke="var(--emerald)" strokeWidth={3} dot={{ r: 3, fill: "var(--emerald)" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <SectionTitle title="Smart pricing" action={<Link to="/app/smart-pricing" className="text-xs font-medium text-emerald hover:underline">Tune</Link>} />
          <div className="space-y-3">
            {[
              { p: "Tokyo Tower", from: 180, to: 222, conf: 92 },
              { p: "Bali Villa", from: 240, to: 268, conf: 87 },
              { p: "NYC Studio", from: 150, to: 142, conf: 78 },
            ].map((s) => (
              <div key={s.p} className="rounded-2xl border border-border/50 bg-secondary/30 p-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold">{s.p}</div>
                  <Badge variant={s.to >= s.from ? "emerald" : "warn"}>
                    {s.to >= s.from ? "+" : ""}{s.to - s.from}€
                  </Badge>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">€{s.from} → <span className="font-semibold text-foreground">€{s.to}</span> · {s.conf}% confidence</div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-emerald" style={{ width: `${s.conf}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Maintenance + Tenant requests + Activity */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card>
          <SectionTitle
            title="Maintenance alerts"
            action={<span className="flex items-center gap-1 text-xs text-yellow-500"><AlertTriangle className="h-3.5 w-3.5" /> {maintenance.length}</span>}
          />
          <div className="space-y-3">
            {maintenance.map((m, i) => (
              <div key={i} className="flex items-start gap-3 rounded-2xl border border-border/50 bg-secondary/30 p-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-yellow-500/10 text-yellow-500">
                  <Wrench className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-sm font-semibold truncate">{m.t}</div>
                    <Badge variant={m.sev === "Urgent" ? "warn" : m.sev === "High" ? "blue" : "muted"}>{m.sev}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">{m.p} · ETA {m.eta}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <SectionTitle
            title="Tenant requests"
            action={<MessageSquare className="h-4 w-4 text-skyblue" />}
          />
          <div className="space-y-3">
            {tenantRequests.map((r, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-skyblue text-xs font-bold text-white">
                  {r.who.split(" ").map((n) => n[0]).join("")}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold">{r.who}<span className="ml-2 text-xs font-normal text-muted-foreground">{r.p}</span></div>
                  <div className="text-xs text-muted-foreground">{r.msg}</div>
                  <div className="mt-1 text-[11px] text-muted-foreground/70">{r.t}</div>
                </div>
                <button className="rounded-full bg-emerald/10 px-2.5 py-1 text-[11px] font-medium text-emerald hover:bg-emerald/20">Reply</button>
              </div>
            ))}
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

      {/* Payouts + Marketplace + Notifications */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card>
          <SectionTitle
            title="Monthly payouts"
            action={<span className="flex items-center gap-1 text-xs text-emerald"><Wallet className="h-3.5 w-3.5" /> Auto</span>}
          />
          <div className="mb-3 rounded-2xl border border-emerald/20 bg-emerald/5 p-4">
            <div className="text-xs uppercase tracking-wide text-emerald">Next payout</div>
            <div className="mt-1 font-display text-2xl font-bold">€26,540</div>
            <div className="text-xs text-muted-foreground">Scheduled Jan 01 · SEPA · ****4421</div>
          </div>
          <div className="space-y-2">
            {payouts.map((p, i) => (
              <div key={i} className="flex items-center justify-between rounded-xl border border-border/50 px-3 py-2 text-sm">
                <span className="text-muted-foreground">{p.date}</span>
                <span className="font-semibold">€{p.amount.toLocaleString("en-US")}</span>
                <Badge variant="emerald">{p.status}</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <SectionTitle
            title="Service marketplace"
            action={<Link to="/app/marketplace" className="text-xs font-medium text-emerald hover:underline">Browse</Link>}
          />
          <div className="grid grid-cols-2 gap-3">
            {services.map((s) => (
              <Link
                key={s.label}
                to="/app/marketplace"
                className="group rounded-2xl border border-border/60 bg-secondary/30 p-4 transition-all hover:-translate-y-0.5 hover:border-emerald/50 hover:shadow-glow"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald/15">
                  <s.icon className="h-5 w-5 text-emerald" />
                </div>
                <div className="mt-3 text-sm font-semibold">{s.label}</div>
                <div className="text-xs text-muted-foreground">{s.note}</div>
                <div className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-emerald opacity-0 transition group-hover:opacity-100">
                  Book <ArrowUpRight className="h-3 w-3" />
                </div>
              </Link>
            ))}
          </div>
        </Card>

        <Card>
          <SectionTitle
            title="Notifications"
            action={<Bell className="h-4 w-4 text-skyblue" />}
          />
          <div className="space-y-3">
            {[
              { t: "Contract awaiting signature", d: "Lisbon Loft 3B · Sofia M.", v: "blue" as const },
              { t: "Insurance renewal in 9 days", d: "Bali Villa policy", v: "warn" as const },
              { t: "New 5★ review received", d: "Tokyo Tower · guest Anna K.", v: "emerald" as const },
              { t: "Payout settled", d: "€22,150 · Nov 01", v: "emerald" as const },
            ].map((n, i) => (
              <div key={i} className="flex items-start justify-between gap-3 rounded-2xl border border-border/50 bg-secondary/20 p-3">
                <div className="min-w-0">
                  <div className="text-sm font-semibold">{n.t}</div>
                  <div className="text-xs text-muted-foreground">{n.d}</div>
                </div>
                <Badge variant={n.v}>New</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Quick stats footer */}
      <div className="mt-6 grid gap-6 md:grid-cols-3">
        {[
          { label: "Outstanding payments", value: "€8,420", note: "3 overdue", color: "warn" as const, to: "/app/finance" },
          { label: "Pending contracts", value: "7", note: "2 awaiting signature", color: "blue" as const, to: "/app/contracts" },
          { label: "Active tenants", value: "148", note: "+12 this month", color: "emerald" as const, to: "/app/crm" },
        ].map((q) => (
          <Card key={q.label}>
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wide text-muted-foreground">{q.label}</span>
              <Badge variant={q.color}>{q.note}</Badge>
            </div>
            <div className="mt-3 flex items-end justify-between">
              <span className="font-display text-3xl font-bold">{q.value}</span>
              <Link to={q.to} className="flex items-center gap-1 text-sm font-medium text-emerald hover:underline">
                Resolve <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}

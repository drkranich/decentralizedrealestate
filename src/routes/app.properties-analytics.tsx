import { createFileRoute } from "@tanstack/react-router";
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { TrendingUp, Activity, Users, Wrench } from "lucide-react";
import { PageHeader, Card, StatCard, SectionTitle } from "@/components/app/ui";

export const Route = createFileRoute("/app/properties-analytics")({
  component: PropertiesAnalytics,
});

const revenue = Array.from({ length: 12 }, (_, i) => ({
  m: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][i],
  rev: 18 + Math.round(Math.sin(i / 2) * 4 + i * 0.6),
}));
const performance = [
  { name: "Lisbon", v: 92 }, { name: "Tokyo", v: 88 }, { name: "Bali", v: 94 },
  { name: "Dubai", v: 70 }, { name: "Barcelona", v: 89 }, { name: "NYC", v: 76 },
];
const tenant = [
  { n: "Short stay (1-7d)", v: 48 },
  { n: "Mid stay (8-30d)", v: 27 },
  { n: "Long stay (30d+)", v: 25 },
];
const colors = ["oklch(0.62 0.16 160)", "oklch(0.72 0.13 230)", "oklch(0.78 0.18 158)"];
const costs = Array.from({ length: 12 }, (_, i) => ({
  m: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][i],
  cleaning: 800 + Math.round(Math.sin(i) * 120),
  repairs: 400 + Math.round(Math.cos(i) * 200 + i * 30),
  utilities: 600 + Math.round(Math.sin(i / 2) * 80),
}));

function PropertiesAnalytics() {
  return (
    <>
      <PageHeader title="Property analytics" subtitle="Revenue, performance, tenant behavior and cost analytics." />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total revenue YTD" value="€312k" change="+24%" icon={TrendingUp} />
        <StatCard label="Avg performance" value="84/100" change="+6 pts" icon={Activity} />
        <StatCard label="Active tenants" value="47" change="+3" icon={Users} accent="skyblue" />
        <StatCard label="Maintenance costs" value="€18.2k" change="-4%" icon={Wrench} accent="skyblue" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <SectionTitle title="Revenue trend" />
          <div className="h-64">
            <ResponsiveContainer>
              <AreaChart data={revenue}>
                <defs>
                  <linearGradient id="rv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.62 0.16 160)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="oklch(0.62 0.16 160)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.08} />
                <XAxis dataKey="m" tickLine={false} axisLine={false} fontSize={11} stroke="currentColor" opacity={0.5} />
                <YAxis tickLine={false} axisLine={false} fontSize={11} stroke="currentColor" opacity={0.5} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--card)" }} />
                <Area type="monotone" dataKey="rev" stroke="oklch(0.62 0.16 160)" strokeWidth={2.5} fill="url(#rv)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <SectionTitle title="Tenant behavior" />
          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={tenant} dataKey="v" nameKey="n" innerRadius={50} outerRadius={80} paddingAngle={4}>
                  {tenant.map((_, i) => <Cell key={i} fill={colors[i]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--card)" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 space-y-1.5 text-xs">
            {tenant.map((t, i) => (
              <div key={t.n} className="flex items-center justify-between">
                <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded" style={{ background: colors[i] }} /> {t.n}</span>
                <span className="font-semibold">{t.v}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <SectionTitle title="Property performance score" />
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={performance} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.08} />
                <XAxis type="number" tickLine={false} axisLine={false} fontSize={11} stroke="currentColor" opacity={0.5} />
                <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} fontSize={11} stroke="currentColor" opacity={0.5} width={70} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--card)" }} />
                <Bar dataKey="v" fill="oklch(0.62 0.16 160)" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <SectionTitle title="Maintenance cost breakdown" />
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={costs}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.08} />
                <XAxis dataKey="m" tickLine={false} axisLine={false} fontSize={11} stroke="currentColor" opacity={0.5} />
                <YAxis tickLine={false} axisLine={false} fontSize={11} stroke="currentColor" opacity={0.5} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--card)" }} />
                <Bar dataKey="cleaning" stackId="a" fill="oklch(0.62 0.16 160)" />
                <Bar dataKey="repairs" stackId="a" fill="oklch(0.72 0.13 230)" />
                <Bar dataKey="utilities" stackId="a" fill="oklch(0.78 0.18 158)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </>
  );
}

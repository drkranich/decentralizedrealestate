import { createFileRoute } from "@tanstack/react-router";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, AreaChart, Area } from "recharts";
import { Coins, TrendingUp, PieChart, Wallet } from "lucide-react";
import { PageHeader, StatCard, Card, SectionTitle, Badge } from "@/components/app/ui";

export const Route = createFileRoute("/app/investor")({
  component: Investor,
});

const portfolio = Array.from({ length: 24 }, (_, i) => ({ m: i, v: 100000 + i * 3500 + Math.sin(i) * 6000 }));

const tokens = [
  { sym: "LIS-LX01", n: "Lisbon Loft", held: 142, value: "$14,200", apy: 9.4, change: "+12.4%" },
  { sym: "TKY-SK22", n: "Tokyo Tower", held: 88, value: "$8,800", apy: 7.8, change: "+8.1%" },
  { sym: "BAL-BV09", n: "Bali Villa", held: 240, value: "$24,000", apy: 12.1, change: "+18.6%" },
  { sym: "DXB-PH04", n: "Dubai Penthouse", held: 56, value: "$11,200", apy: 8.9, change: "+6.3%" },
  { sym: "NYC-ST14", n: "Brooklyn Studio", held: 110, value: "$13,750", apy: 6.2, change: "+3.8%" },
];

function Investor() {
  return (
    <>
      <PageHeader title="Investor Dashboard" subtitle="Track tokenized real estate holdings across the globe.">
        <button className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-secondary">Withdraw</button>
        <button className="rounded-full bg-gradient-to-r from-emerald to-emerald-glow px-4 py-2 text-sm font-semibold text-white shadow-glow">Invest more</button>
      </PageHeader>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Portfolio value" value="$184,320" change="+24.8% YTD" icon={Wallet} />
        <StatCard label="Avg yield" value="11.4%" change="vs 6.8% market" icon={TrendingUp} accent="skyblue" />
        <StatCard label="Tokens held" value="27" change="across 5 assets" icon={Coins} />
        <StatCard label="Monthly income" value="$1,742" change="+$214 MoM" icon={PieChart} accent="skyblue" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <SectionTitle
            title="Portfolio performance"
            action={
              <div className="flex gap-1 rounded-full bg-secondary p-0.5 text-xs">
                {["1M", "3M", "6M", "1Y", "ALL"].map((p) => (
                  <button key={p} className={`rounded-full px-3 py-1 ${p === "1Y" ? "bg-foreground text-background" : "text-muted-foreground"}`}>{p}</button>
                ))}
              </div>
            }
          />
          <div className="h-72">
            <ResponsiveContainer>
              <AreaChart data={portfolio}>
                <defs>
                  <linearGradient id="p1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.62 0.16 160)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="oklch(0.62 0.16 160)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="m" tickLine={false} axisLine={false} fontSize={11} stroke="currentColor" opacity={0.4} />
                <YAxis tickLine={false} axisLine={false} fontSize={11} stroke="currentColor" opacity={0.4} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--card)" }} />
                <Area type="monotone" dataKey="v" stroke="oklch(0.62 0.16 160)" strokeWidth={3} fill="url(#p1)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <SectionTitle title="New opportunities" />
          <div className="space-y-3">
            {[
              { n: "Berlin Mitte Loft", apy: 10.2, raised: 42 },
              { n: "Singapore Marina", apy: 8.8, raised: 71 },
              { n: "Mexico City Suite", apy: 13.4, raised: 28 },
            ].map((o) => (
              <div key={o.n} className="rounded-2xl border border-border/50 bg-secondary/30 p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold">{o.n}</div>
                  <Badge variant="emerald">{o.apy}% APY</Badge>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-background">
                  <div className="h-full rounded-full bg-gradient-to-r from-emerald to-emerald-glow" style={{ width: `${o.raised}%` }} />
                </div>
                <div className="mt-1 flex justify-between text-[11px] text-muted-foreground">
                  <span>{o.raised}% raised</span>
                  <button className="font-semibold text-emerald hover:underline">Invest →</button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="mt-6 overflow-hidden p-0">
        <div className="flex items-center justify-between p-6 pb-4">
          <h2 className="font-display text-lg font-semibold">Holdings</h2>
          <button className="text-xs font-medium text-emerald hover:underline">Export CSV</button>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-y border-border bg-secondary/30 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-6 py-3 font-medium">Token</th>
              <th className="px-6 py-3 font-medium">Property</th>
              <th className="px-6 py-3 font-medium text-right">Held</th>
              <th className="px-6 py-3 font-medium text-right">Value</th>
              <th className="px-6 py-3 font-medium text-right">APY</th>
              <th className="px-6 py-3 font-medium text-right">30d</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {tokens.map((t) => (
              <tr key={t.sym} className="border-b border-border last:border-0 hover:bg-secondary/30">
                <td className="px-6 py-4 font-mono text-xs font-semibold">{t.sym}</td>
                <td className="px-6 py-4">{t.n}</td>
                <td className="px-6 py-4 text-right">{t.held}</td>
                <td className="px-6 py-4 text-right font-semibold">{t.value}</td>
                <td className="px-6 py-4 text-right text-emerald font-semibold">{t.apy}%</td>
                <td className="px-6 py-4 text-right text-emerald">{t.change}</td>
                <td className="px-6 py-4 text-right">
                  <button className="rounded-full border border-border px-3 py-1 text-xs hover:bg-secondary">Trade</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, RadialBarChart, RadialBar,
} from "recharts";
import {
  Coins, TrendingUp, PieChart as PieIcon, Wallet, Globe2, ArrowUpRight, ArrowDownRight,
  Sparkles, Activity, Zap, Shield, Bitcoin,
} from "lucide-react";
import { useState } from "react";
import { PageHeader, StatCard, Card, SectionTitle, Badge, DemoDataBadge } from "@/components/app/ui";
import { useBrand } from "@/components/brand/BrandProvider";
import { toast } from "sonner";

export const Route = createFileRoute("/app/investor")({
  component: Investor,
});

const portfolio = Array.from({ length: 24 }, (_, i) => ({
  m: i,
  v: 100000 + i * 3500 + Math.sin(i / 1.4) * 8000,
  bench: 100000 + i * 1900,
}));

const income = Array.from({ length: 12 }, (_, i) => ({
  m: ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"][i],
  rent: 900 + i * 70 + Math.sin(i) * 120,
  yield: 380 + i * 22,
}));

const diversification = [
  { name: "Residential", v: 42, c: "var(--emerald)" },
  { name: "Commercial", v: 22, c: "var(--skyblue)" },
  { name: "Hospitality", v: 18, c: "var(--emerald-glow)" },
  { name: "Tokenized REITs", v: 12, c: "var(--silver)" },
  { name: "Land", v: 6, c: "oklch(0.55 0.18 30)" },
];

const geo = [
  { region: "Europe", v: 38, flag: "🇪🇺" },
  { region: "N. America", v: 24, flag: "🇺🇸" },
  { region: "Asia", v: 22, flag: "🌏" },
  { region: "LATAM", v: 9, flag: "🌎" },
  { region: "MENA", v: 7, flag: "🌍" },
];

const tokens = [
  { sym: "LIS-LX01", n: "Lisbon Loft", city: "Lisbon", held: 142, value: 14200, apy: 9.4, ch: 12.4 },
  { sym: "TKY-SK22", n: "Tokyo Tower", city: "Tokyo", held: 88, value: 8800, apy: 7.8, ch: 8.1 },
  { sym: "BAL-BV09", n: "Bali Villa", city: "Ubud", held: 240, value: 24000, apy: 12.1, ch: 18.6 },
  { sym: "DXB-PH04", n: "Dubai Penthouse", city: "Dubai", held: 56, value: 11200, apy: 8.9, ch: 6.3 },
  { sym: "NYC-ST14", n: "Brooklyn Studio", city: "New York", held: 110, value: 13750, apy: 6.2, ch: -1.8 },
  { sym: "BER-MT07", n: "Berlin Mitte", city: "Berlin", held: 64, value: 7680, apy: 10.2, ch: 4.4 },
];

const opportunities = [
  { n: "Berlin Mitte Loft", region: "🇩🇪 Berlin", apy: 10.2, raised: 42, min: 100, days: 12 },
  { n: "Singapore Marina", region: "🇸🇬 Singapore", apy: 8.8, raised: 71, min: 250, days: 6 },
  { n: "Mexico City Suite", region: "🇲🇽 CDMX", apy: 13.4, raised: 28, min: 50, days: 21 },
  { n: "Cape Town Cliff", region: "🇿🇦 Cape Town", apy: 11.6, raised: 55, min: 100, days: 9 },
];

const yieldProjection = Array.from({ length: 10 }, (_, i) => ({
  y: 2026 + i,
  conservative: 184320 * Math.pow(1.06, i),
  base: 184320 * Math.pow(1.094, i),
  aggressive: 184320 * Math.pow(1.13, i),
}));

const fxRates: Record<string, { sym: string; rate: number }> = {
  USD: { sym: "$", rate: 1 },
  EUR: { sym: "€", rate: 0.92 },
  GBP: { sym: "£", rate: 0.79 },
  BTC: { sym: "₿", rate: 0.0000148 },
  ETH: { sym: "Ξ", rate: 0.000312 },
  AED: { sym: "د.إ", rate: 3.67 },
};

function fmt(v: number, ccy: string) {
  const r = fxRates[ccy];
  const val = v * r.rate;
  if (ccy === "BTC" || ccy === "ETH") return `${r.sym}${val.toFixed(4)}`;
  return `${r.sym}${Math.round(val).toLocaleString("en-US")}`;
}

const tickerData = [
  { sym: "REIT-EU", v: "+2.14%", up: true },
  { sym: "BTC", v: "+1.08%", up: true },
  { sym: "S&P 500", v: "−0.42%", up: false },
  { sym: "EUR/USD", v: "+0.18%", up: true },
  { sym: "GOLD", v: "+0.62%", up: true },
  { sym: "OIL", v: "−1.20%", up: false },
  { sym: "10Y BOND", v: "4.18%", up: true },
];

function Investor() {
  const brand = useBrand();
  const [ccy, setCcy] = useState<keyof typeof fxRates>("USD");
  const [period, setPeriod] = useState("1Y");

  const totalValue = 184320;
  const monthlyIncome = 1742;

  return (
    <>
      {/* Bloomberg-style ticker */}
      <div className="-mx-4 mb-6 overflow-hidden border-y border-border bg-background/60 backdrop-blur md:-mx-8">
        <div className="flex animate-marquee gap-8 whitespace-nowrap px-4 py-2 font-mono text-xs md:px-8">
          {[...tickerData, ...tickerData].map((t, i) => (
            <span key={i} className="flex items-center gap-2">
              <span className="font-semibold tracking-wider">{t.sym}</span>
              <span className={t.up ? "text-emerald" : "text-red-500"}>
                {t.up ? "▲" : "▼"} {t.v}
              </span>
            </span>
          ))}
        </div>
      </div>

      <PageHeader title="Investor Terminal" subtitle={`${brand.name} · tokenized real estate, global yields, real-time.`}>
        <div className="flex items-center gap-1 rounded-full border border-border bg-card p-1 text-xs">
          {Object.keys(fxRates).map((c) => (
            <button
              key={c}
              onClick={() => setCcy(c as keyof typeof fxRates)}
              className={`rounded-full px-2.5 py-1 font-medium transition ${ccy === c ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}
            >
              {c}
            </button>
          ))}
        </div>
        <button onClick={() => toast.info("A tokenização de investidor ainda não está conectada a saques reais.")} className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-secondary">Withdraw</button>
        <button onClick={() => toast.info("A tokenização de investidor ainda não está conectada a aportes reais.")} className="rounded-full bg-emerald px-4 py-2 text-sm font-semibold text-white shadow-glow">Invest more</button>
      </PageHeader>

      <div className="mt-4 rounded-2xl border border-dashed border-skyblue/30 bg-skyblue/5 p-4 text-xs text-muted-foreground">
        <span className="font-semibold text-skyblue">Nota:</span> os tokens, rendimentos e histórico de investidor abaixo são dados de demonstração — a tokenização de imóveis ainda não está conectada a transações reais.
      </div>

      {/* Hero KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Portfolio value" value={fmt(totalValue, ccy)} change="+24.8% YTD" icon={Wallet} />
        <StatCard label="Monthly passive income" value={fmt(monthlyIncome, ccy)} change="+$214 MoM" icon={TrendingUp} accent="skyblue" />
        <StatCard label="Avg ROI" value="11.4%" change="vs 6.8% market" icon={PieIcon} />
        <StatCard label="Tokens held" value="27" change="across 6 assets" icon={Coins} accent="skyblue" />
      </div>

      {/* Portfolio + Risk */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <SectionTitle
            title="Portfolio performance"
            action={
              <div className="flex items-center gap-3">
                <span className="hidden items-center gap-3 text-xs sm:flex">
                  <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald" /> Portfolio</span>
                  <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-skyblue" /> Benchmark</span>
                </span>
                <div className="flex gap-1 rounded-full bg-secondary p-0.5 text-xs">
                  {["1M", "3M", "6M", "1Y", "ALL"].map((p) => (
                    <button
                      key={p}
                      onClick={() => setPeriod(p)}
                      className={`rounded-full px-3 py-1 ${p === period ? "bg-foreground text-background" : "text-muted-foreground"}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            }
          />
          <div className="h-72">
            <ResponsiveContainer>
              <AreaChart data={portfolio}>
                <defs>
                  <linearGradient id="p1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--emerald)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="var(--emerald)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="m" tickLine={false} axisLine={false} fontSize={11} stroke="currentColor" opacity={0.4} />
                <YAxis tickLine={false} axisLine={false} fontSize={11} stroke="currentColor" opacity={0.4} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--card)" }} />
                <Area type="monotone" dataKey="v" stroke="var(--emerald)" strokeWidth={3} fill="url(#p1)" />
                <Line type="monotone" dataKey="bench" stroke="var(--skyblue)" strokeWidth={2} dot={false} strokeDasharray="4 4" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <SectionTitle title="Risk score" action={<Shield className="h-4 w-4 text-emerald" />} />
          <div className="relative h-44">
            <ResponsiveContainer>
              <RadialBarChart innerRadius="65%" outerRadius="100%" data={[{ name: "Risk", value: 72, fill: "var(--emerald)" }]} startAngle={90} endAngle={-270}>
                <RadialBar dataKey="value" cornerRadius={20} background={{ fill: "var(--muted)" }} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
              <div className="font-display text-3xl font-bold">72<span className="text-base text-muted-foreground">/100</span></div>
              <div className="text-xs text-muted-foreground">Balanced</div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[11px]">
            <div className="rounded-lg bg-emerald/10 p-2"><div className="font-semibold text-emerald">Low</div><div className="text-muted-foreground">42%</div></div>
            <div className="rounded-lg bg-skyblue/10 p-2"><div className="font-semibold text-skyblue">Med</div><div className="text-muted-foreground">38%</div></div>
            <div className="rounded-lg bg-yellow-500/10 p-2"><div className="font-semibold text-yellow-500">High</div><div className="text-muted-foreground">20%</div></div>
          </div>
        </Card>
      </div>

      {/* Income + Diversification + Geo */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card>
          <SectionTitle title="Monthly passive income" />
          <div className="h-56">
            <ResponsiveContainer>
              <BarChart data={income}>
                <XAxis dataKey="m" tickLine={false} axisLine={false} fontSize={11} stroke="currentColor" opacity={0.5} />
                <YAxis tickLine={false} axisLine={false} fontSize={11} stroke="currentColor" opacity={0.5} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--card)" }} />
                <Bar dataKey="rent" stackId="a" fill="var(--emerald)" radius={[0, 0, 0, 0]} />
                <Bar dataKey="yield" stackId="a" fill="var(--skyblue)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex justify-center gap-4 text-xs">
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald" /> Rent</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-skyblue" /> Token yield</span>
          </div>
        </Card>

        <Card>
          <SectionTitle title="Asset diversification" />
          <div className="h-44">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={diversification} dataKey="v" innerRadius={45} outerRadius={75} paddingAngle={3}>
                  {diversification.map((s) => <Cell key={s.name} fill={s.c} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--card)" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 space-y-1.5">
            {diversification.map((d) => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full" style={{ background: d.c }} />{d.name}</span>
                <span className="font-mono font-semibold">{d.v}%</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <SectionTitle title="Global properties" action={<Globe2 className="h-4 w-4 text-skyblue" />} />
          <div className="space-y-3">
            {geo.map((g) => (
              <div key={g.region} className="flex items-center gap-3">
                <span className="text-xl">{g.flag}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold">{g.region}</span>
                    <span className="font-mono text-xs text-muted-foreground">{g.v}%</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-emerald" style={{ width: `${g.v * 2.6}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => toast.info("Mapa mundial de investimentos ainda não está disponível.")} className="mt-4 w-full rounded-xl border border-border bg-secondary/30 py-2 text-xs font-medium hover:bg-secondary">View on world map</button>
        </Card>
      </div>

      {/* Holdings table */}
      <Card className="mt-6 overflow-hidden p-0">
        <div className="flex items-center justify-between p-6 pb-4">
          <div>
            <h2 className="font-display text-lg font-semibold">Tokenized holdings</h2>
            <p className="text-xs text-muted-foreground">Posições de demonstração — sem liquidação real</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="muted">Demonstração</Badge>
            <button onClick={() => toast.info("Exportação real ficará disponível quando houver posições reais de tokens.")} className="rounded-full border border-border px-3 py-1.5 text-xs font-medium hover:bg-secondary">Export CSV</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-y border-border bg-secondary/30 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-6 py-3 font-medium">Token</th>
                <th className="px-6 py-3 font-medium">Property</th>
                <th className="px-6 py-3 font-medium">City</th>
                <th className="px-6 py-3 font-medium text-right">Held</th>
                <th className="px-6 py-3 font-medium text-right">Value</th>
                <th className="px-6 py-3 font-medium text-right">APY</th>
                <th className="px-6 py-3 font-medium text-right">30d</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {tokens.map((t) => (
                <tr key={t.sym} className="border-b border-border last:border-0 transition hover:bg-secondary/30">
                  <td className="px-6 py-4">
                    <span className="rounded-md bg-secondary/60 px-2 py-1 font-mono text-xs font-semibold">{t.sym}</span>
                  </td>
                  <td className="px-6 py-4 font-medium">{t.n}</td>
                  <td className="px-6 py-4 text-muted-foreground">{t.city}</td>
                  <td className="px-6 py-4 text-right font-mono">{t.held}</td>
                  <td className="px-6 py-4 text-right font-mono font-semibold">{fmt(t.value, ccy)}</td>
                  <td className="px-6 py-4 text-right font-mono font-semibold text-emerald">{t.apy}%</td>
                  <td className={`px-6 py-4 text-right font-mono ${t.ch >= 0 ? "text-emerald" : "text-red-500"}`}>
                    <span className="inline-flex items-center gap-1">
                      {t.ch >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                      {Math.abs(t.ch)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => toast.info("Negociação de tokens ainda não está disponível — é um exemplo de demonstração.")} className="rounded-full border border-border px-3 py-1 text-xs hover:bg-secondary">Trade</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Opportunities + Yield projection */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <SectionTitle
            title="Yield projection"
            action={
              <div className="flex gap-3 text-xs">
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-skyblue" /> Conservative</span>
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald" /> Base</span>
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-glow" /> Aggressive</span>
              </div>
            }
          />
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={yieldProjection}>
                <XAxis dataKey="y" tickLine={false} axisLine={false} fontSize={11} stroke="currentColor" opacity={0.4} />
                <YAxis tickLine={false} axisLine={false} fontSize={11} stroke="currentColor" opacity={0.4} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--card)" }} formatter={(v: any) => fmt(Number(v), ccy)} />
                <Line type="monotone" dataKey="conservative" stroke="var(--skyblue)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="base" stroke="var(--emerald)" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="aggressive" stroke="var(--emerald-glow)" strokeWidth={2} strokeDasharray="4 4" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 grid grid-cols-3 gap-3 text-center text-xs">
            <div className="rounded-xl border border-border/60 p-3">
              <div className="text-muted-foreground">10y · 6%</div>
              <div className="mt-1 font-display text-lg font-bold">{fmt(yieldProjection[9].conservative, ccy)}</div>
            </div>
            <div className="rounded-xl border border-emerald/40 bg-emerald/5 p-3">
              <div className="text-emerald">10y · 9.4%</div>
              <div className="mt-1 font-display text-lg font-bold">{fmt(yieldProjection[9].base, ccy)}</div>
            </div>
            <div className="rounded-xl border border-border/60 p-3">
              <div className="text-muted-foreground">10y · 13%</div>
              <div className="mt-1 font-display text-lg font-bold">{fmt(yieldProjection[9].aggressive, ccy)}</div>
            </div>
          </div>
        </Card>

        <Card>
          <SectionTitle title="Investment opportunities" action={<Sparkles className="h-4 w-4 text-emerald" />} />
          <div className="space-y-3">
            {opportunities.map((o) => (
              <div key={o.n} className="rounded-2xl border border-border/60 bg-secondary/30 p-4 transition hover:border-emerald/40 hover:shadow-soft">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold">{o.n}</div>
                    <div className="text-xs text-muted-foreground">{o.region}</div>
                  </div>
                  <Badge variant="emerald">{o.apy}% APY</Badge>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-background">
                  <div className="h-full rounded-full bg-emerald" style={{ width: `${o.raised}%` }} />
                </div>
                <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>{o.raised}% raised · min {fmt(o.min, ccy)}</span>
                  <span>{o.days}d left</span>
                </div>
                <button onClick={() => toast.info("Aportes reais em oportunidades tokenizadas ainda não estão disponíveis.")} className="mt-3 w-full rounded-full bg-foreground py-1.5 text-xs font-semibold text-background hover:opacity-90">
                  Invest →
                </button>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Activity feed */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <SectionTitle title="On-chain activity" action={<DemoDataBadge />} />
          <div className="space-y-3">
            {[
              { i: Zap, who: "Smart contract", what: "Distributed dividend 142 USDC", t: "2m ago", v: "emerald" as const },
              { i: Coins, who: "You", what: "Bought 14 tokens of LIS-LX01", t: "12m ago", v: "blue" as const },
              { i: Bitcoin, who: "Bridge", what: "Swapped 0.04 BTC → 2,840 USDC", t: "1h ago", v: "default" as const },
              { i: Shield, who: "Custodian", what: "Rebalanced risk allocation", t: "3h ago", v: "muted" as const },
            ].map((a, i) => (
              <div key={i} className="flex items-start gap-3 rounded-2xl border border-border/40 p-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald/15">
                  <a.i className="h-4 w-4 text-emerald" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm"><span className="font-semibold">{a.who}</span> {a.what}</div>
                  <div className="font-mono text-[11px] text-muted-foreground">{a.t}</div>
                </div>
                <Badge variant={a.v}>tx</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <SectionTitle title="Currency desk" action={<span className="font-mono text-xs text-muted-foreground">câmbio de demonstração</span>} />
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(fxRates).map(([k, v]) => (
              <div key={k} className="rounded-2xl border border-border/50 bg-secondary/20 p-3">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-mono font-semibold tracking-wider">{k}/USD</span>
                  <span className={k === "USD" ? "text-muted-foreground" : "text-emerald"}>{k === "USD" ? "—" : "▲"}</span>
                </div>
                <div className="mt-1 font-display text-xl font-bold">{v.sym} {v.rate < 0.001 ? v.rate.toExponential(2) : v.rate.toFixed(k === "USD" ? 2 : 4)}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";
import { Sparkles, TrendingUp, Activity, Brain, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { PageHeader, Card, Badge, StatCard, SectionTitle } from "@/components/app/ui";
import { properties } from "@/data/properties";

export const Route = createFileRoute("/app/smart-pricing")({
  component: SmartPricing,
});

const demand = Array.from({ length: 30 }, (_, i) => ({
  d: i + 1,
  current: 130 + Math.round(Math.sin(i / 3) * 18 + i * 0.6),
  ai: 145 + Math.round(Math.sin(i / 3) * 28 + i * 0.9),
}));
const occForecast = Array.from({ length: 12 }, (_, i) => ({
  m: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][i],
  f: 70 + Math.round(Math.sin(i / 2) * 16 + i),
}));

function SmartPricing() {
  return (
    <>
      <PageHeader title="Smart pricing" subtitle="AI-driven nightly rates, demand forecasts and occupancy predictions.">
        <Badge variant="emerald"><Sparkles className="mr-1 inline h-3 w-3" /> AI Active</Badge>
        <button className="rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background">Apply suggestions</button>
      </PageHeader>

      <div className="mt-4 rounded-2xl border border-dashed border-skyblue/30 bg-skyblue/5 p-4 text-xs text-muted-foreground">
        <span className="font-semibold text-skyblue">Nota:</span> as sugestões de preço e a confiança de IA abaixo são dados de demonstração — o motor de precificação inteligente ainda não está conectado a dados reais de mercado.
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Avg suggested rate" value="€168" change="+€23 / night" icon={TrendingUp} />
        <StatCard label="Forecast revenue" value="€42.6k" change="+18.2%" icon={Activity} />
        <StatCard label="Demand index" value="84/100" change="High" icon={Brain} accent="skyblue" />
        <StatCard label="Predicted occupancy" value="91%" change="+4 pts" icon={Activity} accent="skyblue" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <SectionTitle title="30-day pricing recommendation" action={<span className="text-xs text-muted-foreground">Current vs AI suggested</span>} />
          <div className="h-72">
            <ResponsiveContainer>
              <LineChart data={demand}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.08} />
                <XAxis dataKey="d" tickLine={false} axisLine={false} fontSize={11} stroke="currentColor" opacity={0.5} />
                <YAxis tickLine={false} axisLine={false} fontSize={11} stroke="currentColor" opacity={0.5} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--card)" }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="current" stroke="oklch(0.72 0.13 230)" strokeWidth={2.5} dot={false} name="Current" />
                <Line type="monotone" dataKey="ai" stroke="oklch(0.62 0.16 160)" strokeWidth={2.5} dot={false} name="AI suggested" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <SectionTitle title="AI insights" />
          <div className="space-y-3">
            {[
              { t: "Increase weekend rates", d: "+12% Fri-Sun across Lisbon, Barcelona", up: true },
              { t: "Lower mid-week Tokyo", d: "-6% to capture corporate demand", up: false },
              { t: "Holiday surge", d: "Dec 22-Jan 02 +28% globally", up: true },
              { t: "Bali shoulder season", d: "Bundle 7-night stays with discount", up: false },
            ].map((i) => (
              <div key={i.t} className="rounded-2xl border border-border/50 bg-secondary/30 p-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold">{i.t}</div>
                  {i.up ? <ArrowUpRight className="h-4 w-4 text-emerald" /> : <ArrowDownRight className="h-4 w-4 text-skyblue" />}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">{i.d}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <SectionTitle title="Occupancy forecast — next 12 months" />
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={occForecast}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.08} />
                <XAxis dataKey="m" tickLine={false} axisLine={false} fontSize={11} stroke="currentColor" opacity={0.5} />
                <YAxis tickLine={false} axisLine={false} fontSize={11} stroke="currentColor" opacity={0.5} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--card)" }} />
                <Bar dataKey="f" fill="oklch(0.62 0.16 160)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <SectionTitle title="Per-property suggestions" />
          <div className="space-y-2">
            {properties.slice(0, 5).map((p) => {
              const delta = Math.round((p.roi - 12) * 8);
              return (
                <div key={p.id} className="flex items-center justify-between rounded-xl border border-border/50 bg-secondary/30 p-3 text-sm">
                  <div className="min-w-0">
                    <div className="truncate font-semibold">{p.name}</div>
                    <div className="text-[10px] text-muted-foreground">{p.city}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-display font-bold">{p.price}</div>
                    <div className={`text-[10px] font-semibold ${delta >= 0 ? "text-emerald" : "text-skyblue"}`}>
                      {delta >= 0 ? "+" : ""}{delta}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </>
  );
}

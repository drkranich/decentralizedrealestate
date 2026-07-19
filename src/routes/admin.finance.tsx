import { createFileRoute } from "@tanstack/react-router";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line, Legend } from "recharts";
import { DollarSign, TrendingDown, TrendingUp, CreditCard, Download } from "lucide-react";
import { PageHeader, StatCard, Card, SectionTitle, Badge } from "@/components/app/ui";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/finance")({
  component: Finance,
});

const monthly = ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((m, i) => ({
  m,
  income: 60000 + i * 4000 + Math.sin(i) * 3000,
  expense: 22000 + i * 1200,
  profit: 38000 + i * 2800,
}));

const txs = [
  { d: "Dec 08", desc: "Rent — Lisbon Loft", c: "Carlos R.", amt: "+€2,450", t: "in" },
  { d: "Dec 08", desc: "Cleaning service — Bali Villa", c: "CleanPro", amt: "-€85", t: "out" },
  { d: "Dec 07", desc: "Token dividend — TKY-SK22", c: "Investor pool", amt: "+€124", t: "in" },
  { d: "Dec 07", desc: "Maintenance — Tokyo AC", c: "JP Service", amt: "-€420", t: "out" },
  { d: "Dec 06", desc: "Booking — NYC Studio", c: "Anna S.", amt: "+€870", t: "in" },
  { d: "Dec 05", desc: "Stripe processing fee", c: "Stripe", amt: "-€42", t: "out" },
];

function Finance() {
  return (
    <>
      <PageHeader title="Financial Analytics" subtitle="Multi-currency revenue, expenses, and profit across the portfolio.">
        <button
          onClick={() => toast.info("Exportação real ficará disponível quando houver transações reais processadas pela plataforma.")}
          className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm hover:bg-secondary"
        >
          <Download className="h-4 w-4" /> Export
        </button>
      </PageHeader>

      <div className="mt-4 rounded-2xl border border-dashed border-skyblue/30 bg-skyblue/5 p-4 text-xs text-muted-foreground">
        <span className="font-semibold text-skyblue">Nota:</span> todos os valores, gráficos e transações abaixo são dados de demonstração — o histórico financeiro real será exibido aqui assim que pagamentos reais forem processados pela plataforma.
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Gross revenue" value="€384K" change="+22.4% YoY" icon={DollarSign} />
        <StatCard label="Expenses" value="€118K" change="-4.2% MoM" icon={TrendingDown} accent="skyblue" />
        <StatCard label="Net profit" value="€266K" change="+28.1% YoY" icon={TrendingUp} />
        <StatCard label="Cash runway" value="14.2 mo" change="healthy" icon={CreditCard} accent="skyblue" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <SectionTitle title="P&L · last 6 months" />
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={monthly}>
                <XAxis dataKey="m" tickLine={false} axisLine={false} fontSize={11} stroke="currentColor" opacity={0.4} />
                <YAxis tickLine={false} axisLine={false} fontSize={11} stroke="currentColor" opacity={0.4} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--card)" }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="income" fill="oklch(0.62 0.16 160)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="expense" fill="oklch(0.72 0.13 230)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="profit" fill="oklch(0.78 0.18 158)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <SectionTitle title="Currency split" />
          <div className="space-y-3">
            {[
              { c: "EUR", v: 48, a: "€184K" },
              { c: "USD", v: 28, a: "$110K" },
              { c: "JPY", v: 14, a: "¥8.4M" },
              { c: "AED", v: 10, a: "AED 220K" },
            ].map((c) => (
              <div key={c.c}>
                <div className="flex justify-between text-xs">
                  <span className="font-mono font-semibold">{c.c}</span>
                  <span className="text-muted-foreground">{c.a}</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-secondary">
                  <div className="h-full rounded-full bg-emerald" style={{ width: `${c.v}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="mt-6 overflow-hidden p-0">
        <div className="flex items-center justify-between p-6 pb-4">
          <h2 className="font-display text-lg font-semibold">Recent transactions</h2>
          <button
            onClick={() => toast.info("Ainda não há transações reais registradas.")}
            className="text-xs font-medium text-emerald hover:underline"
          >
            View all
          </button>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-y border-border bg-secondary/30 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-6 py-3 font-medium">Date</th>
              <th className="px-6 py-3 font-medium">Description</th>
              <th className="px-6 py-3 font-medium">Counterparty</th>
              <th className="px-6 py-3 font-medium text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {txs.map((t, i) => (
              <tr key={i} className="border-b border-border last:border-0 hover:bg-secondary/30">
                <td className="px-6 py-4 text-muted-foreground">{t.d}</td>
                <td className="px-6 py-4 font-medium">{t.desc}</td>
                <td className="px-6 py-4 text-muted-foreground">{t.c}</td>
                <td className={`px-6 py-4 text-right font-semibold ${t.t === "in" ? "text-emerald" : "text-foreground"}`}>{t.amt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}

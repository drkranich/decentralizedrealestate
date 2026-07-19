import { createFileRoute } from "@tanstack/react-router";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";
import { Home, DollarSign, Wrench, MessageSquare, Calendar, TrendingUp } from "lucide-react";
import { PageHeader, StatCard, Card, SectionTitle, Badge } from "@/components/app/ui";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/owner")({
  component: OwnerHub,
});

const data = Array.from({ length: 30 }, (_, i) => ({ d: i, v: 1200 + Math.random() * 800 }));

function OwnerHub() {
  return (
    <>
      <PageHeader title="Owner Hub" subtitle="Your operational command center." />

      <div className="mt-4 rounded-2xl border border-dashed border-skyblue/30 bg-skyblue/5 p-4 text-xs text-muted-foreground">
        <span className="font-semibold text-skyblue">Nota:</span> esta página ainda usa dados de demonstração — receita, check-ins, manutenção e ranking de desempenho serão reais assim que houver reservas e receita processadas.
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Properties owned" value="8" change="+1 this quarter" icon={Home} />
        <StatCard label="Net cashflow" value="€42,800" change="+12% MoM" icon={DollarSign} accent="skyblue" />
        <StatCard label="Open requests" value="6" change="2 urgent" icon={Wrench} />
        <StatCard label="Tenant messages" value="14" change="3 unread" icon={MessageSquare} accent="skyblue" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <SectionTitle title="Daily revenue (last 30 days)" />
          <div className="h-64">
            <ResponsiveContainer>
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="ow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.62 0.16 160)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="oklch(0.62 0.16 160)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="d" tickLine={false} axisLine={false} fontSize={11} stroke="currentColor" opacity={0.4} />
                <YAxis tickLine={false} axisLine={false} fontSize={11} stroke="currentColor" opacity={0.4} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--card)" }} />
                <Area type="monotone" dataKey="v" stroke="oklch(0.62 0.16 160)" strokeWidth={2.5} fill="url(#ow)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <SectionTitle title="Upcoming check-ins" />
          <div className="space-y-3">
            {[
              { n: "Anna S.", p: "Lisbon Loft", d: "Tomorrow" },
              { n: "Rohan K.", p: "Tokyo Tower", d: "Dec 14" },
              { n: "Marie L.", p: "Bali Villa", d: "Dec 16" },
              { n: "James P.", p: "NYC Studio", d: "Dec 20" },
            ].map((b, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald/20">
                  <Calendar className="h-4 w-4 text-emerald" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold">{b.n}</div>
                  <div className="text-xs text-muted-foreground">{b.p}</div>
                </div>
                <Badge variant="emerald">{b.d}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <SectionTitle title="Maintenance pipeline" action={<button onClick={() => toast.info("Ainda não há manutenções reais registradas.")} className="text-xs font-medium text-emerald hover:underline">View all</button>} />
          <div className="space-y-3">
            {[
              { p: "Tokyo Tower", t: "AC unit replacement", s: "In progress", v: "warn" as const },
              { p: "Bali Villa", t: "Pool cleaning", s: "Scheduled", v: "blue" as const },
              { p: "Lisbon Loft", t: "Smart lock firmware", s: "Done", v: "emerald" as const },
            ].map((m, i) => (
              <div key={i} className="flex items-center justify-between rounded-2xl border border-border/50 bg-secondary/30 p-4">
                <div>
                  <div className="text-sm font-semibold">{m.t}</div>
                  <div className="text-xs text-muted-foreground">{m.p}</div>
                </div>
                <Badge variant={m.v}>{m.s}</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <SectionTitle title="Top performers" />
          <div className="space-y-3">
            {[
              { p: "Bali Villa", roi: 17.8, occ: 94 },
              { p: "Lisbon Loft", roi: 14.2, occ: 92 },
              { p: "Dubai Penthouse", roi: 13.1, occ: 91 },
              { p: "Tokyo Tower", roi: 11.8, occ: 88 },
            ].map((p, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald/10 text-xs font-bold text-emerald">#{i + 1}</div>
                <div className="flex-1">
                  <div className="text-sm font-semibold">{p.p}</div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-secondary">
                    <div className="h-full rounded-full bg-emerald" style={{ width: `${p.occ}%` }} />
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-emerald font-semibold">{p.roi}%</div>
                  <div className="text-[10px] text-muted-foreground">{p.occ}% occ</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Sparkles, Bot, Send, Brain, ShieldCheck, TrendingUp, Workflow, FileSignature,
  AlertTriangle, Wrench, DollarSign, Activity, Zap, Cpu, Lock, ChevronRight,
} from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, RadialBarChart, RadialBar } from "recharts";
import { PageHeader, StatCard, Card, SectionTitle, Badge } from "@/components/app/ui";
import { useBrand } from "@/components/brand/BrandProvider";

export const Route = createFileRoute("/app/ai")({
  component: AICenter,
});

const predictive = Array.from({ length: 24 }, (_, i) => ({
  m: i,
  actual: i < 14 ? 80 + Math.sin(i / 2) * 8 + i * 0.4 : null,
  forecast: 80 + Math.sin(i / 2) * 8 + i * 0.4 + (i >= 14 ? (i - 14) * 0.6 : 0),
}));

const tenants = [
  { n: "Sofia M.", score: 94, risk: "Low", income: "$8.2k", rent: "$2.1k" },
  { n: "Carlos R.", score: 88, risk: "Low", income: "$6.4k", rent: "$1.8k" },
  { n: "Anna K.", score: 76, risk: "Medium", income: "$4.9k", rent: "$1.6k" },
  { n: "James P.", score: 62, risk: "Medium", income: "$3.8k", rent: "$1.5k" },
  { n: "Marie L.", score: 41, risk: "High", income: "$2.6k", rent: "$1.4k" },
];

const workflows = [
  { n: "Auto-greet new bookings", trig: "Booking confirmed", runs: 1284, on: true },
  { n: "Late payment reminder", trig: "Day +3 unpaid", runs: 412, on: true },
  { n: "Smart pricing rebalance", trig: "Daily 03:00 UTC", runs: 365, on: true },
  { n: "Maintenance dispatch", trig: "Sensor alert", runs: 87, on: false },
  { n: "Contract renewal nudge", trig: "30d before end", runs: 156, on: true },
];

const insights = [
  { i: TrendingUp, t: "Tokyo Tower rate +€42/night", d: "Demand spike forecast next 14d", impact: "+€1.2k", v: "emerald" as const },
  { i: Wrench, t: "Predicted HVAC failure", d: "Bali Villa unit B · 87% confidence · 9d", impact: "−€480", v: "warn" as const },
  { i: ShieldCheck, t: "Fraud signal detected", d: "Application #4421 · mismatched IP/ID", impact: "Blocked", v: "warn" as const },
  { i: FileSignature, t: "Contract draft ready", d: "Lisbon Loft 3B · Sofia M.", impact: "Review", v: "blue" as const },
];

type Msg = { role: "user" | "ai"; text: string };

function AICenter() {
  const brand = useBrand();
  const [chat, setChat] = useState<Msg[]>([
    { role: "ai", text: `Hi Jordan — I'm ${brand.name} AI. Ask me about pricing, tenants, contracts, or maintenance.` },
  ]);
  const [input, setInput] = useState("");

  const send = () => {
    if (!input.trim()) return;
    const u = input.trim();
    setChat((c) => [...c, { role: "user", text: u }]);
    setInput("");
    setTimeout(() => {
      setChat((c) => [
        ...c,
        {
          role: "ai",
          text: `Based on the latest portfolio signals, I'd suggest reviewing **Tokyo Tower** pricing (+23% demand) and approving the pending contract for Sofia M. Want me to draft the renewal?`,
        },
      ]);
    }, 600);
  };

  return (
    <>
      <PageHeader title="AI Automation Center" subtitle={`${brand.name} intelligence layer · learning from every transaction.`}>
        <Badge variant="emerald"><span className="mr-1 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald" /> Online</Badge>
        <button className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-secondary">Models</button>
        <button className="rounded-full bg-gradient-to-r from-emerald to-skyblue px-4 py-2 text-sm font-semibold text-white shadow-glow">Train</button>
      </PageHeader>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Active models" value="14" change="3 new this week" icon={Cpu} />
        <StatCard label="Predictions today" value="2,184" change="+18%" icon={Brain} accent="skyblue" />
        <StatCard label="Avg confidence" value="91.2%" change="+2.1%" icon={Activity} />
        <StatCard label="Automations run" value="1,248" change="98.7% success" icon={Workflow} accent="skyblue" />
      </div>

      {/* Chat + Smart recommendations */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 flex flex-col">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald to-skyblue shadow-glow">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="font-display text-lg font-semibold">{brand.name} Assistant</h2>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald" /> GPT-class · multimodal
                </div>
              </div>
            </div>
            <button className="rounded-full border border-border px-3 py-1 text-xs hover:bg-secondary">Clear</button>
          </div>

          <div className="flex h-80 flex-col gap-3 overflow-y-auto rounded-2xl border border-border/50 bg-secondary/20 p-4">
            {chat.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                  m.role === "user"
                    ? "bg-foreground text-background"
                    : "bg-card border border-border/60"
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 flex gap-2">
            <div className="flex flex-1 items-center gap-2 rounded-full border border-border bg-background px-4 py-2">
              <Sparkles className="h-4 w-4 text-emerald" />
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder={`Ask ${brand.name} AI anything…`}
                className="w-full bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none"
              />
            </div>
            <button onClick={send} className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald to-skyblue text-white shadow-glow hover:opacity-90">
              <Send className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {["Suggest pricing", "Score tenants", "Draft contract", "Predict maintenance"].map((q) => (
              <button key={q} onClick={() => setInput(q)} className="rounded-full border border-border bg-secondary/40 px-3 py-1 text-xs hover:bg-secondary">{q}</button>
            ))}
          </div>
        </Card>

        <Card>
          <SectionTitle title="Smart recommendations" action={<Sparkles className="h-4 w-4 text-emerald" />} />
          <div className="space-y-3">
            {insights.map((r, i) => (
              <div key={i} className="rounded-2xl border border-border/60 bg-secondary/20 p-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-emerald/15 to-skyblue/15">
                    <r.i className="h-4 w-4 text-emerald" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-sm font-semibold truncate">{r.t}</div>
                      <Badge variant={r.v}>{r.impact}</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">{r.d}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Predictive analytics + accuracy */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <SectionTitle
            title="Predictive analytics — occupancy"
            action={
              <div className="flex gap-3 text-xs">
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald" /> Actual</span>
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-skyblue" /> Forecast</span>
              </div>
            }
          />
          <div className="h-64">
            <ResponsiveContainer>
              <AreaChart data={predictive}>
                <defs>
                  <linearGradient id="ai1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--emerald)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--emerald)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="ai2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--skyblue)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="var(--skyblue)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="m" tickLine={false} axisLine={false} fontSize={11} stroke="currentColor" opacity={0.4} />
                <YAxis tickLine={false} axisLine={false} fontSize={11} stroke="currentColor" opacity={0.4} unit="%" />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--card)" }} />
                <Area type="monotone" dataKey="actual" stroke="var(--emerald)" strokeWidth={3} fill="url(#ai1)" />
                <Area type="monotone" dataKey="forecast" stroke="var(--skyblue)" strokeWidth={2} strokeDasharray="5 5" fill="url(#ai2)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <SectionTitle title="Model health" action={<Zap className="h-4 w-4 text-emerald" />} />
          <div className="h-44">
            <ResponsiveContainer>
              <RadialBarChart innerRadius="60%" outerRadius="100%" data={[{ name: "Acc", value: 91, fill: "var(--emerald)" }]} startAngle={90} endAngle={-270}>
                <RadialBar dataKey="value" cornerRadius={20} background={{ fill: "var(--muted)" }} />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
          <div className="-mt-32 text-center">
            <div className="font-display text-3xl font-bold">91%</div>
            <div className="text-xs text-muted-foreground">Accuracy</div>
          </div>
          <div className="mt-12 space-y-2 text-xs">
            {[
              { l: "Pricing AI", v: 94 },
              { l: "Tenant scoring", v: 89 },
              { l: "Maintenance predictor", v: 87 },
              { l: "Fraud detection", v: 96 },
            ].map((m) => (
              <div key={m.l}>
                <div className="flex justify-between"><span className="text-muted-foreground">{m.l}</span><span className="font-mono font-semibold">{m.v}%</span></div>
                <div className="mt-1 h-1 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-gradient-to-r from-emerald to-skyblue" style={{ width: `${m.v}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Tenant scoring + Fraud + Maintenance */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card>
          <SectionTitle title="Tenant scoring" action={<Brain className="h-4 w-4 text-emerald" />} />
          <div className="space-y-3">
            {tenants.map((t) => (
              <div key={t.n} className="flex items-center gap-3 rounded-2xl border border-border/40 p-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-emerald to-skyblue text-xs font-bold text-white">
                  {t.n.split(" ").map((p) => p[0]).join("")}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold">{t.n}</span>
                    <span className="font-mono text-xs text-muted-foreground">{t.income} · {t.rent}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                      <div className={`h-full rounded-full ${t.score >= 80 ? "bg-emerald" : t.score >= 60 ? "bg-skyblue" : "bg-red-500"}`} style={{ width: `${t.score}%` }} />
                    </div>
                    <span className="font-mono text-xs font-semibold">{t.score}</span>
                  </div>
                </div>
                <Badge variant={t.risk === "Low" ? "emerald" : t.risk === "Medium" ? "blue" : "warn"}>{t.risk}</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <SectionTitle
            title="Fraud detection"
            action={<span className="flex items-center gap-1 text-xs text-yellow-500"><AlertTriangle className="h-3.5 w-3.5" /> 3 flagged</span>}
          />
          <div className="space-y-3">
            {[
              { id: "#4421", reason: "IP/identity mismatch", sev: "High" as const },
              { id: "#4418", reason: "Synthetic document signature", sev: "Critical" as const },
              { id: "#4402", reason: "Velocity anomaly · 8 apps/24h", sev: "Medium" as const },
            ].map((f, i) => (
              <div key={i} className="rounded-2xl border border-border/50 bg-secondary/20 p-3">
                <div className="flex items-center justify-between">
                  <div className="font-mono text-xs font-semibold">{f.id}</div>
                  <Badge variant={f.sev === "Critical" ? "warn" : f.sev === "High" ? "warn" : "blue"}>{f.sev}</Badge>
                </div>
                <div className="mt-1 text-sm">{f.reason}</div>
                <div className="mt-2 flex gap-2">
                  <button className="flex-1 rounded-lg border border-border py-1 text-xs hover:bg-secondary">Review</button>
                  <button className="flex-1 rounded-lg bg-red-500/10 py-1 text-xs font-semibold text-red-500 hover:bg-red-500/20">Block</button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between rounded-xl border border-emerald/20 bg-emerald/5 p-3 text-xs">
            <span className="flex items-center gap-2"><Lock className="h-3.5 w-3.5 text-emerald" /> Auto-block enabled</span>
            <button className="font-semibold text-emerald hover:underline">Configure</button>
          </div>
        </Card>

        <Card>
          <SectionTitle title="Maintenance prediction" action={<Wrench className="h-4 w-4 text-skyblue" />} />
          <div className="space-y-3">
            {[
              { p: "Bali Villa", part: "HVAC compressor", days: 9, conf: 87 },
              { p: "Tokyo Tower", part: "Water heater valve", days: 21, conf: 78 },
              { p: "Lisbon Loft", part: "Smart lock battery", days: 4, conf: 94 },
              { p: "NYC Studio", part: "Dishwasher pump", days: 35, conf: 71 },
            ].map((m, i) => (
              <div key={i} className="rounded-2xl border border-border/40 p-3">
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <div className="font-semibold">{m.part}</div>
                    <div className="text-xs text-muted-foreground">{m.p}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-sm font-semibold">{m.days}d</div>
                    <div className="text-[10px] text-muted-foreground">{m.conf}% conf</div>
                  </div>
                </div>
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-gradient-to-r from-emerald to-skyblue" style={{ width: `${m.conf}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Workflows + Pricing AI + Contract gen */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <SectionTitle
            title="Automated workflows"
            action={<button className="rounded-full bg-emerald/10 px-3 py-1 text-xs font-semibold text-emerald hover:bg-emerald/20">+ New workflow</button>}
          />
          <div className="space-y-2">
            {workflows.map((w, i) => (
              <div key={i} className="flex items-center gap-3 rounded-2xl border border-border/40 bg-secondary/20 p-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald/15 to-skyblue/15">
                  <Workflow className="h-4 w-4 text-emerald" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold">{w.n}</div>
                  <div className="text-xs text-muted-foreground">Trigger: {w.trig} · {w.runs.toLocaleString("en-US")} runs</div>
                </div>
                <div className={`flex h-6 w-11 items-center rounded-full p-0.5 transition ${w.on ? "bg-emerald" : "bg-muted"}`}>
                  <span className={`h-5 w-5 rounded-full bg-white shadow transition ${w.on ? "translate-x-5" : ""}`} />
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <SectionTitle title="Pricing AI" action={<DollarSign className="h-4 w-4 text-emerald" />} />
          <div className="rounded-2xl border border-emerald/20 bg-gradient-to-br from-emerald/10 to-skyblue/5 p-4">
            <div className="text-xs uppercase tracking-wide text-emerald">Today's net uplift</div>
            <div className="mt-1 font-display text-3xl font-bold">+$3,820</div>
            <div className="text-xs text-muted-foreground">Across 12 active properties</div>
          </div>
          <div className="mt-3 space-y-2">
            {[
              { p: "Tokyo Tower", from: 180, to: 222 },
              { p: "Bali Villa", from: 240, to: 268 },
              { p: "Lisbon Loft", from: 160, to: 178 },
            ].map((s, i) => (
              <div key={i} className="flex items-center justify-between rounded-xl border border-border/40 px-3 py-2 text-sm">
                <span className="font-medium">{s.p}</span>
                <span className="font-mono text-xs"><span className="text-muted-foreground">${s.from}</span> → <span className="font-semibold text-emerald">${s.to}</span></span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Contract generation */}
      <Card className="mt-6">
        <SectionTitle
          title="AI contract generation"
          action={<button className="rounded-full bg-foreground px-4 py-1.5 text-xs font-semibold text-background hover:opacity-90">Generate</button>}
        />
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { t: "Long-term lease", d: "12-month standard with smart pricing escalator", icon: FileSignature },
            { t: "Short-stay agreement", d: "Airbnb-compatible with damage deposit", icon: FileSignature },
            { t: "Token-holder distribution", d: "Quarterly dividend smart contract", icon: FileSignature },
          ].map((c) => (
            <div key={c.t} className="group rounded-2xl border border-border/60 bg-secondary/20 p-4 transition hover:-translate-y-0.5 hover:border-emerald/40 hover:shadow-glow">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald to-skyblue text-white">
                <c.icon className="h-5 w-5" />
              </div>
              <div className="mt-3 text-sm font-semibold">{c.t}</div>
              <div className="text-xs text-muted-foreground">{c.d}</div>
              <button className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-emerald">
                Use template <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}

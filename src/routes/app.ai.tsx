import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Bot, Sparkles, Send, BrainCircuit, Activity, UserCheck, TrendingUp } from "lucide-react";
import { PageHeader, Card, SectionTitle, Badge, StatCard } from "@/components/app/ui";

export const Route = createFileRoute("/app/ai")({
  component: AI,
});

const automations = [
  { name: "Dynamic pricing", desc: "Re-prices listings every 6h based on demand & events", on: true, icon: TrendingUp },
  { name: "Tenant scoring", desc: "Auto-evaluate applications using KYC + behavior", on: true, icon: UserCheck },
  { name: "Predictive maintenance", desc: "Forecasts equipment failures from sensor data", on: false, icon: Activity },
  { name: "Smart messaging", desc: "AI responds to common tenant questions in 32 languages", on: true, icon: BrainCircuit },
];

function AI() {
  const [msg, setMsg] = useState("");
  const [chat, setChat] = useState([
    { from: "ai", t: "Hi Jordan — your portfolio looks strong this week. Anything you'd like to optimize?" },
    { from: "u", t: "Show me underperforming properties." },
    { from: "ai", t: "NYC Studio is at 82% occupancy (avg 92%). I recommend a 14% price drop on weekdays — projected +€640/mo." },
  ]);

  const send = () => {
    if (!msg.trim()) return;
    setChat([...chat, { from: "u", t: msg }, { from: "ai", t: "Analyzing…" }]);
    setMsg("");
  };

  return (
    <>
      <PageHeader title="AI Automation Center" subtitle="Configure and monitor every intelligent workflow." />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Automations" value="12" change="3 active now" icon={Sparkles} />
        <StatCard label="Decisions today" value="1,420" change="98.4% confidence" icon={BrainCircuit} accent="skyblue" />
        <StatCard label="Saved revenue" value="€12,840" change="this month" icon={TrendingUp} />
        <StatCard label="Avg response" value="0.4s" change="-32% vs last week" icon={Activity} accent="skyblue" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {automations.map((a) => (
            <Card key={a.name}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald/15 to-skyblue/15">
                    <a.icon className="h-5 w-5 text-emerald" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-display text-base font-semibold">{a.name}</h3>
                      {a.on && <Badge variant="emerald">Active</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground">{a.desc}</p>
                  </div>
                </div>
                <button className={`relative h-6 w-11 rounded-full transition-colors ${a.on ? "bg-emerald" : "bg-muted"}`}>
                  <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${a.on ? "translate-x-5" : "translate-x-0.5"}`} />
                </button>
              </div>
            </Card>
          ))}
        </div>

        <Card>
          <SectionTitle title="AI Assistant" action={<div className="flex h-2 w-2 rounded-full bg-emerald animate-pulse-glow" />} />
          <div className="space-y-3 max-h-72 overflow-y-auto">
            {chat.map((m, i) => (
              <div key={i} className={`flex gap-2 ${m.from === "u" ? "justify-end" : ""}`}>
                {m.from === "ai" && <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald to-skyblue"><Bot className="h-3.5 w-3.5 text-white" /></div>}
                <div className={`max-w-[80%] rounded-2xl p-3 text-sm ${m.from === "u" ? "rounded-tr-sm bg-foreground text-background" : "rounded-tl-sm bg-secondary"}`}>{m.t}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-2 rounded-full border border-border bg-secondary/40 p-1.5">
            <input
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Ask anything…"
              className="flex-1 bg-transparent px-3 text-sm focus:outline-none"
            />
            <button onClick={send} className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-background">
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        </Card>
      </div>
    </>
  );
}

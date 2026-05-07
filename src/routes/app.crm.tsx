import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Phone, Mail, Filter } from "lucide-react";
import { PageHeader, Card, Badge, StatCard } from "@/components/app/ui";
import { Users, TrendingUp, Target, Zap } from "lucide-react";

export const Route = createFileRoute("/app/crm")({
  component: CRM,
});

const stages = ["New", "Qualified", "Tour", "Proposal", "Closed"];
const initial: Record<string, { id: string; name: string; src: string; val: string; score: number }[]> = {
  New: [
    { id: "1", name: "Sofia M.", src: "Web", val: "€2,400/mo", score: 82 },
    { id: "2", name: "Liam C.", src: "Referral", val: "€3,100/mo", score: 71 },
  ],
  Qualified: [
    { id: "3", name: "Anna B.", src: "Instagram", val: "€2,800/mo", score: 89 },
    { id: "4", name: "Marcus T.", src: "Google", val: "€4,200/mo", score: 94 },
  ],
  Tour: [
    { id: "5", name: "Yuki K.", src: "Web", val: "€2,100/mo", score: 76 },
  ],
  Proposal: [
    { id: "6", name: "Elena R.", src: "Partner", val: "€5,400/mo", score: 91 },
    { id: "7", name: "James W.", src: "Web", val: "€3,000/mo", score: 88 },
  ],
  Closed: [
    { id: "8", name: "Carlos R.", src: "Referral", val: "€2,450/mo", score: 100 },
  ],
};

function CRM() {
  const [board] = useState(initial);

  return (
    <>
      <PageHeader title="CRM Leads" subtitle="Pipeline of prospective tenants and investors.">
        <button className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm hover:bg-secondary">
          <Filter className="h-4 w-4" /> Filter
        </button>
        <button className="flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald to-emerald-glow px-4 py-2 text-sm font-semibold text-white shadow-glow">
          <Plus className="h-4 w-4" /> New lead
        </button>
      </PageHeader>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Active leads" value="148" change="+24 this week" icon={Users} />
        <StatCard label="Conversion" value="32.4%" change="+4.1%" icon={Target} accent="skyblue" />
        <StatCard label="Pipeline value" value="€84,200" change="weighted" icon={TrendingUp} />
        <StatCard label="AI-qualified" value="62%" change="of new leads" icon={Zap} accent="skyblue" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-5">
        {stages.map((s) => (
          <div key={s} className="rounded-3xl border border-border bg-card p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold">{s}</h3>
              <Badge variant="muted">{board[s].length}</Badge>
            </div>
            <div className="space-y-3">
              {board[s].map((l) => (
                <div key={l.id} className="cursor-pointer rounded-2xl border border-border/50 bg-secondary/30 p-3 transition-all hover:border-emerald/40 hover:shadow-soft">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald to-skyblue text-[10px] font-bold text-white">
                      {l.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold truncate">{l.name}</div>
                      <div className="text-[10px] text-muted-foreground">{l.src}</div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs font-semibold">{l.val}</span>
                    <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${l.score >= 85 ? "bg-emerald/15 text-emerald" : "bg-skyblue/15 text-skyblue"}`}>
                      {l.score}
                    </span>
                  </div>
                  <div className="mt-2 flex gap-1.5 border-t border-border/50 pt-2">
                    <button className="flex h-7 flex-1 items-center justify-center rounded-lg hover:bg-background"><Phone className="h-3 w-3" /></button>
                    <button className="flex h-7 flex-1 items-center justify-center rounded-lg hover:bg-background"><Mail className="h-3 w-3" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

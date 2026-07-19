import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { FileText, Plus, Search, Download, MoreHorizontal } from "lucide-react";
import { PageHeader, Card, Badge, StatCard } from "@/components/app/ui";
import { CheckCircle2, Clock, FileSignature, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/app/contracts")({
  component: Contracts,
});

const contracts = [
  { id: "C-2401", n: "Lease — Lisbon Loft", t: "Carlos R.", v: "€2,450/mo", s: "Active", d: "Dec 31, 2025" },
  { id: "C-2402", n: "Short-stay — Tokyo Tower", t: "Anna S.", v: "¥48,000/wk", s: "Pending sig.", d: "Dec 14, 2024" },
  { id: "C-2403", n: "Lease — Bali Villa", t: "Marcus T.", v: "$1,250/mo", s: "Active", d: "Mar 15, 2026" },
  { id: "C-2404", n: "Investor — LIS-LX01", t: "Elena R.", v: "$14,200", s: "Signed", d: "Perpetual" },
  { id: "C-2405", n: "Service — CleanPro", t: "CleanPro Lda.", v: "€85/visit", s: "Active", d: "Renews mo." },
  { id: "C-2406", n: "Lease — NYC Studio", t: "James W.", v: "$3,800/mo", s: "Expired", d: "Nov 30, 2024" },
];

const map: Record<string, "emerald" | "warn" | "muted" | "blue"> = {
  Active: "emerald",
  "Pending sig.": "warn",
  Signed: "blue",
  Expired: "muted",
};

function Contracts() {
  const [showNew, setShowNew] = useState(false);

  return (
    <>
      <PageHeader title="Contracts" subtitle="Generate, sign, and enforce contracts across jurisdictions.">
        <button className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm hover:bg-secondary">
          <Download className="h-4 w-4" /> Export
        </button>
        <button onClick={() => setShowNew(true)} className="flex items-center gap-2 rounded-full bg-emerald px-4 py-2 text-sm font-semibold text-white shadow-glow">
          <Plus className="h-4 w-4" /> New contract
        </button>
      </PageHeader>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Active" value="42" change="+3 this month" icon={CheckCircle2} />
        <StatCard label="Pending sig." value="7" change="2 overdue" icon={Clock} accent="skyblue" />
        <StatCard label="AI-generated" value="38" change="92% of total" icon={FileSignature} />
        <StatCard label="Expiring 30d" value="5" change="action required" icon={AlertCircle} accent="skyblue" />
      </div>

      <Card className="mt-6 overflow-hidden p-0">
        <div className="flex flex-wrap items-center justify-between gap-3 p-6 pb-4">
          <div className="flex flex-1 items-center gap-2 rounded-full border border-border bg-secondary/40 px-4 py-2 max-w-sm">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input className="w-full bg-transparent text-sm focus:outline-none" placeholder="Search contracts…" />
          </div>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-y border-border bg-secondary/30 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-6 py-3 font-medium">Ref</th>
              <th className="px-6 py-3 font-medium">Contract</th>
              <th className="px-6 py-3 font-medium">Counterparty</th>
              <th className="px-6 py-3 font-medium">Value</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium">Expires</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {contracts.map((c) => (
              <tr key={c.id} className="border-b border-border last:border-0 hover:bg-secondary/30">
                <td className="px-6 py-4 font-mono text-xs">{c.id}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-emerald" />
                    <span className="font-semibold">{c.n}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-muted-foreground">{c.t}</td>
                <td className="px-6 py-4 font-semibold">{c.v}</td>
                <td className="px-6 py-4"><Badge variant={map[c.s]}>{c.s}</Badge></td>
                <td className="px-6 py-4 text-muted-foreground">{c.d}</td>
                <td className="px-6 py-4 text-right">
                  <button className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-secondary"><MoreHorizontal className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in" onClick={() => setShowNew(false)}>
          <div className="w-full max-w-lg rounded-3xl bg-card p-6 shadow-elegant animate-in zoom-in-95" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display text-xl font-bold">New contract</h3>
            <p className="mt-1 text-sm text-muted-foreground">AI will draft and pre-fill the legal clauses for the selected jurisdiction.</p>
            <div className="mt-5 space-y-4">
              <div>
                <label className="text-xs font-medium">Type</label>
                <select className="mt-1 w-full rounded-xl border border-border bg-secondary/40 p-2.5 text-sm">
                  <option>Long-term lease</option>
                  <option>Short stay</option>
                  <option>Service agreement</option>
                  <option>Investor token</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium">Property</label>
                  <select className="mt-1 w-full rounded-xl border border-border bg-secondary/40 p-2.5 text-sm">
                    <option>Lisbon Loft</option>
                    <option>Tokyo Tower</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium">Counterparty</label>
                  <input className="mt-1 w-full rounded-xl border border-border bg-secondary/40 p-2.5 text-sm" placeholder="Email" />
                </div>
              </div>
              <div className="rounded-2xl border border-emerald/30 bg-emerald/5 p-3 text-xs text-muted-foreground">
                <span className="font-semibold text-emerald">AI suggestion:</span> Add force-majeure clause v3.2 (recommended for Portugal).
              </div>
            </div>
            <div className="mt-6 flex gap-2">
              <button onClick={() => setShowNew(false)} className="flex-1 rounded-full border border-border py-2.5 text-sm font-medium">Cancel</button>
              <button className="flex-1 rounded-full bg-foreground py-2.5 text-sm font-semibold text-background">Generate</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

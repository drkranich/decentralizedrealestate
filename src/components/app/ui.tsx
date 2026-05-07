// Shared UI primitives for app pages
import { ReactNode } from "react";

export function PageHeader({ title, subtitle, children }: { title: string; subtitle?: string; children?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

export function StatCard({ label, value, change, icon: Icon, accent = "emerald" }: { label: string; value: string; change?: string; icon: any; accent?: "emerald" | "skyblue" }) {
  return (
    <div className="rounded-3xl border border-border bg-card p-5 shadow-soft transition-all hover:shadow-elegant">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${accent === "emerald" ? "from-emerald/15 to-emerald-glow/15" : "from-skyblue/15 to-emerald/15"}`}>
          <Icon className={`h-4 w-4 ${accent === "emerald" ? "text-emerald" : "text-skyblue"}`} />
        </div>
      </div>
      <div className="mt-3 font-display text-3xl font-bold">{value}</div>
      {change && <div className="mt-1 text-xs font-medium text-emerald">{change}</div>}
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-3xl border border-border bg-card p-6 shadow-soft ${className}`}>{children}</div>;
}

export function SectionTitle({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="font-display text-lg font-semibold">{title}</h2>
      {action}
    </div>
  );
}

export function Badge({ children, variant = "default" }: { children: ReactNode; variant?: "default" | "emerald" | "blue" | "warn" | "muted" }) {
  const map = {
    default: "bg-secondary text-foreground",
    emerald: "bg-emerald/10 text-emerald",
    blue: "bg-skyblue/15 text-skyblue",
    warn: "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400",
    muted: "bg-muted text-muted-foreground",
  };
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${map[variant]}`}>{children}</span>;
}

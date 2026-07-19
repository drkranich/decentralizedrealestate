// Shared UI primitives for app pages — glassmorphism + subtle CSS-only motion
// (no framer-motion here: pure CSS keyframes so entrance animations never
// depend on client JS hydration timing), driven by src/config/brand.ts.
import { ReactNode } from "react";

export function PageHeader({ title, subtitle, children }: { title: string; subtitle?: string; children?: ReactNode }) {
  return (
    <div className="animate-fade-in-down mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

export function StatCard({
  label, value, change, icon: Icon, accent = "emerald", delay = 0,
}: { label: string; value: string; change?: string; icon: any; accent?: "emerald" | "skyblue"; delay?: number }) {
  const accentClass = accent === "emerald" ? "bg-emerald/15 text-emerald" : "bg-skyblue/15 text-skyblue";
  return (
    <div
      className="animate-fade-in-up group relative overflow-hidden rounded-3xl border border-white/10 bg-card/60 p-5 shadow-soft backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-emerald/30 hover:shadow-elegant"
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="pointer-events-none absolute inset-0 bg-glass-tint opacity-70" />
      <div className="relative">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
          <div className={`flex h-9 w-9 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 ${accentClass}`}>
            <Icon className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 font-display text-3xl font-bold">{value}</div>
        {change && <div className="mt-1 text-xs font-medium text-emerald">{change}</div>}
      </div>
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`animate-fade-in-up group relative overflow-hidden rounded-3xl border border-white/10 bg-card/60 p-6 shadow-soft backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-emerald/20 hover:shadow-elegant ${className}`}>
      <div className="pointer-events-none absolute inset-0 bg-glass-tint opacity-60" />
      <div className="relative">{children}</div>
    </div>
  );
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
    default: "bg-secondary/70 text-foreground backdrop-blur-sm",
    emerald: "bg-emerald/10 text-emerald backdrop-blur-sm",
    blue: "bg-skyblue/15 text-skyblue backdrop-blur-sm",
    warn: "bg-destructive/15 text-destructive backdrop-blur-sm",
    muted: "bg-muted/70 text-muted-foreground backdrop-blur-sm",
  };
  return (
    <span className={`inline-flex items-center rounded-full border border-white/10 px-2.5 py-0.5 text-xs font-medium transition-colors ${map[variant]}`}>
      {children}
    </span>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Filter, Grid3x3, List, MapPin, MoreHorizontal, TrendingUp, Building2, Percent, DollarSign } from "lucide-react";
import { PageHeader, Card, Badge, StatCard } from "@/components/app/ui";
import { properties } from "@/data/properties";
import { AddPropertyModal } from "@/components/properties/AddPropertyModal";

export const Route = createFileRoute("/app/properties")({
  component: Properties,
});

function Properties() {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [filter, setFilter] = useState("All");
  const [open, setOpen] = useState(false);
  const filtered = filter === "All" ? properties : properties.filter((p) => p.status === filter);

  const total = properties.length;
  const avgRoi = (properties.reduce((s, p) => s + p.roi, 0) / total).toFixed(1);
  const avgOcc = Math.round(properties.reduce((s, p) => s + p.occupancy, 0) / total);
  const monthly = properties.reduce((s, p) => s + p.monthlyIncome, 0);

  return (
    <>
      <PageHeader title="Properties" subtitle={`Manage your global portfolio of ${total} properties.`}>
        <Link to="/app/properties-calendar" className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-secondary">Calendar</Link>
        <Link to="/app/smart-pricing" className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-secondary">Smart pricing</Link>
        <button className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-secondary">
          <Filter className="h-4 w-4" /> Filters
        </button>
        <button onClick={() => setOpen(true)} className="flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald to-emerald-glow px-4 py-2 text-sm font-semibold text-white shadow-glow">
          <Plus className="h-4 w-4" /> Add property
        </button>
      </PageHeader>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Properties" value={String(total)} icon={Building2} />
        <StatCard label="Monthly income" value={`€${monthly.toLocaleString("en-US")}`} change="+8.4%" icon={DollarSign} />
        <StatCard label="Avg ROI" value={`${avgRoi}%`} change="+0.6 pts" icon={TrendingUp} accent="skyblue" />
        <StatCard label="Avg occupancy" value={`${avgOcc}%`} icon={Percent} accent="skyblue" />
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {["All", "Active", "Vacant", "Maintenance"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                filter === s ? "bg-foreground text-background" : "border border-border bg-card text-muted-foreground hover:bg-secondary"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="flex rounded-full border border-border bg-card p-0.5">
          <button onClick={() => setView("grid")} className={`flex h-8 w-8 items-center justify-center rounded-full ${view === "grid" ? "bg-secondary" : ""}`}>
            <Grid3x3 className="h-4 w-4" />
          </button>
          <button onClick={() => setView("list")} className={`flex h-8 w-8 items-center justify-center rounded-full ${view === "list" ? "bg-secondary" : ""}`}>
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {view === "grid" ? (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <Link key={p.id} to="/app/properties/$id" params={{ id: p.id }} className="group overflow-hidden rounded-3xl border border-border bg-card transition-all hover:-translate-y-1 hover:shadow-elegant">
              <div className={`relative aspect-[4/3] bg-gradient-to-br ${p.gradient}`}>
                <div className="absolute inset-0 grid-bg opacity-40" />
                <div className="absolute left-4 top-4">
                  <Badge variant={p.status === "Active" ? "emerald" : p.status === "Maintenance" ? "warn" : "muted"}>{p.status}</Badge>
                </div>
                <div className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full glass-strong opacity-0 group-hover:opacity-100">
                  <MoreHorizontal className="h-4 w-4" />
                </div>
                <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                  <div className="rounded-xl glass-strong px-2.5 py-1 text-[10px] font-semibold">€{p.monthlyIncome.toLocaleString("en-US")}/mo</div>
                  <div className="rounded-xl glass-strong px-2.5 py-1 text-[10px] font-semibold text-emerald">ROI {p.roi}%</div>
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-display text-base font-semibold">{p.name}</h3>
                    <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" /> {p.city}, {p.country}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-display text-base font-bold">{p.price}</div>
                    <div className="text-[10px] text-muted-foreground">/ month</div>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-3 text-xs">
                  <span className="text-muted-foreground">Occ <span className="font-semibold text-foreground">{p.occupancy}%</span></span>
                  <span className="text-muted-foreground">{p.bedrooms} bd · {p.bathrooms} ba · {p.area} m²</span>
                  <Badge variant="blue">{p.type}</Badge>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <Card className="overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/30 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-5 py-3 font-medium">Property</th>
                <th className="px-5 py-3 font-medium">Location</th>
                <th className="px-5 py-3 font-medium">Type</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right">Monthly</th>
                <th className="px-5 py-3 font-medium text-right">ROI</th>
                <th className="px-5 py-3 font-medium text-right">Occ</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0 hover:bg-secondary/30">
                  <td className="px-5 py-4">
                    <Link to="/app/properties/$id" params={{ id: p.id }} className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${p.gradient}`} />
                      <span className="font-semibold">{p.name}</span>
                    </Link>
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">{p.city}, {p.country}</td>
                  <td className="px-5 py-4"><Badge variant="blue">{p.type}</Badge></td>
                  <td className="px-5 py-4">
                    <Badge variant={p.status === "Active" ? "emerald" : p.status === "Maintenance" ? "warn" : "muted"}>{p.status}</Badge>
                  </td>
                  <td className="px-5 py-4 text-right font-semibold">€{p.monthlyIncome.toLocaleString("en-US")}</td>
                  <td className="px-5 py-4 text-right text-emerald font-semibold">{p.roi}%</td>
                  <td className="px-5 py-4 text-right">{p.occupancy}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <AddPropertyModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}

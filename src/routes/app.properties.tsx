import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Filter, Grid3x3, List, MapPin, Star, MoreHorizontal } from "lucide-react";
import { PageHeader, Card, Badge } from "@/components/app/ui";

export const Route = createFileRoute("/app/properties")({
  component: Properties,
});

const props = [
  { id: "1", name: "Príncipe Real Loft", city: "Lisbon", country: "Portugal", price: "€2,450", status: "Active", roi: 14.2, occ: 92, type: "Short stay", g: "from-emerald/40 to-skyblue/30" },
  { id: "2", name: "Skyline Tower 22F", city: "Tokyo", country: "Japan", price: "¥320,000", status: "Active", roi: 11.8, occ: 88, type: "Long stay", g: "from-skyblue/40 to-emerald/30" },
  { id: "3", name: "Beach Villa Kuta", city: "Bali", country: "Indonesia", price: "$1,250", status: "Active", roi: 17.8, occ: 94, type: "Short stay", g: "from-emerald-glow/50 to-emerald/20" },
  { id: "4", name: "Marina Penthouse", city: "Dubai", country: "UAE", price: "AED 8,200", status: "Maintenance", roi: 13.1, occ: 0, type: "Long stay", g: "from-silver/40 to-skyblue/30" },
  { id: "5", name: "Eixample Apt 4B", city: "Barcelona", country: "Spain", price: "€2,100", status: "Active", roi: 12.4, occ: 89, type: "Short stay", g: "from-skyblue/40 to-emerald-glow/30" },
  { id: "6", name: "Brooklyn Studio 7C", city: "New York", country: "USA", price: "$3,800", status: "Vacant", roi: 9.8, occ: 0, type: "Long stay", g: "from-emerald/30 to-skyblue/20" },
];

function Properties() {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [filter, setFilter] = useState("All");
  const filtered = filter === "All" ? props : props.filter((p) => p.status === filter);

  return (
    <>
      <PageHeader title="Properties" subtitle="Manage your global portfolio of 12 properties.">
        <button className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-secondary">
          <Filter className="h-4 w-4" /> Filters
        </button>
        <button className="flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald to-emerald-glow px-4 py-2 text-sm font-semibold text-white shadow-glow">
          <Plus className="h-4 w-4" /> Add property
        </button>
      </PageHeader>

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
              <div className={`relative aspect-[4/3] bg-gradient-to-br ${p.g}`}>
                <div className="absolute inset-0 grid-bg opacity-40" />
                <div className="absolute left-4 top-4">
                  <Badge variant={p.status === "Active" ? "emerald" : p.status === "Maintenance" ? "warn" : "muted"}>{p.status}</Badge>
                </div>
                <div className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full glass-strong opacity-0 group-hover:opacity-100">
                  <MoreHorizontal className="h-4 w-4" />
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
                  <span className="text-muted-foreground">ROI <span className="font-semibold text-emerald">{p.roi}%</span></span>
                  <span className="text-muted-foreground">Occ <span className="font-semibold text-foreground">{p.occ}%</span></span>
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
                <th className="px-5 py-3 font-medium text-right">Price</th>
                <th className="px-5 py-3 font-medium text-right">ROI</th>
                <th className="px-5 py-3 font-medium text-right">Occ</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0 hover:bg-secondary/30">
                  <td className="px-5 py-4">
                    <Link to="/app/properties/$id" params={{ id: p.id }} className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${p.g}`} />
                      <span className="font-semibold">{p.name}</span>
                    </Link>
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">{p.city}, {p.country}</td>
                  <td className="px-5 py-4"><Badge variant="blue">{p.type}</Badge></td>
                  <td className="px-5 py-4">
                    <Badge variant={p.status === "Active" ? "emerald" : p.status === "Maintenance" ? "warn" : "muted"}>{p.status}</Badge>
                  </td>
                  <td className="px-5 py-4 text-right font-semibold">{p.price}</td>
                  <td className="px-5 py-4 text-right text-emerald font-semibold">{p.roi}%</td>
                  <td className="px-5 py-4 text-right">{p.occ}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </>
  );
}

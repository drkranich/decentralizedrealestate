import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalIcon, Wrench, Brush } from "lucide-react";
import { PageHeader, Card, Badge } from "@/components/app/ui";
import { properties } from "@/data/properties";

export const Route = createFileRoute("/app/properties-calendar")({
  component: CalendarPage,
});

type Cell = { type: "booking" | "maintenance" | "cleaning" | "available"; label?: string };

const days = Array.from({ length: 30 }, (_, i) => i + 1);

function makeRow(seed: number): Cell[] {
  return days.map((d) => {
    const m = (d + seed) % 11;
    if (m === 0) return { type: "maintenance", label: "HVAC" };
    if (m === 4) return { type: "cleaning", label: "Clean" };
    if (m >= 5 && m <= 8) return { type: "booking", label: "Booked" };
    return { type: "available" };
  });
}

const cellClass: Record<Cell["type"], string> = {
  booking: "bg-emerald/80 text-white",
  maintenance: "bg-yellow-500/70 text-white",
  cleaning: "bg-skyblue/70 text-white",
  available: "bg-secondary/40 text-muted-foreground",
};

const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

function CalendarPage() {
  const [monthIndex, setMonthIndex] = useState(11);
  const [year, setYear] = useState(2025);
  const month = `${monthNames[monthIndex]} ${year}`;

  const goPrev = () => {
    if (monthIndex === 0) { setMonthIndex(11); setYear((y) => y - 1); }
    else setMonthIndex((m) => m - 1);
  };
  const goNext = () => {
    if (monthIndex === 11) { setMonthIndex(0); setYear((y) => y + 1); }
    else setMonthIndex((m) => m + 1);
  };

  return (
    <>
      <PageHeader title="Calendar" subtitle="Bookings, availability and maintenance across all properties.">
        <div className="flex items-center gap-1 rounded-full border border-border bg-card p-1">
          <button onClick={goPrev} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-secondary"><ChevronLeft className="h-4 w-4" /></button>
          <span className="px-3 text-sm font-semibold">{month}</span>
          <button onClick={goNext} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-secondary"><ChevronRight className="h-4 w-4" /></button>
        </div>
      </PageHeader>

      <div className="mt-4 rounded-2xl border border-dashed border-skyblue/30 bg-skyblue/5 p-4 text-xs text-muted-foreground">
        <span className="font-semibold text-skyblue">Nota:</span> as reservas exibidas no calendário abaixo são dados de demonstração — não há um sistema de reservas real conectado ainda.
      </div>

      <div className="mb-4 flex flex-wrap gap-3 text-xs">
        <Legend color="bg-emerald" label="Booking" icon={CalIcon} />
        <Legend color="bg-skyblue" label="Cleaning" icon={Brush} />
        <Legend color="bg-yellow-500" label="Maintenance" icon={Wrench} />
        <Legend color="bg-secondary border border-border" label="Available" icon={CalIcon} />
      </div>

      <Card className="overflow-x-auto p-0">
        <div className="min-w-[900px]">
          <div className="grid grid-cols-[200px_repeat(30,minmax(28px,1fr))] border-b border-border bg-secondary/30 text-[10px] uppercase tracking-wide text-muted-foreground">
            <div className="px-4 py-2 font-medium">Property</div>
            {days.map((d) => (
              <div key={d} className="border-l border-border/50 py-2 text-center">{d}</div>
            ))}
          </div>
          {properties.map((p, idx) => {
            const row = makeRow(idx * 3);
            return (
              <div key={p.id} className="grid grid-cols-[200px_repeat(30,minmax(28px,1fr))] border-b border-border last:border-0">
                <div className="flex items-center gap-2 px-4 py-2 text-xs">
                  <div className={`h-7 w-7 shrink-0 rounded-lg bg-${p.gradient}`} />
                  <div className="min-w-0">
                    <div className="truncate font-semibold">{p.name}</div>
                    <div className="text-[10px] text-muted-foreground">{p.city}</div>
                  </div>
                </div>
                {row.map((c, i) => (
                  <div key={i} className="border-l border-border/50 p-0.5">
                    <div className={`h-6 rounded ${cellClass[c.type]}`} />
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </Card>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="font-display text-lg font-semibold">Upcoming bookings</h3>
          <div className="mt-3 space-y-2">
            {[
              { p: "Príncipe Real Loft", g: "Anna Schmidt", d: "Dec 12 — Dec 18" },
              { p: "Beach Villa Kuta", g: "James Wong", d: "Dec 14 — Dec 21" },
              { p: "Eixample Apt 4B", g: "Marie Lefèvre", d: "Dec 18 — Dec 24" },
            ].map((b, i) => (
              <div key={i} className="flex items-center justify-between rounded-xl border border-border/50 bg-secondary/30 p-3 text-sm">
                <div>
                  <div className="font-semibold">{b.p}</div>
                  <div className="text-xs text-muted-foreground">{b.g}</div>
                </div>
                <Badge variant="emerald">{b.d}</Badge>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <h3 className="font-display text-lg font-semibold">Maintenance schedule</h3>
          <div className="mt-3 space-y-2">
            {[
              { p: "Marina Penthouse", t: "Pool resurface", d: "Dec 11" },
              { p: "Skyline Tower 22F", t: "Window cleaning", d: "Dec 16" },
              { p: "Brooklyn Studio 7C", t: "HVAC tune-up", d: "Dec 19" },
            ].map((b, i) => (
              <div key={i} className="flex items-center justify-between rounded-xl border border-border/50 bg-secondary/30 p-3 text-sm">
                <div>
                  <div className="font-semibold">{b.p}</div>
                  <div className="text-xs text-muted-foreground">{b.t}</div>
                </div>
                <Badge variant="warn">{b.d}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}

function Legend({ color, label, icon: Icon }: { color: string; label: string; icon: any }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1">
      <span className={`h-3 w-3 rounded ${color}`} />
      <Icon className="h-3 w-3 text-muted-foreground" /> {label}
    </span>
  );
}

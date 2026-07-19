import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalIcon, Wrench, Brush } from "lucide-react";
import { PageHeader, Card, Badge } from "@/components/app/ui";
import { Calendar as DatePicker } from "@/components/ui/calendar";
import { properties } from "@/data/properties";

export const Route = createFileRoute("/app/properties-calendar")({
  component: CalendarPage,
});

type Cell = { type: "booking" | "maintenance" | "cleaning" | "available"; label?: string };

function daysInMonth(monthIndex: number, year: number) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

// Deterministic demo pattern that actually changes when the month/year change,
// so navigating the calendar visibly moves the grid instead of always showing
// the exact same fake bookings regardless of what month is selected.
function makeRow(seed: number, monthIndex: number, year: number, dayCount: number): Cell[] {
  const monthSeed = monthIndex * 7 + (year % 100) * 13;
  return Array.from({ length: dayCount }, (_, i) => {
    const d = i + 1;
    const m = (d + seed + monthSeed) % 11;
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
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const monthIndex = selectedDate.getMonth();
  const year = selectedDate.getFullYear();
  const month = `${monthNames[monthIndex]} ${year}`;
  const dayCount = daysInMonth(monthIndex, year);
  const days = Array.from({ length: dayCount }, (_, i) => i + 1);
  const isCurrentMonth = (d: Date) => d.getMonth() === monthIndex && d.getFullYear() === year;

  const goPrev = () => setSelectedDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const goNext = () => setSelectedDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));

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
        <span className="font-semibold text-skyblue">Nota:</span> as reservas exibidas no calendário abaixo são dados de demonstração — não há um sistema de reservas real conectado ainda. O grid muda de acordo com o mês/dia selecionados, mas os eventos em si continuam fictícios.
      </div>

      <div className="mb-4 flex flex-wrap gap-3 text-xs">
        <Legend color="bg-emerald" label="Booking" icon={CalIcon} />
        <Legend color="bg-skyblue" label="Cleaning" icon={Brush} />
        <Legend color="bg-yellow-500" label="Maintenance" icon={Wrench} />
        <Legend color="bg-secondary border border-border" label="Available" icon={CalIcon} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[auto_1fr]">
        <Card className="w-fit">
          <DatePicker
            mode="single"
            selected={selectedDate}
            onSelect={(d) => d && setSelectedDate(d)}
            month={new Date(year, monthIndex)}
            onMonthChange={(d) => setSelectedDate((prev) => new Date(d.getFullYear(), d.getMonth(), Math.min(prev.getDate(), daysInMonth(d.getMonth(), d.getFullYear()))))}
          />
          <p className="px-3 pb-2 text-xs text-muted-foreground">
            Selecionado: <span className="font-semibold text-foreground">{selectedDate.toLocaleDateString("pt-BR")}</span>
          </p>
        </Card>

        <Card className="overflow-x-auto p-0">
          <div style={{ minWidth: `${200 + dayCount * 32}px` }}>
            <div className="grid border-b border-border bg-secondary/30 text-[10px] uppercase tracking-wide text-muted-foreground" style={{ gridTemplateColumns: `200px repeat(${dayCount}, minmax(28px, 1fr))` }}>
              <div className="px-4 py-2 font-medium">Property</div>
              {days.map((d) => (
                <div
                  key={d}
                  className={`border-l border-border/50 py-2 text-center ${d === selectedDate.getDate() && isCurrentMonth(selectedDate) ? "bg-emerald/20 font-bold text-emerald" : ""}`}
                >
                  {d}
                </div>
              ))}
            </div>
            {properties.map((p, idx) => {
              const row = makeRow(idx * 3, monthIndex, year, dayCount);
              return (
                <div key={p.id} className="grid border-b border-border last:border-0" style={{ gridTemplateColumns: `200px repeat(${dayCount}, minmax(28px, 1fr))` }}>
                  <div className="flex items-center gap-2 px-4 py-2 text-xs">
                    <div className={`h-7 w-7 shrink-0 rounded-lg bg-${p.gradient}`} />
                    <div className="min-w-0">
                      <div className="truncate font-semibold">{p.name}</div>
                      <div className="text-[10px] text-muted-foreground">{p.city}</div>
                    </div>
                  </div>
                  {row.map((c, i) => (
                    <div key={i} className={`border-l border-border/50 p-0.5 ${i + 1 === selectedDate.getDate() && isCurrentMonth(selectedDate) ? "ring-1 ring-inset ring-emerald/60" : ""}`}>
                      <div className={`h-6 rounded ${cellClass[c.type]}`} />
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </Card>
      </div>

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

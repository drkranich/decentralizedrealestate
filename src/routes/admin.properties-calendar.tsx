import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Brush,
  Calendar as CalIcon,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Wrench,
} from "lucide-react";
import { PageHeader, Card, Badge } from "@/components/app/ui";
import { Calendar as DatePicker } from "@/components/ui/calendar";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/admin/properties-calendar")({
  component: CalendarPage,
});

type PropertyRow = {
  id: string;
  title: string;
  city: string | null;
  status: string | null;
};

type ContractRow = {
  id: string;
  property_id: string | null;
  user_id: string;
  status: string | null;
  start_date: string | null;
  end_date: string | null;
  created_at: string | null;
};

type MaintenanceRow = {
  id: string;
  property_id: string;
  title: string | null;
  description: string;
  status: string;
  priority: string;
  due_at: string | null;
  created_at: string;
};

type CalendarData = {
  properties: PropertyRow[];
  contracts: ContractRow[];
  maintenance: MaintenanceRow[];
};

type Cell = {
  type: "contract" | "maintenance" | "available";
  label?: string;
};

const cellClass: Record<Cell["type"], string> = {
  contract: "bg-emerald/80 text-white",
  maintenance: "bg-yellow-500/75 text-white",
  available: "bg-secondary/40 text-muted-foreground",
};

const monthNames = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

function CalendarPage() {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [data, setData] = useState<CalendarData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const [properties, contracts, maintenance] = await Promise.all([
        supabase
          .from("properties")
          .select("id, title, city, status")
          .order("created_at", { ascending: false }),
        supabase
          .from("contracts")
          .select("id, property_id, user_id, status, start_date, end_date, created_at")
          .order("created_at", { ascending: false }),
        supabase
          .from("maintenance_requests")
          .select("id, property_id, title, description, status, priority, due_at, created_at")
          .order("created_at", { ascending: false }),
      ]);

      if (cancelled) return;
      const firstError = [properties, contracts, maintenance].find((item) => item.error)?.error;
      if (firstError) {
        setError(firstError.message);
        setData({ properties: [], contracts: [], maintenance: [] });
        return;
      }

      setError(null);
      setData({
        properties: ((properties.data ?? []) as PropertyRow[]) ?? [],
        contracts: ((contracts.data ?? []) as ContractRow[]) ?? [],
        maintenance: ((maintenance.data ?? []) as MaintenanceRow[]) ?? [],
      });
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const monthIndex = selectedDate.getMonth();
  const year = selectedDate.getFullYear();
  const month = `${monthNames[monthIndex]} ${year}`;
  const dayCount = daysInMonth(monthIndex, year);
  const days = Array.from({ length: dayCount }, (_, index) => index + 1);
  const isCurrentMonth = (date: Date) =>
    date.getMonth() === monthIndex && date.getFullYear() === year;

  const visibleContracts = useMemo(
    () =>
      (data?.contracts ?? []).filter((contract) =>
        dateRangeTouchesMonth(contract.start_date, contract.end_date, year, monthIndex),
      ),
    [data?.contracts, monthIndex, year],
  );
  const visibleMaintenance = useMemo(
    () =>
      (data?.maintenance ?? []).filter((item) =>
        dateTouchesMonth(item.due_at ?? item.created_at, year, monthIndex),
      ),
    [data?.maintenance, monthIndex, year],
  );

  const goPrev = () =>
    setSelectedDate((date) => new Date(date.getFullYear(), date.getMonth() - 1, 1));
  const goNext = () =>
    setSelectedDate((date) => new Date(date.getFullYear(), date.getMonth() + 1, 1));

  if (!data) {
    return (
      <>
        <PageHeader
          title="Calendário"
          subtitle="Carregando agenda real de imóveis, contratos e manutenção."
        />
        <Card>
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Carregando...
          </div>
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Calendário"
        subtitle="Contratos, disponibilidade e manutenção registrados na plataforma."
      >
        <div className="flex items-center gap-1 rounded-full border border-border bg-card p-1">
          <button
            onClick={goPrev}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-secondary"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="px-3 text-sm font-semibold">{month}</span>
          <button
            onClick={goNext}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-secondary"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </PageHeader>

      {error && (
        <Card className="mb-6 border-destructive/30 bg-destructive/5">
          <p className="text-sm text-destructive">{error}</p>
        </Card>
      )}

      <div className="mb-4 flex flex-wrap gap-3 text-xs">
        <Legend color="bg-emerald" label="Contrato" icon={CalIcon} />
        <Legend color="bg-yellow-500" label="Manutenção" icon={Wrench} />
        <Legend color="bg-secondary border border-border" label="Livre / sem evento" icon={Brush} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[auto_1fr]">
        <Card className="w-fit">
          <DatePicker
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            month={new Date(year, monthIndex)}
            onMonthChange={(date) =>
              setSelectedDate(
                (previous) =>
                  new Date(
                    date.getFullYear(),
                    date.getMonth(),
                    Math.min(previous.getDate(), daysInMonth(date.getMonth(), date.getFullYear())),
                  ),
              )
            }
          />
          <p className="px-3 pb-2 text-xs text-muted-foreground">
            Selecionado:{" "}
            <span className="font-semibold text-foreground">
              {selectedDate.toLocaleDateString("pt-BR")}
            </span>
          </p>
        </Card>

        <Card className="overflow-x-auto p-0">
          {data.properties.length === 0 ? (
            <div className="py-16 text-center text-sm text-muted-foreground">
              Nenhum imóvel cadastrado ainda.
            </div>
          ) : (
            <div style={{ minWidth: `${220 + dayCount * 32}px` }}>
              <div
                className="grid border-b border-border bg-secondary/30 text-[10px] uppercase tracking-wide text-muted-foreground"
                style={{ gridTemplateColumns: `220px repeat(${dayCount}, minmax(28px, 1fr))` }}
              >
                <div className="px-4 py-2 font-medium">Imóvel</div>
                {days.map((day) => (
                  <div
                    key={day}
                    className={`border-l border-border/50 py-2 text-center ${
                      day === selectedDate.getDate() && isCurrentMonth(selectedDate)
                        ? "bg-emerald/20 font-bold text-emerald"
                        : ""
                    }`}
                  >
                    {day}
                  </div>
                ))}
              </div>
              {data.properties.map((property) => {
                const row = buildPropertyRow(property.id, days, monthIndex, year, data);
                return (
                  <div
                    key={property.id}
                    className="grid border-b border-border last:border-0"
                    style={{ gridTemplateColumns: `220px repeat(${dayCount}, minmax(28px, 1fr))` }}
                  >
                    <div className="flex items-center gap-2 px-4 py-2 text-xs">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald/15 text-emerald">
                        <CalIcon className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="truncate font-semibold">{property.title}</div>
                        <div className="text-[10px] text-muted-foreground">
                          {property.city ?? property.status ?? "Sem localização"}
                        </div>
                      </div>
                    </div>
                    {row.map((cell, index) => (
                      <div
                        key={index}
                        title={cell.label}
                        className={`border-l border-border/50 p-0.5 ${
                          index + 1 === selectedDate.getDate() && isCurrentMonth(selectedDate)
                            ? "ring-1 ring-inset ring-emerald/60"
                            : ""
                        }`}
                      >
                        <div className={`h-6 rounded ${cellClass[cell.type]}`} />
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="font-display text-lg font-semibold">Contratos no mês</h3>
          <div className="mt-3 space-y-2">
            {visibleContracts.length === 0 ? (
              <p className="py-6 text-sm text-muted-foreground">
                Nenhum contrato com vigência neste mês.
              </p>
            ) : (
              visibleContracts.map((contract) => (
                <div
                  key={contract.id}
                  className="flex items-center justify-between rounded-xl border border-border/50 bg-secondary/30 p-3 text-sm"
                >
                  <div>
                    <div className="font-semibold">
                      {propertyTitle(contract.property_id, data.properties)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(contract.start_date)} até {formatDate(contract.end_date)}
                    </div>
                  </div>
                  <Badge variant="emerald">{contract.status ?? "contrato"}</Badge>
                </div>
              ))
            )}
          </div>
        </Card>
        <Card>
          <h3 className="font-display text-lg font-semibold">Manutenção no mês</h3>
          <div className="mt-3 space-y-2">
            {visibleMaintenance.length === 0 ? (
              <p className="py-6 text-sm text-muted-foreground">
                Nenhuma manutenção com data neste mês.
              </p>
            ) : (
              visibleMaintenance.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-xl border border-border/50 bg-secondary/30 p-3 text-sm"
                >
                  <div>
                    <div className="font-semibold">
                      {item.title || propertyTitle(item.property_id, data.properties)}
                    </div>
                    <div className="text-xs text-muted-foreground">{item.description}</div>
                  </div>
                  <Badge variant={item.priority === "urgent" ? "warn" : "muted"}>
                    {formatDate(item.due_at ?? item.created_at)}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </>
  );
}

function Legend({
  color,
  label,
  icon: Icon,
}: {
  color: string;
  label: string;
  icon: typeof CalIcon;
}) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1">
      <span className={`h-3 w-3 rounded ${color}`} />
      <Icon className="h-3 w-3 text-muted-foreground" /> {label}
    </span>
  );
}

function daysInMonth(monthIndex: number, year: number) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

function dateOnly(value: string | null | undefined) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function dateTouchesMonth(value: string | null | undefined, year: number, monthIndex: number) {
  const date = dateOnly(value);
  return !!date && date.getFullYear() === year && date.getMonth() === monthIndex;
}

function dateRangeTouchesMonth(
  startValue: string | null | undefined,
  endValue: string | null | undefined,
  year: number,
  monthIndex: number,
) {
  const start = dateOnly(startValue);
  const end = dateOnly(endValue) ?? start;
  if (!start || !end) return false;
  const monthStart = new Date(year, monthIndex, 1);
  const monthEnd = new Date(year, monthIndex + 1, 0);
  return start <= monthEnd && end >= monthStart;
}

function buildPropertyRow(
  propertyId: string,
  days: number[],
  monthIndex: number,
  year: number,
  data: CalendarData,
): Cell[] {
  return days.map((day) => {
    const current = new Date(year, monthIndex, day);
    const maintenance = data.maintenance.find((item) => {
      if (item.property_id !== propertyId) return false;
      const date = dateOnly(item.due_at ?? item.created_at);
      return !!date && date.getTime() === current.getTime();
    });
    if (maintenance) {
      return {
        type: "maintenance",
        label: maintenance.title || maintenance.description,
      };
    }

    const contract = data.contracts.find((item) => {
      if (item.property_id !== propertyId) return false;
      const start = dateOnly(item.start_date);
      const end = dateOnly(item.end_date) ?? start;
      return !!start && !!end && start <= current && end >= current;
    });
    if (contract) {
      return { type: "contract", label: contract.status ?? "Contrato" };
    }

    return { type: "available" };
  });
}

function propertyTitle(propertyId: string | null, properties: PropertyRow[]) {
  return properties.find((property) => property.id === propertyId)?.title ?? "Imóvel";
}

function formatDate(value: string | null | undefined) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("pt-BR");
}

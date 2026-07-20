import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { PageHeader, Card, Badge } from "@/components/app/ui";
import { Calendar as DatePicker } from "@/components/ui/calendar";
import { useAuthUser } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

type ContractRow = {
  id: string;
  status: string;
  start_date: string | null;
  end_date: string | null;
  property_title: string;
};

export const Route = createFileRoute("/app/calendar")({
  component: OwnerCalendar,
});

function OwnerCalendar() {
  const { user } = useAuthUser();
  const [contracts, setContracts] = useState<ContractRow[] | null>(null);
  const [month, setMonth] = useState(new Date());

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: props } = await supabase
        .from("properties")
        .select("id")
        .eq("owner_id", user.id);
      const propertyIds = (props ?? []).map((p) => p.id);
      if (propertyIds.length === 0) {
        setContracts([]);
        return;
      }
      const { data } = await supabase
        .from("contracts")
        .select("id, status, start_date, end_date, properties(title)")
        .in("property_id", propertyIds)
        .order("start_date", { ascending: true });
      setContracts(
        (data ?? []).map((c: any) => ({
          id: c.id,
          status: c.status,
          start_date: c.start_date,
          end_date: c.end_date,
          property_title: c.properties?.title ?? "Imóvel",
        })),
      );
    })();
  }, [user]);

  const occupiedDays = useMemo(() => {
    const days: Date[] = [];
    for (const c of contracts ?? []) {
      if (!c.start_date || !c.end_date || c.status !== "active") continue;
      const start = new Date(c.start_date);
      const end = new Date(c.end_date);
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        days.push(new Date(d));
      }
    }
    return days;
  }, [contracts]);

  return (
    <>
      <PageHeader
        title="Calendário"
        subtitle="Ocupação real dos seus imóveis, com base nos contratos ativos"
      />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[auto_1fr]">
        <Card className="w-fit">
          <DatePicker
            mode="single"
            month={month}
            onMonthChange={setMonth}
            modifiers={{ occupied: occupiedDays }}
            modifiersClassNames={{
              occupied: "bg-emerald/25 text-emerald font-semibold rounded-full",
            }}
          />
          <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
            <span className="h-3 w-3 rounded-full bg-emerald/25" /> Período de contrato ativo
          </div>
        </Card>

        <Card>
          {contracts === null ? (
            <div className="text-sm text-muted-foreground">Carregando…</div>
          ) : contracts.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              Nenhum contrato vinculado aos seus imóveis ainda.
            </div>
          ) : (
            <div className="space-y-3">
              {contracts.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between rounded-xl border border-glass-border bg-secondary/30 px-4 py-3"
                >
                  <div>
                    <div className="font-medium">{c.property_title}</div>
                    <div className="text-xs text-muted-foreground">
                      {c.start_date ?? "?"} — {c.end_date ?? "?"}
                    </div>
                  </div>
                  <Badge variant={c.status === "active" ? "emerald" : "muted"}>{c.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </>
  );
}

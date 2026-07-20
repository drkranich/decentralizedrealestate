import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { FileText } from "lucide-react";
import { PageHeader, Card, Badge } from "@/components/app/ui";
import { useAuthUser } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

type ContractRow = {
  id: string;
  status: string;
  start_date: string | null;
  end_date: string | null;
  property_title: string;
  tenant_name: string;
};

export const Route = createFileRoute("/app/contracts")({
  component: OwnerContracts,
});

function OwnerContracts() {
  const { user } = useAuthUser();
  const [contracts, setContracts] = useState<ContractRow[] | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: props } = await supabase.from("properties").select("id").eq("owner_id", user.id);
      const propertyIds = (props ?? []).map((p) => p.id);
      if (propertyIds.length === 0) {
        setContracts([]);
        return;
      }
      const { data } = await supabase
        .from("contracts")
        .select("id, status, start_date, end_date, properties(title), users(name)")
        .in("property_id", propertyIds)
        .order("created_at", { ascending: false });
      setContracts(
        (data ?? []).map((c: any) => ({
          id: c.id,
          status: c.status,
          start_date: c.start_date,
          end_date: c.end_date,
          property_title: c.properties?.title ?? "Imóvel",
          tenant_name: c.users?.name ?? "Inquilino",
        }))
      );
    })();
  }, [user]);

  return (
    <>
      <PageHeader title="Contratos" subtitle="Contratos vinculados aos seus imóveis" />
      <Card>
        {contracts === null ? (
          <div className="text-sm text-muted-foreground">Carregando…</div>
        ) : contracts.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">Nenhum contrato vinculado aos seus imóveis ainda.</div>
        ) : (
          <div className="space-y-3">
            {contracts.map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-xl border border-glass-border bg-secondary/30 px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald/15 text-emerald">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-medium">{c.property_title}</div>
                    <div className="text-xs text-muted-foreground">
                      {c.tenant_name} · {c.start_date ?? "??"} — {c.end_date ?? "??"}
                    </div>
                  </div>
                </div>
                <Badge variant={c.status === "active" ? "emerald" : "muted"}>{c.status}</Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </>
  );
}

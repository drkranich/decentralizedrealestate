import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { FileText, MapPin } from "lucide-react";
import { PageHeader, Card, Badge } from "@/components/app/ui";
import { useAuthUser } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

type ContractDetail = {
  id: string;
  status: string;
  start_date: string | null;
  end_date: string | null;
  property_title: string;
  property_address: string | null;
  price: number | null;
};

export const Route = createFileRoute("/app/contract")({
  component: TenantContract,
});

function TenantContract() {
  const { user } = useAuthUser();
  const [contract, setContract] = useState<ContractDetail | null | undefined>(undefined);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("contracts")
      .select("id, status, start_date, end_date, properties(title, formatted_address, price)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) {
          setContract(null);
          return;
        }
        const p = (data as any).properties;
        setContract({
          id: data.id,
          status: data.status,
          start_date: data.start_date,
          end_date: data.end_date,
          property_title: p?.title ?? "Imóvel",
          property_address: p?.formatted_address ?? null,
          price: p?.price ?? null,
        });
      });
  }, [user]);

  return (
    <>
      <PageHeader title="Meu contrato" subtitle="Detalhes do seu aluguel" />
      {contract === undefined ? (
        <div className="text-sm text-muted-foreground">Carregando…</div>
      ) : contract === null ? (
        <Card className="py-12 text-center text-sm text-muted-foreground">Nenhum contrato encontrado para a sua conta.</Card>
      ) : (
        <Card>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald/15 text-emerald">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <div className="font-display text-lg font-semibold">{contract.property_title}</div>
                {contract.property_address && (
                  <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" /> {contract.property_address}
                  </div>
                )}
              </div>
            </div>
            <Badge variant={contract.status === "active" ? "emerald" : "muted"}>{contract.status}</Badge>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Início</div>
              <div className="mt-1 font-medium">{contract.start_date ?? "—"}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Término</div>
              <div className="mt-1 font-medium">{contract.end_date ?? "—"}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Aluguel mensal</div>
              <div className="mt-1 font-medium">{contract.price != null ? `€${Number(contract.price).toLocaleString("en-US")}` : "—"}</div>
            </div>
          </div>
        </Card>
      )}
    </>
  );
}

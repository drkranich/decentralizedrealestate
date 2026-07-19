import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { FileText } from "lucide-react";
import { PageHeader, Card, Badge } from "@/components/app/ui";
import { useAuthUser } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

type Doc = {
  id: string;
  status: string | null;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  property_title: string;
};

export const Route = createFileRoute("/app/investor-documents")({
  component: InvestorDocuments,
});

function InvestorDocuments() {
  const { user } = useAuthUser();
  const [docs, setDocs] = useState<Doc[] | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: tokens } = await supabase
        .from("property_tokens")
        .select("property_id")
        .eq("owner_id", user.id);
      const propertyIds = Array.from(new Set((tokens ?? []).map((t) => t.property_id)));
      if (propertyIds.length === 0) {
        setDocs([]);
        return;
      }
      const { data } = await supabase
        .from("contracts")
        .select("id, status, start_date, end_date, created_at, properties(title)")
        .in("property_id", propertyIds)
        .order("created_at", { ascending: false });
      setDocs(
        (data ?? []).map((c: any) => ({
          id: c.id,
          status: c.status,
          start_date: c.start_date,
          end_date: c.end_date,
          created_at: c.created_at,
          property_title: c.properties?.title ?? "Imóvel",
        }))
      );
    })();
  }, [user]);

  return (
    <>
      <PageHeader title="Documentos" subtitle="Contratos vigentes sobre os imóveis do seu portfólio" />

      {docs === null ? (
        <div className="text-sm text-muted-foreground">Carregando…</div>
      ) : docs.length === 0 ? (
        <Card className="py-12 text-center text-sm text-muted-foreground">
          Nenhum contrato registrado para os imóveis do seu portfólio ainda.
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {docs.map((d) => (
            <Card key={d.id}>
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald/15 text-emerald">
                  <FileText className="h-5 w-5" />
                </div>
                <Badge variant={d.status === "active" ? "emerald" : "muted"}>{d.status ?? "—"}</Badge>
              </div>
              <div className="mt-3 font-display text-lg font-semibold">{d.property_title}</div>
              <div className="mt-1 text-xs text-muted-foreground">
                {d.start_date ? new Date(d.start_date).toLocaleDateString("pt-BR") : "—"}
                {" → "}
                {d.end_date ? new Date(d.end_date).toLocaleDateString("pt-BR") : "indeterminado"}
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}

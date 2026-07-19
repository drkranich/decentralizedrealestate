import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Banknote, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, Card, Badge, StatCard } from "@/components/app/ui";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/admin/payouts")({
  component: Payouts,
});

type Payout = {
  id: string;
  owner_name: string;
  property_title: string;
  gross_amount: number;
  commission: number;
  net_amount: number;
  status: string;
  created_at: string;
};

const statusVariant: Record<string, "emerald" | "warn" | "muted"> = {
  paid: "emerald",
  invoiced: "warn",
  pending: "warn",
  refunded: "muted",
};

const statusLabels: Record<string, string> = {
  paid: "Repassado",
  invoiced: "Faturado",
  pending: "Pendente",
  refunded: "Estornado",
};

function Payouts() {
  const [rows, setRows] = useState<Payout[] | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("commission_ledger")
        .select("id, amount, rate, status, created_at, contracts(properties(title, owner_id), users(name))")
        .order("created_at", { ascending: false });

      const contractIds = new Set<string>();
      const ownerIdsToLookup = (data ?? []).map((c: any) => c.contracts?.properties?.owner_id).filter(Boolean);
      const uniqueOwnerIds = [...new Set(ownerIdsToLookup)];
      const { data: owners } = uniqueOwnerIds.length
        ? await supabase.from("users").select("id, name").in("id", uniqueOwnerIds as string[])
        : { data: [] };
      const ownerNameById = new Map((owners ?? []).map((o: any) => [o.id, o.name]));

      const built: Payout[] = (data ?? []).map((c: any) => {
        const commission = Number(c.amount ?? 0);
        const rate = Number(c.rate ?? 0.03);
        const gross = rate > 0 ? commission / rate : 0;
        const ownerId = c.contracts?.properties?.owner_id;
        return {
          id: c.id,
          owner_name: (ownerId && ownerNameById.get(ownerId)) || "Dono",
          property_title: c.contracts?.properties?.title ?? "Imóvel",
          gross_amount: gross,
          commission,
          net_amount: gross - commission,
          status: c.status,
          created_at: c.created_at,
        };
      });
      setRows(built);
    })();
  }, []);

  const processPayout = () => {
    toast.info("Repasses automáticos ainda não estão conectados a um provedor de pagamento real.");
  };

  if (rows === null) {
    return (
      <>
        <PageHeader title="Payouts" subtitle="Repasses devidos aos donos de imóveis." />
        <Card>
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Carregando…
          </div>
        </Card>
      </>
    );
  }

  const totalNet = rows.reduce((s, r) => s + r.net_amount, 0);
  const totalPaid = rows.filter((r) => r.status === "paid").reduce((s, r) => s + r.net_amount, 0);
  const totalPending = rows.filter((r) => r.status !== "paid").reduce((s, r) => s + r.net_amount, 0);

  return (
    <>
      <PageHeader title="Payouts" subtitle="Repasses devidos aos donos de imóveis, calculados a partir das comissões reais.">
        <button onClick={processPayout} className="rounded-full bg-emerald px-4 py-2 text-sm font-semibold text-white shadow-glow">
          Processar repasses
        </button>
      </PageHeader>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Total a repassar" value={`€${totalNet.toLocaleString("en-US")}`} icon={Banknote} />
        <StatCard label="Já repassado" value={`€${totalPaid.toLocaleString("en-US")}`} icon={Banknote} accent="emerald" />
        <StatCard label="Pendente" value={`€${totalPending.toLocaleString("en-US")}`} icon={Banknote} accent="skyblue" />
      </div>

      {rows.length === 0 ? (
        <Card className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald shadow-glow">
            <Banknote className="h-6 w-6 text-white" />
          </div>
          <h2 className="font-display text-xl font-bold">Nenhum repasse ainda</h2>
          <p className="max-w-md text-sm text-muted-foreground">
            Os repasses são calculados automaticamente a partir das comissões geradas por contratos reais — assim que
            houver pagamentos, eles aparecerão aqui. O envio real do dinheiro ainda depende de um provedor de pagamento
            conectado.
          </p>
        </Card>
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-glass-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-5 py-3">Dono</th>
                <th className="px-5 py-3">Imóvel</th>
                <th className="px-5 py-3">Bruto</th>
                <th className="px-5 py-3">Comissão</th>
                <th className="px-5 py-3">Líquido</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-glass-border last:border-0">
                  <td className="px-5 py-4 font-medium">{r.owner_name}</td>
                  <td className="px-5 py-4 text-muted-foreground">{r.property_title}</td>
                  <td className="px-5 py-4">€{r.gross_amount.toLocaleString("en-US")}</td>
                  <td className="px-5 py-4 text-muted-foreground">€{r.commission.toLocaleString("en-US")}</td>
                  <td className="px-5 py-4 font-semibold">€{r.net_amount.toLocaleString("en-US")}</td>
                  <td className="px-5 py-4">
                    <Badge variant={statusVariant[r.status] ?? "muted"}>{statusLabels[r.status] ?? r.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Layers, Loader2 } from "lucide-react";
import { PageHeader, Card, Badge, StatCard } from "@/components/app/ui";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/admin/fractional-ownership")({
  component: FractionalOwnership,
});

type TokenRow = {
  id: string;
  token_code: string;
  property_title: string;
  owner_name: string;
  fraction_percent: number;
  status: string;
};

const statusVariant: Record<string, "emerald" | "warn" | "muted"> = {
  active: "emerald",
  transferred: "warn",
  revoked: "muted",
};

function FractionalOwnership() {
  const [rows, setRows] = useState<TokenRow[] | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("property_tokens")
        .select("id, token_code, fraction_percent, status, properties(title), users(name)")
        .eq("ownership_type", "fractional")
        .order("created_at", { ascending: false });
      setRows(
        (data ?? []).map((t: any) => ({
          id: t.id,
          token_code: t.token_code,
          property_title: t.properties?.title ?? "Imóvel",
          owner_name: t.users?.name ?? "Investidor",
          fraction_percent: Number(t.fraction_percent ?? 0),
          status: t.status,
        }))
      );
    })();
  }, []);

  if (rows === null) {
    return (
      <>
        <PageHeader title="Fractional Ownership" subtitle="Tokens de propriedade fracionada na plataforma." />
        <Card>
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Carregando…
          </div>
        </Card>
      </>
    );
  }

  const byProperty = new Map<string, number>();
  for (const r of rows) byProperty.set(r.property_title, (byProperty.get(r.property_title) ?? 0) + r.fraction_percent);
  const activeTokens = rows.filter((r) => r.status === "active").length;

  return (
    <>
      <PageHeader title="Fractional Ownership" subtitle="Tokens de propriedade fracionada emitidos na plataforma." />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Tokens fracionados" value={String(rows.length)} icon={Layers} />
        <StatCard label="Tokens ativos" value={String(activeTokens)} icon={Layers} accent="emerald" />
        <StatCard label="Imóveis com fração" value={String(byProperty.size)} icon={Layers} accent="skyblue" />
      </div>

      {rows.length === 0 ? (
        <Card className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald shadow-glow">
            <Layers className="h-6 w-6 text-white" />
          </div>
          <h2 className="font-display text-xl font-bold">Nenhum token fracionado ainda</h2>
          <p className="max-w-md text-sm text-muted-foreground">
            Quando um imóvel for dividido entre múltiplos investidores, os tokens de propriedade fracionada aparecerão
            aqui, com o percentual de cada um.
          </p>
        </Card>
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-glass-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-5 py-3">Token</th>
                <th className="px-5 py-3">Imóvel</th>
                <th className="px-5 py-3">Investidor</th>
                <th className="px-5 py-3">Fração</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-glass-border last:border-0">
                  <td className="px-5 py-4 font-mono text-xs">{r.token_code}</td>
                  <td className="px-5 py-4 font-medium">{r.property_title}</td>
                  <td className="px-5 py-4">{r.owner_name}</td>
                  <td className="px-5 py-4">{r.fraction_percent}%</td>
                  <td className="px-5 py-4">
                    <Badge variant={statusVariant[r.status] ?? "muted"}>{r.status}</Badge>
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

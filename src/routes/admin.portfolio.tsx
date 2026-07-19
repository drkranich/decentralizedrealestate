import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Boxes, Loader2 } from "lucide-react";
import { PageHeader, Card, Badge, StatCard } from "@/components/app/ui";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/admin/portfolio")({
  component: AdminPortfolio,
});

type InvestorPortfolio = {
  ownerId: string;
  ownerName: string;
  properties: Set<string>;
  fullTokens: number;
  fractionalTokens: number;
  avgFraction: number;
};

function AdminPortfolio() {
  const [rows, setRows] = useState<InvestorPortfolio[] | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("property_tokens")
        .select("id, property_id, owner_id, ownership_type, fraction_percent, status, users(name), properties(title)")
        .eq("status", "active");

      const byOwner = new Map<string, InvestorPortfolio>();
      for (const t of (data ?? []) as any[]) {
        const key = t.owner_id;
        const existing = byOwner.get(key) ?? {
          ownerId: key,
          ownerName: t.users?.name ?? "Investidor",
          properties: new Set<string>(),
          fullTokens: 0,
          fractionalTokens: 0,
          avgFraction: 0,
        };
        existing.properties.add(t.properties?.title ?? t.property_id);
        if (t.ownership_type === "fractional") existing.fractionalTokens += 1;
        else existing.fullTokens += 1;
        byOwner.set(key, existing);
      }
      setRows([...byOwner.values()].sort((a, b) => b.properties.size - a.properties.size));
    })();
  }, []);

  if (rows === null) {
    return (
      <>
        <PageHeader title="Portfolio" subtitle="Portfólio tokenizado de todos os investidores da plataforma." />
        <Card>
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Carregando…
          </div>
        </Card>
      </>
    );
  }

  const totalProperties = new Set(rows.flatMap((r) => [...r.properties])).size;
  const totalInvestors = rows.length;

  return (
    <>
      <PageHeader title="Portfolio" subtitle="Portfólio tokenizado de todos os investidores da plataforma." />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Investidores com holdings" value={String(totalInvestors)} icon={Boxes} />
        <StatCard label="Imóveis tokenizados" value={String(totalProperties)} icon={Boxes} accent="emerald" />
        <StatCard
          label="Tokens ativos"
          value={String(rows.reduce((s, r) => s + r.fullTokens + r.fractionalTokens, 0))}
          icon={Boxes}
          accent="skyblue"
        />
      </div>

      {rows.length === 0 ? (
        <Card className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald shadow-glow">
            <Boxes className="h-6 w-6 text-white" />
          </div>
          <h2 className="font-display text-xl font-bold">Nenhum portfólio ainda</h2>
          <p className="max-w-md text-sm text-muted-foreground">
            Assim que imóveis forem tokenizados e atribuídos a investidores, o portfólio consolidado de cada um
            aparecerá aqui.
          </p>
        </Card>
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-glass-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-5 py-3">Investidor</th>
                <th className="px-5 py-3">Imóveis</th>
                <th className="px-5 py-3">Tokens integrais</th>
                <th className="px-5 py-3">Tokens fracionados</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.ownerId} className="border-b border-glass-border last:border-0">
                  <td className="px-5 py-4 font-medium">{r.ownerName}</td>
                  <td className="px-5 py-4">{r.properties.size}</td>
                  <td className="px-5 py-4">
                    <Badge variant="emerald">{r.fullTokens}</Badge>
                  </td>
                  <td className="px-5 py-4">
                    <Badge variant="blue">{r.fractionalTokens}</Badge>
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

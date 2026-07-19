import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { UserCheck, Loader2 } from "lucide-react";
import { PageHeader, Card, Badge, StatCard } from "@/components/app/ui";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/admin/tenant-scoring")({
  component: TenantScoring,
});

type TenantScore = {
  userId: string;
  name: string;
  contracts: number;
  paidPayments: number;
  totalPayments: number;
  score: number;
};

function scoreLabel(score: number) {
  if (score >= 90) return { label: "Excelente", variant: "emerald" as const };
  if (score >= 70) return { label: "Bom", variant: "blue" as const };
  if (score >= 40) return { label: "Regular", variant: "warn" as const };
  return { label: "Atenção", variant: "muted" as const };
}

function TenantScoring() {
  const [rows, setRows] = useState<TenantScore[] | null>(null);

  useEffect(() => {
    (async () => {
      const { data: contracts } = await supabase.from("contracts").select("id, user_id, users(name)");
      const contractIds = (contracts ?? []).map((c: any) => c.id);
      const { data: payments } = contractIds.length
        ? await supabase.from("payments").select("contract_id, status").in("contract_id", contractIds)
        : { data: [] };

      const paymentsByContract = new Map<string, { paid: number; total: number }>();
      for (const p of (payments ?? []) as any[]) {
        const entry = paymentsByContract.get(p.contract_id) ?? { paid: 0, total: 0 };
        entry.total += 1;
        if (p.status === "paid") entry.paid += 1;
        paymentsByContract.set(p.contract_id, entry);
      }

      const byTenant = new Map<string, TenantScore>();
      for (const c of (contracts ?? []) as any[]) {
        const existing = byTenant.get(c.user_id) ?? {
          userId: c.user_id,
          name: c.users?.name ?? "Inquilino",
          contracts: 0,
          paidPayments: 0,
          totalPayments: 0,
          score: 100,
        };
        existing.contracts += 1;
        const p = paymentsByContract.get(c.id);
        if (p) {
          existing.paidPayments += p.paid;
          existing.totalPayments += p.total;
        }
        byTenant.set(c.user_id, existing);
      }

      const built = [...byTenant.values()].map((t) => ({
        ...t,
        score: t.totalPayments > 0 ? Math.round((t.paidPayments / t.totalPayments) * 100) : 100,
      }));
      built.sort((a, b) => a.score - b.score);
      setRows(built);
    })();
  }, []);

  if (rows === null) {
    return (
      <>
        <PageHeader title="Tenant Scoring" subtitle="Score calculado a partir do histórico real de pagamentos." />
        <Card>
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Carregando…
          </div>
        </Card>
      </>
    );
  }

  const avgScore = rows.length ? Math.round(rows.reduce((s, r) => s + r.score, 0) / rows.length) : 0;
  const atRisk = rows.filter((r) => r.score < 70).length;

  return (
    <>
      <PageHeader title="Tenant Scoring" subtitle="Score interno calculado a partir do histórico real de pagamentos — não é um serviço de bureau de crédito." />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Inquilinos avaliados" value={String(rows.length)} icon={UserCheck} />
        <StatCard label="Score médio" value={`${avgScore}`} icon={UserCheck} accent="emerald" />
        <StatCard label="Atenção (score baixo)" value={String(atRisk)} icon={UserCheck} accent="skyblue" />
      </div>

      {rows.length === 0 ? (
        <Card className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald shadow-glow">
            <UserCheck className="h-6 w-6 text-white" />
          </div>
          <h2 className="font-display text-xl font-bold">Nenhum inquilino com contrato ainda</h2>
          <p className="max-w-md text-sm text-muted-foreground">
            O score é calculado automaticamente a partir do percentual de pagamentos em dia por inquilino — assim que
            houver contratos e pagamentos reais, ele aparecerá aqui.
          </p>
        </Card>
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-glass-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-5 py-3">Inquilino</th>
                <th className="px-5 py-3">Contratos</th>
                <th className="px-5 py-3">Pagamentos em dia</th>
                <th className="px-5 py-3">Score</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const s = scoreLabel(r.score);
                return (
                  <tr key={r.userId} className="border-b border-glass-border last:border-0">
                    <td className="px-5 py-4 font-medium">{r.name}</td>
                    <td className="px-5 py-4">{r.contracts}</td>
                    <td className="px-5 py-4 text-muted-foreground">
                      {r.totalPayments > 0 ? `${r.paidPayments}/${r.totalPayments}` : "sem histórico"}
                    </td>
                    <td className="px-5 py-4">
                      <Badge variant={s.variant}>{r.score} · {s.label}</Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}
    </>
  );
}

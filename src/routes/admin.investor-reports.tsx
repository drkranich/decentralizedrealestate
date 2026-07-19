import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { FileBarChart, Loader2, FileDown } from "lucide-react";
import { PageHeader, Card, Badge, StatCard, SectionTitle } from "@/components/app/ui";
import { supabase } from "@/lib/supabase";
import { downloadTablePdf } from "@/lib/pdf";

export const Route = createFileRoute("/admin/investor-reports")({
  component: InvestorReports,
});

type Report = {
  totalCommission: number;
  paidCommission: number;
  activeSubscriptions: number;
  subscriptionsByPlan: Record<string, number>;
  totalTokens: number;
  fractionalTokens: number;
  tokenizedProperties: number;
};

const planLabels: Record<string, string> = {
  tenant_free: "Inquilino · Free",
  tenant_plus: "Inquilino · Plus",
  advertiser_basic: "Anunciante · Basic",
  advertiser_pro: "Anunciante · Pro",
  advertiser_portfolio: "Anunciante · Portfolio",
};

function InvestorReports() {
  const [report, setReport] = useState<Report | null>(null);

  useEffect(() => {
    (async () => {
      const [{ data: commissions }, { data: subs }, { data: tokens }] = await Promise.all([
        supabase.from("commission_ledger").select("amount, status"),
        supabase.from("subscriptions").select("plan, status").eq("status", "active"),
        supabase.from("property_tokens").select("id, property_id, ownership_type, status").eq("status", "active"),
      ]);

      const totalCommission = (commissions ?? []).reduce((s, c: any) => s + Number(c.amount ?? 0), 0);
      const paidCommission = (commissions ?? [])
        .filter((c: any) => c.status === "paid")
        .reduce((s, c: any) => s + Number(c.amount ?? 0), 0);

      const subscriptionsByPlan: Record<string, number> = {};
      for (const s of subs ?? []) {
        subscriptionsByPlan[s.plan] = (subscriptionsByPlan[s.plan] ?? 0) + 1;
      }

      const uniqueProperties = new Set((tokens ?? []).map((t: any) => t.property_id));

      setReport({
        totalCommission,
        paidCommission,
        activeSubscriptions: subs?.length ?? 0,
        subscriptionsByPlan,
        totalTokens: tokens?.length ?? 0,
        fractionalTokens: (tokens ?? []).filter((t: any) => t.ownership_type === "fractional").length,
        tokenizedProperties: uniqueProperties.size,
      });
    })();
  }, []);

  const exportPdf = () => {
    if (!report) return;
    downloadTablePdf({
      title: "Investor Report",
      subtitle: `Exportado em ${new Date().toLocaleDateString("pt-BR")}`,
      header: ["Métrica", "Valor"],
      rows: [
        ["Comissão total gerada", `€${report.totalCommission.toLocaleString("en-US")}`],
        ["Comissão já paga", `€${report.paidCommission.toLocaleString("en-US")}`],
        ["Assinaturas ativas", String(report.activeSubscriptions)],
        ["Imóveis tokenizados", String(report.tokenizedProperties)],
        ["Tokens fracionados", String(report.fractionalTokens)],
      ],
    });
  };

  if (report === null) {
    return (
      <>
        <PageHeader title="Investor Reports" subtitle="Relatório agregado para investidores da plataforma." />
        <Card>
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Carregando…
          </div>
        </Card>
      </>
    );
  }

  const hasData = report.totalCommission > 0 || report.activeSubscriptions > 0 || report.totalTokens > 0;

  return (
    <>
      <PageHeader title="Investor Reports" subtitle="Relatório agregado, gerado a partir de dados reais da plataforma.">
        <button onClick={exportPdf} className="flex items-center gap-2 rounded-full border border-glass-border bg-card px-4 py-2 text-sm font-medium hover:bg-secondary">
          <FileDown className="h-4 w-4" /> Exportar PDF
        </button>
      </PageHeader>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Comissão total gerada" value={`€${report.totalCommission.toLocaleString("en-US")}`} icon={FileBarChart} />
        <StatCard label="Comissão já paga" value={`€${report.paidCommission.toLocaleString("en-US")}`} icon={FileBarChart} accent="emerald" />
        <StatCard label="Imóveis tokenizados" value={String(report.tokenizedProperties)} icon={FileBarChart} accent="skyblue" />
      </div>

      {!hasData ? (
        <Card className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald shadow-glow">
            <FileBarChart className="h-6 w-6 text-white" />
          </div>
          <h2 className="font-display text-xl font-bold">Ainda sem dados suficientes</h2>
          <p className="max-w-md text-sm text-muted-foreground">
            Este relatório é calculado a partir de comissões, assinaturas e tokens reais — assim que houver atividade
            na plataforma, os números aparecerão aqui.
          </p>
        </Card>
      ) : (
        <Card>
          <SectionTitle title="Assinaturas ativas por plano" />
          <div className="space-y-2">
            {Object.entries(report.subscriptionsByPlan).length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma assinatura ativa no momento.</p>
            ) : (
              Object.entries(report.subscriptionsByPlan).map(([plan, count]) => (
                <div key={plan} className="flex items-center justify-between rounded-xl border border-glass-border bg-glass-fill px-4 py-2.5 text-sm">
                  <span>{planLabels[plan] ?? plan}</span>
                  <Badge variant="emerald">{count}</Badge>
                </div>
              ))
            )}
          </div>
        </Card>
      )}
    </>
  );
}

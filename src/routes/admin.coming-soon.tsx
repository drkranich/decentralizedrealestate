import { createFileRoute, useSearch } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { PageHeader, Card } from "@/components/app/ui";

export const Route = createFileRoute("/admin/coming-soon")({
  validateSearch: (s: Record<string, unknown>) => ({
    section: typeof s.section === "string" ? s.section : "Module",
    page: typeof s.page === "string" ? s.page : "Page",
  }),
  component: ComingSoon,
});

function ComingSoon() {
  const { section, page } = useSearch({ from: "/admin/coming-soon" });
  return (
    <>
      <PageHeader title={page} subtitle={section} />
      <Card className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald shadow-glow">
          <Sparkles className="h-6 w-6 text-white" />
        </div>
        <h2 className="font-display text-2xl font-bold">{page}</h2>
        <p className="max-w-md text-sm text-muted-foreground">
          Este módulo de <span className="font-semibold text-foreground">{section}</span> ainda não
          tem uma rota dedicada no painel. As permissões já podem controlar o acesso enquanto a tela
          específica é conectada.
        </p>
      </Card>
    </>
  );
}

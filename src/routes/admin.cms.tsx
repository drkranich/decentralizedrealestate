import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LayoutTemplate, Loader2, Save, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, Card, SectionTitle } from "@/components/app/ui";
import { supabase } from "@/lib/supabase";
import { useAuthUser } from "@/lib/auth";

export const Route = createFileRoute("/admin/cms")({
  component: AdminCms,
});

type Field = { key: string; label: string; long?: boolean };
type SectionConfig = { key: string; title: string; hint: string; fields: Field[] };

const sections: SectionConfig[] = [
  {
    key: "hero",
    title: "Hero (topo da página)",
    hint: "O primeiro bloco que qualquer visitante vê, com a busca e os cartões flutuantes de estatística.",
    fields: [
      { key: "badge", label: "Selo acima do título" },
      { key: "headline_prefix", label: "Título — início" },
      { key: "headline_emphasis", label: "Título — palavra em destaque" },
      { key: "headline_suffix", label: "Título — final" },
      { key: "subtitle", label: "Subtítulo", long: true },
      { key: "search_placeholder", label: "Placeholder da busca" },
      { key: "stat1_label", label: "Estatística 1 — rótulo" },
      { key: "stat1_value", label: "Estatística 1 — valor" },
      { key: "stat2_label", label: "Estatística 2 — rótulo" },
      { key: "stat2_value", label: "Estatística 2 — valor" },
      { key: "stat3_label", label: "Estatística 3 — rótulo" },
      { key: "stat3_value", label: "Estatística 3 — valor" },
    ],
  },
  {
    key: "smart_search",
    title: "Busca inteligente",
    hint: "Seção logo abaixo do Hero, com os filtros de busca.",
    fields: [
      { key: "heading_prefix", label: "Título — início" },
      { key: "heading_emphasis", label: "Título — palavra em destaque" },
      { key: "subheading", label: "Subtítulo", long: true },
    ],
  },
  {
    key: "featured_properties",
    title: "Imóveis em destaque",
    hint: "Seção com a vitrine de imóveis (os cartões de imóvel em si continuam sendo dados de demonstração).",
    fields: [
      { key: "eyebrow", label: "Selo acima do título" },
      { key: "heading", label: "Título" },
      { key: "subheading", label: "Subtítulo", long: true },
    ],
  },
  {
    key: "investments",
    title: "Investir (tokenização)",
    hint: "Seção sobre propriedade fracionária e os números agregados de investimento no rodapé dela.",
    fields: [
      { key: "eyebrow", label: "Selo acima do título" },
      { key: "heading_prefix", label: "Título — início" },
      { key: "heading_emphasis", label: "Título — destaque" },
      { key: "subheading", label: "Subtítulo", long: true },
      { key: "stat_investors", label: "Estatística — investidores" },
      { key: "stat_assets", label: "Estatística — ativos tokenizados" },
      { key: "stat_yield", label: "Estatística — rendimento médio" },
    ],
  },
  {
    key: "manage",
    title: "Gestão (operações)",
    hint: "Seção com os cartões de automação de contratos, pagamentos, manutenção, etc.",
    fields: [
      { key: "eyebrow", label: "Selo acima do título" },
      { key: "heading_prefix", label: "Título — início" },
      { key: "heading_emphasis", label: "Título — destaque" },
      { key: "subheading", label: "Subtítulo", long: true },
    ],
  },
  {
    key: "marketplace",
    title: "Marketplace de serviços",
    hint: "Seção com os serviços parceiros (limpeza, reparos, mudança, etc).",
    fields: [
      { key: "eyebrow", label: "Selo acima do título" },
      { key: "heading_prefix", label: "Título — início" },
      { key: "heading_emphasis", label: "Título — destaque" },
      { key: "subheading", label: "Subtítulo", long: true },
    ],
  },
  {
    key: "ai",
    title: "Inteligência artificial",
    hint: "Seção com o assistente de IA e a prévia de conversa.",
    fields: [
      { key: "badge", label: "Selo acima do título" },
      { key: "heading_prefix", label: "Título — início" },
      { key: "heading_emphasis", label: "Título — destaque" },
      { key: "subheading", label: "Subtítulo", long: true },
    ],
  },
  {
    key: "international",
    title: "Internacional",
    hint: "Seção sobre idiomas, moedas e cobertura de países.",
    fields: [
      { key: "badge", label: "Selo acima do título" },
      { key: "heading_prefix", label: "Título — início" },
      { key: "heading_emphasis", label: "Título — destaque" },
      { key: "heading_suffix", label: "Título — final" },
      { key: "subheading", label: "Subtítulo", long: true },
    ],
  },
  {
    key: "footer_cta",
    title: "Chamada final (rodapé)",
    hint: "O bloco de call-to-action logo antes das colunas de links do rodapé.",
    fields: [
      { key: "heading_prefix", label: "Título — início" },
      { key: "heading_emphasis", label: "Título — destaque" },
      { key: "subheading", label: "Subtítulo", long: true },
    ],
  },
];

function AdminCms() {
  const { user } = useAuthUser();
  const [values, setValues] = useState<Record<string, Record<string, string>> | null>(null);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("site_content")
      .select("section_key, data")
      .then(({ data }) => {
        const map: Record<string, Record<string, string>> = {};
        for (const row of data ?? []) {
          map[row.section_key] = row.data as Record<string, string>;
        }
        setValues(map);
      });
  }, []);

  const setField = (sectionKey: string, fieldKey: string, value: string) => {
    setValues((prev) => ({
      ...(prev ?? {}),
      [sectionKey]: { ...(prev?.[sectionKey] ?? {}), [fieldKey]: value },
    }));
  };

  const save = async (sectionKey: string) => {
    setSaving(sectionKey);
    const { error } = await supabase.from("site_content").upsert({
      section_key: sectionKey,
      data: values?.[sectionKey] ?? {},
      updated_at: new Date().toISOString(),
      updated_by: user?.id ?? null,
    });
    setSaving(null);
    if (error) {
      toast.error(error.message || "Não foi possível salvar.");
      return;
    }
    toast.success("Conteúdo salvo. Atualize a página pública para ver a mudança.");
  };

  if (values === null) {
    return (
      <>
        <PageHeader title="CMS da página pública" subtitle="Edite o texto da landing page exibida a todos os visitantes." />
        <Card>
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Carregando…
          </div>
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader title="CMS da página pública" subtitle="Edite o texto da landing page exibida a todos os visitantes.">
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 rounded-full border border-glass-border bg-secondary/40 px-4 py-2 text-sm font-medium hover:bg-secondary"
        >
          <ExternalLink className="h-4 w-4" /> Ver página pública
        </a>
      </PageHeader>

      <p className="mb-6 text-sm text-muted-foreground">
        Esta lista cobre todos os títulos, subtítulos e estatísticas editáveis da landing page — os cartões de
        imóveis em destaque, os planos de tokenização e as demais listas de recursos continuam vindo do código
        (não são texto livre). Nada foi ocultado além disso.
      </p>

      <div className="space-y-6">
        {sections.map((s) => {
          const current = values[s.key] ?? {};
          return (
            <Card key={s.key}>
              <SectionTitle
                title={s.title}
                action={
                  <button
                    onClick={() => save(s.key)}
                    disabled={saving === s.key}
                    className="flex items-center gap-2 rounded-full bg-emerald px-4 py-1.5 text-xs font-semibold text-white shadow-glow disabled:opacity-60"
                  >
                    {saving === s.key ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                    Salvar
                  </button>
                }
              />
              <p className="-mt-2 mb-4 text-xs text-muted-foreground">{s.hint}</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {s.fields.map((f) => (
                  <div key={f.key} className={f.long ? "sm:col-span-2" : ""}>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">{f.label}</label>
                    {f.long ? (
                      <textarea
                        value={current[f.key] ?? ""}
                        onChange={(e) => setField(s.key, f.key, e.target.value)}
                        rows={3}
                        className="w-full rounded-xl border border-glass-border bg-glass-fill p-2.5 text-sm outline-none focus:border-emerald/40"
                      />
                    ) : (
                      <input
                        value={current[f.key] ?? ""}
                        onChange={(e) => setField(s.key, f.key, e.target.value)}
                        className="w-full rounded-xl border border-glass-border bg-glass-fill p-2.5 text-sm outline-none focus:border-emerald/40"
                      />
                    )}
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
    </>
  );
}

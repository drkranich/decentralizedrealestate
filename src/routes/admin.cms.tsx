import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  Archive,
  ExternalLink,
  FileText,
  ImageIcon,
  Loader2,
  Newspaper,
  Plus,
  RotateCcw,
  Save,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader, Card, SectionTitle, Badge } from "@/components/app/ui";
import {
  type BlogPost,
  defaultBlogPosts,
  getPublicPageStatus,
  parseBlogPosts,
  publicPageDefaults,
  publicPageStatusLabels,
  serializeBlogPosts,
} from "@/components/landing/publicContent";
import { supabase } from "@/lib/supabase";
import { useAuthUser } from "@/lib/auth";
import heroImg from "@/assets/hero.jpg";

export const Route = createFileRoute("/admin/cms")({
  component: AdminCms,
});

type Field = { key: string; label: string; long?: boolean };
type SectionConfig = { key: string; title: string; hint: string; fields: Field[] };
type SiteContentValue = Record<string, string>;
type CmsTab = "landing" | "pages" | "blog";

const sections: SectionConfig[] = [
  {
    key: "hero",
    title: "Hero (topo da página)",
    hint: "O primeiro bloco que qualquer visitante vê ao entrar na página pública.",
    fields: [
      { key: "badge", label: "Selo acima do título" },
      { key: "headline_prefix", label: "Título - início" },
      { key: "headline_emphasis", label: "Título - palavra em destaque" },
      { key: "headline_suffix", label: "Título - final" },
      { key: "subtitle", label: "Subtítulo", long: true },
      { key: "search_placeholder", label: "Placeholder da busca" },
      { key: "stat1_label", label: "Estatística 1 - rótulo" },
      { key: "stat1_value", label: "Estatística 1 - valor" },
      { key: "stat2_label", label: "Estatística 2 - rótulo" },
      { key: "stat2_value", label: "Estatística 2 - valor" },
      { key: "stat3_label", label: "Estatística 3 - rótulo" },
      { key: "stat3_value", label: "Estatística 3 - valor" },
    ],
  },
  {
    key: "smart_search",
    title: "Busca inteligente",
    hint: "Seção com filtros, busca e sinais de descoberta de ativos.",
    fields: [
      { key: "heading_prefix", label: "Título - início" },
      { key: "heading_emphasis", label: "Título - palavra em destaque" },
      { key: "subheading", label: "Subtítulo", long: true },
    ],
  },
  {
    key: "featured_properties",
    title: "Imóveis em destaque",
    hint: "Seção com a vitrine de imóveis.",
    fields: [
      { key: "eyebrow", label: "Selo acima do título" },
      { key: "heading", label: "Título" },
      { key: "subheading", label: "Subtítulo", long: true },
    ],
  },
  {
    key: "investments",
    title: "Investir (tokenização)",
    hint: "Seção sobre propriedade fracionária e números agregados de investimento.",
    fields: [
      { key: "eyebrow", label: "Selo acima do título" },
      { key: "heading_prefix", label: "Título - início" },
      { key: "heading_emphasis", label: "Título - destaque" },
      { key: "subheading", label: "Subtítulo", long: true },
      { key: "stat_investors", label: "Estatística - investidores" },
      { key: "stat_assets", label: "Estatística - ativos tokenizados" },
      { key: "stat_yield", label: "Estatística - rendimento médio" },
    ],
  },
  {
    key: "manage",
    title: "Gestão (operações)",
    hint: "Seção com cartões de automação de contratos, pagamentos e manutenção.",
    fields: [
      { key: "eyebrow", label: "Selo acima do título" },
      { key: "heading_prefix", label: "Título - início" },
      { key: "heading_emphasis", label: "Título - destaque" },
      { key: "subheading", label: "Subtítulo", long: true },
    ],
  },
  {
    key: "marketplace",
    title: "Marketplace de serviços",
    hint: "Seção com serviços parceiros, operação e suporte.",
    fields: [
      { key: "eyebrow", label: "Selo acima do título" },
      { key: "heading_prefix", label: "Título - início" },
      { key: "heading_emphasis", label: "Título - destaque" },
      { key: "subheading", label: "Subtítulo", long: true },
    ],
  },
  {
    key: "ai",
    title: "Inteligência artificial",
    hint: "Seção com inteligência, automação e prévia de conversa.",
    fields: [
      { key: "badge", label: "Selo acima do título" },
      { key: "heading_prefix", label: "Título - início" },
      { key: "heading_emphasis", label: "Título - destaque" },
      { key: "subheading", label: "Subtítulo", long: true },
    ],
  },
  {
    key: "international",
    title: "Internacional",
    hint: "Seção sobre idiomas, moedas e cobertura de países.",
    fields: [
      { key: "badge", label: "Selo acima do título" },
      { key: "heading_prefix", label: "Título - início" },
      { key: "heading_emphasis", label: "Título - destaque" },
      { key: "heading_suffix", label: "Título - final" },
      { key: "subheading", label: "Subtítulo", long: true },
    ],
  },
  {
    key: "footer_cta",
    title: "Chamada final (rodapé)",
    hint: "O bloco de call-to-action logo antes das colunas de links do rodapé.",
    fields: [
      { key: "heading_prefix", label: "Título - início" },
      { key: "heading_emphasis", label: "Título - destaque" },
      { key: "subheading", label: "Subtítulo", long: true },
    ],
  },
];

const tabs: { key: CmsTab; label: string; icon: typeof FileText }[] = [
  { key: "landing", label: "Landing", icon: ImageIcon },
  { key: "pages", label: "Páginas públicas", icon: FileText },
  { key: "blog", label: "Blog", icon: Newspaper },
];

function AdminCms() {
  const { user } = useAuthUser();
  const heroInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<CmsTab>("landing");
  const [values, setValues] = useState<Record<string, SiteContentValue> | null>(null);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(defaultBlogPosts);
  const [heroImageUrl, setHeroImageUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [uploadingHero, setUploadingHero] = useState(false);

  useEffect(() => {
    supabase
      .from("site_content")
      .select("section_key, data")
      .then(({ data }) => {
        const map: Record<string, SiteContentValue> = {};
        for (const row of data ?? []) {
          map[row.section_key] = row.data as SiteContentValue;
        }
        setValues(map);
        setBlogPosts(parseBlogPosts(map.blog_posts?.posts));
      });

    supabase
      .from("app_settings")
      .select("hero_image_url")
      .eq("id", true)
      .maybeSingle()
      .then(({ data }) => {
        setHeroImageUrl(data?.hero_image_url ?? null);
      });
  }, []);

  const setField = (sectionKey: string, fieldKey: string, value: string) => {
    setValues((prev) => ({
      ...(prev ?? {}),
      [sectionKey]: { ...(prev?.[sectionKey] ?? {}), [fieldKey]: value },
    }));
  };

  const saveContent = async (sectionKey: string, data: SiteContentValue) => {
    setSaving(sectionKey);
    const { error } = await supabase.from("site_content").upsert({
      section_key: sectionKey,
      data,
      updated_at: new Date().toISOString(),
      updated_by: user?.id ?? null,
    });
    setSaving(null);

    if (error) {
      toast.error(error.message || "Não foi possível salvar.");
      return false;
    }

    setValues((prev) => ({ ...(prev ?? {}), [sectionKey]: data }));
    toast.success("Conteúdo salvo. Atualize a página pública para ver a mudança.");
    return true;
  };

  const save = (sectionKey: string) => saveContent(sectionKey, values?.[sectionKey] ?? {});

  const setPageStatus = async (
    sectionKey: string,
    current: SiteContentValue,
    status: "published" | "archived" | "deleted",
  ) => {
    const next: SiteContentValue = { ...current, status };
    if (status === "published") {
      delete next.archived_at;
      delete next.deleted_at;
    }
    if (status === "archived") {
      next.archived_at = new Date().toISOString();
      delete next.deleted_at;
    }
    if (status === "deleted") {
      next.deleted_at = new Date().toISOString();
      delete next.archived_at;
    }
    return saveContent(sectionKey, next);
  };

  const uploadHeroImage = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Selecione um arquivo de imagem.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 8MB.");
      return;
    }

    setUploadingHero(true);
    const ext = file.name.split(".").pop() || "jpg";
    const path = `hero.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("branding")
      .upload(path, file, { upsert: true, cacheControl: "3600" });

    if (uploadError) {
      setUploadingHero(false);
      toast.error(uploadError.message || "Não foi possível enviar a imagem.");
      return;
    }

    const { data: pub } = supabase.storage.from("branding").getPublicUrl(path);
    const cacheBustedUrl = `${pub.publicUrl}?t=${Date.now()}`;
    const { error: dbError } = await supabase.from("app_settings").upsert({
      id: true,
      hero_image_url: cacheBustedUrl,
      updated_at: new Date().toISOString(),
    });

    setUploadingHero(false);
    if (dbError) {
      toast.error(dbError.message || "Imagem enviada, mas não foi possível salvar a referência.");
      return;
    }

    setHeroImageUrl(cacheBustedUrl);
    toast.success("Imagem de fundo atualizada na página pública.");
  };

  const addBlogPost = () => {
    setBlogPosts((prev) => [
      {
        id: `post-${Date.now()}`,
        title: "Novo post",
        date: new Date().toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        excerpt: "",
        body: "",
        published: false,
      },
      ...prev,
    ]);
  };

  const updateBlogPost = <K extends keyof BlogPost>(id: string, field: K, value: BlogPost[K]) => {
    setBlogPosts((prev) =>
      prev.map((post) => (post.id === id ? { ...post, [field]: value } : post)),
    );
  };

  const removeBlogPost = (id: string) => {
    setBlogPosts((prev) => prev.filter((post) => post.id !== id));
  };

  const saveBlog = () =>
    saveContent("blog_posts", {
      posts: serializeBlogPosts(blogPosts),
    });

  if (values === null) {
    return (
      <>
        <PageHeader
          title="CMS da página pública"
          subtitle="Edite a landing page, páginas institucionais e blog exibidos aos visitantes."
        />
        <Card>
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Carregando...
          </div>
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="CMS da página pública"
        subtitle="Edite a landing, páginas públicas, blog e imagem de fundo do hero."
      >
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 rounded-full border border-glass-border bg-secondary/40 px-4 py-2 text-sm font-medium hover:bg-secondary"
        >
          <ExternalLink className="h-4 w-4" /> Ver página pública
        </a>
      </PageHeader>

      <div className="mb-6 flex flex-wrap gap-2 border-b border-glass-border pb-3">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const selected = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                selected
                  ? "bg-emerald text-white shadow-glow"
                  : "border border-glass-border bg-glass-fill text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "landing" && (
        <div className="space-y-6">
          <Card>
            <SectionTitle title="Imagem de fundo da página pública" />
            <p className="-mt-2 mb-4 text-xs text-muted-foreground">
              Esta imagem aparece atrás do título principal da home. Você pode trocar quando quiser.
            </p>
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="flex h-28 w-full max-w-sm items-center justify-center overflow-hidden rounded-2xl border border-glass-border bg-glass-fill md:w-48">
                <img
                  src={heroImageUrl || heroImg}
                  alt="Imagem de fundo da página pública"
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => heroInputRef.current?.click()}
                  disabled={uploadingHero}
                  className="inline-flex items-center gap-2 rounded-xl border border-glass-border bg-glass-fill px-4 py-2 text-sm font-medium backdrop-blur-sm disabled:opacity-50"
                >
                  {uploadingHero ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ImageIcon className="h-4 w-4" />
                  )}
                  Enviar imagem de fundo
                </button>
                <p className="mt-2 text-xs text-muted-foreground">
                  Use imagem horizontal em JPG, PNG ou WebP, até 8MB.
                </p>
              </div>
            </div>
            <input
              ref={heroInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) uploadHeroImage(file);
                event.target.value = "";
              }}
            />
          </Card>

          {sections.map((section) => {
            const current = values[section.key] ?? {};
            return (
              <Card key={section.key}>
                <SectionTitle
                  title={section.title}
                  action={
                    <SaveButton
                      onClick={() => save(section.key)}
                      loading={saving === section.key}
                    />
                  }
                />
                <p className="-mt-2 mb-4 text-xs text-muted-foreground">{section.hint}</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {section.fields.map((field) => (
                    <TextField
                      key={field.key}
                      label={field.label}
                      value={current[field.key] ?? ""}
                      long={field.long}
                      onChange={(value) => setField(section.key, field.key, value)}
                    />
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {activeTab === "pages" && (
        <div className="space-y-6">
          {publicPageDefaults.map((page) => {
            const sectionKey = `page_${page.key}`;
            const current = { ...page.defaults, ...(values[sectionKey] ?? {}) };
            const status = getPublicPageStatus(current);
            const pageSaving = saving === sectionKey;
            return (
              <Card key={page.key}>
                <SectionTitle
                  title={page.menuTitle}
                  action={
                    <div className="flex flex-wrap gap-2">
                      <Badge
                        variant={
                          status === "published"
                            ? "emerald"
                            : status === "archived"
                              ? "muted"
                              : "warn"
                        }
                      >
                        {publicPageStatusLabels[status]}
                      </Badge>
                      <a
                        href={page.path}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 rounded-full border border-glass-border bg-secondary/40 px-3 py-1.5 text-xs font-medium hover:bg-secondary"
                      >
                        <ExternalLink className="h-3.5 w-3.5" /> Abrir
                      </a>
                      {status !== "published" && (
                        <StatusButton
                          label="Restaurar"
                          icon={RotateCcw}
                          disabled={pageSaving}
                          onClick={() => setPageStatus(sectionKey, current, "published")}
                        />
                      )}
                      {status !== "archived" && (
                        <StatusButton
                          label="Arquivar"
                          icon={Archive}
                          disabled={pageSaving}
                          onClick={() => setPageStatus(sectionKey, current, "archived")}
                        />
                      )}
                      {status !== "deleted" && (
                        <StatusButton
                          label="Excluir"
                          icon={Trash2}
                          danger
                          disabled={pageSaving}
                          onClick={() => {
                            if (
                              window.confirm(
                                `Excluir a página "${page.menuTitle}" da área pública? O conteúdo ficará salvo para restauração.`,
                              )
                            ) {
                              setPageStatus(sectionKey, current, "deleted");
                            }
                          }}
                        />
                      )}
                      <SaveButton
                        onClick={() => saveContent(sectionKey, current)}
                        loading={pageSaving}
                      />
                    </div>
                  }
                />
                <p className="-mt-2 mb-4 text-xs text-muted-foreground">{page.path}</p>
                <div className="grid gap-3">
                  <TextField
                    label="Título"
                    value={current.title}
                    onChange={(value) => setField(sectionKey, "title", value)}
                  />
                  <TextField
                    label="Subtítulo"
                    value={current.subtitle}
                    onChange={(value) => setField(sectionKey, "subtitle", value)}
                  />
                  <TextField
                    label="Conteúdo"
                    value={current.body}
                    long
                    rows={9}
                    onChange={(value) => setField(sectionKey, "body", value)}
                  />
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {activeTab === "blog" && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={addBlogPost}
              className="flex items-center gap-2 rounded-full border border-glass-border bg-glass-fill px-4 py-2 text-sm font-medium hover:bg-secondary"
            >
              <Plus className="h-4 w-4" />
              Novo post
            </button>
          </div>

          {blogPosts.map((post) => (
            <Card key={post.id}>
              <SectionTitle
                title={post.title || "Post sem título"}
                action={
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => removeBlogPost(post.id)}
                      className="flex items-center gap-2 rounded-full border border-glass-border bg-glass-fill px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Remover
                    </button>
                    <SaveButton onClick={saveBlog} loading={saving === "blog_posts"} />
                  </div>
                }
              />
              <div className="grid gap-3">
                <TextField
                  label="Título"
                  value={post.title}
                  onChange={(value) => updateBlogPost(post.id, "title", value)}
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <TextField
                    label="Data"
                    value={post.date}
                    onChange={(value) => updateBlogPost(post.id, "date", value)}
                  />
                  <label className="flex items-center gap-2 rounded-xl border border-glass-border bg-glass-fill px-3 py-2.5 text-sm">
                    <input
                      type="checkbox"
                      checked={post.published}
                      onChange={(event) =>
                        updateBlogPost(post.id, "published", event.target.checked)
                      }
                      className="h-4 w-4 accent-emerald"
                    />
                    Publicado
                  </label>
                </div>
                <TextField
                  label="Resumo"
                  value={post.excerpt}
                  long
                  rows={3}
                  onChange={(value) => updateBlogPost(post.id, "excerpt", value)}
                />
                <TextField
                  label="Conteúdo"
                  value={post.body}
                  long
                  rows={10}
                  onChange={(value) => updateBlogPost(post.id, "body", value)}
                />
              </div>
            </Card>
          ))}

          {!blogPosts.length && (
            <Card>
              <div className="py-10 text-center text-sm text-muted-foreground">
                Nenhum post cadastrado.
              </div>
            </Card>
          )}
        </div>
      )}
    </>
  );
}

function SaveButton({ onClick, loading }: { onClick: () => void; loading: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="flex items-center gap-2 rounded-full bg-emerald px-4 py-1.5 text-xs font-semibold text-white shadow-glow disabled:opacity-60"
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Save className="h-3.5 w-3.5" />
      )}
      Salvar
    </button>
  );
}

function StatusButton({
  label,
  icon: Icon,
  onClick,
  disabled,
  danger,
}: {
  label: string;
  icon: typeof Save;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-2 rounded-full border border-glass-border px-3 py-1.5 text-xs font-medium disabled:opacity-50 ${
        danger
          ? "bg-glass-fill text-destructive hover:bg-destructive/10"
          : "bg-glass-fill text-muted-foreground hover:bg-secondary hover:text-foreground"
      }`}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}

function TextField({
  label,
  value,
  onChange,
  long,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  long?: boolean;
  rows?: number;
}) {
  return (
    <div className={long ? "sm:col-span-2" : ""}>
      <label className="mb-1 block text-xs font-medium text-muted-foreground">{label}</label>
      {long ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={rows}
          className="w-full rounded-xl border border-glass-border bg-glass-fill p-2.5 text-sm outline-none focus:border-emerald/40"
        />
      ) : (
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-xl border border-glass-border bg-glass-fill p-2.5 text-sm outline-none focus:border-emerald/40"
        />
      )}
    </div>
  );
}

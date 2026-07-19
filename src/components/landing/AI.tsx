import { Activity, Bot, Lightbulb, Sparkles, UserCheck } from "lucide-react";
import { useBrand } from "@/components/brand/BrandProvider";
import { usePublicContent } from "@/lib/siteContent";

const features = [
  {
    icon: Bot,
    title: "Assistente inteligente",
    desc: "Atendimento conversacional para proprietários, investidores e operadores.",
  },
  {
    icon: Lightbulb,
    title: "Recomendações inteligentes",
    desc: "Ativos, precificação e oportunidades conforme perfil e mercado.",
  },
  {
    icon: Activity,
    title: "Análise preditiva",
    desc: "Projeções de ocupação, rendimento, risco e valorização.",
  },
  {
    icon: UserCheck,
    title: "Análise de participantes",
    desc: "Avaliação combinando KYC, histórico e comportamento operacional.",
  },
];

const aiDefaults = {
  badge: "Inteligência aplicada",
  heading_prefix: "Inteligência em",
  heading_emphasis: "cada camada",
  subheading:
    "A Seravie Heritage combina dados imobiliários, análise de risco, precificação e automação para apoiar decisões em cada operação.",
};

export function AI() {
  const brand = useBrand();
  const c = usePublicContent("ai", aiDefaults);
  return (
    <section id="ai" className="relative overflow-hidden py-24">
      <div className="absolute inset-0 -z-10 bg-skyblue/5" />
      <div className="absolute inset-0 -z-10 grid-bg opacity-30" />
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-medium">
              <Sparkles className="h-3.5 w-3.5 text-emerald" />
              {c.badge}
            </div>
            <h2 className="mt-4 font-display text-4xl font-bold md:text-5xl">
              {c.heading_prefix} <span className="text-emerald">{c.heading_emphasis}</span>
            </h2>
            <p className="mt-4 text-muted-foreground">{c.subheading}</p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {features.map((f) => (
                <div
                  key={f.title}
                  className="rounded-2xl border border-border bg-card p-5 transition-all hover:border-emerald/40"
                >
                  <f.icon className="h-5 w-5 text-emerald" />
                  <div className="mt-3 font-display text-base font-semibold">{f.title}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{f.desc}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="rounded-3xl glass-strong p-6 shadow-elegant">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald shadow-glow">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="font-semibold">{brand.name} AI</div>
                  <div className="text-xs text-muted-foreground">Online · Concierge global</div>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <div className="ml-auto max-w-[80%] rounded-2xl rounded-tr-sm bg-foreground p-3 text-sm text-background">
                  Busque um apartamento em Lisboa com alta liquidez e potencial de valorização.
                </div>
                <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-secondary p-3 text-sm">
                  Encontrei 14 ativos compatíveis. Destaque:{" "}
                  <span className="font-semibold">Príncipe Real Loft</span> · 14,2% de ROI
                  projetado, 92% de ocupação e documentação pronta para análise.
                </div>
                <div className="flex flex-wrap gap-2">
                  {["Agendar visita", "Ver ROI", "Comparar ativos"].map((label) => (
                    <button
                      key={label}
                      type="button"
                      className="rounded-full border border-border bg-background/50 px-3 py-1.5 text-xs font-medium hover:border-emerald/40"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="absolute -inset-4 -z-10 rounded-3xl bg-emerald/20 blur-3xl" />
          </div>
        </div>
      </div>
    </section>
  );
}

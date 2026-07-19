import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgeCheck,
  Banknote,
  BarChart3,
  Building2,
  Calendar,
  FileCheck2,
  Globe2,
  Home,
  Hotel,
  KeyRound,
  Landmark,
  Layers,
  LineChart,
  Map,
  MapPin,
  Network,
  Repeat2,
  ShieldCheck,
  Sparkles,
  Store,
  TrendingUp,
  WalletCards,
  type LucideIcon,
} from "lucide-react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { useHeroImageUrl } from "@/components/brand/BrandProvider";
import heroImg from "@/assets/hero.jpg";

export const Route = createFileRoute("/")({
  component: Index,
});

type Module = {
  name: string;
  label: string;
  description: string;
  icon: LucideIcon;
};

type DiscoveryTab = {
  id: string;
  label: string;
  icon: LucideIcon;
  summary: string;
  metric: string;
  items: { title: string; detail: string; signal: string }[];
};

const modules: Module[] = [
  {
    name: "Heritage Marketplace",
    label: "Compra e venda",
    description:
      "Imóveis completos, oportunidades selecionadas e transações tradicionais com dados de mercado.",
    icon: Store,
  },
  {
    name: "Heritage Token",
    label: "Tokenização",
    description:
      "Ativos reais convertidos em participações digitais com registro, regras e transparência operacional.",
    icon: Layers,
  },
  {
    name: "Heritage Invest",
    label: "Frações imobiliárias",
    description:
      "Acesso a casas, hotéis, fazendas, apartamentos e projetos exclusivos por participação.",
    icon: WalletCards,
  },
  {
    name: "Heritage Exchange",
    label: "Mercado secundário",
    description:
      "Ambiente para negociar participações e destravar liquidez em ativos antes pouco móveis.",
    icon: Repeat2,
  },
  {
    name: "Heritage Capital",
    label: "Crédito e capital",
    description:
      "Financiamento, antecipação de recebíveis e estruturas de capital para ativos imobiliários.",
    icon: Banknote,
  },
  {
    name: "Heritage Registry",
    label: "Histórico digital",
    description:
      "Documentos, contratos, auditoria e trilha de propriedade conectados ao ciclo de vida do ativo.",
    icon: FileCheck2,
  },
];

const assetClasses = [
  { label: "Casas", icon: Home },
  { label: "Apartamentos", icon: Building2 },
  { label: "Hotéis", icon: Hotel },
  { label: "Chalés", icon: KeyRound },
  { label: "Fazendas", icon: Landmark },
  { label: "Comercial", icon: Store },
];

const discoveryTabs: DiscoveryTab[] = [
  {
    id: "city",
    label: "City",
    icon: MapPin,
    summary: "Mapa vivo por cidade com liquidez, demanda e sinais de valorização.",
    metric: "+14% média YoY",
    items: [
      { title: "Lisboa, Portugal", detail: "1240 ativos monitorados", signal: "+12% YoY" },
      { title: "Tóquio, Japão", detail: "1027 ativos monitorados", signal: "+13% YoY" },
      { title: "Nova York, EUA", detail: "814 ativos monitorados", signal: "+14% YoY" },
      { title: "Bali, Indonésia", detail: "601 ativos monitorados", signal: "+15% YoY" },
    ],
  },
  {
    id: "country",
    label: "Country",
    icon: Globe2,
    summary: "Comparação internacional para compra, investimento e diversificação patrimonial.",
    metric: "32 mercados",
    items: [
      { title: "Portugal", detail: "Residencial, turismo e renda curta", signal: "Alta procura" },
      { title: "Brasil", detail: "Praia, campo, incorporação e renda", signal: "Ciclo inicial" },
      {
        title: "United States",
        detail: "Multifamily, comercial e portfolios",
        signal: "Liquidez alta",
      },
      { title: "Japão", detail: "Urbano, hotelaria e retrofit", signal: "Estável" },
    ],
  },
  {
    id: "property",
    label: "Property type",
    icon: Building2,
    summary: "Leitura por classe de ativo para construir portfolios com risco mais claro.",
    metric: "8 classes",
    items: [
      { title: "Residencial urbano", detail: "Apartamentos, studios e casas", signal: "Core" },
      { title: "Hospitality", detail: "Hotéis, pousadas e chalés", signal: "Renda flexível" },
      { title: "Rural e lifestyle", detail: "Fazendas, vilas e retiros", signal: "Oferta rara" },
      { title: "Comercial", detail: "Lojas, salas e ativos operacionais", signal: "Yield" },
    ],
  },
  {
    id: "sale",
    label: "For sale",
    icon: Calendar,
    summary:
      "Pipeline de venda com preço, documentos, apetite de compra e potencial de tokenização.",
    metric: "Compra direta",
    items: [
      {
        title: "Imóvel completo",
        detail: "Aquisição tradicional com due diligence",
        signal: "Disponível",
      },
      {
        title: "Portfolio familiar",
        detail: "Venda estruturada em múltiplos ativos",
        signal: "Em análise",
      },
      {
        title: "Projeto exclusivo",
        detail: "Terreno, incorporação ou retrofit",
        signal: "Selecionado",
      },
      {
        title: "Ativo internacional",
        detail: "Compra cross-border com suporte local",
        signal: "Aberto",
      },
    ],
  },
  {
    id: "rent",
    label: "For rent",
    icon: KeyRound,
    summary: "Gestão de locação, ocupação e fluxo de caixa para proprietários e investidores.",
    metric: "Renda recorrente",
    items: [
      { title: "Long stay", detail: "Contratos, reajustes e ocupação", signal: "Estável" },
      { title: "Short stay", detail: "Precificação dinâmica e calendário", signal: "Alta margem" },
      { title: "Corporate", detail: "Empresas, equipes e relocação", signal: "Baixo atrito" },
      { title: "Hospitality", detail: "Unidades operadas por parceiros", signal: "Escalável" },
    ],
  },
  {
    id: "furnished",
    label: "Furnished",
    icon: BadgeCheck,
    summary: "Padronização de ativos prontos para morar, hospedar ou operar.",
    metric: "Turnkey",
    items: [
      {
        title: "Pronto para morar",
        detail: "Inventário, fotos e vistoria digital",
        signal: "Verificado",
      },
      { title: "Pronto para renda", detail: "Operação, manutenção e limpeza", signal: "Operável" },
      {
        title: "Design upgrade",
        detail: "Capex leve para elevar diária e valor",
        signal: "Otimizado",
      },
      { title: "Asset care", detail: "Histórico de manutenção e seguros", signal: "Seguro" },
    ],
  },
  {
    id: "investment",
    label: "Investment",
    icon: TrendingUp,
    summary: "Frações tokenizadas, mercado secundário e inteligência para alocação global.",
    metric: "Token ready",
    items: [
      {
        title: "Fração imobiliária",
        detail: "Participação em ativo selecionado",
        signal: "Acesso",
      },
      {
        title: "Renda distribuida",
        detail: "Fluxo do ativo acompanhado por painel",
        signal: "Yield",
      },
      { title: "Mercado secundário", detail: "Negociação de participações", signal: "Liquidez" },
      {
        title: "Portfolio global",
        detail: "Diversificação por país, moeda e classe",
        signal: "Balanceado",
      },
    ],
  },
];

function Index() {
  return (
    <div className="seravie-public min-h-screen overflow-x-hidden bg-[#f7f8f5] text-[#111510] transition-colors dark:bg-[#07100d] dark:text-white">
      <Navbar />
      <main>
        <HeroSection />
        <MissionSection />
        <DiscoveryConsole />
        <InfrastructureSection />
        <InvestmentSection />
        <InternationalSection />
      </main>
      <Footer />
    </div>
  );
}

function HeroSection() {
  const heroImageOverride = useHeroImageUrl();

  return (
    <section className="relative min-h-[92svh] overflow-hidden pt-28 text-white">
      <img
        src={heroImageOverride || heroImg}
        alt="Global real estate skyline"
        className="absolute inset-0 h-full w-full object-cover"
        width={1920}
        height={1080}
      />
      <div className="absolute inset-0 bg-[#07100d]/70 dark:bg-[#030605]/85" />
      <div className="absolute inset-x-0 bottom-0 h-28 bg-[#f7f8f5] dark:bg-[#07100d]" />

      <div className="relative mx-auto flex min-h-[calc(92svh-7rem)] max-w-7xl flex-col justify-end px-4 pb-10">
        <div className="max-w-4xl pb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-white/80 backdrop-blur">
            <Sparkles className="h-4 w-4 text-[#d4a73e]" />
            Global Real Estate Platform
          </div>
          <h1 className="mt-7 font-display text-6xl font-semibold leading-none tracking-normal md:text-8xl">
            Seravie Heritage
          </h1>
          <p className="mt-6 max-w-2xl text-xl font-medium text-white md:text-2xl">
            Patrimônio imobiliário para a era digital.
          </p>
          <p className="mt-5 max-w-3xl text-base leading-8 text-white/75 md:text-lg">
            Uma infraestrutura global para comprar, vender, investir, administrar e tokenizar ativos
            imobiliários reais com segurança, transparência e acesso simplificado.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <a
              href="#platform"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#111510] transition hover:bg-white/90"
            >
              Explorar plataforma <ArrowRight className="h-4 w-4" />
            </a>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/10"
            >
              Acessar plataforma
            </Link>
          </div>
        </div>

        <div className="grid gap-px overflow-hidden rounded-lg border border-white/15 bg-white/15 text-[#111510] shadow-2xl md:grid-cols-3">
          {[
            ["Ativos reais", "Casas, apartamentos, hotéis, fazendas e projetos exclusivos."],
            ["Propriedade digital", "Fracionamento, registro, contratos e histórico operacional."],
            [
              "Capital global",
              "Investidores, proprietários e empreendedores em um único ecossistema.",
            ],
          ].map(([title, text]) => (
            <div key={title} className="bg-[#f7f8f5]/95 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9b7423]">
                {title}
              </p>
              <p className="mt-2 text-sm leading-6 text-[#4b514a]">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function MissionSection() {
  return (
    <section className="px-4 py-20">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#9b7423]">
            Nossa missão
          </p>
          <h2 className="mt-4 max-w-lg font-display text-5xl font-semibold leading-tight tracking-normal text-[#151711] md:text-6xl">
            Transformar o imóvel em um ativo mais acessível, líquido e conectado.
          </h2>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {[
            "Conectar proprietários, investidores e empreendedores em um ecossistema imobiliário global.",
            "Unir a segurança dos ativos reais à eficiência da propriedade digital.",
            "Abrir oportunidades antes restritas a grandes investidores.",
            "Criar transparência em cada operação, do documento ao mercado secundário.",
          ].map((item) => (
            <div key={item} className="rounded-lg border border-[#dfe3dc] bg-white p-6 shadow-sm">
              <ShieldCheck className="h-5 w-5 text-[#b88a2b]" />
              <p className="mt-5 text-base leading-7 text-[#3d433c]">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function DiscoveryConsole() {
  const [activeId, setActiveId] = useState(discoveryTabs[0].id);
  const active = discoveryTabs.find((tab) => tab.id === activeId) ?? discoveryTabs[0];

  return (
    <section id="platform" className="border-y border-[#dfe3dc] bg-[#eef3f5] px-4 py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#9b7423]">
              Heritage Intelligence
            </p>
            <h2 className="mt-4 font-display text-5xl font-semibold tracking-normal text-[#151711] md:text-6xl">
              Um painel vivo para ativos reais.
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-[#5a6259]">
            A busca pública deixa de ser uma lista estática. Ela cruza localização, tipo de ativo,
            finalidade, mobiliário e perfil de investimento para revelar oportunidades com contexto.
          </p>
        </div>

        <div className="overflow-hidden rounded-[28px] border border-[#dfe3dc] bg-white shadow-[0_30px_90px_-60px_rgba(17,21,16,0.6)]">
          <div className="flex gap-3 overflow-x-auto border-b border-[#e7ebe5] px-4 py-4 md:px-5">
            {discoveryTabs.map((tab) => {
              const Icon = tab.icon;
              const selected = tab.id === active.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveId(tab.id)}
                  className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                    selected
                      ? "bg-[#111820] text-white shadow-sm"
                      : "text-[#5b6470] hover:bg-[#f2f5f2] hover:text-[#111820]"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="grid lg:grid-cols-[1fr_1.08fr]">
            <div className="space-y-3 p-5 md:p-6">
              {active.items.map((item, index) => (
                <div
                  key={item.title}
                  className="grid grid-cols-[2.5rem_1fr_auto] items-center gap-4 rounded-[20px] border border-[#e7ebe5] bg-[#fbfcfb] p-4 transition hover:border-[#d4a73e]/50 hover:bg-white"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f5ecd5]">
                    <MapPin className="h-4 w-4 text-[#c89429]" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#141914]">{item.title}</p>
                    <p className="text-sm text-[#667064]">{item.detail}</p>
                  </div>
                  <div className="hidden text-sm font-semibold text-[#b58424] sm:block">
                    {item.signal}
                  </div>
                  <div className="col-span-3 h-1 overflow-hidden rounded-full bg-[#edf0ec] sm:hidden">
                    <div
                      className="h-full rounded-full bg-[#d4a73e]"
                      style={{ width: `${52 + index * 10}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="relative min-h-[25rem] border-t border-[#e7ebe5] bg-[#f7faf9] p-6 lg:border-l lg:border-t-0">
              <div className="absolute inset-0 opacity-70">
                <div className="h-full w-full bg-[linear-gradient(#dce5e1_1px,transparent_1px),linear-gradient(90deg,#dce5e1_1px,transparent_1px)] bg-[size:44px_44px]" />
              </div>
              <div className="relative flex h-full flex-col items-center justify-center text-center">
                <div className="relative mb-7 h-48 w-full max-w-md">
                  {[18, 34, 47, 61, 76].map((left, index) => (
                    <span
                      key={left}
                      className="absolute h-3 w-3 rounded-full bg-[#d4a73e] shadow-[0_0_0_8px_rgba(212,167,62,0.16)]"
                      style={{
                        left: `${left}%`,
                        top: `${35 + (index % 2) * 20}%`,
                        animation: `pulse-glow ${2.6 + index * 0.25}s ease-in-out infinite`,
                      }}
                    />
                  ))}
                  <div className="absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-xl">
                    <Map className="h-8 w-8 text-[#c89429]" />
                  </div>
                </div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#9b7423]">
                  {active.metric}
                </p>
                <h3 className="mt-3 text-2xl font-bold text-[#111820]">
                  {active.label} intelligence
                </h3>
                <p className="mt-3 max-w-md text-sm leading-6 text-[#667064]">{active.summary}</p>
                <div className="mt-7 flex items-center gap-2">
                  {active.items.map((item) => (
                    <span key={item.title} className="h-2 w-2 rounded-full bg-[#d4a73e]" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function InfrastructureSection() {
  return (
    <section id="infrastructure" className="px-4 py-20">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#9b7423]">
            Global Real Estate Infrastructure
          </p>
          <h2 className="mt-4 font-display text-5xl font-semibold leading-tight tracking-normal text-[#151711] md:text-6xl">
            Uma companhia de infraestrutura para a próxima geração do mercado imobiliário.
          </h2>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {modules.map((module) => {
            const Icon = module.icon;
            return (
              <article
                key={module.name}
                className="rounded-lg border border-[#dfe3dc] bg-white p-6 shadow-sm"
              >
                <div className="flex items-center justify-between gap-4">
                  <Icon className="h-6 w-6 text-[#b88a2b]" />
                  <span className="rounded-full bg-[#eef5f7] px-3 py-1 text-xs font-semibold text-[#3f6d78]">
                    {module.label}
                  </span>
                </div>
                <h3 className="mt-8 text-xl font-bold text-[#141914]">{module.name}</h3>
                <p className="mt-3 text-sm leading-6 text-[#5b665d]">{module.description}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function InvestmentSection() {
  return (
    <section id="token" className="bg-[#111820] px-4 py-20 text-white">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#d4a73e]">
            Heritage Token + Heritage Invest
          </p>
          <h2 className="mt-4 font-display text-5xl font-semibold leading-tight tracking-normal md:text-6xl">
            Imóveis completos ou participações tokenizadas no mesmo ecossistema.
          </h2>
          <p className="mt-6 max-w-2xl text-base leading-8 text-white/70">
            A Seravie Heritage permite que o investidor escolha entre aquisição direta, participação
            fracionada, renda recorrente e negociação secundária, sempre com ativos reais como base
            econômica.
          </p>
          <div className="mt-8 flex flex-wrap gap-3" id="invest">
            {assetClasses.map((asset) => {
              const Icon = asset.icon;
              return (
                <div
                  key={asset.label}
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm text-white/80"
                >
                  <Icon className="h-4 w-4 text-[#d4a73e]" />
                  {asset.label}
                </div>
              );
            })}
          </div>
        </div>

        <div id="exchange" className="rounded-lg border border-white/15 bg-white/[0.04] p-6">
          {[
            { label: "Compra direta", value: "Ativo completo", icon: Home },
            { label: "Tokenização", value: "Frações digitais", icon: Layers },
            { label: "Renda", value: "Fluxo acompanhado", icon: LineChart },
            { label: "Exchange", value: "Saída secundária", icon: Repeat2 },
          ].map((row) => {
            const Icon = row.icon;
            return (
              <div
                key={row.label}
                className="flex items-center gap-4 border-b border-white/10 py-5 last:border-b-0"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#d4a73e] text-[#111820]">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-white/55">{row.label}</p>
                  <p className="font-semibold">{row.value}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function InternationalSection() {
  return (
    <section id="international" className="px-4 py-20">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div className="rounded-lg border border-[#dfe3dc] bg-white p-6">
          <div className="flex items-center gap-3">
            <Network className="h-6 w-6 text-[#b88a2b]" />
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#9b7423]">
              Heritage International
            </p>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-3">
            {["Brasil", "Portugal", "Estados Unidos", "Japão", "Indonésia", "Europa"].map(
              (market) => (
                <div
                  key={market}
                  className="rounded-lg bg-[#f4f6f2] p-4 text-sm font-semibold text-[#252b24]"
                >
                  {market}
                </div>
              ),
            )}
          </div>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#9b7423]">
            Nossa visão
          </p>
          <h2 className="mt-4 font-display text-5xl font-semibold leading-tight tracking-normal text-[#151711] md:text-6xl">
            Permitir que pessoas de qualquer lugar participem da valorização de imóveis com
            confiança.
          </h2>
          <p className="mt-6 text-base leading-8 text-[#4e574f]">
            A plataforma nasce para reunir proprietários, compradores, investidores, gestores e
            operadores em uma rede internacional, conectando dados, contratos, capital e ativos
            reais.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              { label: "Transparência", icon: ShieldCheck },
              { label: "Liquidez", icon: BarChart3 },
              { label: "Acesso global", icon: Globe2 },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="rounded-lg border border-[#dfe3dc] bg-white p-5">
                  <Icon className="h-5 w-5 text-[#b88a2b]" />
                  <p className="mt-4 text-sm font-semibold text-[#151711]">{item.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { PublicPage } from "@/components/landing/PublicPage";

export const Route = createFileRoute("/pricing")({
  component: PricingPage,
});

const tiers = [
  {
    audience: "Inquilinos",
    plans: [
      { name: "Tenant Free", features: ["Buscar e favoritar imóveis", "Enviar interesse direto ao anunciante", "Painel do inquilino: contrato, pagamentos, manutenção, mensagens"] },
      { name: "Tenant Plus", features: ["Tudo do Free", "Prioridade em respostas de leads", "Histórico estendido de contratos e pagamentos"] },
    ],
  },
  {
    audience: "Proprietários / Anunciantes",
    plans: [
      { name: "Advertiser Basic", features: ["Cadastro de imóveis com fotos e vídeos", "CRM de leads e funil de qualificação", "Calendário e gestão de manutenção"] },
      { name: "Advertiser Pro", features: ["Tudo do Basic", "Precificação inteligente (Smart Pricing)", "Relatórios financeiros avançados"] },
      { name: "Advertiser Portfolio", features: ["Tudo do Pro", "Gestão de múltiplos imóveis e fracionamento (tokens)", "Painel do investidor com rendimentos proporcionais"] },
    ],
  },
];

function PricingPage() {
  return (
    <PublicPage
      title="Planos"
      subtitle="Planos pensados para inquilinos, proprietários e investidores — sem taxas escondidas."
    >
      <p>
        Os valores de cada plano variam de acordo com o mercado e o volume de imóveis gerenciados. Fale com nosso
        time comercial para uma proposta sob medida — a estrutura de recursos abaixo é a mesma usada hoje dentro
        da plataforma.
      </p>

      {tiers.map((t) => (
        <div key={t.audience}>
          <h2>{t.audience}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {t.plans.map((p) => (
              <div key={p.name} className="rounded-3xl border border-glass-border bg-card/60 p-5 backdrop-blur-xl">
                <div className="font-display text-base font-semibold">{p.name}</div>
                <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald" /> {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      ))}

      <p>
        Precisa de algo específico? <a href="mailto:contato@decentralizedrealestate.com">Fale com vendas</a> ou{" "}
        <Link to="/signup">crie sua conta gratuita</Link> para começar agora.
      </p>
    </PublicPage>
  );
}

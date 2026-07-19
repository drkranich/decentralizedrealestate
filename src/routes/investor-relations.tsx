import { createFileRoute } from "@tanstack/react-router";
import { PublicPage } from "@/components/landing/PublicPage";

export const Route = createFileRoute("/investor-relations")({
  component: InvestorRelationsPage,
});

function InvestorRelationsPage() {
  return (
    <PublicPage
      title="Relações com investidores"
      subtitle="Para quem quer investir na empresa por trás da plataforma."
    >
      <p>
        Esta página é sobre investir na própria Property OS como empresa — diferente do painel de investidor
        dentro do produto, que é para quem compra frações de imóveis específicos listados na plataforma.
      </p>
      <p>
        Se você é investidor institucional, anjo ou fundo e quer conversar sobre a empresa, escreva para{" "}
        <a href="mailto:contato@decentralizedrealestate.com">contato@decentralizedrealestate.com</a>. Não
        divulgamos publicamente valuation, rodadas ou métricas financeiras fora de conversas diretas com
        investidores.
      </p>
    </PublicPage>
  );
}

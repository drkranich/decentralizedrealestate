import { createFileRoute } from "@tanstack/react-router";
import { PublicPage } from "@/components/landing/PublicPage";

export const Route = createFileRoute("/about")({
  component: AboutPage,
});

function AboutPage() {
  return (
    <PublicPage title="Sobre" subtitle="Uma plataforma de operação imobiliária, sem intermediário desnecessário.">
      <p>
        A Property OS existe para colocar proprietários, inquilinos e investidores na mesma plataforma, com dados
        reais e ferramentas de verdade — cadastro e busca de imóveis, CRM de leads, contratos, manutenção,
        pagamentos e um sistema de propriedade fracionária via tokens para quem quer investir em imóveis sem
        comprar o imóvel inteiro.
      </p>
      <h2>O que nos diferencia</h2>
      <ul>
        <li>Um único produto para os três lados do negócio: quem mora, quem administra e quem investe</li>
        <li>Propriedade fracionária real, com registro de token, percentual e histórico de transferência</li>
        <li>Dados de mercado (câmbio, cripto, ouro) ao vivo para quem acompanha o lado de investimento</li>
      </ul>
      <p>
        Estamos construindo isso de forma incremental e transparente — o que está na plataforma hoje é real, não
        uma maquete.
      </p>
    </PublicPage>
  );
}

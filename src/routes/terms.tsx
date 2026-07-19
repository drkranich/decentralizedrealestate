import { createFileRoute } from "@tanstack/react-router";
import { PublicPage } from "@/components/landing/PublicPage";

export const Route = createFileRoute("/terms")({
  component: TermsPage,
});

function TermsPage() {
  return (
    <PublicPage title="Termos de uso" subtitle="Última atualização: julho de 2026.">
      <p className="rounded-2xl border border-dashed border-skyblue/40 bg-skyblue/10 p-4 text-xs text-muted-foreground">
        Este é um modelo padrão de termos de uso para uma plataforma de anúncios e gestão de imóveis. Ele não
        substitui aconselhamento jurídico — recomendamos revisão por um advogado antes de tratá-lo como
        contrato final vinculante.
      </p>
      <h2>1. Objeto</h2>
      <p>
        A Property OS conecta proprietários, inquilinos e investidores para anúncio, locação, venda e
        fracionamento de imóveis. A plataforma é uma intermediária tecnológica e não parte nos contratos de
        locação ou compra e venda firmados entre os usuários.
      </p>
      <h2>2. Cadastro</h2>
      <p>
        O uso da plataforma exige cadastro com dados verdadeiros. Cada usuário é responsável pela veracidade das
        informações e fotos publicadas nos imóveis sob sua conta.
      </p>
      <h2>3. Propriedade fracionária</h2>
      <p>
        Tokens de fração representam um percentual de titularidade sobre um imóvel, conforme registrado na
        plataforma. A emissão e transferência de tokens não substitui os registros legais de propriedade exigidos
        pela legislação aplicável em cada jurisdição.
      </p>
      <h2>4. Pagamentos</h2>
      <p>
        Pagamentos entre partes são processados por provedores de pagamento terceirizados. A plataforma não
        executa transferências financeiras diretamente em nome do usuário sem autorização explícita.
      </p>
      <h2>5. Encerramento de conta</h2>
      <p>
        Qualquer usuário pode solicitar o encerramento de sua conta a qualquer momento, respeitando obrigações
        contratuais já assumidas (contratos ativos, tokens emitidos).
      </p>
      <h2>6. Contato</h2>
      <p>
        Dúvidas sobre estes termos: <a href="mailto:contato@decentralizedrealestate.com">contato@decentralizedrealestate.com</a>.
      </p>
    </PublicPage>
  );
}

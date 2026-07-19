import { createFileRoute } from "@tanstack/react-router";
import { PublicPage } from "@/components/landing/PublicPage";

export const Route = createFileRoute("/careers")({
  component: CareersPage,
});

function CareersPage() {
  return (
    <PublicPage title="Carreiras" subtitle="Não temos vagas abertas no momento.">
      <p>
        Neste momento não há um processo seletivo ativo. Se você quer deixar contato para oportunidades futuras —
        principalmente em produto, engenharia ou operações imobiliárias — escreva para{" "}
        <a href="mailto:contato@decentralizedrealestate.com">contato@decentralizedrealestate.com</a> com um pouco
        sobre você. Quando abrirmos vagas, esta página será atualizada com as posições reais disponíveis.
      </p>
    </PublicPage>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { PublicPage } from "@/components/landing/PublicPage";

export const Route = createFileRoute("/white-label")({
  component: WhiteLabelPage,
});

function WhiteLabelPage() {
  return (
    <PublicPage title="White-label" subtitle="A plataforma já suporta marca própria hoje.">
      <p>
        O painel de administrador tem uma aba de marca (Branding) onde é possível trocar o logo e o favicon
        exibidos em toda a plataforma, para todos os visitantes — esse é um recurso real, já em uso, não um
        plano futuro.
      </p>
      <h2>O que já dá para personalizar</h2>
      <ul>
        <li>Logo e favicon globais</li>
        <li>Paleta de cores do tema (definida em configuração de marca)</li>
      </ul>
      <p>
        Para uma operação white-label completa (domínio próprio, contrato comercial dedicado), fale com{" "}
        <a href="mailto:contato@decentralizedrealestate.com">contato@decentralizedrealestate.com</a>.
      </p>
    </PublicPage>
  );
}

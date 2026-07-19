import { createFileRoute } from "@tanstack/react-router";
import { PublicPage } from "@/components/landing/PublicPage";

export const Route = createFileRoute("/sdks")({
  component: SdksPage,
});

function SdksPage() {
  return (
    <PublicPage title="SDKs" subtitle="Ainda não publicamos pacotes de SDK — aqui está o estado real hoje.">
      <p>
        Não existe, no momento, um pacote instalável (npm ou outro) para integrar com a Property OS por conta
        própria. A integração hoje acontece através do mesmo modelo de dados e API que usamos internamente,
        caso a caso, junto ao nosso time técnico.
      </p>
      <p>
        Se o seu produto precisa trocar dados com imóveis, leads, contratos ou tokens de fração, entre em contato
        em <a href="mailto:contato@decentralizedrealestate.com">contato@decentralizedrealestate.com</a> e avaliamos
        a melhor forma de conectar os dois lados.
      </p>
    </PublicPage>
  );
}

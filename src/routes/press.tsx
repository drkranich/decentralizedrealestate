import { createFileRoute } from "@tanstack/react-router";
import { PublicPage } from "@/components/landing/PublicPage";
import { useBrand } from "@/components/brand/BrandProvider";

export const Route = createFileRoute("/press")({
  component: PressPage,
});

function PressPage() {
  const brand = useBrand();
  return (
    <PublicPage title="Imprensa" subtitle="Kit de marca e contato para jornalistas.">
      <p>{brand.tagline}</p>
      <h2>Ativos de marca</h2>
      <p>
        O logo e as cores oficiais em uso na plataforma podem ser vistos no rodapé e cabeçalho deste site. Para
        arquivos em alta resolução ou uma entrevista, escreva diretamente para nosso contato de imprensa.
      </p>
      <h2>Contato</h2>
      <p>
        <a href="mailto:contato@decentralizedrealestate.com">contato@decentralizedrealestate.com</a>
      </p>
    </PublicPage>
  );
}

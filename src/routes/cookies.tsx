import { createFileRoute } from "@tanstack/react-router";
import { PublicPage } from "@/components/landing/PublicPage";

export const Route = createFileRoute("/cookies")({
  component: CookiesPage,
});

function CookiesPage() {
  return (
    <PublicPage title="Política de cookies" subtitle="O que realmente usamos — sem rastreamento de anúncios.">
      <p>
        A plataforma usa apenas cookies e armazenamento local essenciais para manter sua sessão autenticada
        (login) funcionando. Não usamos cookies de publicidade nem vendemos dados de navegação para redes de
        anúncio.
      </p>
      <h2>O que é armazenado</h2>
      <ul>
        <li>Token de sessão de autenticação, para manter você conectado</li>
        <li>Preferências de interface, como tema claro/escuro e idioma</li>
      </ul>
      <p>
        Você pode limpar esses dados a qualquer momento nas configurações do seu navegador — isso vai exigir um
        novo login.
      </p>
    </PublicPage>
  );
}

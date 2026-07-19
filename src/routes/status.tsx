import { createFileRoute } from "@tanstack/react-router";
import { PublicPage } from "@/components/landing/PublicPage";

export const Route = createFileRoute("/status")({
  component: StatusPage,
});

function StatusPage() {
  return (
    <PublicPage title="Status" subtitle="Nossa infraestrutura real e onde acompanhar a disponibilidade dela.">
      <p>
        A Property OS roda sobre duas plataformas de infraestrutura de terceiros com status público próprio e
        verificável — não publicamos um número de disponibilidade inventado aqui, e sim apontamos para a fonte
        real:
      </p>
      <ul>
        <li>
          Aplicação e edge functions: <a href="https://www.cloudflarestatus.com" target="_blank" rel="noreferrer">Cloudflare Status</a>
        </li>
        <li>
          Banco de dados, autenticação e armazenamento: <a href="https://status.supabase.com" target="_blank" rel="noreferrer">Supabase Status</a>
        </li>
      </ul>
      <p>
        Se você suspeitar de uma instabilidade específica da nossa conta (não da infraestrutura de terceiros),
        escreva para <a href="mailto:contato@decentralizedrealestate.com">contato@decentralizedrealestate.com</a>.
      </p>
    </PublicPage>
  );
}

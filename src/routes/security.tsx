import { createFileRoute } from "@tanstack/react-router";
import { PublicPage } from "@/components/landing/PublicPage";

export const Route = createFileRoute("/security")({
  component: SecurityPage,
});

function SecurityPage() {
  return (
    <PublicPage title="Segurança" subtitle="Medidas reais em produção, hoje.">
      <ul>
        <li>Toda comunicação com a plataforma é criptografada em trânsito (HTTPS/TLS via Cloudflare)</li>
        <li>Autenticação gerenciada com senhas armazenadas de forma segura, nunca em texto puro</li>
        <li>Regras de segurança em nível de linha (RLS) em todas as tabelas com dado sensível</li>
        <li>Buckets de armazenamento (fotos/vídeos, avatares, marca) com políticas de acesso próprias</li>
        <li>Log de atividade administrativa auditável</li>
      </ul>
      <h2>Divulgação responsável</h2>
      <p>
        Encontrou uma vulnerabilidade? Escreva para{" "}
        <a href="mailto:contato@decentralizedrealestate.com">contato@decentralizedrealestate.com</a> com os
        detalhes — respondemos diretamente, sem programa formal de recompensa no momento.
      </p>
    </PublicPage>
  );
}

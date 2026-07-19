import { createFileRoute } from "@tanstack/react-router";
import { PublicPage } from "@/components/landing/PublicPage";

export const Route = createFileRoute("/api")({
  component: ApiPage,
});

function ApiPage() {
  return (
    <PublicPage title="API" subtitle="A plataforma é construída API-first, sobre um banco de dados real.">
      <p>
        Toda a Property OS roda sobre um banco Postgres com API REST e realtime nativos, protegido por regras de
        segurança em nível de linha (RLS) por tabela e por papel de usuário (inquilino, proprietário, investidor,
        administrador). A lógica de negócio e integrações rodam em edge functions distribuídas globalmente.
      </p>
      <h2>O que já existe hoje</h2>
      <ul>
        <li>Modelo de dados real para imóveis, contratos, leads, pagamentos, tokens de fração e usuários</li>
        <li>Autenticação real com papéis (inquilino, proprietário, investidor, administrador)</li>
        <li>Armazenamento de mídia (fotos e vídeos de imóveis) com controle de acesso por política</li>
      </ul>
      <h2>Acesso para parceiros</h2>
      <p>
        Ainda não abrimos um programa self-service de chaves de API para terceiros. Se você é uma integradora,
        proptech ou parceiro comercial e quer trocar dados com a plataforma, fale com nosso time em{" "}
        <a href="mailto:contato@decentralizedrealestate.com">contato@decentralizedrealestate.com</a> — avaliamos
        integrações caso a caso.
      </p>
    </PublicPage>
  );
}

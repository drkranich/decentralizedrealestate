import { createFileRoute } from "@tanstack/react-router";
import { PublicPage } from "@/components/landing/PublicPage";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <PublicPage title="Política de privacidade" subtitle="Última atualização: julho de 2026.">
      <p className="rounded-2xl border border-dashed border-skyblue/40 bg-skyblue/10 p-4 text-xs text-muted-foreground">
        Este é um modelo padrão de política de privacidade, descrevendo os dados que a plataforma efetivamente
        coleta hoje. Recomendamos revisão jurídica para adequação total a leis locais de proteção de dados
        (como a LGPD ou o GDPR) conforme os países em que a operação atuar.
      </p>
      <h2>Dados que coletamos</h2>
      <ul>
        <li>Dados de cadastro: nome, e-mail, telefone, senha (armazenada de forma segura)</li>
        <li>Endereço e localização, quando informados no perfil ou no cadastro de um imóvel</li>
        <li>Preferências de idioma, fuso horário e moeda</li>
        <li>Dados de imóveis, contratos, pagamentos e leads associados à sua conta</li>
      </ul>
      <h2>Como usamos</h2>
      <p>
        Usamos esses dados para operar o produto: exibir imóveis, processar leads, gerar contratos e relatórios,
        e permitir que investidores acompanhem seu portfólio. Não vendemos dados pessoais a terceiros.
      </p>
      <h2>Acesso e segurança</h2>
      <p>
        O acesso aos dados é controlado por regras de segurança em nível de linha (RLS) por tabela — cada usuário
        só acessa os dados da sua própria conta ou dos imóveis/contratos aos quais está relacionado, e
        administradores têm acesso auditado.
      </p>
      <h2>Seus direitos</h2>
      <p>
        Você pode solicitar a exportação ou exclusão dos seus dados pessoais a qualquer momento, escrevendo para{" "}
        <a href="mailto:contato@decentralizedrealestate.com">contato@decentralizedrealestate.com</a>.
      </p>
    </PublicPage>
  );
}

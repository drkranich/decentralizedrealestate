import { createFileRoute } from "@tanstack/react-router";
import { PublicPage } from "@/components/landing/PublicPage";

export const Route = createFileRoute("/compliance")({
  component: CompliancePage,
});

function CompliancePage() {
  return (
    <PublicPage title="Compliance" subtitle="Como tratamos dados e acesso, na prática.">
      <h2>Controle de acesso por linha</h2>
      <p>
        Cada tabela do banco de dados tem regras de segurança em nível de linha (Row Level Security): um
        inquilino só vê o próprio contrato, um proprietário só vê os próprios imóveis, um investidor só vê os
        tokens registrados em seu nome, e administradores têm acesso auditado a toda a operação.
      </p>
      <h2>Registro de atividade</h2>
      <p>
        Ações administrativas ficam registradas em um log de atividade real, consultável pelo próprio
        administrador da conta.
      </p>
      <h2>Propriedade fracionária</h2>
      <p>
        Tokens de fração e suas transferências ficam registrados com histórico completo — quem detinha, quem
        passou a deter, e quando.
      </p>
      <h2>Dúvidas</h2>
      <p>
        Para solicitações formais de compliance ou auditoria, escreva para{" "}
        <a href="mailto:contato@decentralizedrealestate.com">contato@decentralizedrealestate.com</a>.
      </p>
    </PublicPage>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { PublicPage } from "@/components/landing/PublicPage";

export const Route = createFileRoute("/webhooks")({
  component: WebhooksPage,
});

const events = [
  "Novo lead recebido em um imóvel",
  "Contrato assinado ou atualizado",
  "Solicitação de manutenção aberta",
  "Pagamento registrado ou com mudança de status",
];

function WebhooksPage() {
  return (
    <PublicPage title="Webhooks" subtitle="Automação de eventos, configurável dentro do painel administrativo.">
      <p>
        A Property OS tem um módulo real de automação: administradores podem cadastrar webhooks apontando para uma
        URL própria, escolher o evento que dispara o envio e ativar ou desativar cada regra individualmente.
      </p>
      <h2>Eventos disponíveis hoje</h2>
      <ul>
        {events.map((e) => (
          <li key={e}>{e}</li>
        ))}
      </ul>
      <p>
        A configuração é feita em <strong>Automação → Webhooks</strong>, dentro do painel do administrador da
        conta.
      </p>
    </PublicPage>
  );
}

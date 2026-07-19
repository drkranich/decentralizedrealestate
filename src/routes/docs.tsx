import { createFileRoute } from "@tanstack/react-router";
import { PublicPage } from "@/components/landing/PublicPage";

export const Route = createFileRoute("/docs")({
  component: DocsPage,
});

const guides = [
  { title: "Publicar um imóvel", body: "Cadastre título, descrição, endereço com geolocalização, fotos/vídeos e escolha entre venda ou aluguel. O imóvel fica disponível na busca pública assim que marcado como disponível." },
  { title: "Gerenciar leads (CRM)", body: "Cada interesse recebido pela página pública do imóvel entra automaticamente no seu funil de CRM, com estágios (novo, qualificado, visita, proposta, fechado) e quadro kanban arrastável." },
  { title: "Fracionar um imóvel (tokens)", body: "Imóveis podem ter propriedade fracionária: cada fração vira um token vinculado a um investidor, com percentual, status e histórico de transferência." },
  { title: "Portal do investidor", body: "Investidores acompanham seu portfólio de frações, o valor proporcional investido, os rendimentos calculados sobre os pagamentos recebidos e os contratos vigentes dos imóveis em que investem." },
  { title: "Manutenção e mensagens", body: "Inquilinos abrem chamados de manutenção por categoria; proprietários acompanham e respondem. Mensagens ficam vinculadas ao contrato." },
  { title: "Contratos e pagamentos", body: "Contratos vinculam inquilino e imóvel, com status e vigência. Pagamentos ficam associados ao contrato e alimentam os relatórios financeiros." },
];

function DocsPage() {
  return (
    <PublicPage title="Documentação" subtitle="Guias sobre como cada parte da Property OS funciona hoje.">
      <p>
        Esta é uma documentação viva dos recursos que já existem na plataforma — não um roteiro de funcionalidades
        futuras. Conforme abrimos integrações para parceiros, vamos publicar referências técnicas mais detalhadas
        aqui.
      </p>
      {guides.map((g) => (
        <div key={g.title}>
          <h2>{g.title}</h2>
          <p>{g.body}</p>
        </div>
      ))}
    </PublicPage>
  );
}

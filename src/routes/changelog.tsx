import { createFileRoute } from "@tanstack/react-router";
import { PublicPage } from "@/components/landing/PublicPage";

export const Route = createFileRoute("/changelog")({
  component: ChangelogPage,
});

const entries = [
  { date: "19 jul 2026", items: [
    "Painel dedicado para investidores: portfólio de frações, rendimentos proporcionais e documentos dos imóveis",
    "Editar, arquivar e excluir imóveis e leads direto dos painéis de admin e proprietário",
    "Página pública de imóvel com captação de interesse (lead) e botão de compartilhar link",
    "Removido o conceito de estadia curta/longa — o produto é venda e aluguel de imóveis",
    "Cotações reais de câmbio, cripto e ouro no terminal do investidor",
  ]},
  { date: "18 jul 2026", items: [
    "Autenticação real com cadastro de inquilino, proprietário e investidor",
    "CRM e contratos conectados a dados reais",
    "Novo sistema visual: verde-menta/azul/vermelho, tipografia moderna, cadastro completo de imóveis",
  ]},
  { date: "07 mai 2026", items: [
    "Reconstrução do módulo de IA e do marketplace",
    "Painel do proprietário e navegação modular",
    "Sistema de marca reutilizável (branding)",
  ]},
];

function ChangelogPage() {
  return (
    <PublicPage title="Changelog" subtitle="O que mudou de verdade na plataforma, por data.">
      {entries.map((e) => (
        <div key={e.date}>
          <h2>{e.date}</h2>
          <ul>
            {e.items.map((i) => (
              <li key={i}>{i}</li>
            ))}
          </ul>
        </div>
      ))}
    </PublicPage>
  );
}

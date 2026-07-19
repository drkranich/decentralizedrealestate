import { createFileRoute } from "@tanstack/react-router";
import { PublicPage } from "@/components/landing/PublicPage";

export const Route = createFileRoute("/blog")({
  component: BlogPage,
});

const posts = [
  {
    title: "Propriedade fracionária: investir em um imóvel sem comprar o imóvel inteiro",
    date: "19 jul 2026",
    body: "Lançamos o registro de tokens de fração dentro da plataforma: cada investidor recebe um token vinculado a um percentual de um imóvel, com histórico de transferência e um painel próprio para acompanhar valor investido e rendimentos proporcionais.",
  },
  {
    title: "Um portal para cada lado do negócio",
    date: "19 jul 2026",
    body: "Proprietário, inquilino e investidor agora têm painéis dedicados dentro da mesma conta — cada um vendo só o que importa para o seu papel, com dados reais vindos do mesmo banco.",
  },
  {
    title: "Câmbio, cripto e ouro ao vivo no terminal do investidor",
    date: "19 jul 2026",
    body: "O terminal do investidor deixou de mostrar números fixos: agora ele consulta cotações reais de câmbio e cripto, atualizadas automaticamente, para dar contexto de mercado a quem acompanha seus investimentos em imóveis.",
  },
];

function BlogPage() {
  return (
    <PublicPage title="Blog" subtitle="Anúncios reais sobre o que construímos.">
      {posts.map((p) => (
        <article key={p.title} className="border-b border-glass-border pb-6 last:border-0">
          <div className="text-xs text-muted-foreground">{p.date}</div>
          <h2 className="!mt-1">{p.title}</h2>
          <p>{p.body}</p>
        </article>
      ))}
    </PublicPage>
  );
}

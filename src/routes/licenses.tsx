import { createFileRoute } from "@tanstack/react-router";
import { PublicPage } from "@/components/landing/PublicPage";

export const Route = createFileRoute("/licenses")({
  component: LicensesPage,
});

const libs = [
  "React", "TanStack Router", "TanStack Query", "Vite", "Tailwind CSS", "Radix UI",
  "Supabase JS", "lucide-react", "recharts", "date-fns", "react-hook-form", "zod",
  "sonner", "framer-motion", "embla-carousel-react",
];

function LicensesPage() {
  return (
    <PublicPage title="Licenças" subtitle="Principais projetos de código aberto usados na plataforma.">
      <p>
        A Property OS é construída sobre uma base majoritariamente de código aberto sob licença MIT. Esta não é
        uma lista jurídica exaustiva de cada dependência transitiva — para o arquivo completo de licenças,
        entre em contato.
      </p>
      <ul>
        {libs.map((l) => (
          <li key={l}>{l}</li>
        ))}
      </ul>
      <p>
        Dúvidas sobre uma dependência específica:{" "}
        <a href="mailto:contato@decentralizedrealestate.com">contato@decentralizedrealestate.com</a>.
      </p>
    </PublicPage>
  );
}

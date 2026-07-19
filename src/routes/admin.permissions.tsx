import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { KeyRound, ShieldCheck, Home, UserRound, Loader2, ArrowRight } from "lucide-react";
import { PageHeader, Card, Badge, SectionTitle } from "@/components/app/ui";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/admin/permissions")({
  component: Permissions,
});

const roleInfo = [
  {
    role: "admin",
    label: "Super admin",
    icon: ShieldCheck,
    area: "/admin/*",
    access: [
      "Acesso total ao painel administrativo",
      "Gerencia usuários e permissões",
      "Vê todos os imóveis, contratos, pagamentos e comissões da plataforma",
      "Configura marca, integrações e preferências globais",
    ],
  },
  {
    role: "owner",
    label: "Dono de imóvel",
    icon: Home,
    area: "/app/*",
    access: [
      "Vê e gerencia apenas os próprios imóveis",
      "Calendário, financeiro e contratos dos seus imóveis",
      "Marketplace de manutenção para os seus imóveis",
      "Não acessa dados de outros donos ou o painel admin",
    ],
  },
  {
    role: "tenant",
    label: "Inquilino",
    icon: UserRound,
    area: "/app/*",
    access: [
      "Vê apenas o próprio contrato de aluguel",
      "Pagamentos e boletos do seu contrato",
      "Abre chamados de manutenção",
      "Mensagens com o dono/imobiliária",
    ],
  },
];

function Permissions() {
  const [counts, setCounts] = useState<Record<string, number> | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("users").select("role");
      const c: Record<string, number> = { admin: 0, owner: 0, tenant: 0 };
      for (const row of data ?? []) c[row.role] = (c[row.role] ?? 0) + 1;
      setCounts(c);
    })();
  }, []);

  return (
    <>
      <PageHeader title="Permissions" subtitle="Como cada papel (role) é aplicado na plataforma — enforçado via RLS no Supabase, não só na interface." />

      <div className="grid gap-6 md:grid-cols-3">
        {roleInfo.map((r) => (
          <Card key={r.role}>
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald/15 text-emerald">
                  <r.icon className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-display font-semibold">{r.label}</div>
                  <div className="font-mono text-xs text-muted-foreground">{r.area}</div>
                </div>
              </div>
              {counts === null ? (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              ) : (
                <Badge variant="emerald">{counts[r.role] ?? 0} usuários</Badge>
              )}
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {r.access.map((a) => (
                <li key={a} className="flex items-start gap-2">
                  <KeyRound className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald" />
                  {a}
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <SectionTitle title="Gerenciar usuários" />
        <p className="mb-4 text-sm text-muted-foreground">
          Para trocar o papel (role) de um usuário específico, use a página Users.
        </p>
        <Link to="/admin/users" className="inline-flex items-center gap-2 rounded-full bg-emerald px-4 py-2 text-sm font-semibold text-white shadow-glow">
          Ir para Users <ArrowRight className="h-4 w-4" />
        </Link>
      </Card>
    </>
  );
}

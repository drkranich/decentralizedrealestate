import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  Home,
  KeyRound,
  Loader2,
  RotateCcw,
  Save,
  ShieldCheck,
  UserRound,
  WalletCards,
} from "lucide-react";
import { toast } from "sonner";
import type { UserRole } from "@/lib/auth";
import { useAuthUser } from "@/lib/auth";
import { PageHeader, Card, Badge, SectionTitle } from "@/components/app/ui";
import { supabase } from "@/lib/supabase";
import {
  ROLE_PERMISSIONS_SECTION_KEY,
  defaultRolePermissions,
  isPermissionLocked,
  normalizeRolePermissions,
  permissionRoutes,
  roleAreas,
  roleCapabilities,
  roleLabels,
  roleOrder,
  roleSummaries,
  toRolePermissionsData,
  useRolePermissions,
  type PermissionArea,
  type PermissionRoute,
  type RoleCapability,
  type RolePermissions,
} from "@/lib/rolePermissions";

export const Route = createFileRoute("/admin/permissions")({
  component: Permissions,
});

const roleIcons: Record<UserRole, typeof ShieldCheck> = {
  admin: ShieldCheck,
  owner: Home,
  tenant: UserRound,
  investor: WalletCards,
  service_provider: BriefcaseBusiness,
};

const roleNotes: Record<UserRole, string[]> = {
  admin: [
    "Governa usuários, permissões, CMS, integrações e operação global.",
    "Acessos essenciais de administração permanecem obrigatórios.",
    "Pode publicar, revisar e auditar dados da plataforma.",
  ],
  owner: [
    "Acessa o portal do proprietário e dados dos próprios imóveis.",
    "Pode receber abas de contratos, calendário, financeiro e manutenção.",
    "Não recebe acesso ao painel administrativo.",
  ],
  tenant: [
    "Acessa contrato, pagamentos, manutenção e mensagens do próprio vínculo.",
    "Permissões podem ser reduzidas para experiências mais simples.",
    "Não vê dados de proprietários, investidores ou outros inquilinos.",
  ],
  investor: [
    "Acessa o lado de investidor já disponível no cadastro de conta.",
    "Pode consultar portfólio, rendimentos e documentos de investimento.",
    "Fica separado das abas de proprietário e inquilino.",
  ],
  service_provider: [
    "Acessa o painel próprio para cadastro comercial, anúncios e leads.",
    "Pode operar por plano pago, comissão ou modelo híbrido aprovado pela plataforma.",
    "Não acessa dados internos de proprietários, inquilinos ou investidores.",
  ],
};

function Permissions() {
  const { user } = useAuthUser();
  const { permissions, setPermissions, loading } = useRolePermissions();
  const [draft, setDraft] = useState<RolePermissions>(defaultRolePermissions);
  const [selectedRole, setSelectedRole] = useState<UserRole>("admin");
  const [counts, setCounts] = useState<Record<UserRole, number> | null>(null);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (!loading) {
      setDraft(permissions);
      setDirty(false);
    }
  }, [loading, permissions]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("users").select("role");
      const next: Record<UserRole, number> = {
        admin: 0,
        owner: 0,
        tenant: 0,
        investor: 0,
        service_provider: 0,
      };
      for (const row of data ?? []) {
        if (roleOrder.includes(row.role as UserRole)) {
          next[row.role as UserRole] += 1;
        }
      }
      setCounts(next);
    })();
  }, []);

  const selectedArea: PermissionArea = selectedRole === "admin" ? "admin" : "app";
  const selectedRoutes = useMemo(
    () => permissionRoutes.filter((route) => route.area === selectedArea),
    [selectedArea],
  );
  const selectedCapabilities = useMemo(
    () => roleCapabilities.filter((capability) => capability.availableFor.includes(selectedRole)),
    [selectedRole],
  );
  const routeGroups = useMemo(() => groupBySection(selectedRoutes), [selectedRoutes]);
  const capabilityGroups = useMemo(
    () => groupBySection(selectedCapabilities),
    [selectedCapabilities],
  );

  const routeCount = draft[selectedRole]?.routes.length ?? 0;
  const capabilityCount = draft[selectedRole]?.capabilities.length ?? 0;

  const toggleRoute = (route: PermissionRoute) => {
    if (isPermissionLocked(selectedRole, route.id, "route")) return;
    setDraft((prev) => {
      const current = prev[selectedRole]?.routes ?? [];
      const routes = current.includes(route.id)
        ? current.filter((id) => id !== route.id)
        : [...current, route.id];
      return { ...prev, [selectedRole]: { ...prev[selectedRole], routes } };
    });
    setDirty(true);
  };

  const toggleCapability = (capability: RoleCapability) => {
    if (isPermissionLocked(selectedRole, capability.id, "capability")) return;
    setDraft((prev) => {
      const current = prev[selectedRole]?.capabilities ?? [];
      const capabilities = current.includes(capability.id)
        ? current.filter((id) => id !== capability.id)
        : [...current, capability.id];
      return { ...prev, [selectedRole]: { ...prev[selectedRole], capabilities } };
    });
    setDirty(true);
  };

  const resetSelectedRole = () => {
    setDraft((prev) => ({
      ...prev,
      [selectedRole]: {
        routes: [...defaultRolePermissions[selectedRole].routes],
        capabilities: [...defaultRolePermissions[selectedRole].capabilities],
      },
    }));
    setDirty(true);
  };

  const savePermissions = async () => {
    setSaving(true);
    const normalized = normalizeRolePermissions(draft);
    const { error } = await supabase.from("site_content").upsert({
      section_key: ROLE_PERMISSIONS_SECTION_KEY,
      data: toRolePermissionsData(normalized),
      updated_at: new Date().toISOString(),
      updated_by: user?.id ?? null,
    });
    setSaving(false);

    if (error) {
      toast.error(error.message || "Não foi possível salvar as permissões.");
      return;
    }

    setDraft(normalized);
    setPermissions(normalized);
    setDirty(false);
    toast.success("Matriz de permissões salva.");
  };

  if (loading) {
    return (
      <>
        <PageHeader title="Permissões" subtitle="Carregando a matriz de papéis, abas e funções." />
        <Card>
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Carregando...
          </div>
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Permissões"
        subtitle="Defina quais abas e funções cada papel pode acessar. A interface aplica estes guards; dados sensíveis continuam protegidos pelas políticas do Supabase."
      >
        <button
          type="button"
          onClick={resetSelectedRole}
          className="flex items-center gap-2 rounded-full border border-glass-border bg-glass-fill px-4 py-2 text-sm font-medium hover:bg-secondary"
        >
          <RotateCcw className="h-4 w-4" /> Restaurar papel
        </button>
        <button
          type="button"
          onClick={savePermissions}
          disabled={saving || !dirty}
          className="flex items-center gap-2 rounded-full bg-emerald px-4 py-2 text-sm font-semibold text-white shadow-glow disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Salvar matriz
        </button>
      </PageHeader>

      <div className="grid gap-4 lg:grid-cols-4">
        {roleOrder.map((role) => {
          const Icon = roleIcons[role];
          const selected = selectedRole === role;
          return (
            <button
              key={role}
              type="button"
              onClick={() => setSelectedRole(role)}
              className={`rounded-3xl border p-5 text-left shadow-soft backdrop-blur-xl transition-all ${
                selected
                  ? "border-emerald/40 bg-emerald/10"
                  : "border-glass-border bg-card/60 hover:border-emerald/25"
              }`}
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald/15 text-emerald">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-display font-semibold">{roleLabels[role]}</div>
                    <div className="font-mono text-xs text-muted-foreground">{roleAreas[role]}</div>
                  </div>
                </div>
                {counts === null ? (
                  <Loader2 className="mt-2 h-4 w-4 animate-spin text-muted-foreground" />
                ) : (
                  <Badge variant="emerald">{counts[role]} usuários</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{roleSummaries[role]}</p>
            </button>
          );
        })}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <Card>
          <SectionTitle
            title={roleLabels[selectedRole]}
            action={
              <div className="flex flex-wrap gap-2">
                <Badge variant="blue">{routeCount} abas</Badge>
                <Badge variant="emerald">{capabilityCount} funções</Badge>
              </div>
            }
          />
          <p className="-mt-2 mb-4 text-sm text-muted-foreground">{roleSummaries[selectedRole]}</p>
          <ul className="space-y-3 text-sm text-muted-foreground">
            {roleNotes[selectedRole].map((note) => (
              <li key={note} className="flex gap-2">
                <KeyRound className="mt-0.5 h-4 w-4 shrink-0 text-emerald" />
                <span>{note}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6 rounded-2xl border border-glass-border bg-glass-fill p-4">
            <div className="mb-2 flex items-center gap-2 font-display text-sm font-semibold">
              <CheckCircle2 className="h-4 w-4 text-emerald" />
              Como aplicar
            </div>
            <p className="text-sm text-muted-foreground">
              As abas marcadas aparecem no menu e o acesso direto à rota redireciona para a primeira
              página permitida do papel.
            </p>
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <SectionTitle title="Abas disponíveis" />
            <div className="grid gap-4 lg:grid-cols-2">
              {routeGroups.map(([section, routes]) => (
                <PermissionGroup key={section} title={section}>
                  {routes.map((route) => (
                    <PermissionToggle
                      key={route.id}
                      title={route.label}
                      description={route.description}
                      checked={
                        isPermissionLocked(selectedRole, route.id, "route") ||
                        draft[selectedRole]?.routes.includes(route.id)
                      }
                      locked={isPermissionLocked(selectedRole, route.id, "route")}
                      meta={route.path}
                      onChange={() => toggleRoute(route)}
                    />
                  ))}
                </PermissionGroup>
              ))}
            </div>
          </Card>

          <Card>
            <SectionTitle title="Funções permitidas" />
            <div className="grid gap-4 lg:grid-cols-2">
              {capabilityGroups.map(([section, capabilities]) => (
                <PermissionGroup key={section} title={section}>
                  {capabilities.map((capability) => (
                    <PermissionToggle
                      key={capability.id}
                      title={capability.label}
                      description={capability.description}
                      checked={
                        isPermissionLocked(selectedRole, capability.id, "capability") ||
                        draft[selectedRole]?.capabilities.includes(capability.id)
                      }
                      locked={isPermissionLocked(selectedRole, capability.id, "capability")}
                      meta={capability.id}
                      onChange={() => toggleCapability(capability)}
                    />
                  ))}
                </PermissionGroup>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <Card className="mt-6">
        <SectionTitle title="Gerenciar usuários" />
        <p className="mb-4 text-sm text-muted-foreground">
          Para trocar o papel de um usuário específico, use a página Users.
        </p>
        <Link
          to="/admin/users"
          className="inline-flex items-center gap-2 rounded-full bg-emerald px-4 py-2 text-sm font-semibold text-white shadow-glow"
        >
          Ir para Users <ArrowRight className="h-4 w-4" />
        </Link>
      </Card>
    </>
  );
}

function PermissionGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-glass-border bg-glass-fill p-4">
      <div className="mb-3 font-display text-sm font-semibold">{title}</div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function PermissionToggle({
  title,
  description,
  checked,
  locked,
  meta,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  locked: boolean;
  meta: string;
  onChange: () => void;
}) {
  return (
    <label
      className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors ${
        checked
          ? "border-emerald/30 bg-emerald/10"
          : "border-glass-border bg-card/40 hover:border-emerald/20"
      } ${locked ? "cursor-not-allowed opacity-80" : ""}`}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={locked}
        onChange={onChange}
        className="mt-1 h-4 w-4 accent-emerald"
      />
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2 text-sm font-semibold">
          {title}
          {locked && <Badge variant="muted">Obrigatória</Badge>}
        </span>
        <span className="mt-1 block text-xs text-muted-foreground">{description}</span>
        <span className="mt-1 block truncate font-mono text-[10px] text-muted-foreground">
          {meta}
        </span>
      </span>
    </label>
  );
}

function groupBySection<T extends { section: string }>(items: T[]) {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    groups.set(item.section, [...(groups.get(item.section) ?? []), item]);
  }
  return Array.from(groups.entries());
}

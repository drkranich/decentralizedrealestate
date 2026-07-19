import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Archive,
  BadgeCheck,
  Building2,
  Coins,
  FileText,
  FileLock2,
  Globe2,
  KeyRound,
  Landmark,
  LayoutDashboard,
  LayoutTemplate,
  Plus,
  Scale,
  Search,
  Settings,
  ShieldCheck,
  Signature,
  ScrollText,
  TrendingUp,
  UserCheck,
  Users,
  WalletCards,
} from "lucide-react";
import type { UserRole } from "@/lib/auth";
import {
  isPathAllowedForRole,
  permissionRoutes,
  type RolePermissions,
} from "@/lib/rolePermissions";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";

export const SAAS_COMMAND_OPEN_EVENT = "saas-command-open";

type SearchIntent = {
  id: string;
  label: string;
  description: string;
  keywords: string;
  section: string;
  path: string;
  icon: typeof Search;
  search?: Record<string, string>;
};

const iconByPath: Record<string, typeof Search> = {
  "/admin/dashboard": LayoutDashboard,
  "/admin/properties": Building2,
  "/admin/users": Users,
  "/admin/permissions": KeyRound,
  "/admin/legal-compliance": Scale,
  "/admin/jurisdictions": Globe2,
  "/admin/token-classifications": BadgeCheck,
  "/admin/compliance-engine": ShieldCheck,
  "/admin/legal-vault": FileLock2,
  "/admin/contract-lifecycle": Signature,
  "/admin/identity-aml": UserCheck,
  "/admin/escrow-reconciliation": Landmark,
  "/admin/audit-evidence": Archive,
  "/admin/cms": LayoutTemplate,
  "/admin/settings": Settings,
  "/app/dashboard": LayoutDashboard,
  "/app/properties": Building2,
  "/app/contracts": FileText,
  "/app/contract": FileText,
  "/app/investor-opportunities": WalletCards,
  "/app/investor-portfolio": Coins,
  "/app/investor-earnings": TrendingUp,
  "/app/investor-documents": ScrollText,
  "/app/investor-compliance": ShieldCheck,
};

const adminQuickActions: SearchIntent[] = [
  {
    id: "action.admin.add_property",
    label: "Adicionar imóvel",
    description: "Abrir o cadastro de um novo imóvel.",
    keywords: "novo cadastro propriedade imóvel criar",
    section: "Ações rápidas",
    path: "/admin/properties",
    search: { add: "1" },
    icon: Plus,
  },
  {
    id: "action.admin.public_cms",
    label: "Editar página pública",
    description: "Abrir o CMS da landing, páginas e blog.",
    keywords: "site landing cms página pública blog",
    section: "Ações rápidas",
    path: "/admin/cms",
    icon: LayoutTemplate,
  },
  {
    id: "action.admin.users",
    label: "Gerenciar usuários",
    description: "Abrir usuários, papéis e perfis cadastrados.",
    keywords: "usuários permissões papel role",
    section: "Ações rápidas",
    path: "/admin/users",
    icon: Users,
  },
  {
    id: "action.admin.legal_compliance",
    label: "Abrir Legal & Compliance",
    description: "Ver gates, jurisdições, vault, evidências e decisões regulatórias.",
    keywords:
      "legal compliance jurídico regulatório token classificação vault evidências kyc kyb aml",
    section: "Ações rápidas",
    path: "/admin/legal-compliance",
    icon: Scale,
  },
];

export function SaasCommandMenu({
  role,
  permissions,
  trigger,
}: {
  role: UserRole;
  permissions: RolePermissions;
  trigger: (open: () => void) => ReactNode;
}) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const options = useMemo(() => buildOptions(role, permissions), [permissions, role]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    const onOpenRequest = () => setOpen(true);
    window.addEventListener(SAAS_COMMAND_OPEN_EVENT, onOpenRequest);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener(SAAS_COMMAND_OPEN_EVENT, onOpenRequest);
    };
  }, []);

  const run = (option: SearchIntent) => {
    setOpen(false);
    navigate({ to: option.path as never, search: option.search as never });
  };

  return (
    <>
      {trigger(() => setOpen(true))}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Procure páginas, funções, usuários, imóveis..." />
        <CommandList>
          <CommandEmpty>Nada encontrado.</CommandEmpty>
          {groupOptions(options).map(([section, items], index) => (
            <div key={section}>
              {index > 0 && <CommandSeparator />}
              <CommandGroup heading={section}>
                {items.map((option) => {
                  const Icon = option.icon;
                  return (
                    <CommandItem
                      key={option.id}
                      value={`${option.label} ${option.description} ${option.keywords}`}
                      onSelect={() => run(option)}
                    >
                      <Icon className="h-4 w-4" />
                      <div className="min-w-0">
                        <div className="truncate font-medium">{option.label}</div>
                        <div className="truncate text-xs text-muted-foreground">
                          {option.description}
                        </div>
                      </div>
                      <CommandShortcut>{option.path}</CommandShortcut>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </div>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
}

function buildOptions(role: UserRole, permissions: RolePermissions) {
  const area = role === "admin" ? "admin" : "app";
  const quickActions =
    role === "admin"
      ? adminQuickActions.filter((action) => isPathAllowedForRole(role, action.path, permissions))
      : [];
  const routes = permissionRoutes
    .filter((route) => route.area === area)
    .filter((route) => isPathAllowedForRole(role, route.path, permissions))
    .map<SearchIntent>((route) => ({
      id: `route.${route.id}`,
      label: route.label,
      description: route.description,
      keywords: `${route.path} ${route.section}`,
      section: route.section,
      path: route.path,
      icon: iconByPath[route.path] ?? Search,
    }));

  return [...quickActions, ...routes];
}

function groupOptions(options: SearchIntent[]) {
  const groups = new Map<string, SearchIntent[]>();
  for (const option of options) {
    groups.set(option.section, [...(groups.get(option.section) ?? []), option]);
  }
  return Array.from(groups.entries());
}

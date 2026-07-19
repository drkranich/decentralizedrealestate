import { useEffect, useState } from "react";
import type { UserRole } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export type PermissionArea = "admin" | "app";

export type RolePermissionState = {
  routes: string[];
  capabilities: string[];
};

export type RolePermissions = Record<UserRole, RolePermissionState>;

export type PermissionRoute = {
  id: string;
  label: string;
  path: string;
  area: PermissionArea;
  section: string;
  description: string;
  defaultRoles: UserRole[];
  lockedFor?: UserRole[];
};

export type RoleCapability = {
  id: string;
  label: string;
  description: string;
  section: string;
  defaultRoles: UserRole[];
  availableFor: UserRole[];
  lockedFor?: UserRole[];
};

export const ROLE_PERMISSIONS_SECTION_KEY = "role_permissions";

export const roleOrder: UserRole[] = ["admin", "owner", "tenant", "investor"];

export const roleLabels: Record<UserRole, string> = {
  admin: "Super admin",
  owner: "Dono de imóvel",
  tenant: "Inquilino",
  investor: "Investidor",
};

export const roleAreas: Record<UserRole, string> = {
  admin: "/admin/*",
  owner: "/app/*",
  tenant: "/app/*",
  investor: "/app/*",
};

export const roleSummaries: Record<UserRole, string> = {
  admin: "Governa a plataforma, usuários, conteúdo, segurança, finanças e operação.",
  owner: "Opera os próprios imóveis, contratos, calendário, financeiro e manutenção.",
  tenant: "Acompanha contrato, pagamentos, chamados de manutenção e mensagens.",
  investor: "Acompanha portfólio tokenizado, rendimentos, documentos e oportunidades.",
};

export const permissionRoutes: PermissionRoute[] = [
  {
    id: "admin.dashboard",
    label: "Dashboard admin",
    path: "/admin/dashboard",
    area: "admin",
    section: "Principal",
    description: "Visão geral operacional da plataforma.",
    defaultRoles: ["admin"],
    lockedFor: ["admin"],
  },
  {
    id: "admin.properties",
    label: "Imóveis",
    path: "/admin/properties",
    area: "admin",
    section: "Principal",
    description: "Cadastro, edição e auditoria de imóveis da plataforma.",
    defaultRoles: ["admin"],
  },
  {
    id: "admin.investor",
    label: "Investidores",
    path: "/admin/investor",
    area: "admin",
    section: "Principal",
    description: "Terminal administrativo para investimentos, tokens e oportunidades.",
    defaultRoles: ["admin"],
  },
  {
    id: "admin.marketplace",
    label: "Marketplace",
    path: "/admin/marketplace",
    area: "admin",
    section: "Principal",
    description: "Serviços, fornecedores e categorias operacionais.",
    defaultRoles: ["admin"],
  },
  {
    id: "admin.contracts",
    label: "Contratos",
    path: "/admin/contracts",
    area: "admin",
    section: "Principal",
    description: "Contratos, vigência, documentos e partes envolvidas.",
    defaultRoles: ["admin"],
  },
  {
    id: "admin.payments",
    label: "Pagamentos",
    path: "/admin/payments",
    area: "admin",
    section: "Principal",
    description: "Pagamentos, cobranças e boletos da operação.",
    defaultRoles: ["admin"],
  },
  {
    id: "admin.analytics",
    label: "Analytics",
    path: "/admin/properties-analytics",
    area: "admin",
    section: "Principal",
    description: "Métricas de ativos, ocupação e performance.",
    defaultRoles: ["admin"],
  },
  {
    id: "admin.messages",
    label: "Mensagens",
    path: "/admin/messages",
    area: "admin",
    section: "Principal",
    description: "Conversas entre usuários, imóveis e operação.",
    defaultRoles: ["admin"],
  },
  {
    id: "admin.calendar",
    label: "Calendário",
    path: "/admin/properties-calendar",
    area: "admin",
    section: "Principal",
    description: "Calendário central de imóveis, contratos e eventos.",
    defaultRoles: ["admin"],
  },
  {
    id: "admin.smart_pricing",
    label: "Precificação inteligente",
    path: "/admin/smart-pricing",
    area: "admin",
    section: "Gestão imobiliária",
    description: "Regras e inteligência de preço.",
    defaultRoles: ["admin"],
  },
  {
    id: "admin.maintenance",
    label: "Manutenção",
    path: "/admin/maintenance",
    area: "admin",
    section: "Gestão imobiliária",
    description: "Chamados, fornecedores, ordens de serviço e SLA.",
    defaultRoles: ["admin"],
  },
  {
    id: "admin.finance",
    label: "Receita",
    path: "/admin/finance",
    area: "admin",
    section: "Financeiro",
    description: "Receita, fluxo financeiro e indicadores.",
    defaultRoles: ["admin"],
  },
  {
    id: "admin.transactions",
    label: "Transações",
    path: "/admin/transactions",
    area: "admin",
    section: "Financeiro",
    description: "Movimentações financeiras e histórico transacional.",
    defaultRoles: ["admin"],
  },
  {
    id: "admin.payouts",
    label: "Repasses",
    path: "/admin/payouts",
    area: "admin",
    section: "Financeiro",
    description: "Repasses para proprietários e investidores.",
    defaultRoles: ["admin"],
  },
  {
    id: "admin.investor_reports",
    label: "Relatórios de investidores",
    path: "/admin/investor-reports",
    area: "admin",
    section: "Financeiro",
    description: "Relatórios e demonstrativos de investimento.",
    defaultRoles: ["admin"],
  },
  {
    id: "admin.fractional",
    label: "Propriedade fracionada",
    path: "/admin/fractional-ownership",
    area: "admin",
    section: "Investidores",
    description: "Frações, tokens e participação em ativos.",
    defaultRoles: ["admin"],
  },
  {
    id: "admin.portfolio",
    label: "Portfólios",
    path: "/admin/portfolio",
    area: "admin",
    section: "Investidores",
    description: "Visão agregada de portfólios por participante.",
    defaultRoles: ["admin"],
  },
  {
    id: "admin.workflows",
    label: "Workflows",
    path: "/admin/workflows",
    area: "admin",
    section: "Automação",
    description: "Fluxos e automações operacionais.",
    defaultRoles: ["admin"],
  },
  {
    id: "admin.ai",
    label: "IA e automações",
    path: "/admin/ai",
    area: "admin",
    section: "Automação",
    description: "Assistentes e automações com IA.",
    defaultRoles: ["admin"],
  },
  {
    id: "admin.notifications",
    label: "Notificações",
    path: "/admin/notifications",
    area: "admin",
    section: "Automação",
    description: "Regras e histórico de notificações.",
    defaultRoles: ["admin"],
  },
  {
    id: "admin.webhooks",
    label: "Webhooks",
    path: "/admin/webhooks",
    area: "admin",
    section: "Automação",
    description: "Eventos enviados a sistemas externos.",
    defaultRoles: ["admin"],
  },
  {
    id: "admin.crm",
    label: "CRM",
    path: "/admin/crm",
    area: "admin",
    section: "CRM",
    description: "Leads, contatos e pipeline comercial.",
    defaultRoles: ["admin"],
  },
  {
    id: "admin.follow_up",
    label: "Follow-up",
    path: "/admin/follow-up",
    area: "admin",
    section: "CRM",
    description: "Tarefas comerciais e relacionamento.",
    defaultRoles: ["admin"],
  },
  {
    id: "admin.tenant_scoring",
    label: "Score de inquilinos",
    path: "/admin/tenant-scoring",
    area: "admin",
    section: "CRM",
    description: "Análise e classificação de risco de inquilinos.",
    defaultRoles: ["admin"],
  },
  {
    id: "admin.users",
    label: "Usuários",
    path: "/admin/users",
    area: "admin",
    section: "Admin",
    description: "Lista de usuários e troca de papel.",
    defaultRoles: ["admin"],
    lockedFor: ["admin"],
  },
  {
    id: "admin.permissions",
    label: "Permissões",
    path: "/admin/permissions",
    area: "admin",
    section: "Admin",
    description: "Matriz de abas e funções por papel.",
    defaultRoles: ["admin"],
    lockedFor: ["admin"],
  },
  {
    id: "admin.legal_compliance",
    label: "Legal & Compliance",
    path: "/admin/legal-compliance",
    area: "admin",
    section: "Admin",
    description: "Cockpit jurídico, regulatório, documental, tokenização e evidências.",
    defaultRoles: ["admin"],
  },
  {
    id: "admin.jurisdictions",
    label: "Jurisdições",
    path: "/admin/jurisdictions",
    area: "admin",
    section: "LegalTech",
    description: "Pacotes regulatórios por país, versão, vigência e restrições.",
    defaultRoles: ["admin"],
  },
  {
    id: "admin.token_classifications",
    label: "Classificação de tokens",
    path: "/admin/token-classifications",
    area: "admin",
    section: "LegalTech",
    description: "Ficha jurídica obrigatória para ativos tokenizados e produtos fracionados.",
    defaultRoles: ["admin"],
  },
  {
    id: "admin.compliance_engine",
    label: "Compliance Engine",
    path: "/admin/compliance-engine",
    area: "admin",
    section: "LegalTech",
    description: "Decisões de compliance com regra, versão, fundamento e evidências.",
    defaultRoles: ["admin"],
  },
  {
    id: "admin.legal_vault",
    label: "Legal Vault",
    path: "/admin/legal-vault",
    area: "admin",
    section: "LegalTech",
    description: "Cofre documental com hash, retenção, legal hold e cadeia de custódia.",
    defaultRoles: ["admin"],
  },
  {
    id: "admin.contract_lifecycle",
    label: "CLM",
    path: "/admin/contract-lifecycle",
    area: "admin",
    section: "LegalTech",
    description: "Templates, cláusulas, revisão jurídica, assinatura e vigência.",
    defaultRoles: ["admin"],
  },
  {
    id: "admin.identity_aml",
    label: "KYC/KYB/AML",
    path: "/admin/identity-aml",
    area: "admin",
    section: "LegalTech",
    description: "Identidade, beneficiário final, sanções, PEP e origem de recursos.",
    defaultRoles: ["admin"],
  },
  {
    id: "admin.escrow_reconciliation",
    label: "Escrow & Reconciliação",
    path: "/admin/escrow-reconciliation",
    area: "admin",
    section: "LegalTech",
    description: "Pagamentos, escrow, condições precedentes, liberação e conciliação.",
    defaultRoles: ["admin"],
  },
  {
    id: "admin.audit_evidence",
    label: "Audit & Evidence",
    path: "/admin/audit-evidence",
    area: "admin",
    section: "LegalTech",
    description: "Eventos append-only, dossiês de evidência e trilha de auditoria.",
    defaultRoles: ["admin"],
  },
  {
    id: "admin.logs",
    label: "Logs",
    path: "/admin/logs",
    area: "admin",
    section: "Admin",
    description: "Atividade administrativa e auditoria.",
    defaultRoles: ["admin"],
  },
  {
    id: "admin.cms",
    label: "CMS público",
    path: "/admin/cms",
    area: "admin",
    section: "Admin",
    description: "Conteúdo da página pública e blog.",
    defaultRoles: ["admin"],
  },
  {
    id: "admin.settings",
    label: "Configurações",
    path: "/admin/settings",
    area: "admin",
    section: "Admin",
    description: "Marca, segurança, integrações e preferências.",
    defaultRoles: ["admin"],
    lockedFor: ["admin"],
  },
  {
    id: "app.dashboard",
    label: "Dashboard",
    path: "/app/dashboard",
    area: "app",
    section: "Portal",
    description: "Resumo inicial do papel ativo.",
    defaultRoles: ["owner", "tenant", "investor"],
    lockedFor: ["owner", "tenant", "investor"],
  },
  {
    id: "app.properties",
    label: "Meus imóveis",
    path: "/app/properties",
    area: "app",
    section: "Proprietário",
    description: "Imóveis vinculados ao proprietário.",
    defaultRoles: ["owner"],
  },
  {
    id: "app.calendar",
    label: "Calendário",
    path: "/app/calendar",
    area: "app",
    section: "Proprietário",
    description: "Agenda de imóveis, contratos e estadias.",
    defaultRoles: ["owner"],
  },
  {
    id: "app.finance",
    label: "Financeiro",
    path: "/app/finance",
    area: "app",
    section: "Proprietário",
    description: "Resumo financeiro dos imóveis próprios.",
    defaultRoles: ["owner"],
  },
  {
    id: "app.contracts",
    label: "Contratos",
    path: "/app/contracts",
    area: "app",
    section: "Proprietário",
    description: "Contratos dos imóveis do proprietário.",
    defaultRoles: ["owner"],
  },
  {
    id: "app.contract",
    label: "Meu contrato",
    path: "/app/contract",
    area: "app",
    section: "Inquilino",
    description: "Contrato ativo do inquilino.",
    defaultRoles: ["tenant"],
  },
  {
    id: "app.payments",
    label: "Pagamentos",
    path: "/app/payments",
    area: "app",
    section: "Inquilino",
    description: "Pagamentos e boletos do contrato.",
    defaultRoles: ["tenant"],
  },
  {
    id: "app.maintenance",
    label: "Manutenção",
    path: "/app/maintenance",
    area: "app",
    section: "Operação",
    description: "Chamados de manutenção conforme papel.",
    defaultRoles: ["owner", "tenant"],
  },
  {
    id: "app.messages",
    label: "Mensagens",
    path: "/app/messages",
    area: "app",
    section: "Operação",
    description: "Conversas entre inquilino, proprietário e operação.",
    defaultRoles: ["tenant"],
  },
  {
    id: "app.investor_portfolio",
    label: "Meu portfólio",
    path: "/app/investor-portfolio",
    area: "app",
    section: "Investidor",
    description: "Frações, tokens e ativos do investidor.",
    defaultRoles: ["investor"],
  },
  {
    id: "app.investor_earnings",
    label: "Rendimentos",
    path: "/app/investor-earnings",
    area: "app",
    section: "Investidor",
    description: "Rendimentos e distribuição de receitas.",
    defaultRoles: ["investor"],
  },
  {
    id: "app.investor_documents",
    label: "Documentos",
    path: "/app/investor-documents",
    area: "app",
    section: "Investidor",
    description: "Contratos, comprovantes e documentos do investidor.",
    defaultRoles: ["investor"],
  },
  {
    id: "app.profile",
    label: "Perfil",
    path: "/app/profile",
    area: "app",
    section: "Conta",
    description: "Dados da conta, contato e preferências pessoais.",
    defaultRoles: ["owner", "tenant", "investor"],
    lockedFor: ["owner", "tenant", "investor"],
  },
];

export const roleCapabilities: RoleCapability[] = [
  {
    id: "admin.manage_users",
    label: "Gerenciar usuários e papéis",
    description: "Pode alterar papel, revisar cadastro e administrar usuários.",
    section: "Governança",
    defaultRoles: ["admin"],
    availableFor: ["admin"],
    lockedFor: ["admin"],
  },
  {
    id: "admin.manage_permissions",
    label: "Editar matriz de permissões",
    description: "Pode definir abas e funções de todos os papéis.",
    section: "Governança",
    defaultRoles: ["admin"],
    availableFor: ["admin"],
    lockedFor: ["admin"],
  },
  {
    id: "admin.manage_platform",
    label: "Configurar plataforma",
    description: "Marca, CMS, integrações, segurança e preferências globais.",
    section: "Governança",
    defaultRoles: ["admin"],
    availableFor: ["admin"],
  },
  {
    id: "admin.manage_legal_compliance",
    label: "Gerenciar LegalTech e compliance",
    description:
      "Pode configurar jurisdições, gates, classificação jurídica, vault, legal holds e evidências.",
    section: "Governança",
    defaultRoles: ["admin"],
    availableFor: ["admin"],
  },
  {
    id: "admin.manage_regulatory_rule_packs",
    label: "Gerenciar rule packs regulatórios",
    description: "Pode editar jurisdições, versões, regras, vigências e restrições operacionais.",
    section: "LegalTech",
    defaultRoles: ["admin"],
    availableFor: ["admin"],
  },
  {
    id: "admin.manage_token_classification",
    label: "Gerenciar classificação jurídica de tokens",
    description: "Pode preparar records jurídicos para tokens, frações, ofertas e transferências.",
    section: "LegalTech",
    defaultRoles: ["admin"],
    availableFor: ["admin"],
  },
  {
    id: "admin.manage_legal_vault",
    label: "Gerenciar Legal Vault",
    description: "Pode controlar retenção, legal hold, hashes, versões documentais e evidências.",
    section: "LegalTech",
    defaultRoles: ["admin"],
    availableFor: ["admin"],
  },
  {
    id: "admin.manage_identity_aml",
    label: "Gerenciar KYC, KYB e AML",
    description: "Pode revisar identidade, beneficiário final, sanções, PEP e origem de recursos.",
    section: "LegalTech",
    defaultRoles: ["admin"],
    availableFor: ["admin"],
  },
  {
    id: "admin.manage_operations",
    label: "Gerenciar operação imobiliária",
    description: "Imóveis, contratos, manutenção, calendário, CRM e marketplace.",
    section: "Operação",
    defaultRoles: ["admin"],
    availableFor: ["admin"],
  },
  {
    id: "admin.manage_finance",
    label: "Gerenciar financeiro",
    description: "Pagamentos, transações, repasses, relatórios e comissões.",
    section: "Financeiro",
    defaultRoles: ["admin"],
    availableFor: ["admin"],
  },
  {
    id: "admin.manage_investors",
    label: "Gerenciar investidores e tokenização",
    description: "Portfólios, frações, relatórios e oportunidades tokenizadas.",
    section: "Investidores",
    defaultRoles: ["admin"],
    availableFor: ["admin"],
  },
  {
    id: "owner.manage_properties",
    label: "Cadastrar e editar imóveis",
    description: "Pode manter dados, fotos e disponibilidade dos próprios imóveis.",
    section: "Imóveis",
    defaultRoles: ["owner"],
    availableFor: ["owner"],
  },
  {
    id: "owner.manage_contracts",
    label: "Gerenciar contratos dos próprios imóveis",
    description: "Pode acompanhar vigência, partes, anexos e histórico.",
    section: "Contratos",
    defaultRoles: ["owner"],
    availableFor: ["owner"],
  },
  {
    id: "owner.view_finance",
    label: "Ver financeiro próprio",
    description: "Pode acessar receitas, pagamentos e indicadores dos imóveis vinculados.",
    section: "Financeiro",
    defaultRoles: ["owner"],
    availableFor: ["owner"],
  },
  {
    id: "owner.manage_maintenance",
    label: "Gerenciar manutenção",
    description: "Pode acompanhar chamados e aprovar encaminhamentos nos próprios imóveis.",
    section: "Operação",
    defaultRoles: ["owner"],
    availableFor: ["owner"],
  },
  {
    id: "tenant.view_contract",
    label: "Ver contrato próprio",
    description: "Pode consultar contrato, imóvel e período de locação.",
    section: "Contrato",
    defaultRoles: ["tenant"],
    availableFor: ["tenant"],
  },
  {
    id: "tenant.view_payments",
    label: "Ver pagamentos próprios",
    description: "Pode consultar boletos, pagamentos e histórico financeiro do contrato.",
    section: "Financeiro",
    defaultRoles: ["tenant"],
    availableFor: ["tenant"],
  },
  {
    id: "tenant.create_maintenance",
    label: "Abrir chamados de manutenção",
    description: "Pode registrar e acompanhar solicitações do imóvel alugado.",
    section: "Operação",
    defaultRoles: ["tenant"],
    availableFor: ["tenant"],
  },
  {
    id: "tenant.send_messages",
    label: "Enviar mensagens",
    description: "Pode conversar com dono, imobiliária ou operação.",
    section: "Comunicação",
    defaultRoles: ["tenant"],
    availableFor: ["tenant"],
  },
  {
    id: "investor.view_portfolio",
    label: "Ver portfólio de investimentos",
    description: "Pode acessar frações, tokens e ativos em carteira.",
    section: "Portfólio",
    defaultRoles: ["investor"],
    availableFor: ["investor"],
  },
  {
    id: "investor.view_earnings",
    label: "Ver rendimentos",
    description: "Pode acompanhar receitas, distribuições e projeções.",
    section: "Financeiro",
    defaultRoles: ["investor"],
    availableFor: ["investor"],
  },
  {
    id: "investor.view_documents",
    label: "Ver documentos de investimento",
    description: "Pode consultar contratos, comprovantes e histórico documental.",
    section: "Documentos",
    defaultRoles: ["investor"],
    availableFor: ["investor"],
  },
  {
    id: "investor.view_opportunities",
    label: "Ver oportunidades tokenizadas",
    description: "Pode acompanhar ofertas e novos ativos elegíveis.",
    section: "Mercado",
    defaultRoles: ["investor"],
    availableFor: ["investor"],
  },
];

export const defaultRolePermissions: RolePermissions = roleOrder.reduce((acc, role) => {
  acc[role] = {
    routes: permissionRoutes
      .filter((route) => route.defaultRoles.includes(role) || route.lockedFor?.includes(role))
      .map((route) => route.id),
    capabilities: roleCapabilities
      .filter(
        (capability) =>
          capability.defaultRoles.includes(role) || capability.lockedFor?.includes(role),
      )
      .map((capability) => capability.id),
  };
  return acc;
}, {} as RolePermissions);

export function normalizeRolePermissions(raw: unknown): RolePermissions {
  const source = (raw && typeof raw === "object" ? raw : {}) as Partial<
    Record<UserRole, Partial<RolePermissionState>>
  >;

  return roleOrder.reduce((acc, role) => {
    const defaultState = defaultRolePermissions[role];
    const sourceState = source[role];
    const sourceRoutes = Array.isArray(sourceState?.routes)
      ? sourceState.routes
      : defaultState.routes;
    const sourceCapabilities = Array.isArray(sourceState?.capabilities)
      ? sourceState.capabilities
      : defaultState.capabilities;

    const lockedRoutes = permissionRoutes
      .filter((route) => route.lockedFor?.includes(role))
      .map((route) => route.id);
    const lockedCapabilities = roleCapabilities
      .filter((capability) => capability.lockedFor?.includes(role))
      .map((capability) => capability.id);
    const validRoutes = new Set(
      permissionRoutes
        .filter((route) => (route.area === "admin" ? role === "admin" : role !== "admin"))
        .map((route) => route.id),
    );
    const validCapabilities = new Set(
      roleCapabilities
        .filter((capability) => capability.availableFor.includes(role))
        .map((capability) => capability.id),
    );

    acc[role] = {
      routes: unique([...sourceRoutes, ...lockedRoutes].filter((id) => validRoutes.has(id))),
      capabilities: unique(
        [...sourceCapabilities, ...lockedCapabilities].filter((id) => validCapabilities.has(id)),
      ),
    };
    return acc;
  }, {} as RolePermissions);
}

export function parseRolePermissionsData(data: unknown): RolePermissions {
  const value = (data && typeof data === "object" ? data : {}) as { config?: unknown };
  if (typeof value.config === "string") {
    try {
      return normalizeRolePermissions(JSON.parse(value.config));
    } catch {
      return defaultRolePermissions;
    }
  }
  return normalizeRolePermissions(value.config ?? data);
}

export function toRolePermissionsData(permissions: RolePermissions) {
  return {
    config: JSON.stringify(normalizeRolePermissions(permissions)),
  };
}

export function isPermissionLocked(role: UserRole, id: string, type: "route" | "capability") {
  if (type === "route") {
    return permissionRoutes.some((route) => route.id === id && route.lockedFor?.includes(role));
  }
  return roleCapabilities.some(
    (capability) => capability.id === id && capability.lockedFor?.includes(role),
  );
}

export function getPermissionRouteByPath(pathname: string) {
  return permissionRoutes.find((route) => route.path === pathname);
}

export function isPathAllowedForRole(
  role: UserRole | null,
  pathname: string,
  permissions: RolePermissions,
) {
  if (!role) return false;
  if (pathname === "/admin" && role === "admin") return true;
  if (pathname === "/app" && role !== "admin") return true;
  const route = getPermissionRouteByPath(pathname);
  if (!route) return true;
  if (route.area === "admin" && role !== "admin") return false;
  if (route.area === "app" && role === "admin") return false;
  if (route.lockedFor?.includes(role)) return true;
  return permissions[role]?.routes.includes(route.id) ?? false;
}

export function getFirstAllowedPath(
  role: UserRole,
  area: PermissionArea,
  permissions: RolePermissions,
) {
  const route = permissionRoutes.find(
    (item) =>
      item.area === area &&
      (item.lockedFor?.includes(role) || permissions[role]?.routes.includes(item.id)),
  );
  return route?.path ?? (area === "admin" ? "/admin/permissions" : "/app/dashboard");
}

export function routeIsAllowed(role: UserRole, routeId: string, permissions: RolePermissions) {
  if (isPermissionLocked(role, routeId, "route")) return true;
  return permissions[role]?.routes.includes(routeId) ?? false;
}

export function capabilityIsAllowed(
  role: UserRole,
  capabilityId: string,
  permissions: RolePermissions,
) {
  if (isPermissionLocked(role, capabilityId, "capability")) return true;
  return permissions[role]?.capabilities.includes(capabilityId) ?? false;
}

export function useRolePermissions() {
  const [permissions, setPermissions] = useState<RolePermissions>(defaultRolePermissions);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from("site_content")
      .select("data")
      .eq("section_key", ROLE_PERMISSIONS_SECTION_KEY)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return;
        setPermissions(parseRolePermissionsData(data?.data));
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { permissions, setPermissions, loading };
}

function unique(values: string[]) {
  return Array.from(new Set(values));
}

import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, Building2, Calendar, TrendingUp, FileText, Wrench,
  CreditCard, MessageSquare, LogOut,
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar,
} from "@/components/ui/sidebar";
import { Logo, LogoMark } from "@/components/brand/Logo";
import { useAuthUser, initials } from "@/lib/auth";
import type { UserRole } from "@/lib/auth";

type Item = { title: string; icon: any; to: string };

const ownerItems: Item[] = [
  { title: "Dashboard", icon: LayoutDashboard, to: "/app/dashboard" },
  { title: "Meus imóveis", icon: Building2, to: "/app/properties" },
  { title: "Calendário", icon: Calendar, to: "/app/calendar" },
  { title: "Financeiro", icon: TrendingUp, to: "/app/finance" },
  { title: "Contratos", icon: FileText, to: "/app/contracts" },
  { title: "Manutenção", icon: Wrench, to: "/app/maintenance" },
];

const tenantItems: Item[] = [
  { title: "Dashboard", icon: LayoutDashboard, to: "/app/dashboard" },
  { title: "Meu contrato", icon: FileText, to: "/app/contract" },
  { title: "Pagamentos", icon: CreditCard, to: "/app/payments" },
  { title: "Manutenção", icon: Wrench, to: "/app/maintenance" },
  { title: "Mensagens", icon: MessageSquare, to: "/app/messages" },
];

export function UserSidebar({ role }: { role: UserRole | null }) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { user, signOut } = useAuthUser();
  const items = role === "owner" ? ownerItems : tenantItems;
  const displayName = (user?.user_metadata?.name as string | undefined) ?? user?.email ?? "";
  const roleLabel = role === "owner" ? "Dono de imóvel" : "Inquilino";

  return (
    <Sidebar collapsible="icon" className="border-r border-white/10 bg-sidebar/70 backdrop-blur-xl">
      <SidebarHeader className="border-b border-white/10">
        <div className="flex items-center gap-2 px-2 py-2">
          {collapsed ? <LogoMark size="md" /> : <Logo />}
        </div>
        {!collapsed && (
          <div className="px-2 pb-2">
            <div className="flex items-center gap-2 rounded-xl border border-border bg-secondary/50 px-2.5 py-2 text-xs">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-emerald text-[10px] font-bold text-white">
                {initials(displayName)}
              </div>
              <div className="min-w-0 text-left">
                <div className="truncate text-xs font-semibold">{displayName}</div>
                <div className="text-[10px] text-muted-foreground">{roleLabel}</div>
              </div>
            </div>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className="gap-0">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
            {roleLabel}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={path === item.to} tooltip={item.title}>
                    <Link
                      to={item.to}
                      className="flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors data-[status=active]:bg-foreground data-[status=active]:text-background"
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span className="truncate">{item.title}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {!collapsed && (
          <div className="mt-auto m-3">
            <button
              onClick={() => signOut()}
              className="flex w-full items-center gap-2 rounded-xl border border-white/10 bg-secondary/40 px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              <LogOut className="h-3.5 w-3.5" /> Sair
            </button>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}

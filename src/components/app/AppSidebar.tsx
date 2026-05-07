import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, Building2, Coins, ShoppingBag, FileText, CreditCard, BarChart3,
  MessageSquare, Calendar, Hotel, Home, Sparkles, Wrench, Brush, BedDouble,
  TrendingUp, ArrowLeftRight, Banknote, FileBarChart, PieChart, Layers,
  Boxes, Lightbulb, Briefcase, ShieldCheck, Truck, Workflow, Bot, Bell,
  Webhook, Users, GitBranch, UserCheck, ClipboardList, KeyRound, ScrollText,
  Settings, Lock, Search, ChevronDown,
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar,
} from "@/components/ui/sidebar";
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Logo, LogoMark } from "@/components/brand/Logo";
import { useBrand } from "@/components/brand/BrandProvider";
import { cn } from "@/lib/utils";

// ===== Sidebar configuration (modular, easy to extend) =====
type Item = { title: string; icon: any; to?: string; section: string };
type Group = { label: string; items: Item[] };

const groups: Group[] = [
  {
    label: "Main",
    items: [
      { title: "Dashboard", icon: LayoutDashboard, to: "/app/dashboard", section: "Main" },
      { title: "Properties", icon: Building2, to: "/app/properties", section: "Main" },
      { title: "Investments", icon: Coins, to: "/app/investor", section: "Main" },
      { title: "Marketplace", icon: ShoppingBag, to: "/app/marketplace", section: "Main" },
      { title: "Contracts", icon: FileText, to: "/app/contracts", section: "Main" },
      { title: "Payments", icon: CreditCard, section: "Main" },
      { title: "Analytics", icon: BarChart3, to: "/app/finance", section: "Main" },
      { title: "Messages", icon: MessageSquare, section: "Main" },
      { title: "Calendar", icon: Calendar, section: "Main" },
    ],
  },
  {
    label: "Property Management",
    items: [
      { title: "All Properties", icon: Building2, to: "/app/properties", section: "Property Management" },
      { title: "Short Stay", icon: Hotel, section: "Property Management" },
      { title: "Long Stay", icon: Home, section: "Property Management" },
      { title: "Smart Pricing", icon: Sparkles, section: "Property Management" },
      { title: "Maintenance", icon: Wrench, section: "Property Management" },
      { title: "Cleaning", icon: Brush, section: "Property Management" },
      { title: "Occupancy", icon: BedDouble, section: "Property Management" },
    ],
  },
  {
    label: "Financial",
    items: [
      { title: "Revenue", icon: TrendingUp, to: "/app/finance", section: "Financial" },
      { title: "Transactions", icon: ArrowLeftRight, section: "Financial" },
      { title: "Payouts", icon: Banknote, section: "Financial" },
      { title: "Investor Reports", icon: FileBarChart, section: "Financial" },
      { title: "ROI Analytics", icon: PieChart, section: "Financial" },
    ],
  },
  {
    label: "Investors",
    items: [
      { title: "Fractional Ownership", icon: Layers, section: "Investors" },
      { title: "Tokenized Assets", icon: Coins, to: "/app/investor", section: "Investors" },
      { title: "Investment Opportunities", icon: Sparkles, section: "Investors" },
      { title: "Portfolio", icon: Boxes, section: "Investors" },
    ],
  },
  {
    label: "Services",
    items: [
      { title: "Cleaning", icon: Brush, section: "Services" },
      { title: "Repairs", icon: Wrench, section: "Services" },
      { title: "Interior Design", icon: Lightbulb, section: "Services" },
      { title: "Insurance", icon: ShieldCheck, section: "Services" },
      { title: "Moving Services", icon: Truck, section: "Services" },
    ],
  },
  {
    label: "Automation",
    items: [
      { title: "Workflows", icon: Workflow, section: "Automation" },
      { title: "AI Automations", icon: Bot, to: "/app/ai", section: "Automation" },
      { title: "Notifications", icon: Bell, section: "Automation" },
      { title: "Webhooks", icon: Webhook, section: "Automation" },
    ],
  },
  {
    label: "CRM",
    items: [
      { title: "Leads", icon: Users, to: "/app/crm", section: "CRM" },
      { title: "Pipeline", icon: GitBranch, section: "CRM" },
      { title: "Follow-up", icon: ClipboardList, section: "CRM" },
      { title: "Tenant Scoring", icon: UserCheck, section: "CRM" },
    ],
  },
  {
    label: "Admin",
    items: [
      { title: "Users", icon: Users, section: "Admin" },
      { title: "Permissions", icon: KeyRound, section: "Admin" },
      { title: "Security", icon: Lock, section: "Admin" },
      { title: "Logs", icon: ScrollText, section: "Admin" },
      { title: "Settings", icon: Settings, to: "/app/settings", section: "Admin" },
    ],
  },
];

function ItemLink({ item, active, collapsed }: { item: Item; active: boolean; collapsed: boolean }) {
  const className = cn(
    "flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
    active
      ? "bg-foreground text-background"
      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
  );
  const content = (
    <>
      <item.icon className="h-4 w-4 shrink-0" />
      {!collapsed && <span className="truncate">{item.title}</span>}
    </>
  );

  if (item.to) {
    return (
      <Link to={item.to} className={className}>
        {content}
      </Link>
    );
  }
  return (
    <Link
      to="/app/coming-soon"
      search={{ section: item.section, page: item.title }}
      className={className}
    >
      {content}
    </Link>
  );
}

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const path = useRouterState({ select: (s) => s.location.pathname });
  const brand = useBrand();

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarHeader className="border-b border-border">
        <div className="flex items-center gap-2 px-2 py-2">
          {collapsed ? <LogoMark size="md" /> : <Logo />}
        </div>
        {!collapsed && (
          <div className="px-2 pb-2">
            <button className="flex w-full items-center justify-between rounded-xl border border-border bg-secondary/50 px-2.5 py-2 text-xs hover:bg-secondary">
              <div className="flex items-center gap-2 min-w-0">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-emerald to-skyblue text-[10px] font-bold text-white">
                  {brand.shortName}
                </div>
                <div className="text-left min-w-0">
                  <div className="truncate text-xs font-semibold">Portfolio Alpha</div>
                  <div className="text-[10px] text-muted-foreground">12 properties</div>
                </div>
              </div>
              <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            </button>
            <div className="mt-2 flex items-center gap-2 rounded-xl border border-border bg-secondary/30 px-2.5 py-1.5">
              <Search className="h-3.5 w-3.5 text-muted-foreground" />
              <input
                placeholder="Search…"
                className="w-full bg-transparent text-xs placeholder:text-muted-foreground focus:outline-none"
              />
              <kbd className="rounded bg-background px-1 py-0.5 text-[9px] text-muted-foreground">⌘K</kbd>
            </div>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className="gap-0">
        {groups.map((group) => {
          const hasActive = group.items.some((i) => i.to && path === i.to);
          // Collapsible only when expanded; in icon mode, render flat list.
          if (collapsed) {
            return (
              <SidebarGroup key={group.label}>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {group.items.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild tooltip={item.title} isActive={!!item.to && path === item.to}>
                          <ItemLink item={item} active={!!item.to && path === item.to} collapsed />
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            );
          }
          return (
            <Collapsible key={group.label} defaultOpen={hasActive || group.label === "Main"} className="group/collapsible">
              <SidebarGroup>
                <SidebarGroupLabel asChild>
                  <CollapsibleTrigger className="flex w-full items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70 hover:text-foreground">
                    {group.label}
                    <ChevronDown className="h-3.5 w-3.5 transition-transform group-data-[state=closed]/collapsible:-rotate-90" />
                  </CollapsibleTrigger>
                </SidebarGroupLabel>
                <CollapsibleContent>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {group.items.map((item) => (
                        <SidebarMenuItem key={item.title}>
                          <SidebarMenuButton asChild isActive={!!item.to && path === item.to}>
                            <ItemLink item={item} active={!!item.to && path === item.to} collapsed={false} />
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </CollapsibleContent>
              </SidebarGroup>
            </Collapsible>
          );
        })}

        {!collapsed && (
          <div className="m-3 rounded-2xl bg-gradient-to-br from-emerald/15 to-skyblue/15 p-4">
            <div className="font-display text-sm font-semibold">Upgrade to Pro</div>
            <div className="mt-1 text-xs text-muted-foreground">Unlimited AI pricing & contracts.</div>
            <button className="mt-3 w-full rounded-full bg-foreground py-2 text-xs font-semibold text-background">Upgrade</button>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}

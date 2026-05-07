import { createFileRoute, Outlet, Link, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import {
  LayoutDashboard, Building2, Home, Coins, ShoppingBag, Bot, Users,
  BarChart3, FileText, Settings, Bell, Search, Menu, X, ChevronDown, Plus, Building
} from "lucide-react";

export const Route = createFileRoute("/app")({
  component: AppLayout,
});

const nav = [
  { to: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/app/properties", label: "Properties", icon: Building2 },
  { to: "/app/owner", label: "Owner Hub", icon: Home },
  { to: "/app/investor", label: "Investor", icon: Coins },
  { to: "/app/marketplace", label: "Marketplace", icon: ShoppingBag },
  { to: "/app/ai", label: "AI Center", icon: Bot },
  { to: "/app/crm", label: "CRM Leads", icon: Users },
  { to: "/app/finance", label: "Financials", icon: BarChart3 },
  { to: "/app/contracts", label: "Contracts", icon: FileText },
  { to: "/app/settings", label: "Settings", icon: Settings },
];

function AppLayout() {
  const [open, setOpen] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="flex min-h-screen bg-secondary/30">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-72 transform border-r border-border bg-card transition-transform lg:static lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-16 items-center justify-between border-b border-border px-5">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald to-skyblue shadow-glow">
              <Building className="h-5 w-5 text-white" />
            </div>
            <span className="font-display text-lg font-bold">Property<span className="gradient-text">OS</span></span>
          </Link>
          <button onClick={() => setOpen(false)} className="lg:hidden">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-3">
          <button className="flex w-full items-center justify-between rounded-2xl border border-border bg-secondary/50 px-3 py-2.5 text-sm hover:bg-secondary">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-emerald to-skyblue text-xs font-bold text-white">PO</div>
              <div className="text-left">
                <div className="font-semibold">Portfolio Alpha</div>
                <div className="text-[10px] text-muted-foreground">12 properties</div>
              </div>
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        <nav className="px-3 pb-6">
          {nav.map((n) => {
            const active = path === n.to;
            return (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  active ? "bg-foreground text-background shadow-soft" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <n.icon className="h-4 w-4" />
                {n.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 m-3 rounded-2xl bg-gradient-to-br from-emerald/15 to-skyblue/15 p-4">
          <div className="font-display text-sm font-semibold">Upgrade to Pro</div>
          <div className="mt-1 text-xs text-muted-foreground">Unlimited AI pricing & contracts.</div>
          <button className="mt-3 w-full rounded-full bg-foreground py-2 text-xs font-semibold text-background">Upgrade</button>
        </div>
      </aside>

      {open && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setOpen(false)} />}

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-xl md:px-6">
          <button onClick={() => setOpen(true)} className="lg:hidden">
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex flex-1 items-center gap-2 rounded-full border border-border bg-secondary/40 px-4 py-2 max-w-md">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input className="w-full bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none" placeholder="Search properties, tenants, contracts…" />
            <kbd className="hidden rounded bg-background px-1.5 py-0.5 text-[10px] text-muted-foreground md:inline">⌘K</kbd>
          </div>
          <button className="hidden items-center gap-2 rounded-full bg-gradient-to-r from-emerald to-emerald-glow px-4 py-2 text-sm font-medium text-white shadow-glow md:flex">
            <Plus className="h-4 w-4" /> Add property
          </button>
          <button className="relative flex h-9 w-9 items-center justify-center rounded-full hover:bg-secondary">
            <Bell className="h-4 w-4" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-emerald animate-pulse-glow" />
          </button>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-skyblue to-emerald text-xs font-bold text-white">JD</div>
        </header>

        <main className="flex-1 p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Bell, Search, Plus } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app/AppSidebar";

export const Route = createFileRoute("/app")({
  component: AppLayout,
});

function AppLayout() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-secondary/30">
        <AppSidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-xl md:px-6">
            <SidebarTrigger />
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
    </SidebarProvider>
  );
}

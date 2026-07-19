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
      <div className="relative flex min-h-screen w-full overflow-hidden bg-secondary/30">
        {/* Ambient drifting glow — gives the glass panels something to catch light from */}
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
          <div className="absolute -left-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-emerald/20 blur-[110px] animate-drift-slow" />
          <div className="absolute right-[-10rem] top-1/3 h-[24rem] w-[24rem] rounded-full bg-skyblue/15 blur-[110px] animate-drift-slower" />
          <div className="absolute bottom-[-8rem] left-1/3 h-[22rem] w-[22rem] rounded-full bg-emerald-glow/15 blur-[110px] animate-drift-slow" />
        </div>

        <AppSidebar />

        <div className="relative z-10 flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-white/10 bg-background/70 px-4 backdrop-blur-xl md:px-6">
            <SidebarTrigger />
            <div className="flex flex-1 items-center gap-2 rounded-full border border-white/10 bg-secondary/40 px-4 py-2 max-w-md backdrop-blur-sm">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input className="w-full bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none" placeholder="Search properties, tenants, contracts…" />
              <kbd className="hidden rounded bg-background px-1.5 py-0.5 text-[10px] text-muted-foreground md:inline">⌘K</kbd>
            </div>
            <button className="hidden items-center gap-2 rounded-full bg-emerald px-4 py-2 text-sm font-medium text-white shadow-glow transition-transform hover:scale-105 md:flex">
              <Plus className="h-4 w-4" /> Add property
            </button>
            <button className="relative flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-secondary">
              <Bell className="h-4 w-4" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-emerald animate-pulse-glow" />
            </button>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-skyblue text-xs font-bold text-white">JD</div>
          </header>

          <main className="flex-1 p-4 md:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

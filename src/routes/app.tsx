import { createFileRoute, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import { Bell, LogOut } from "lucide-react";
import { toast } from "sonner";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { UserSidebar } from "@/components/app/UserSidebar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { supabase } from "@/lib/supabase";
import { useAuthUser, useUserRole, useAvatarUrl, initials } from "@/lib/auth";

export const Route = createFileRoute("/app")({
  beforeLoad: async () => {
    let session = null;
    try {
      const { data } = await supabase.auth.getSession();
      session = data.session;
    } catch {
      session = null;
    }
    if (!session) {
      throw redirect({ to: "/login" });
    }
    // /app is the SaaS portal for owners and tenants. The super admin has
    // its own dedicated console at /admin instead.
    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", session.user.id)
      .maybeSingle();
    if (profile?.role === "admin") {
      throw redirect({ to: "/admin/dashboard" });
    }
  },
  component: UserLayout,
});

function UserLayout() {
  const navigate = useNavigate();
  const { user, signOut } = useAuthUser();
  const { role } = useUserRole();
  const avatarUrl = useAvatarUrl();
  const displayName = (user?.user_metadata?.name as string | undefined) ?? user?.email ?? "";

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/login" });
  };

  return (
    <SidebarProvider>
      <div className="relative flex min-h-screen w-full overflow-hidden bg-secondary/30">
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
          <div className="absolute -left-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-emerald/20 blur-[110px] animate-drift-slow" />
          <div className="absolute right-[-10rem] top-1/3 h-[24rem] w-[24rem] rounded-full bg-skyblue/15 blur-[110px] animate-drift-slower" />
          <div className="absolute bottom-[-8rem] left-1/3 h-[22rem] w-[22rem] rounded-full bg-emerald-glow/15 blur-[110px] animate-drift-slow" />
        </div>

        <UserSidebar role={role} />

        <div className="relative z-10 flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 flex h-16 items-center justify-end gap-3 border-b border-white/10 bg-background/70 px-4 backdrop-blur-xl md:px-6">
            <SidebarTrigger className="mr-auto" />
            <button
              onClick={() => toast.info("Nenhuma notificação real no momento.")}
              className="relative flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-secondary"
            >
              <Bell className="h-4 w-4" />
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-skyblue text-xs font-bold text-white">
                  {avatarUrl ? <img src={avatarUrl} alt="" className="h-full w-full object-cover" /> : initials(displayName)}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5 text-xs text-muted-foreground truncate">{user?.email}</div>
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" /> Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </header>

          <main className="flex-1 p-4 md:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

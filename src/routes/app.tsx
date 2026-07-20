import {
  createFileRoute,
  Outlet,
  redirect,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";
import { useEffect } from "react";
import { Bell, LogOut, Search } from "lucide-react";
import { toast } from "sonner";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { UserSidebar } from "@/components/app/UserSidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/lib/supabase";
import { getSafeSession, useAuthUser, useAvatarUrl, useUserRole, initials } from "@/lib/auth";
import {
  getFirstAllowedPath,
  isPathAllowedForRole,
  useRolePermissions,
} from "@/lib/rolePermissions";
import { SaasCommandMenu } from "@/components/app/SaasCommandMenu";

export const Route = createFileRoute("/app")({
  beforeLoad: async () => {
    if (typeof window === "undefined") {
      return;
    }

    const session = await getSafeSession();
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
  const { user, loading: authLoading, signOut } = useAuthUser();
  const { role, loading: roleLoading } = useUserRole();
  const { permissions, loading: permissionsLoading } = useRolePermissions();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const avatarUrl = useAvatarUrl();
  const displayName = (user?.user_metadata?.name as string | undefined) ?? user?.email ?? "";

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate({ to: "/login", replace: true });
      return;
    }
    if (roleLoading) return;
    if (role === "admin") {
      navigate({ to: "/admin/dashboard", replace: true });
      return;
    }
    if (!permissionsLoading && role && !isPathAllowedForRole(role, pathname, permissions)) {
      navigate({ to: getFirstAllowedPath(role, "app", permissions), replace: true });
    }
  }, [authLoading, navigate, permissions, permissionsLoading, pathname, role, roleLoading, user]);

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/login" });
  };

  if (authLoading || roleLoading || permissionsLoading || !user || role === "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="rounded-2xl border border-glass-border bg-card/70 px-6 py-4 text-sm text-muted-foreground shadow-soft backdrop-blur-xl">
          Restaurando sessão segura...
        </div>
      </div>
    );
  }

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
          <header className="sticky top-0 z-20 flex h-16 items-center justify-end gap-3 border-b border-glass-border bg-background/70 px-4 backdrop-blur-xl md:px-6">
            <SidebarTrigger className="mr-auto" />
            {role && (
              <SaasCommandMenu
                role={role}
                permissions={permissions}
                trigger={(open) => (
                  <button
                    type="button"
                    onClick={open}
                    className="flex items-center gap-2 rounded-full border border-glass-border bg-secondary/40 px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  >
                    <Search className="h-4 w-4" />
                    <span className="hidden sm:inline">Procurar</span>
                    <kbd className="hidden rounded bg-background px-1.5 py-0.5 text-[10px] text-muted-foreground md:inline">
                      ⌘K
                    </kbd>
                  </button>
                )}
              />
            )}
            <button
              onClick={() => toast.info("Nenhuma notificação real no momento.")}
              className="relative flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-secondary"
            >
              <Bell className="h-4 w-4" />
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-skyblue text-xs font-bold text-white">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    initials(displayName)
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                side="bottom"
                sideOffset={10}
                avoidCollisions={false}
                className="w-56 bg-card/95 text-foreground"
              >
                <div className="px-2 py-1.5 text-xs text-muted-foreground truncate">
                  {user?.email}
                </div>
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="text-destructive focus:text-destructive"
                >
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

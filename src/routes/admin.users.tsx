import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Users as UsersIcon, Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, Card, Badge, StatCard } from "@/components/app/ui";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/admin/users")({
  component: AdminUsers,
});

type UserRow = {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  avatar_url: string | null;
  created_at: string;
};

const roleLabels: Record<string, string> = { admin: "Super admin", owner: "Dono de imóvel", tenant: "Inquilino", investor: "Investidor" };

function initials(name: string | null) {
  return (name || "?").split(" ").filter(Boolean).map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

function AdminUsers() {
  const [users, setUsers] = useState<UserRow[] | null>(null);
  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const load = async () => {
    const { data } = await supabase
      .from("users")
      .select("id, name, email, role, avatar_url, created_at")
      .order("created_at", { ascending: false });
    setUsers(data ?? []);
  };

  useEffect(() => {
    load();
  }, []);

  const changeRole = async (id: string, role: string) => {
    const previous = users;
    setUsers((prev) => prev?.map((u) => (u.id === id ? { ...u, role } : u)) ?? null);
    const { error } = await supabase.from("users").update({ role }).eq("id", id);
    if (error) {
      setUsers(previous);
      toast.error(error.message || "Não foi possível atualizar a permissão.");
      return;
    }
    toast.success("Permissão atualizada.");
  };

  if (users === null) {
    return (
      <>
        <PageHeader title="Users" subtitle="Todos os usuários da plataforma." />
        <Card>
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Carregando…
          </div>
        </Card>
      </>
    );
  }

  const admins = users.filter((u) => u.role === "admin").length;
  const owners = users.filter((u) => u.role === "owner").length;
  const tenants = users.filter((u) => u.role === "tenant").length;
  const investors = users.filter((u) => u.role === "investor").length;

  const filtered = users
    .filter((u) => roleFilter === "all" || u.role === roleFilter)
    .filter((u) => !q || (u.name ?? "").toLowerCase().includes(q.toLowerCase()) || (u.email ?? "").toLowerCase().includes(q.toLowerCase()));

  return (
    <>
      <PageHeader title="Users" subtitle="Todos os usuários cadastrados na plataforma." />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Super admins" value={String(admins)} icon={UsersIcon} />
        <StatCard label="Donos de imóvel" value={String(owners)} icon={UsersIcon} accent="skyblue" />
        <StatCard label="Inquilinos" value={String(tenants)} icon={UsersIcon} accent="emerald" />
        <StatCard label="Investidores" value={String(investors)} icon={UsersIcon} accent="skyblue" />
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 rounded-xl border border-glass-border bg-glass-fill px-3 py-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nome ou e-mail…" className="w-56 bg-transparent text-sm outline-none" />
        </div>
        {["all", "admin", "owner", "tenant", "investor"].map((r) => (
          <button
            key={r}
            onClick={() => setRoleFilter(r)}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
              roleFilter === r ? "border-emerald/40 bg-emerald/10 text-emerald" : "border-glass-border bg-secondary/40"
            }`}
          >
            {r === "all" ? "Todos" : roleLabels[r]}
          </button>
        ))}
      </div>

      {users.length === 0 ? (
        <Card className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald shadow-glow">
            <UsersIcon className="h-6 w-6 text-white" />
          </div>
          <h2 className="font-display text-xl font-bold">Nenhum usuário ainda</h2>
        </Card>
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-glass-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-5 py-3">Usuário</th>
                <th className="px-5 py-3">E-mail</th>
                <th className="px-5 py-3">Desde</th>
                <th className="px-5 py-3">Permissão</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-b border-glass-border last:border-0">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      {u.avatar_url ? (
                        <img src={u.avatar_url} alt="" className="h-8 w-8 rounded-full object-cover" />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald/15 text-xs font-semibold text-emerald">
                          {initials(u.name)}
                        </div>
                      )}
                      <span className="font-medium">{u.name || "—"}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">{u.email || "—"}</td>
                  <td className="px-5 py-4 text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</td>
                  <td className="px-5 py-4">
                    <Select value={u.role} onValueChange={(v) => changeRole(u.id, v)}>
                      <SelectTrigger className="h-auto w-auto gap-2 rounded-full border-glass-border bg-secondary/50 px-3 py-1 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Super admin</SelectItem>
                        <SelectItem value="owner">Dono de imóvel</SelectItem>
                        <SelectItem value="tenant">Inquilino</SelectItem>
                        <SelectItem value="investor">Investidor</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </>
  );
}

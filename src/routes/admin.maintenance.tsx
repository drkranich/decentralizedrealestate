import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Wrench, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, Card, Badge, StatCard } from "@/components/app/ui";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/admin/maintenance")({
  component: AdminMaintenance,
});

type Request = {
  id: string;
  category: string;
  description: string;
  status: string;
  created_at: string;
  property_title: string;
  requester_name: string;
};

const categoryLabels: Record<string, string> = {
  plumbing: "Hidráulica",
  electrical: "Elétrica",
  appliance: "Eletrodoméstico",
  structural: "Estrutural",
  cleaning: "Limpeza",
  other: "Outro",
};

const statusFilters = ["all", "open", "in_progress", "resolved", "cancelled"];
const statusLabels: Record<string, string> = {
  all: "Todos", open: "Aberto", in_progress: "Em andamento", resolved: "Resolvido", cancelled: "Cancelado",
};

function AdminMaintenance() {
  const [requests, setRequests] = useState<Request[] | null>(null);
  const [filter, setFilter] = useState("all");

  const load = async () => {
    const { data } = await supabase
      .from("maintenance_requests")
      .select("id, category, description, status, created_at, property_id, requested_by, properties(title), users(name)")
      .order("created_at", { ascending: false });
    setRequests(
      (data ?? []).map((r: any) => ({
        id: r.id,
        category: r.category,
        description: r.description,
        status: r.status,
        created_at: r.created_at,
        property_title: r.properties?.title ?? "Imóvel",
        requester_name: r.users?.name ?? "Usuário",
      }))
    );
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    const previous = requests;
    setRequests((prev) => prev?.map((r) => (r.id === id ? { ...r, status } : r)) ?? null);
    const { error } = await supabase.from("maintenance_requests").update({ status }).eq("id", id);
    if (error) {
      setRequests(previous);
      toast.error(error.message || "Não foi possível atualizar o status.");
      return;
    }
    toast.success("Status atualizado.");
  };

  if (requests === null) {
    return (
      <>
        <PageHeader title="Maintenance" subtitle="Todos os chamados de manutenção da plataforma." />
        <Card>
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Carregando…
          </div>
        </Card>
      </>
    );
  }

  const filtered = filter === "all" ? requests : requests.filter((r) => r.status === filter);
  const open = requests.filter((r) => r.status === "open").length;
  const inProgress = requests.filter((r) => r.status === "in_progress").length;
  const resolved = requests.filter((r) => r.status === "resolved").length;

  return (
    <>
      <PageHeader title="Maintenance" subtitle="Todos os chamados de manutenção da plataforma, em todos os imóveis." />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Abertos" value={String(open)} icon={Wrench} accent="emerald" />
        <StatCard label="Em andamento" value={String(inProgress)} icon={Wrench} accent="skyblue" />
        <StatCard label="Resolvidos" value={String(resolved)} icon={Wrench} accent="emerald" />
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {statusFilters.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
              filter === s ? "border-emerald/40 bg-emerald/10 text-emerald" : "border-glass-border bg-secondary/40"
            }`}
          >
            {statusLabels[s]}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald shadow-glow">
            <Wrench className="h-6 w-6 text-white" />
          </div>
          <h2 className="font-display text-xl font-bold">Nenhum chamado ainda</h2>
          <p className="max-w-md text-sm text-muted-foreground">
            Assim que donos e inquilinos abrirem chamados de manutenção, eles aparecerão aqui.
          </p>
        </Card>
      ) : (
        <Card className="p-0">
          <div className="divide-y divide-glass-border">
            {filtered.map((r) => (
              <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald/15 text-emerald">
                    <Wrench className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 font-medium">
                      {r.property_title}
                      <Badge variant="muted">{categoryLabels[r.category] ?? r.category}</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {r.description} · aberto por {r.requester_name}
                    </div>
                  </div>
                </div>
                <Select value={r.status} onValueChange={(v) => updateStatus(r.id, v)}>
                  <SelectTrigger className="h-auto w-auto gap-2 rounded-full border-glass-border bg-secondary/50 px-3 py-1 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Aberto</SelectItem>
                    <SelectItem value="in_progress">Em andamento</SelectItem>
                    <SelectItem value="resolved">Resolvido</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        </Card>
      )}
    </>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Wrench, Plus } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, Card, Badge } from "@/components/app/ui";
import { useAuthUser, useUserRole } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

type Request = {
  id: string;
  category: string;
  description: string;
  status: string;
  created_at: string;
  property_title: string;
  property_id: string;
};

export const Route = createFileRoute("/app/maintenance")({
  component: Maintenance,
});

function Maintenance() {
  const { user } = useAuthUser();
  const { role } = useUserRole();
  const [requests, setRequests] = useState<Request[] | null>(null);
  const [myProperty, setMyProperty] = useState<{ id: string; title: string } | null>(null);
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    if (!user) return;
    if (role === "owner") {
      const { data: props } = await supabase.from("properties").select("id, title").eq("owner_id", user.id);
      const propertyIds = (props ?? []).map((p) => p.id);
      const titleById = new Map((props ?? []).map((p) => [p.id, p.title]));
      if (propertyIds.length === 0) {
        setRequests([]);
        return;
      }
      const { data } = await supabase
        .from("maintenance_requests")
        .select("id, category, description, status, created_at, property_id")
        .in("property_id", propertyIds)
        .order("created_at", { ascending: false });
      setRequests((data ?? []).map((r) => ({ ...r, property_title: titleById.get(r.property_id) ?? "Imóvel" })));
    } else {
      const { data: contract } = await supabase
        .from("contracts")
        .select("property_id, properties(title)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (contract) {
        setMyProperty({ id: contract.property_id as string, title: (contract as any).properties?.title ?? "Imóvel" });
      }
      const { data } = await supabase
        .from("maintenance_requests")
        .select("id, category, description, status, created_at, property_id")
        .eq("requested_by", user.id)
        .order("created_at", { ascending: false });
      setRequests((data ?? []).map((r) => ({ ...r, property_title: contract ? (contract as any).properties?.title ?? "Imóvel" : "Imóvel" })));
    }
  };

  useEffect(() => {
    if (role) load();
  }, [user, role]);

  const submitRequest = async () => {
    if (!user || !myProperty || !description.trim()) return;
    setSubmitting(true);
    const { error } = await supabase.from("maintenance_requests").insert({
      property_id: myProperty.id,
      requested_by: user.id,
      description: description.trim(),
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message || "Não foi possível abrir o chamado.");
      return;
    }
    toast.success("Chamado aberto com sucesso.");
    setDescription("");
    load();
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("maintenance_requests").update({ status }).eq("id", id);
    if (error) {
      toast.error(error.message || "Não foi possível atualizar o chamado.");
      return;
    }
    load();
  };

  return (
    <>
      <PageHeader
        title="Manutenção"
        subtitle={role === "owner" ? "Chamados abertos nos seus imóveis" : "Solicite e acompanhe reparos no seu imóvel"}
      />

      {role === "tenant" && (
        <Card className="mb-6">
          {myProperty ? (
            <div className="space-y-3">
              <div className="text-sm text-muted-foreground">Novo chamado para <span className="font-medium text-foreground">{myProperty.title}</span></div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva o problema…"
                className="w-full rounded-xl border border-white/10 bg-secondary/30 p-3 text-sm focus:outline-none"
                rows={3}
              />
              <button
                onClick={submitRequest}
                disabled={submitting || !description.trim()}
                className="flex items-center gap-2 rounded-full bg-emerald px-4 py-2 text-sm font-medium text-white shadow-glow disabled:opacity-50"
              >
                <Plus className="h-4 w-4" /> {submitting ? "Enviando…" : "Abrir chamado"}
              </button>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">Nenhum contrato ativo encontrado para abrir um chamado.</div>
          )}
        </Card>
      )}

      <Card>
        {requests === null ? (
          <div className="text-sm text-muted-foreground">Carregando…</div>
        ) : requests.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">Nenhum chamado de manutenção ainda.</div>
        ) : (
          <div className="space-y-3">
            {requests.map((r) => (
              <div key={r.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-secondary/30 px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald/15 text-emerald">
                    <Wrench className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-medium">{r.property_title}</div>
                    <div className="text-xs text-muted-foreground">{r.description}</div>
                  </div>
                </div>
                {role === "owner" ? (
                  <select
                    value={r.status}
                    onChange={(e) => updateStatus(r.id, e.target.value)}
                    className="rounded-full border border-white/10 bg-secondary/50 px-3 py-1 text-xs"
                  >
                    <option value="open">Aberto</option>
                    <option value="in_progress">Em andamento</option>
                    <option value="resolved">Resolvido</option>
                    <option value="cancelled">Cancelado</option>
                  </select>
                ) : (
                  <Badge variant={r.status === "resolved" ? "emerald" : "muted"}>{r.status}</Badge>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </>
  );
}

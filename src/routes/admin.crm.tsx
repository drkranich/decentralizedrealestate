import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Phone, Mail, Filter, Loader2, Search, ChevronRight, ChevronLeft, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, Card, Badge, StatCard, DemoDataBadge } from "@/components/app/ui";
import { Users, TrendingUp, Target, Zap } from "lucide-react";
import { EditLeadModal, type EditableLead } from "@/components/crm/EditLeadModal";
import { LeadActionsMenu } from "@/components/crm/LeadActionsMenu";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/admin/crm")({
  component: CRM,
});

type Lead = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  status: string | null;
  created_at: string;
  properties: { title: string } | null;
};

const stages = ["new", "qualified", "tour", "proposal", "closed"];
const stageLabels: Record<string, string> = {
  new: "New", qualified: "Qualified", tour: "Tour", proposal: "Proposal", closed: "Closed",
};

function initials(name: string) {
  return name.split(" ").filter(Boolean).map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

function CRM() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSearch, setShowSearch] = useState(false);
  const [q, setQ] = useState("");
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [editing, setEditing] = useState<EditableLead | null>(null);

  const load = async () => {
    const { data } = await supabase
      .from("leads")
      .select("id, name, email, phone, status, created_at, properties(title)")
      .order("created_at", { ascending: false });
    setLeads((data as unknown as Lead[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const moveLead = async (leadId: string, newStatus: string) => {
    const previous = leads;
    setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l)));
    const { error } = await supabase.from("leads").update({ status: newStatus }).eq("id", leadId);
    if (error) {
      setLeads(previous);
      toast.error(error.message || "Não foi possível mover o lead.");
      return;
    }
    toast.success(`Lead movido para ${stageLabels[newStatus]}.`);
  };

  const visibleLeads = q
    ? leads.filter((l) => l.name.toLowerCase().includes(q.toLowerCase()) || (l.properties?.title ?? "").toLowerCase().includes(q.toLowerCase()))
    : leads;

  const board: Record<string, Lead[]> = Object.fromEntries(stages.map((s) => [s, []]));
  for (const lead of visibleLeads) {
    const key = stages.includes(lead.status ?? "") ? (lead.status as string) : "new";
    board[key].push(lead);
  }

  const total = leads.length;

  return (
    <>
      <PageHeader title="CRM Leads" subtitle="Pipeline real de interessados nos seus imóveis. Arraste o card ou use os botões para mudar de etapa.">
        <button
          onClick={() => setShowSearch((v) => !v)}
          className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors ${showSearch ? "border-emerald/40 bg-emerald/10 text-emerald" : "border-border bg-card hover:bg-secondary"}`}
        >
          <Filter className="h-4 w-4" /> Filter
        </button>
      </PageHeader>

      {showSearch && (
        <div className="mb-2 flex items-center gap-2 rounded-full border border-border bg-secondary/40 px-4 py-2 max-w-sm">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por nome ou imóvel…"
            className="w-full bg-transparent text-sm focus:outline-none"
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Leads reais" value={String(total)} icon={Users} />
        <StatCard label="Em qualificação" value={String(board.qualified.length)} icon={Target} accent="skyblue" />
        <StatCard label="Fechados" value={String(board.closed.length)} icon={TrendingUp} />
        <div className="relative">
          <StatCard label="Score de IA" value="—" icon={Zap} accent="skyblue" />
          <div className="absolute right-3 top-3"><DemoDataBadge /></div>
        </div>
      </div>

      {loading ? (
        <div className="mt-8 flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Carregando leads…
        </div>
      ) : total === 0 ? (
        <Card className="mt-6">
          <p className="text-sm text-muted-foreground">
            Nenhum lead real ainda. Quando um interessado enviar contato para um dos seus imóveis, ele aparecerá aqui automaticamente.
          </p>
        </Card>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {stages.map((s, stageIndex) => (
            <div
              key={s}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverStage(s);
              }}
              onDragLeave={() => setDragOverStage((cur) => (cur === s ? null : cur))}
              onDrop={(e) => {
                e.preventDefault();
                const leadId = e.dataTransfer.getData("text/lead-id");
                setDragOverStage(null);
                setDraggingId(null);
                if (leadId) moveLead(leadId, s);
              }}
              className={`rounded-3xl border p-4 transition-colors ${
                dragOverStage === s ? "border-emerald/50 bg-emerald/5" : "border-border bg-card"
              }`}
            >
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold">{stageLabels[s]}</h3>
                <Badge variant="muted">{board[s].length}</Badge>
              </div>
              <div className="space-y-3">
                {board[s].map((l) => {
                  const prevStage = stages[stageIndex - 1];
                  const nextStage = stages[stageIndex + 1];
                  const isBeingDragged = draggingId === l.id;
                  return (
                    <div
                      key={l.id}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData("text/lead-id", l.id);
                        e.dataTransfer.effectAllowed = "move";
                        setDraggingId(l.id);
                      }}
                      onDragEnd={() => {
                        setDraggingId(null);
                        setDragOverStage(null);
                      }}
                      className={`cursor-grab rounded-2xl border border-border/50 bg-secondary/30 p-3 transition-all hover:border-emerald/40 hover:shadow-soft active:cursor-grabbing ${
                        isBeingDragged ? "opacity-40" : ""
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald text-[10px] font-bold text-white">
                          {initials(l.name)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-semibold truncate">{l.name}</div>
                          <div className="text-[10px] text-muted-foreground truncate">{l.properties?.title ?? "Imóvel removido"}</div>
                        </div>
                        <span onMouseDown={(e) => e.stopPropagation()} draggable={false}>
                          <LeadActionsMenu
                            leadId={l.id}
                            name={l.name}
                            onEdit={() => setEditing(l)}
                            onChanged={load}
                          />
                        </span>
                      </div>
                      <div className="mt-2 flex gap-1.5 border-t border-border/50 pt-2">
                        {l.phone && (
                          <a href={`tel:${l.phone}`} className="flex h-7 flex-1 items-center justify-center rounded-lg hover:bg-background"><Phone className="h-3 w-3" /></a>
                        )}
                        {l.email && (
                          <a href={`mailto:${l.email}`} className="flex h-7 flex-1 items-center justify-center rounded-lg hover:bg-background"><Mail className="h-3 w-3" /></a>
                        )}
                      </div>
                      <div className="mt-1.5 flex items-center gap-1.5 border-t border-border/50 pt-1.5">
                        {prevStage && (
                          <button
                            onClick={() => moveLead(l.id, prevStage)}
                            title={`Voltar para ${stageLabels[prevStage]}`}
                            className="flex h-6 flex-1 items-center justify-center gap-1 rounded-lg text-[10px] text-muted-foreground hover:bg-background hover:text-foreground"
                          >
                            <ChevronLeft className="h-3 w-3" />
                          </button>
                        )}
                        {nextStage && (
                          <button
                            onClick={() => moveLead(l.id, nextStage)}
                            className="flex h-6 flex-[3] items-center justify-center gap-1 rounded-lg bg-emerald/10 text-[10px] font-medium text-emerald hover:bg-emerald/20"
                          >
                            {s === "new" ? (
                              <>
                                <CheckCircle2 className="h-3 w-3" /> Qualificar
                              </>
                            ) : (
                              <>
                                Avançar <ChevronRight className="h-3 w-3" />
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <EditLeadModal
        lead={editing}
        onClose={() => setEditing(null)}
        onSaved={() => {
          setEditing(null);
          load();
        }}
      />
    </>
  );
}

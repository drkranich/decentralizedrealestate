import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Phone, Mail, Filter, Loader2 } from "lucide-react";
import { PageHeader, Card, Badge, StatCard, DemoDataBadge } from "@/components/app/ui";
import { Users, TrendingUp, Target, Zap } from "lucide-react";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/app/crm")({
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

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("leads")
        .select("id, name, email, phone, status, created_at, properties(title)")
        .order("created_at", { ascending: false });
      setLeads((data as unknown as Lead[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const board: Record<string, Lead[]> = Object.fromEntries(stages.map((s) => [s, []]));
  for (const lead of leads) {
    const key = stages.includes(lead.status ?? "") ? (lead.status as string) : "new";
    board[key].push(lead);
  }

  const total = leads.length;

  return (
    <>
      <PageHeader title="CRM Leads" subtitle="Pipeline real de interessados nos seus imóveis.">
        <button className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm hover:bg-secondary">
          <Filter className="h-4 w-4" /> Filter
        </button>
      </PageHeader>

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
          {stages.map((s) => (
            <div key={s} className="rounded-3xl border border-border bg-card p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold">{stageLabels[s]}</h3>
                <Badge variant="muted">{board[s].length}</Badge>
              </div>
              <div className="space-y-3">
                {board[s].map((l) => (
                  <div key={l.id} className="rounded-2xl border border-border/50 bg-secondary/30 p-3 transition-all hover:border-emerald/40 hover:shadow-soft">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald text-[10px] font-bold text-white">
                        {initials(l.name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold truncate">{l.name}</div>
                        <div className="text-[10px] text-muted-foreground truncate">{l.properties?.title ?? "Imóvel removido"}</div>
                      </div>
                    </div>
                    <div className="mt-2 flex gap-1.5 border-t border-border/50 pt-2">
                      {l.phone && (
                        <a href={`tel:${l.phone}`} className="flex h-7 flex-1 items-center justify-center rounded-lg hover:bg-background"><Phone className="h-3 w-3" /></a>
                      )}
                      {l.email && (
                        <a href={`mailto:${l.email}`} className="flex h-7 flex-1 items-center justify-center rounded-lg hover:bg-background"><Mail className="h-3 w-3" /></a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

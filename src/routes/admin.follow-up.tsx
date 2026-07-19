import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ClipboardList, Loader2, Phone, Mail } from "lucide-react";
import { PageHeader, Card, Badge, StatCard } from "@/components/app/ui";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/admin/follow-up")({
  component: FollowUp,
});

type Lead = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  status: string | null;
  created_at: string;
  property_title: string;
};

function daysSince(iso: string) {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
}

function FollowUp() {
  const [leads, setLeads] = useState<Lead[] | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("leads")
        .select("id, name, email, phone, status, created_at, properties(title)")
        .neq("status", "closed")
        .order("created_at", { ascending: true });
      setLeads((data ?? []).map((l: any) => ({ ...l, property_title: l.properties?.title ?? "Imóvel" })));
    })();
  }, []);

  if (leads === null) {
    return (
      <>
        <PageHeader title="Follow-up" subtitle="Leads que ainda precisam de acompanhamento." />
        <Card>
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Carregando…
          </div>
        </Card>
      </>
    );
  }

  const urgent = leads.filter((l) => daysSince(l.created_at) >= 3).length;
  const dueSoon = leads.filter((l) => daysSince(l.created_at) >= 1 && daysSince(l.created_at) < 3).length;

  return (
    <>
      <PageHeader title="Follow-up" subtitle="Leads em aberto ordenados por tempo de espera — os mais antigos primeiro." />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Aguardando follow-up" value={String(leads.length)} icon={ClipboardList} />
        <StatCard label="3+ dias sem contato" value={String(urgent)} icon={ClipboardList} accent="skyblue" />
        <StatCard label="1-2 dias sem contato" value={String(dueSoon)} icon={ClipboardList} accent="emerald" />
      </div>

      {leads.length === 0 ? (
        <Card className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald shadow-glow">
            <ClipboardList className="h-6 w-6 text-white" />
          </div>
          <h2 className="font-display text-xl font-bold">Nenhum lead pendente</h2>
          <p className="max-w-md text-sm text-muted-foreground">
            Todos os leads em aberto já foram atendidos, ou ainda não há leads reais na plataforma.
          </p>
        </Card>
      ) : (
        <Card className="p-0">
          <div className="divide-y divide-glass-border">
            {leads.map((l) => {
              const days = daysSince(l.created_at);
              return (
                <div key={l.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div>
                    <div className="flex items-center gap-2 font-medium">
                      {l.name}
                      <Badge variant="muted">{l.status}</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">{l.property_title}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={days >= 3 ? "warn" : "emerald"}>{days === 0 ? "hoje" : `${days}d sem contato`}</Badge>
                    {l.phone && (
                      <a href={`tel:${l.phone}`} className="flex h-8 w-8 items-center justify-center rounded-lg border border-glass-border bg-secondary/40 hover:bg-secondary">
                        <Phone className="h-3.5 w-3.5" />
                      </a>
                    )}
                    {l.email && (
                      <a href={`mailto:${l.email}`} className="flex h-8 w-8 items-center justify-center rounded-lg border border-glass-border bg-secondary/40 hover:bg-secondary">
                        <Mail className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </>
  );
}

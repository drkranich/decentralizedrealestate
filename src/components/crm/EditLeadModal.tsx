import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export type EditableLead = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  status: string | null;
};

const stages = ["new", "qualified", "tour", "proposal", "closed"];
const stageLabels: Record<string, string> = {
  new: "Novo", qualified: "Qualificado", tour: "Visita", proposal: "Proposta", closed: "Fechado",
};

type Props = {
  lead: EditableLead | null;
  onClose: () => void;
  onSaved: () => void;
};

export function EditLeadModal({ lead, onClose, onSaved }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState("new");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!lead) return;
    setName(lead.name ?? "");
    setEmail(lead.email ?? "");
    setPhone(lead.phone ?? "");
    setStatus(stages.includes(lead.status ?? "") ? (lead.status as string) : "new");
  }, [lead]);

  if (!lead) return null;

  const save = async () => {
    if (!name.trim()) {
      toast.error("O nome é obrigatório.");
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("leads")
      .update({
        name: name.trim(),
        email: email.trim() || null,
        phone: phone.trim() || null,
        status,
      })
      .eq("id", lead.id);
    setSaving(false);
    if (error) {
      toast.error(error.message || "Não foi possível salvar as alterações.");
      return;
    }
    toast.success("Lead atualizado.");
    onSaved();
  };

  const inputCls = "w-full rounded-xl border border-glass-border bg-glass-fill p-2.5 text-sm outline-none focus:border-emerald/40";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in" onClick={onClose}>
      <div
        className="w-full max-w-lg overflow-hidden rounded-3xl border border-glass-border bg-card/90 shadow-elegant backdrop-blur-2xl animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-glass-border px-6 py-4">
          <h3 className="font-display text-xl font-bold">Editar lead</h3>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-secondary">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 px-6 py-5">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Nome</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">E-mail</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className={inputCls} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Telefone</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Etapa</label>
            <div className="flex flex-wrap gap-2">
              {stages.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${status === s ? "bg-emerald text-white" : "border border-glass-border bg-secondary/40"}`}
                >
                  {stageLabels[s]}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-glass-border px-6 py-4">
          <button onClick={onClose} className="rounded-full border border-glass-border bg-secondary/40 px-4 py-2 text-sm font-medium hover:bg-secondary">
            Cancelar
          </button>
          <button onClick={save} disabled={saving} className="rounded-full bg-emerald px-4 py-2 text-sm font-semibold text-white shadow-glow disabled:opacity-50">
            {saving ? "Salvando…" : "Salvar alterações"}
          </button>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export type EditableProperty = {
  id: string;
  title: string;
  description: string | null;
  price: number | null;
  listing_type: string | null;
};

type Props = {
  property: EditableProperty | null;
  onClose: () => void;
  onSaved: () => void;
};

export function EditPropertyModal({ property, onClose, onSaved }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [listingType, setListingType] = useState<"aluguel" | "venda">("aluguel");
  const [price, setPrice] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!property) return;
    setTitle(property.title ?? "");
    setDescription(property.description ?? "");
    setListingType(property.listing_type === "venda" ? "venda" : "aluguel");
    setPrice(property.price != null ? String(property.price) : "");
  }, [property]);

  if (!property) return null;

  const save = async () => {
    if (!title.trim()) {
      toast.error("O título é obrigatório.");
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("properties")
      .update({
        title: title.trim(),
        description: description.trim() || null,
        listing_type: listingType,
        price: price ? Number(String(price).replace(/[^\d.]/g, "")) || null : null,
      })
      .eq("id", property.id);
    setSaving(false);
    if (error) {
      toast.error(error.message || "Não foi possível salvar as alterações.");
      return;
    }
    toast.success("Imóvel atualizado.");
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in" onClick={onClose}>
      <div
        className="w-full max-w-lg overflow-hidden rounded-3xl border border-glass-border bg-card/90 shadow-elegant backdrop-blur-2xl animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-glass-border px-6 py-4">
          <h3 className="font-display text-xl font-bold">Editar imóvel</h3>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-secondary">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[70vh] space-y-4 overflow-y-auto px-6 py-5">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Título</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="rounded-xl border border-glass-border bg-glass-fill p-2.5 text-sm outline-none focus:border-emerald/40 w-full" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Descrição</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="rounded-xl border border-glass-border bg-glass-fill p-2.5 text-sm outline-none focus:border-emerald/40 w-full resize-none" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Tipo de listagem</label>
            <div className="flex flex-wrap gap-2">
              {(["aluguel", "venda"] as const).map((lt) => (
                <button
                  key={lt}
                  type="button"
                  onClick={() => setListingType(lt)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-medium capitalize transition-colors ${listingType === lt ? "bg-emerald text-white" : "border border-glass-border bg-secondary/40"}`}
                >
                  {lt === "aluguel" ? "Aluguel" : "Venda"}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Preço (€)</label>
            <input value={price} onChange={(e) => setPrice(e.target.value)} inputMode="decimal" placeholder="2500" className="rounded-xl border border-glass-border bg-glass-fill p-2.5 text-sm outline-none focus:border-emerald/40 w-full" />
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

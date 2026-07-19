import { useState } from "react";
import { MoreVertical, Pencil, Archive, ArchiveRestore, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/lib/supabase";

type Props = {
  propertyId: string;
  title: string;
  status: string | null;
  onEdit: () => void;
  onChanged: () => void;
  triggerClassName?: string;
};

function stop(e: React.SyntheticEvent) {
  e.preventDefault();
  e.stopPropagation();
}

export function PropertyActionsMenu({ propertyId, title, status, onEdit, onChanged, triggerClassName }: Props) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const isArchived = status === "archived";

  const toggleArchive = async () => {
    setBusy(true);
    const { error } = await supabase
      .from("properties")
      .update({ status: isArchived ? "available" : "archived" })
      .eq("id", propertyId);
    setBusy(false);
    if (error) {
      toast.error(error.message || "Não foi possível atualizar o imóvel.");
      return;
    }
    toast.success(isArchived ? "Imóvel restaurado." : "Imóvel arquivado.");
    onChanged();
  };

  const remove = async () => {
    setBusy(true);
    try {
      const { data: media } = await supabase
        .from("property_media")
        .select("storage_path")
        .eq("property_id", propertyId);

      if (media && media.length > 0) {
        await supabase.storage.from("property-media").remove(media.map((m: any) => m.storage_path));
      }

      const { error } = await supabase.from("properties").delete().eq("id", propertyId);
      if (error) {
        if (error.code === "23503") {
          toast.error("Não é possível excluir — este imóvel tem contratos ou leads vinculados. Arquive-o em vez de excluir.");
        } else {
          toast.error(error.message || "Não foi possível excluir o imóvel.");
        }
        return;
      }
      toast.success("Imóvel excluído.");
      onChanged();
    } finally {
      setBusy(false);
      setConfirmOpen(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            onClick={stop}
            className={triggerClassName ?? "flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/60"}
            aria-label="Ações do imóvel"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" onClick={stop}>
          <DropdownMenuItem onClick={(e) => { stop(e); onEdit(); }}>
            <Pencil className="mr-2 h-4 w-4" /> Editar
          </DropdownMenuItem>
          <DropdownMenuItem onClick={(e) => { stop(e); toggleArchive(); }} disabled={busy}>
            {isArchived ? <ArchiveRestore className="mr-2 h-4 w-4" /> : <Archive className="mr-2 h-4 w-4" />}
            {isArchived ? "Restaurar" : "Arquivar"}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(e) => { stop(e); setConfirmOpen(true); }}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" /> Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent onClick={stop}>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir "{title}"?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação remove o imóvel e suas fotos/vídeos permanentemente. Não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { stop(e); remove(); }}
              disabled={busy}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {busy ? "Excluindo…" : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

import { useState } from "react";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
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
  leadId: string;
  name: string;
  onEdit: () => void;
  onChanged: () => void;
  triggerClassName?: string;
};

function stop(e: React.SyntheticEvent) {
  e.preventDefault();
  e.stopPropagation();
}

export function LeadActionsMenu({ leadId, name, onEdit, onChanged, triggerClassName }: Props) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const remove = async () => {
    setBusy(true);
    const { error } = await supabase.from("leads").delete().eq("id", leadId);
    setBusy(false);
    setConfirmOpen(false);
    if (error) {
      toast.error(error.message || "Não foi possível excluir o lead.");
      return;
    }
    toast.success("Lead excluído.");
    onChanged();
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            onClick={stop}
            className={triggerClassName ?? "flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-background hover:text-foreground"}
            aria-label="Ações do lead"
          >
            <MoreVertical className="h-3.5 w-3.5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" onClick={stop}>
          <DropdownMenuItem onClick={(e) => { stop(e); onEdit(); }}>
            <Pencil className="mr-2 h-4 w-4" /> Editar
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
            <AlertDialogTitle>Excluir lead de "{name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação remove o lead permanentemente do seu CRM. Não pode ser desfeita.
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

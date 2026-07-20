import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Download, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, Card, Badge } from "@/components/app/ui";
import { useAuthUser } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

type Doc = {
  id: string;
  title: string;
  document_type: string;
  status: string;
  issued_at: string | null;
  expires_at: string | null;
  opportunity_title: string | null;
  vault_document?: {
    storage_bucket: string;
    storage_path: string;
    hash_sha256: string | null;
  } | null;
};

type InvestorDocumentRow = {
  id: string;
  title: string;
  document_type: string;
  status: string;
  issued_at: string | null;
  expires_at: string | null;
  investment_opportunities?: { title: string | null } | null;
  vault_documents?: Doc["vault_document"];
};

type LegacyContractDocumentRow = {
  id: string;
  status: string | null;
  start_date: string | null;
  end_date: string | null;
  properties?: { title: string | null } | null;
};

export const Route = createFileRoute("/app/investor-documents")({
  component: InvestorDocuments,
});

function InvestorDocuments() {
  const { user } = useAuthUser();
  const [docs, setDocs] = useState<Doc[] | null>(null);
  const [schemaMissing, setSchemaMissing] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setSchemaMissing(false);
      const { data, error } = await supabase
        .from("investor_documents")
        .select(
          "id, title, document_type, status, issued_at, expires_at, investment_opportunities(title), vault_documents(storage_bucket, storage_path, hash_sha256)",
        )
        .eq("investor_id", user.id)
        .eq("visible_to_investor", true)
        .order("created_at", { ascending: false });

      if (!error) {
        setDocs(
          ((data as unknown as InvestorDocumentRow[]) ?? []).map((doc) => ({
            id: doc.id,
            title: doc.title,
            document_type: doc.document_type,
            status: doc.status,
            issued_at: doc.issued_at,
            expires_at: doc.expires_at,
            opportunity_title: doc.investment_opportunities?.title ?? null,
            vault_document: doc.vault_documents ?? null,
          })),
        );
        return;
      }

      setSchemaMissing(true);
      setDocs(await loadLegacyDocs(user.id));
    })();
  }, [user]);

  const download = async (doc: Doc) => {
    if (!doc.vault_document) {
      toast.info("Este documento não possui arquivo no Legal Vault.");
      return;
    }

    const { data, error } = await supabase.storage
      .from(doc.vault_document.storage_bucket)
      .createSignedUrl(doc.vault_document.storage_path, 60);

    if (error || !data?.signedUrl) {
      toast.error(error?.message || "Não foi possível criar o link de download.");
      return;
    }

    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      <PageHeader
        title="Documentos"
        subtitle="Contratos, comprovantes e evidências liberadas para seu perfil."
      />

      {schemaMissing && (
        <Card className="mb-6 border-dashed border-skyblue/30 text-sm text-muted-foreground">
          Não foi possível carregar todos os documentos de investidor. Verifique sessão e permissões
          antes de operar arquivos sensíveis.
        </Card>
      )}

      {docs === null ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Carregando...
        </div>
      ) : docs.length === 0 ? (
        <Card className="py-12 text-center text-sm text-muted-foreground">
          Nenhum documento liberado para seu portfólio ainda.
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {docs.map((doc) => (
            <Card key={doc.id}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald/15 text-emerald">
                  <FileText className="h-5 w-5" />
                </div>
                <Badge variant={isApproved(doc.status) ? "emerald" : "muted"}>{doc.status}</Badge>
              </div>
              <div className="mt-3 font-display text-lg font-semibold">{doc.title}</div>
              <div className="mt-1 text-xs text-muted-foreground">
                {[doc.document_type, doc.opportunity_title].filter(Boolean).join(" · ")}
              </div>
              <div className="mt-3 text-xs text-muted-foreground">
                Emitido: {doc.issued_at ? new Date(doc.issued_at).toLocaleDateString("pt-BR") : "-"}
                {" · "}
                Expira:{" "}
                {doc.expires_at
                  ? new Date(doc.expires_at).toLocaleDateString("pt-BR")
                  : "sem prazo"}
              </div>
              {doc.vault_document?.hash_sha256 && (
                <div className="mt-3 rounded-xl border border-glass-border bg-glass-fill p-2 font-mono text-[10px] text-muted-foreground">
                  hash {doc.vault_document.hash_sha256.slice(0, 28)}...
                </div>
              )}
              <button
                type="button"
                onClick={() => download(doc)}
                className="mt-4 flex items-center gap-2 rounded-full border border-glass-border bg-glass-fill px-4 py-2 text-sm font-medium hover:bg-secondary"
              >
                <Download className="h-4 w-4" />
                Baixar
              </button>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}

async function loadLegacyDocs(userId: string): Promise<Doc[]> {
  const { data: tokens } = await supabase
    .from("property_tokens")
    .select("property_id")
    .eq("owner_id", userId);
  const propertyIds = Array.from(new Set((tokens ?? []).map((token) => token.property_id)));
  if (propertyIds.length === 0) return [];

  const { data } = await supabase
    .from("contracts")
    .select("id, status, start_date, end_date, created_at, properties(title)")
    .in("property_id", propertyIds)
    .order("created_at", { ascending: false });

  return ((data as unknown as LegacyContractDocumentRow[]) ?? []).map((contract) => ({
    id: contract.id,
    title: contract.properties?.title ?? "Contrato",
    document_type: "contract",
    status: contract.status ?? "unknown",
    issued_at: contract.start_date,
    expires_at: contract.end_date,
    opportunity_title: null,
    vault_document: null,
  }));
}

function isApproved(status: string) {
  return ["active", "signed", "approved", "approved_with_conditions"].includes(status);
}

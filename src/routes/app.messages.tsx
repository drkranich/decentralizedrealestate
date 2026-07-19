import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, Card } from "@/components/app/ui";
import { useAuthUser } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

type MessageRow = { id: string; body: string; sender_id: string; created_at: string };

export const Route = createFileRoute("/app/messages")({
  component: TenantMessages,
});

function TenantMessages() {
  const { user } = useAuthUser();
  const [contractId, setContractId] = useState<string | null | undefined>(undefined);
  const [propertyTitle, setPropertyTitle] = useState<string>("");
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("contracts")
      .select("id, properties(title)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        setContractId(data?.id ?? null);
        setPropertyTitle((data as any)?.properties?.title ?? "");
      });
  }, [user]);

  useEffect(() => {
    if (!contractId) return;
    supabase
      .from("messages")
      .select("id, body, sender_id, created_at")
      .eq("contract_id", contractId)
      .order("created_at", { ascending: true })
      .then(({ data }) => setMessages(data ?? []));
  }, [contractId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!user || !contractId || !body.trim()) return;
    setSending(true);
    const { data, error } = await supabase
      .from("messages")
      .insert({ contract_id: contractId, sender_id: user.id, body: body.trim() })
      .select("id, body, sender_id, created_at")
      .single();
    setSending(false);
    if (error) {
      toast.error(error.message || "Não foi possível enviar a mensagem.");
      return;
    }
    setMessages((prev) => [...prev, data]);
    setBody("");
  };

  return (
    <>
      <PageHeader title="Mensagens" subtitle={propertyTitle ? `Conversa sobre ${propertyTitle}` : "Fale com o dono do imóvel"} />
      {contractId === undefined ? (
        <div className="text-sm text-muted-foreground">Carregando…</div>
      ) : contractId === null ? (
        <Card className="py-12 text-center text-sm text-muted-foreground">
          Você precisa de um contrato ativo para trocar mensagens com o dono do imóvel.
        </Card>
      ) : (
        <Card className="flex h-[60vh] flex-col">
          <div className="flex-1 space-y-3 overflow-y-auto pr-1">
            {messages.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">Nenhuma mensagem ainda. Diga olá!</div>
            ) : (
              messages.map((m) => (
                <div
                  key={m.id}
                  className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                    m.sender_id === user?.id ? "ml-auto bg-emerald text-white" : "bg-secondary/50"
                  }`}
                >
                  {m.body}
                </div>
              ))
            )}
            <div ref={bottomRef} />
          </div>
          <div className="mt-3 flex items-center gap-2 border-t border-glass-border pt-3">
            <input
              value={body}
              onChange={(e) => setBody(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Escreva uma mensagem…"
              className="flex-1 rounded-full border border-glass-border bg-secondary/30 px-4 py-2 text-sm focus:outline-none"
            />
            <button
              onClick={send}
              disabled={sending || !body.trim()}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald text-white disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </Card>
      )}
    </>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { supabase, PROPERTY_ID } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const [form, setForm] = useState({ nome: "", email: "", telefone: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");
    const { error } = await supabase.from("leads").insert({
      nome: form.nome,
      email: form.email,
      telefone: form.telefone,
      property_id: PROPERTY_ID,
    });
    if (error) {
      setStatus("error");
      setErrorMsg(error.message);
      return;
    }
    setStatus("success");
    setForm({ nome: "", email: "", telefone: "" });
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Tenho interesse neste imóvel</CardTitle>
          <CardDescription>Preencha seus dados e entraremos em contato.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome</Label>
              <Input
                id="nome"
                required
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                type="tel"
                required
                value={form.telefone}
                onChange={(e) => setForm({ ...form, telefone: e.target.value })}
              />
            </div>
            <Button type="submit" className="w-full" disabled={status === "loading"}>
              {status === "loading" ? "Enviando..." : "Quero alugar"}
            </Button>
            {status === "success" && (
              <p className="text-sm text-green-600">Recebemos seu interesse! Em breve entraremos em contato.</p>
            )}
            {status === "error" && (
              <p className="text-sm text-destructive">Erro ao enviar: {errorMsg}</p>
            )}
          </form>
        </CardContent>
      </Card>
    </main>
  );
}

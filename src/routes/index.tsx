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
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");
    const { error } = await supabase.from("leads").insert({
      name: form.name,
      email: form.email,
      phone: form.phone,
      property_id: PROPERTY_ID,
    });
    if (error) {
      setStatus("error");
      setErrorMsg(error.message);
      return;
    }
    setStatus("success");
    setForm({ name: "", email: "", phone: "" });
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Interested in this property</CardTitle>
          <CardDescription>Fill in your details and we'll get in touch.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
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
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <Button type="submit" className="w-full" disabled={status === "loading"}>
              {status === "loading" ? "Sending..." : "I want to rent"}
            </Button>
            {status === "success" && (
              <p className="text-sm text-green-600">We received your interest! We'll be in touch soon.</p>
            )}
            {status === "error" && (
              <p className="text-sm text-destructive">Error: {errorMsg}</p>
            )}
          </form>
        </CardContent>
      </Card>
    </main>
  );
}

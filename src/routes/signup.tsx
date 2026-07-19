import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Loader2, Mail, Lock, User, Phone } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Logo } from "@/components/brand/Logo";

export const Route = createFileRoute("/signup")({
  component: SignupPage,
});

type Role = "tenant" | "owner";

function SignupPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("tenant");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkEmail, setCheckEmail] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !email.trim() || !phone.trim() || !password) {
      setError("Nome, e-mail, celular e senha são obrigatórios.");
      return;
    }
    if (!/^\+?[0-9()\s-]{8,}$/.test(phone.trim())) {
      setError("Informe um número de celular válido (com DDD).");
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, phone, role } },
    });
    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }
    if (data.session) {
      navigate({ to: "/app/dashboard" });
    } else {
      setCheckEmail(true);
    }
  };

  if (checkEmail) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-secondary/30 px-4">
        <div className="w-full max-w-sm rounded-3xl border border-glass-border bg-card/70 p-8 text-center shadow-elegant backdrop-blur-2xl">
          <Logo />
          <h1 className="mt-6 font-display text-xl font-bold">Confirme seu e-mail</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enviamos um link de confirmação para <strong>{email}</strong>. Abra-o para ativar sua conta e depois volte para fazer login.
          </p>
          <Link to="/login" className="mt-6 inline-block rounded-full bg-emerald px-5 py-2 text-sm font-semibold text-white">
            Ir para o login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-secondary/30 px-4 py-12">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-emerald/20 blur-[110px] animate-drift-slow" />
        <div className="absolute right-[-10rem] top-1/3 h-[24rem] w-[24rem] rounded-full bg-skyblue/15 blur-[110px] animate-drift-slower" />
      </div>

      <div className="relative z-10 w-full max-w-sm rounded-3xl border border-glass-border bg-card/70 p-8 shadow-elegant backdrop-blur-2xl">
        <Logo />
        <h1 className="mt-6 font-display text-2xl font-bold">Create your account</h1>
        <p className="mt-1 text-sm text-muted-foreground">Proprietário ou inquilino — negocie direto, sem intermediário.</p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Nome completo *</label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input required value={name} onChange={(e) => setName(e.target.value)} className="input pl-9" placeholder="Seu nome" />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">E-mail *</label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input pl-9" placeholder="voce@exemplo.com" />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Celular *</label>
            <div className="relative">
              <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="input pl-9" placeholder="+55 (11) 91234-5678" />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Senha *</label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input required type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="input pl-9" placeholder="Mínimo 6 caracteres" />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Você é</label>
            <div className="flex gap-2">
              {(["tenant", "owner"] as Role[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`flex-1 rounded-full px-3.5 py-2 text-sm font-medium transition-colors ${role === r ? "bg-foreground text-background" : "border border-glass-border bg-secondary/40"}`}
                >
                  {r === "tenant" ? "Inquilino" : "Proprietário"}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <button disabled={loading} type="submit" className="flex w-full items-center justify-center gap-2 rounded-full bg-emerald py-2.5 text-sm font-semibold text-white disabled:opacity-60">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "Creating…" : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Já tem conta?{" "}
          <Link to="/login" className="font-medium text-emerald hover:underline">Entrar</Link>
        </p>
      </div>

      <style>{`.input{width:100%;border-radius:.875rem;border:1px solid oklch(1 0 0 / 0.1);background:color-mix(in oklab, var(--secondary) 40%, transparent);padding:.625rem .75rem .625rem 2.25rem;font-size:.875rem;outline:none}.input:focus{border-color:var(--emerald)}`}</style>
    </div>
  );
}

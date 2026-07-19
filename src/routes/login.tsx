import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Loader2, Mail, Lock } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Logo } from "@/components/brand/Logo";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    navigate({ to: "/app/dashboard" });
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-secondary/30 px-4">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-emerald/20 blur-[110px] animate-drift-slow" />
        <div className="absolute right-[-10rem] top-1/3 h-[24rem] w-[24rem] rounded-full bg-skyblue/15 blur-[110px] animate-drift-slower" />
      </div>

      <div className="relative z-10 w-full max-w-sm rounded-3xl border border-white/10 bg-card/70 p-8 shadow-elegant backdrop-blur-2xl">
        <Logo />
        <h1 className="mt-6 font-display text-2xl font-bold">Welcome back</h1>
        <p className="mt-1 text-sm text-muted-foreground">Sign in to manage your properties.</p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Email</label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input pl-9" placeholder="you@example.com" />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Password</label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input pl-9" placeholder="••••••••" />
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <button disabled={loading} type="submit" className="flex w-full items-center justify-center gap-2 rounded-full bg-emerald py-2.5 text-sm font-semibold text-white disabled:opacity-60">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link to="/signup" className="font-medium text-emerald hover:underline">Create one</Link>
        </p>
      </div>

      <style>{`.input{width:100%;border-radius:.875rem;border:1px solid oklch(1 0 0 / 0.1);background:color-mix(in oklab, var(--secondary) 40%, transparent);padding:.625rem .75rem .625rem 2.25rem;font-size:.875rem;outline:none}.input:focus{border-color:var(--emerald)}`}</style>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { User, Bell, Shield, CreditCard, Globe, Key } from "lucide-react";
import { PageHeader, Card, SectionTitle, Badge, DemoDataBadge } from "@/components/app/ui";
import { useAuthUser, initials } from "@/lib/auth";

export const Route = createFileRoute("/app/settings")({
  component: Settings,
});

const tabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Shield },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "regional", label: "Regional", icon: Globe },
  { id: "api", label: "API & Integrations", icon: Key },
];

function Settings() {
  const [tab, setTab] = useState("profile");
  const { user } = useAuthUser();
  const name = (user?.user_metadata?.name as string | undefined) ?? "";
  const email = user?.email ?? "";
  const phone = (user?.user_metadata?.phone as string | undefined) ?? "";

  return (
    <>
      <PageHeader title="Settings" subtitle="Manage your account, security, and platform preferences." />

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <nav className="space-y-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                tab === t.id ? "bg-foreground text-background shadow-soft" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
            </button>
          ))}
        </nav>

        <div className="space-y-6">
          {tab === "profile" && (
            <>
              <Card>
                <SectionTitle title="Profile" />
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald text-xl font-bold text-white">{initials(name || email)}</div>
                  <div className="text-xs text-muted-foreground">Foto de perfil ainda não é suportada.</div>
                </div>
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <Field label="Nome completo" value={name} readOnly />
                  <Field label="E-mail" value={email} readOnly />
                  <Field label="Celular" value={phone} readOnly />
                </div>
              </Card>
            </>
          )}

          {tab === "notifications" && (
            <Card>
              <SectionTitle title="Notification preferences" action={<DemoDataBadge />} />
              <div className="space-y-3">
                {[
                  { l: "New bookings", on: true },
                  { l: "Payment received", on: true },
                  { l: "Maintenance updates", on: true },
                  { l: "AI pricing changes", on: false },
                  { l: "Weekly reports", on: true },
                ].map((n) => (
                  <ToggleRow key={n.l} label={n.l} on={n.on} />
                ))}
              </div>
            </Card>
          )}

          {tab === "security" && (
            <>
              <Card>
                <SectionTitle title="Two-factor authentication" action={<DemoDataBadge />} />
                <div className="flex items-center justify-between rounded-2xl bg-emerald/5 border border-emerald/20 p-4">
                  <div>
                    <div className="text-sm font-semibold">Authenticator app</div>
                    <div className="text-xs text-muted-foreground">Enabled · Last used 2h ago</div>
                  </div>
                  <Badge variant="emerald">Active</Badge>
                </div>
              </Card>
              <Card>
                <SectionTitle title="Active sessions" action={<DemoDataBadge />} />
                <div className="space-y-2">
                  {[
                    { d: "MacBook Pro · Lisbon", n: "Now", c: "emerald" as const },
                    { d: "iPhone 15 · Lisbon", n: "1h ago", c: "muted" as const },
                  ].map((s, i) => (
                    <div key={i} className="flex items-center justify-between rounded-xl border border-border/50 bg-secondary/30 p-3 text-sm">
                      <span>{s.d}</span>
                      <Badge variant={s.c}>{s.n}</Badge>
                    </div>
                  ))}
                </div>
              </Card>
            </>
          )}

          {tab === "billing" && (
            <Card>
              <SectionTitle title="Plan" action={<DemoDataBadge />} />
              <div className="rounded-2xl border border-emerald/30 bg-emerald/10 p-5">
                <Badge variant="emerald">Pro</Badge>
                <div className="mt-2 font-display text-2xl font-bold">€89/month</div>
                <div className="text-xs text-muted-foreground">Renews on Jan 12, 2026</div>
              </div>
              <div className="mt-4 flex gap-2">
                <button className="flex-1 rounded-full border border-border py-2.5 text-sm">Manage plan</button>
                <button className="flex-1 rounded-full bg-foreground py-2.5 text-sm font-semibold text-background">Upgrade</button>
              </div>
            </Card>
          )}

          {tab === "regional" && (
            <Card>
              <SectionTitle title="Language & currency" />
              <div className="grid gap-4 md:grid-cols-3">
                <Field label="Language" value="English" />
                <Field label="Currency" value="EUR (€)" />
                <Field label="Timezone" value="Europe/Lisbon" />
              </div>
            </Card>
          )}

          {tab === "api" && (
            <Card>
              <SectionTitle title="API keys" action={<DemoDataBadge />} />
              <div className="space-y-2">
                {["sk_live_••••••••a4F2", "sk_test_••••••••9bC1"].map((k) => (
                  <div key={k} className="flex items-center justify-between rounded-xl border border-border/50 bg-secondary/30 p-3 font-mono text-xs">
                    <span>{k}</span>
                    <button className="text-muted-foreground hover:text-destructive">Revoke</button>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}

function Field({ label, value, readOnly }: { label: string; value: string; readOnly?: boolean }) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <input
        defaultValue={value}
        readOnly={readOnly}
        className={`mt-1 w-full rounded-xl border border-border bg-secondary/40 p-2.5 text-sm ${readOnly ? "opacity-70" : ""}`}
      />
    </div>
  );
}

function ToggleRow({ label, on: initial }: { label: string; on: boolean }) {
  const [on, setOn] = useState(initial);
  return (
    <div className="flex items-center justify-between rounded-xl border border-border/50 bg-secondary/30 p-3">
      <span className="text-sm">{label}</span>
      <button onClick={() => setOn(!on)} className={`relative h-6 w-11 rounded-full transition-colors ${on ? "bg-emerald" : "bg-muted"}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${on ? "translate-x-5" : "translate-x-0.5"}`} />
      </button>
    </div>
  );
}

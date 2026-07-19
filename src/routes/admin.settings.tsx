import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { User, Bell, Shield, CreditCard, Globe, Key, Palette } from "lucide-react";
import { PageHeader, Card, SectionTitle, Badge, DemoDataBadge } from "@/components/app/ui";
import { ProfileCard } from "@/components/app/ProfileCard";
import { AddressCard } from "@/components/app/AddressCard";
import { PlanCard } from "@/components/app/PlanCard";
import { RegionalCard } from "@/components/app/RegionalCard";
import { BrandingCard } from "@/components/app/BrandingCard";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/settings")({
  component: Settings,
});

const tabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Shield },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "regional", label: "Regional", icon: Globe },
  { id: "branding", label: "Branding", icon: Palette },
  { id: "api", label: "API & Integrations", icon: Key },
];

function Settings() {
  const [tab, setTab] = useState("profile");

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
            <div className="space-y-6">
              <ProfileCard />
              <AddressCard />
            </div>
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

          {tab === "billing" && <PlanCard />}

          {tab === "regional" && <RegionalCard />}

          {tab === "branding" && <BrandingCard />}

          {tab === "api" && (
            <Card>
              <SectionTitle title="API keys" action={<DemoDataBadge />} />
              <div className="space-y-2">
                {["sk_live_••••••••a4F2", "sk_test_••••••••9bC1"].map((k) => (
                  <div key={k} className="flex items-center justify-between rounded-xl border border-border/50 bg-secondary/30 p-3 font-mono text-xs">
                    <span>{k}</span>
                    <button onClick={() => toast.info("Chaves de API ainda não estão disponíveis.")} className="text-muted-foreground hover:text-destructive">Revoke</button>
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

function ToggleRow({ label, on: initial }: { label: string; on: boolean }) {
  const [on, setOn] = useState(initial);
  return (
    <div className="flex items-center justify-between rounded-lg border border-glass-border bg-glass-fill px-3.5 py-3 backdrop-blur-sm">
      <span className="text-sm">{label}</span>
      <button
        onClick={() => setOn(!on)}
        aria-pressed={on}
        className={`flex h-6 w-11 shrink-0 items-center rounded-full border px-0.5 backdrop-blur-sm transition-colors ${
          on ? "justify-end border-emerald/30 bg-emerald/80" : "justify-start border-glass-border bg-glass-fill-strong"
        }`}
      >
        <span className="h-4.5 w-4.5 rounded-full bg-white shadow-sm" />
      </button>
    </div>
  );
}

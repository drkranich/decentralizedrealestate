import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Activity,
  Bell,
  CheckCircle2,
  Copy,
  CreditCard,
  Globe,
  Key,
  Loader2,
  LogOut,
  Palette,
  Plus,
  RefreshCw,
  Shield,
  Trash2,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { AddressCard } from "@/components/app/AddressCard";
import { BrandingCard } from "@/components/app/BrandingCard";
import { PlanCard } from "@/components/app/PlanCard";
import { RegionalCard } from "@/components/app/RegionalCard";
import { ProfileCard } from "@/components/app/ProfileCard";
import { Badge, Card, PageHeader, SectionTitle } from "@/components/app/ui";
import { useAuthUser } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/admin/settings")({
  validateSearch: (s: Record<string, unknown>) => ({
    tab: typeof s.tab === "string" ? s.tab : "",
  }),
  component: Settings,
});

const tabs = [
  { id: "profile", label: "Perfil", icon: User },
  { id: "notifications", label: "Notificações", icon: Bell },
  { id: "security", label: "Segurança", icon: Shield },
  { id: "billing", label: "Cobrança", icon: CreditCard },
  { id: "regional", label: "Regional", icon: Globe },
  { id: "branding", label: "Marca", icon: Palette },
  { id: "api", label: "API interna", icon: Key },
];

const inputCls =
  "w-full rounded-xl border border-glass-border bg-glass-fill p-2.5 text-sm outline-none backdrop-blur-sm focus:border-emerald/40 focus:ring-1 focus:ring-emerald/20";

type NotificationPreference = {
  id: string;
  notification_key: string;
  label: string;
  channel: string;
  enabled: boolean;
};

type SessionEvent = {
  id: string;
  event_type: string;
  user_agent: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

type ApiKeyRow = {
  id: string;
  name: string;
  key_prefix: string;
  scopes: string[] | null;
  last_used_at: string | null;
  revoked_at: string | null;
  created_at: string;
};

const defaultPreferences = [
  { notification_key: "new_leads", label: "Novos leads", enabled: true },
  { notification_key: "contracts", label: "Contratos e documentos", enabled: true },
  { notification_key: "maintenance", label: "Chamados de manutenção", enabled: true },
  { notification_key: "legaltech", label: "Alertas LegalTech", enabled: true },
  { notification_key: "weekly_reports", label: "Resumo semanal interno", enabled: true },
];

function Settings() {
  const search = Route.useSearch();
  const { user, signOut } = useAuthUser();
  const [tab, setTab] = useState(search.tab || "profile");

  return (
    <>
      <PageHeader
        title="Configurações"
        subtitle="Gerencie conta, segurança e preferências internas da plataforma."
      />

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <nav className="space-y-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                tab === t.id
                  ? "bg-foreground text-background shadow-soft"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
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

          {tab === "notifications" && <NotificationPreferencesCard userId={user?.id ?? null} />}

          {tab === "security" && <SecurityCard userId={user?.id ?? null} signOut={signOut} />}

          {tab === "billing" && <PlanCard />}

          {tab === "regional" && <RegionalCard />}

          {tab === "branding" && <BrandingCard />}

          {tab === "api" && <ApiKeysCard userId={user?.id ?? null} />}
        </div>
      </div>
    </>
  );
}

function NotificationPreferencesCard({ userId }: { userId: string | null }) {
  const [items, setItems] = useState<NotificationPreference[] | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = async () => {
    if (!userId) {
      setItems([]);
      return;
    }

    const { data, error } = await supabase
      .from("user_notification_preferences")
      .select("id, notification_key, label, channel, enabled")
      .eq("user_id", userId)
      .eq("channel", "in_app")
      .order("created_at", { ascending: true });

    if (error) {
      toast.error(error.message || "Não foi possível carregar as preferências.");
      setItems([]);
      return;
    }

    if ((data ?? []).length > 0) {
      setItems((data ?? []) as NotificationPreference[]);
      return;
    }

    const rows = defaultPreferences.map((pref) => ({
      ...pref,
      user_id: userId,
      channel: "in_app",
    }));
    const { error: insertError } = await supabase
      .from("user_notification_preferences")
      .insert(rows);
    if (insertError) {
      toast.error(insertError.message || "Não foi possível preparar as preferências.");
      setItems([]);
      return;
    }

    const { data: created } = await supabase
      .from("user_notification_preferences")
      .select("id, notification_key, label, channel, enabled")
      .eq("user_id", userId)
      .eq("channel", "in_app")
      .order("created_at", { ascending: true });
    setItems((created ?? []) as NotificationPreference[]);
  };

  useEffect(() => {
    load();
  }, [userId]);

  const toggle = async (item: NotificationPreference) => {
    if (!userId) return;
    const enabled = !item.enabled;
    setSavingId(item.id);
    setItems((prev) => prev?.map((p) => (p.id === item.id ? { ...p, enabled } : p)) ?? null);
    const { error } = await supabase
      .from("user_notification_preferences")
      .update({ enabled, updated_at: new Date().toISOString() })
      .eq("id", item.id)
      .eq("user_id", userId);
    setSavingId(null);
    if (error) {
      setItems((prev) => prev?.map((p) => (p.id === item.id ? item : p)) ?? null);
      toast.error(error.message || "Não foi possível salvar a preferência.");
      return;
    }
    toast.success("Preferência salva.");
  };

  return (
    <Card>
      <SectionTitle
        title="Preferências de notificação"
        action={<Badge variant="emerald">No app</Badge>}
      />
      {items === null ? (
        <LoadingRow label="Carregando preferências" />
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Entre na conta para carregar suas preferências internas.
        </p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <ToggleRow
              key={item.id}
              label={item.label}
              on={item.enabled}
              busy={savingId === item.id}
              onToggle={() => toggle(item)}
            />
          ))}
        </div>
      )}
    </Card>
  );
}

function SecurityCard({
  userId,
  signOut,
}: {
  userId: string | null;
  signOut: () => Promise<void>;
}) {
  const [events, setEvents] = useState<SessionEvent[] | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    if (!userId) {
      setEvents([]);
      return;
    }
    const { data, error } = await supabase
      .from("user_session_events")
      .select("id, event_type, user_agent, metadata, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(8);
    if (error) {
      toast.error(error.message || "Não foi possível carregar a atividade de sessão.");
      setEvents([]);
      return;
    }
    setEvents((data ?? []) as SessionEvent[]);
  };

  const recordSessionSeen = async () => {
    if (!userId || typeof window === "undefined") return;
    const storageKey = `seravie:last-session-event:${userId}`;
    const lastRecordedAt = Number(window.localStorage.getItem(storageKey) ?? 0);
    if (Date.now() - lastRecordedAt < 30 * 60 * 1000) return;

    await supabase.from("user_session_events").insert({
      user_id: userId,
      event_type: "session_seen",
      user_agent: navigator.userAgent,
      metadata: {
        path: window.location.pathname,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
    });
    window.localStorage.setItem(storageKey, String(Date.now()));
  };

  useEffect(() => {
    if (!userId) {
      setEvents([]);
      return;
    }
    recordSessionSeen().then(load);
  }, [userId]);

  const refreshSession = async () => {
    if (!userId) return;
    setRefreshing(true);
    const { error } = await supabase.auth.refreshSession();
    if (!error) {
      await supabase.from("user_session_events").insert({
        user_id: userId,
        event_type: "session_refreshed",
        user_agent: navigator.userAgent,
        metadata: { path: window.location.pathname },
      });
      toast.success("Sessão renovada.");
    } else {
      toast.error(error.message || "Não foi possível renovar a sessão.");
    }
    setRefreshing(false);
    load();
  };

  const leave = async () => {
    if (userId) {
      await supabase.from("user_session_events").insert({
        user_id: userId,
        event_type: "signed_out",
        user_agent: navigator.userAgent,
        metadata: { path: window.location.pathname },
      });
    }
    await signOut();
  };

  return (
    <div className="space-y-6">
      <Card>
        <SectionTitle title="Sessão atual" action={<Badge variant="emerald">Validada</Badge>} />
        <div className="rounded-2xl border border-emerald/20 bg-emerald/5 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald/15 text-emerald">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold">Sessão autenticada pelo Supabase</div>
              <div className="mt-1 text-xs text-muted-foreground">{describeCurrentBrowser()}</div>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={refreshSession}
              disabled={refreshing || !userId}
              className="inline-flex items-center gap-2 rounded-full border border-glass-border bg-glass-fill px-4 py-2 text-sm font-medium backdrop-blur-sm hover:bg-glass-fill-strong disabled:opacity-50"
            >
              {refreshing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Renovar sessão
            </button>
            <button
              onClick={leave}
              className="inline-flex items-center gap-2 rounded-full border border-glass-border bg-glass-fill px-4 py-2 text-sm font-medium backdrop-blur-sm hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="h-4 w-4" />
              Sair desta conta
            </button>
          </div>
        </div>
      </Card>

      <Card>
        <SectionTitle
          title="Atividade de sessão"
          action={<Activity className="h-4 w-4 text-muted-foreground" />}
        />
        {events === null ? (
          <LoadingRow label="Carregando atividade" />
        ) : events.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            A atividade desta conta será registrada automaticamente a partir de agora.
          </p>
        ) : (
          <div className="space-y-2">
            {events.map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-glass-border bg-glass-fill px-3.5 py-3 text-sm backdrop-blur-sm"
              >
                <div className="min-w-0">
                  <div className="font-medium">{sessionEventLabel(event.event_type)}</div>
                  <div className="truncate text-xs text-muted-foreground">
                    {formatUserAgent(event.user_agent)}
                  </div>
                </div>
                <Badge variant="muted">{new Date(event.created_at).toLocaleString("pt-BR")}</Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function ApiKeysCard({ userId }: { userId: string | null }) {
  const [keys, setKeys] = useState<ApiKeyRow[] | null>(null);
  const [name, setName] = useState("");
  const [createdKey, setCreatedKey] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    if (!userId) {
      setKeys([]);
      return;
    }
    const { data, error } = await supabase
      .from("platform_api_keys")
      .select("id, name, key_prefix, scopes, last_used_at, revoked_at, created_at")
      .eq("owner_id", userId)
      .order("created_at", { ascending: false });
    if (error) {
      toast.error(error.message || "Não foi possível carregar as chaves internas.");
      setKeys([]);
      return;
    }
    setKeys((data ?? []) as ApiKeyRow[]);
  };

  useEffect(() => {
    load();
  }, [userId]);

  const create = async () => {
    if (!userId || !name.trim()) return;
    if (!globalThis.crypto?.subtle) {
      toast.error("Este navegador não suporta geração segura de chaves.");
      return;
    }

    setSaving(true);
    const rawKey = `sh_${randomPart(10)}.${randomPart(36)}`;
    const keyHash = await sha256(rawKey);
    const keyPrefix = rawKey.slice(0, 14);

    const { data, error } = await supabase
      .from("platform_api_keys")
      .insert({
        owner_id: userId,
        created_by: userId,
        name: name.trim(),
        key_prefix: keyPrefix,
        key_hash: keyHash,
        scopes: ["read"],
      })
      .select("id, name, key_prefix, scopes, last_used_at, revoked_at, created_at")
      .single();

    setSaving(false);
    if (error) {
      toast.error(error.message || "Não foi possível gerar a chave.");
      return;
    }

    setCreatedKey(rawKey);
    setName("");
    setKeys((prev) => [data as ApiKeyRow, ...((prev ?? []) as ApiKeyRow[])]);
    toast.success("Chave interna criada.");
  };

  const copyCreatedKey = async () => {
    if (!createdKey) return;
    try {
      await navigator.clipboard.writeText(createdKey);
      toast.success("Chave copiada.");
    } catch {
      toast.error("Não foi possível copiar a chave.");
    }
  };

  const revoke = async (key: ApiKeyRow) => {
    if (!userId || key.revoked_at) return;
    const revokedAt = new Date().toISOString();
    setKeys(
      (prev) =>
        prev?.map((item) => (item.id === key.id ? { ...item, revoked_at: revokedAt } : item)) ??
        null,
    );
    const { error } = await supabase
      .from("platform_api_keys")
      .update({ revoked_at: revokedAt })
      .eq("id", key.id)
      .eq("owner_id", userId);
    if (error) {
      setKeys((prev) => prev?.map((item) => (item.id === key.id ? key : item)) ?? null);
      toast.error(error.message || "Não foi possível revogar a chave.");
      return;
    }
    toast.success("Chave revogada.");
  };

  return (
    <Card>
      <SectionTitle title="Chaves internas" action={<Badge variant="blue">Hash SHA-256</Badge>} />

      <div className="grid gap-3 md:grid-cols-[1fr_auto]">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nome da chave, ex: Integração interna"
          className={inputCls}
        />
        <button
          onClick={create}
          disabled={saving || !name.trim() || !userId}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald px-4 py-2.5 text-sm font-semibold text-white shadow-glow disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Criar chave
        </button>
      </div>

      {createdKey && (
        <div className="mt-4 rounded-2xl border border-emerald/25 bg-emerald/5 p-4">
          <div className="mb-2 text-sm font-semibold">Chave criada. Guarde este valor agora.</div>
          <div className="flex flex-col gap-2 rounded-xl border border-glass-border bg-background/50 p-3 font-mono text-xs md:flex-row md:items-center md:justify-between">
            <span className="break-all">{createdKey}</span>
            <button
              onClick={copyCreatedKey}
              className="inline-flex shrink-0 items-center gap-2 rounded-full border border-glass-border bg-glass-fill px-3 py-1.5 font-sans text-xs font-medium backdrop-blur-sm hover:bg-glass-fill-strong"
            >
              <Copy className="h-3.5 w-3.5" />
              Copiar
            </button>
          </div>
        </div>
      )}

      <div className="mt-5 space-y-2">
        {keys === null ? (
          <LoadingRow label="Carregando chaves" />
        ) : keys.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhuma chave interna criada para esta conta.
          </p>
        ) : (
          keys.map((key) => (
            <div
              key={key.id}
              className="flex flex-col gap-3 rounded-xl border border-glass-border bg-glass-fill p-3 backdrop-blur-sm md:flex-row md:items-center md:justify-between"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 text-sm font-medium">
                  {key.name}
                  <Badge variant={key.revoked_at ? "muted" : "emerald"}>
                    {key.revoked_at ? "Revogada" : "Ativa"}
                  </Badge>
                </div>
                <div className="mt-1 font-mono text-xs text-muted-foreground">
                  {key.key_prefix}••••••••••••
                </div>
              </div>
              <button
                onClick={() => revoke(key)}
                disabled={Boolean(key.revoked_at)}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-glass-border bg-glass-fill px-3 py-1.5 text-xs font-medium backdrop-blur-sm hover:bg-destructive/10 hover:text-destructive disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Revogar
              </button>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}

function ToggleRow({
  label,
  on,
  busy,
  onToggle,
}: {
  label: string;
  on: boolean;
  busy?: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-glass-border bg-glass-fill px-3.5 py-3 backdrop-blur-sm">
      <span className="text-sm">{label}</span>
      <button
        onClick={onToggle}
        disabled={busy}
        aria-pressed={on}
        className={`flex h-6 w-11 shrink-0 items-center rounded-full border px-0.5 backdrop-blur-sm transition-colors disabled:opacity-60 ${
          on
            ? "justify-end border-emerald/30 bg-emerald/80"
            : "justify-start border-glass-border bg-glass-fill-strong"
        }`}
      >
        <span className="h-4.5 w-4.5 rounded-full bg-white shadow-sm" />
      </button>
    </div>
  );
}

function LoadingRow({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 py-5 text-sm text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin" />
      {label}
    </div>
  );
}

function sessionEventLabel(eventType: string) {
  const labels: Record<string, string> = {
    session_seen: "Sessão reconhecida",
    session_refreshed: "Sessão renovada",
    signed_out: "Saída solicitada",
  };
  return labels[eventType] ?? eventType;
}

function describeCurrentBrowser() {
  if (typeof navigator === "undefined") return "Navegador atual";
  return formatUserAgent(navigator.userAgent);
}

function formatUserAgent(userAgent: string | null | undefined) {
  if (!userAgent) return "Navegador não identificado";
  const browser = userAgent.includes("Edg/")
    ? "Edge"
    : userAgent.includes("Chrome/")
      ? "Chrome"
      : userAgent.includes("Firefox/")
        ? "Firefox"
        : userAgent.includes("Safari/")
          ? "Safari"
          : "Navegador";
  const os = userAgent.includes("Windows")
    ? "Windows"
    : userAgent.includes("Mac OS")
      ? "macOS"
      : userAgent.includes("Android")
        ? "Android"
        : userAgent.includes("iPhone")
          ? "iOS"
          : "Sistema";
  return `${browser} · ${os}`;
}

function randomPart(length: number) {
  const bytes = new Uint8Array(Math.ceil((length * 3) / 4));
  crypto.getRandomValues(bytes);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "").slice(0, length);
}

async function sha256(value: string) {
  const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(hash))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

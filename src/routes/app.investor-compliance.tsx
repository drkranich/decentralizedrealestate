import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import {
  BadgeCheck,
  Landmark,
  Loader2,
  Save,
  ShieldAlert,
  ShieldCheck,
  WalletCards,
} from "lucide-react";
import { toast } from "sonner";
import { GlassSelect } from "@/components/app/GlassSelect";
import { PageHeader, Card, Badge, SectionTitle, StatCard } from "@/components/app/ui";
import { useAuthUser } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/app/investor-compliance")({
  component: InvestorCompliance,
});

type ReviewStatus =
  | "draft"
  | "pending_review"
  | "legal_review"
  | "approved"
  | "approved_with_conditions"
  | "blocked"
  | "expired"
  | "archived"
  | "deleted"
  | "legal_hold";

type InvestorProfile = {
  id: string;
  user_id: string;
  onboarding_status: ReviewStatus;
  kyc_status: ReviewStatus;
  suitability_status: ReviewStatus;
  wallet_status: ReviewStatus;
  risk_profile: "conservative" | "balanced" | "growth" | "professional";
  residence_country: string | null;
  tax_residence_country: string | null;
  source_of_funds_status: ReviewStatus;
  pep_status: string;
  sanctions_status: string;
  investment_limit: number | null;
  preferred_currency: string;
  notes: string | null;
};

type KycCase = {
  id: string;
  status: ReviewStatus;
  risk_level: "low" | "medium" | "high" | "critical";
  residence_country: string | null;
  tax_residence_country: string | null;
  source_of_funds_summary: string | null;
  created_at: string;
};

type Wallet = {
  id: string;
  label: string;
  wallet_type: string;
  network: string | null;
  address: string | null;
  provider: string | null;
  status: ReviewStatus;
};

const riskProfileOptions = [
  { value: "conservative", label: "Conservador" },
  { value: "balanced", label: "Balanceado" },
  { value: "growth", label: "Crescimento" },
  { value: "professional", label: "Profissional" },
];

const currencyOptions = [
  { value: "USD", label: "USD" },
  { value: "EUR", label: "EUR" },
  { value: "BRL", label: "BRL" },
];

const riskLevelOptions = [
  { value: "low", label: "Baixo" },
  { value: "medium", label: "Médio" },
  { value: "high", label: "Alto" },
  { value: "critical", label: "Crítico" },
];

const walletTypeOptions = [
  { value: "custodial", label: "Custodial" },
  { value: "self_custody", label: "Self-custody" },
  { value: "bank_account", label: "Conta bancária" },
  { value: "escrow", label: "Escrow" },
];

function InvestorCompliance() {
  const { user } = useAuthUser();
  const [profile, setProfile] = useState<InvestorProfile | null>(null);
  const [kycCases, setKycCases] = useState<KycCase[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingKyc, setSavingKyc] = useState(false);
  const [savingWallet, setSavingWallet] = useState(false);
  const [schemaMissing, setSchemaMissing] = useState(false);

  const [profileForm, setProfileForm] = useState({
    residence_country: "",
    tax_residence_country: "",
    risk_profile: "balanced",
    preferred_currency: "USD",
    investment_limit: "",
    notes: "",
  });

  const [kycForm, setKycForm] = useState({
    source_of_funds_summary: "",
    risk_level: "medium",
  });

  const [walletForm, setWalletForm] = useState({
    label: "Carteira principal",
    wallet_type: "custodial",
    network: "",
    address: "",
    provider: "",
  });

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setSchemaMissing(false);

    const { data: profileData, error } = await supabase
      .from("investor_profiles")
      .select(
        "id, user_id, onboarding_status, kyc_status, suitability_status, wallet_status, risk_profile, residence_country, tax_residence_country, source_of_funds_status, pep_status, sanctions_status, investment_limit, preferred_currency, notes",
      )
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      setSchemaMissing(true);
      setLoading(false);
      return;
    }

    const nextProfile = profileData as InvestorProfile | null;
    setProfile(nextProfile);
    if (nextProfile) {
      setProfileForm({
        residence_country: nextProfile.residence_country ?? "",
        tax_residence_country: nextProfile.tax_residence_country ?? "",
        risk_profile: nextProfile.risk_profile,
        preferred_currency: nextProfile.preferred_currency,
        investment_limit: nextProfile.investment_limit ? String(nextProfile.investment_limit) : "",
        notes: nextProfile.notes ?? "",
      });
    }

    const [{ data: kycData }, { data: walletData }] = await Promise.all([
      supabase
        .from("kyc_cases")
        .select(
          "id, status, risk_level, residence_country, tax_residence_country, source_of_funds_summary, created_at",
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("investor_wallets")
        .select("id, label, wallet_type, network, address, provider, status")
        .eq("investor_id", user.id)
        .order("created_at", { ascending: false }),
    ]);

    setKycCases((kycData as KycCase[]) ?? []);
    setWallets((walletData as Wallet[]) ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const saveProfile = async () => {
    if (!user) return;
    setSavingProfile(true);
    const { error } = await supabase.from("investor_profiles").upsert({
      user_id: user.id,
      onboarding_status: "pending_review",
      risk_profile: profileForm.risk_profile,
      residence_country: profileForm.residence_country || null,
      tax_residence_country: profileForm.tax_residence_country || null,
      preferred_currency: profileForm.preferred_currency || "USD",
      investment_limit: profileForm.investment_limit ? Number(profileForm.investment_limit) : null,
      notes: profileForm.notes || null,
    });
    setSavingProfile(false);

    if (error) {
      toast.error(error.message || "Não foi possível salvar o perfil.");
      return;
    }

    toast.success("Perfil de investidor salvo.");
    load();
  };

  const createKycCase = async () => {
    if (!user) return;
    setSavingKyc(true);
    const { error } = await supabase.from("kyc_cases").insert({
      user_id: user.id,
      status: "pending_review",
      risk_level: kycForm.risk_level,
      residence_country: profileForm.residence_country || null,
      tax_residence_country: profileForm.tax_residence_country || null,
      source_of_funds_summary: kycForm.source_of_funds_summary || null,
    });
    setSavingKyc(false);

    if (error) {
      toast.error(error.message || "Não foi possível abrir o KYC.");
      return;
    }

    toast.success("Caso KYC aberto para revisão.");
    setKycForm({ source_of_funds_summary: "", risk_level: "medium" });
    load();
  };

  const addWallet = async () => {
    if (!user) return;
    setSavingWallet(true);
    const { error } = await supabase.from("investor_wallets").insert({
      investor_id: user.id,
      label: walletForm.label || "Carteira",
      wallet_type: walletForm.wallet_type,
      network: walletForm.network || null,
      address: walletForm.address || null,
      provider: walletForm.provider || null,
      status: "pending_review",
    });
    setSavingWallet(false);

    if (error) {
      toast.error(error.message || "Não foi possível cadastrar a carteira.");
      return;
    }

    toast.success("Carteira cadastrada para triagem.");
    setWalletForm({
      label: "Carteira principal",
      wallet_type: "custodial",
      network: "",
      address: "",
      provider: "",
    });
    load();
  };

  if (loading) {
    return (
      <>
        <PageHeader
          title="Compliance"
          subtitle="KYC, suitability, origem de recursos e carteiras."
        />
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Carregando compliance...
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Compliance"
        subtitle="Prepare seu perfil antes de participar de oportunidades tokenizadas."
      />

      {schemaMissing && (
        <Card className="mb-6 border-dashed border-destructive/30 text-sm text-muted-foreground">
          Não foi possível carregar seus dados regulatórios. Verifique sua sessão e tente novamente.
        </Card>
      )}

      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        <StatCard
          label="Onboarding"
          value={statusLabel(profile?.onboarding_status)}
          icon={BadgeCheck}
        />
        <StatCard
          label="KYC"
          value={statusLabel(profile?.kyc_status)}
          icon={ShieldCheck}
          accent="skyblue"
        />
        <StatCard
          label="Suitability"
          value={statusLabel(profile?.suitability_status)}
          icon={ShieldAlert}
        />
        <StatCard
          label="Carteiras"
          value={String(wallets.length)}
          icon={WalletCards}
          accent="skyblue"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <SectionTitle title="Perfil regulatório" />
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="País de residência">
              <input
                value={profileForm.residence_country}
                onChange={(event) =>
                  setProfileForm((prev) => ({ ...prev, residence_country: event.target.value }))
                }
                className="input"
                placeholder="Brasil"
              />
            </Field>
            <Field label="Residência fiscal">
              <input
                value={profileForm.tax_residence_country}
                onChange={(event) =>
                  setProfileForm((prev) => ({ ...prev, tax_residence_country: event.target.value }))
                }
                className="input"
                placeholder="Brasil"
              />
            </Field>
            <Field label="Perfil de risco">
              <GlassSelect
                value={profileForm.risk_profile}
                onValueChange={(value) =>
                  setProfileForm((prev) => ({ ...prev, risk_profile: value }))
                }
                options={riskProfileOptions}
              />
            </Field>
            <Field label="Moeda preferida">
              <GlassSelect
                value={profileForm.preferred_currency}
                onValueChange={(value) =>
                  setProfileForm((prev) => ({ ...prev, preferred_currency: value }))
                }
                options={currencyOptions}
              />
            </Field>
            <Field label="Limite pretendido">
              <input
                type="number"
                value={profileForm.investment_limit}
                onChange={(event) =>
                  setProfileForm((prev) => ({ ...prev, investment_limit: event.target.value }))
                }
                className="input"
                placeholder="50000"
              />
            </Field>
            <Field label="Observações" wide>
              <textarea
                value={profileForm.notes}
                onChange={(event) =>
                  setProfileForm((prev) => ({ ...prev, notes: event.target.value }))
                }
                className="input min-h-24 resize-none"
              />
            </Field>
          </div>
          <button
            type="button"
            onClick={saveProfile}
            disabled={savingProfile || schemaMissing}
            className="mt-4 flex items-center gap-2 rounded-full bg-emerald px-4 py-2 text-sm font-semibold text-white shadow-glow disabled:opacity-60"
          >
            {savingProfile ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Salvar perfil
          </button>
        </Card>

        <Card>
          <SectionTitle title="Abrir KYC" />
          <div className="space-y-3">
            <Field label="Risco declarado">
              <GlassSelect
                value={kycForm.risk_level}
                onValueChange={(value) => setKycForm((prev) => ({ ...prev, risk_level: value }))}
                options={riskLevelOptions}
              />
            </Field>
            <Field label="Origem dos recursos">
              <textarea
                value={kycForm.source_of_funds_summary}
                onChange={(event) =>
                  setKycForm((prev) => ({ ...prev, source_of_funds_summary: event.target.value }))
                }
                className="input min-h-28 resize-none"
                placeholder="Ex.: renda profissional, venda de ativo, distribuição empresarial..."
              />
            </Field>
            <button
              type="button"
              onClick={createKycCase}
              disabled={savingKyc || schemaMissing}
              className="flex items-center gap-2 rounded-full border border-glass-border bg-glass-fill px-4 py-2 text-sm font-medium hover:bg-secondary disabled:opacity-60"
            >
              {savingKyc ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ShieldCheck className="h-4 w-4" />
              )}
              Enviar para revisão
            </button>
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card>
          <SectionTitle
            title="Casos KYC"
            action={<Badge variant="blue">{kycCases.length}</Badge>}
          />
          {kycCases.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum caso KYC aberto ainda.</p>
          ) : (
            <div className="space-y-3">
              {kycCases.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-glass-border bg-glass-fill p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-medium">KYC {item.id.slice(0, 8)}</div>
                    <Badge variant={statusVariant(item.status)}>{statusLabel(item.status)}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {item.source_of_funds_summary || "Sem resumo."}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <SectionTitle
            title="Carteiras e contas"
            action={<Landmark className="h-4 w-4 text-emerald" />}
          />
          <div className="mb-4 grid gap-3 sm:grid-cols-2">
            <Field label="Nome">
              <input
                value={walletForm.label}
                onChange={(event) =>
                  setWalletForm((prev) => ({ ...prev, label: event.target.value }))
                }
                className="input"
              />
            </Field>
            <Field label="Tipo">
              <GlassSelect
                value={walletForm.wallet_type}
                onValueChange={(value) =>
                  setWalletForm((prev) => ({ ...prev, wallet_type: value }))
                }
                options={walletTypeOptions}
              />
            </Field>
            <Field label="Rede/banco">
              <input
                value={walletForm.network}
                onChange={(event) =>
                  setWalletForm((prev) => ({ ...prev, network: event.target.value }))
                }
                className="input"
              />
            </Field>
            <Field label="Endereço/identificador">
              <input
                value={walletForm.address}
                onChange={(event) =>
                  setWalletForm((prev) => ({ ...prev, address: event.target.value }))
                }
                className="input"
              />
            </Field>
            <Field label="Provedor" wide>
              <input
                value={walletForm.provider}
                onChange={(event) =>
                  setWalletForm((prev) => ({ ...prev, provider: event.target.value }))
                }
                className="input"
              />
            </Field>
          </div>
          <button
            type="button"
            onClick={addWallet}
            disabled={savingWallet || schemaMissing}
            className="mb-4 flex items-center gap-2 rounded-full border border-glass-border bg-glass-fill px-4 py-2 text-sm font-medium hover:bg-secondary disabled:opacity-60"
          >
            {savingWallet ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <WalletCards className="h-4 w-4" />
            )}
            Cadastrar para triagem
          </button>

          <div className="space-y-3">
            {wallets.map((wallet) => (
              <div
                key={wallet.id}
                className="rounded-2xl border border-glass-border bg-glass-fill p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-medium">{wallet.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {[wallet.wallet_type, wallet.network, wallet.provider]
                        .filter(Boolean)
                        .join(" · ")}
                    </div>
                  </div>
                  <Badge variant={statusVariant(wallet.status)}>{statusLabel(wallet.status)}</Badge>
                </div>
              </div>
            ))}
            {wallets.length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhuma carteira cadastrada.</p>
            )}
          </div>
        </Card>
      </div>
    </>
  );
}

function Field({
  label,
  wide,
  children,
}: {
  label: string;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className={wide ? "sm:col-span-2" : ""}>
      <span className="mb-1 block text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function statusLabel(status: ReviewStatus | undefined | null) {
  const labels: Record<ReviewStatus, string> = {
    draft: "Rascunho",
    pending_review: "Revisão",
    legal_review: "Jurídico",
    approved: "Aprovado",
    approved_with_conditions: "Condicionado",
    blocked: "Bloqueado",
    expired: "Expirado",
    archived: "Arquivado",
    deleted: "Excluído",
    legal_hold: "Legal hold",
  };
  return status ? labels[status] : "Não iniciado";
}

function statusVariant(status: ReviewStatus) {
  if (status === "approved" || status === "approved_with_conditions") return "emerald" as const;
  if (status === "blocked" || status === "expired" || status === "deleted") return "warn" as const;
  if (status === "pending_review" || status === "legal_review") return "blue" as const;
  return "muted" as const;
}

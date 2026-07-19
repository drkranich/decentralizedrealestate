import { useEffect, useRef, useState } from "react";
import { Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Card, SectionTitle, Badge } from "@/components/app/ui";
import { useAuthUser, initials, type UserRole } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

const roleLabels: Record<UserRole, string> = {
  admin: "Super admin",
  owner: "Dono de imóvel",
  tenant: "Inquilino",
};

export function ProfileCard() {
  const { user } = useAuthUser();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<UserRole | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("users")
      .select("name, phone, role, avatar_url")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        setName(data?.name ?? (user.user_metadata?.name as string | undefined) ?? "");
        setPhone(data?.phone ?? (user.user_metadata?.phone as string | undefined) ?? "");
        setRole((data?.role as UserRole | undefined) ?? "tenant");
        setAvatarUrl(data?.avatar_url ?? null);
        setLoading(false);
      });
  }, [user]);

  const saveProfile = async () => {
    if (!user) return;
    setSaving(true);
    const { error: dbError } = await supabase
      .from("users")
      .update({ name: name.trim(), phone: phone.trim() })
      .eq("id", user.id);
    const { error: authError } = await supabase.auth.updateUser({
      data: { name: name.trim(), phone: phone.trim() },
    });
    setSaving(false);
    if (dbError || authError) {
      toast.error((dbError || authError)?.message || "Não foi possível salvar o perfil.");
      return;
    }
    toast.success("Perfil atualizado.");
  };

  const pickAvatar = () => fileInputRef.current?.click();

  const uploadAvatar = async (file: File) => {
    if (!user) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Selecione um arquivo de imagem.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 5MB.");
      return;
    }
    setUploading(true);
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${user.id}/avatar.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true, cacheControl: "3600" });
    if (uploadError) {
      setUploading(false);
      toast.error(uploadError.message || "Não foi possível enviar a foto.");
      return;
    }
    const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
    const cacheBustedUrl = `${pub.publicUrl}?t=${Date.now()}`;
    const { error: dbError } = await supabase
      .from("users")
      .update({ avatar_url: cacheBustedUrl })
      .eq("id", user.id);
    setUploading(false);
    if (dbError) {
      toast.error(dbError.message || "Foto enviada, mas não foi possível salvar a referência.");
      return;
    }
    setAvatarUrl(cacheBustedUrl);
    toast.success("Foto de perfil atualizada.");
  };

  const updatePassword = async () => {
    if (newPassword.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("As senhas não coincidem.");
      return;
    }
    setChangingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setChangingPassword(false);
    if (error) {
      toast.error(error.message || "Não foi possível atualizar a senha.");
      return;
    }
    toast.success("Senha atualizada com sucesso.");
    setNewPassword("");
    setConfirmPassword("");
  };

  if (loading) {
    return (
      <Card>
        <div className="text-sm text-muted-foreground">Carregando…</div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <SectionTitle title="Perfil" action={role && <Badge variant="emerald">{roleLabels[role]}</Badge>} />

        <div className="flex items-center gap-5">
          <div className="group relative">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Foto de perfil"
                className="h-20 w-20 rounded-2xl object-cover"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-emerald text-2xl font-bold text-white">
                {initials(name || user?.email)}
              </div>
            )}
            <button
              onClick={pickAvatar}
              disabled={uploading}
              className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100 disabled:opacity-100"
              title="Alterar foto"
            >
              {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Camera className="h-5 w-5" />}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) uploadAvatar(file);
                e.target.value = "";
              }}
            />
          </div>
          <div>
            <button
              onClick={pickAvatar}
              disabled={uploading}
              className="rounded-full border border-border px-4 py-1.5 text-xs font-medium hover:bg-secondary disabled:opacity-50"
            >
              {uploading ? "Enviando…" : "Alterar foto"}
            </button>
            <div className="mt-1.5 text-[11px] text-muted-foreground">JPG ou PNG, até 5MB.</div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Nome completo</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-xl border border-border bg-secondary/40 p-2.5 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Celular</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 w-full rounded-xl border border-border bg-secondary/40 p-2.5 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">E-mail</label>
            <input
              value={user?.email ?? ""}
              readOnly
              className="mt-1 w-full rounded-xl border border-border bg-secondary/40 p-2.5 text-sm opacity-70"
            />
            <div className="mt-1 text-[11px] text-muted-foreground">
              Para alterar o e-mail de acesso, fale com o suporte.
            </div>
          </div>
        </div>

        <button
          onClick={saveProfile}
          disabled={saving || !name.trim()}
          className="mt-5 rounded-full bg-emerald px-5 py-2.5 text-sm font-semibold text-white shadow-glow disabled:opacity-50"
        >
          {saving ? "Salvando…" : "Salvar alterações"}
        </button>
      </Card>

      <Card>
        <SectionTitle title="Alterar senha" />
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Nova senha</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              className="mt-1 w-full rounded-xl border border-border bg-secondary/40 p-2.5 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Confirmar nova senha</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 w-full rounded-xl border border-border bg-secondary/40 p-2.5 text-sm"
            />
          </div>
        </div>
        <button
          onClick={updatePassword}
          disabled={changingPassword || !newPassword || !confirmPassword}
          className="mt-5 rounded-full border border-border px-5 py-2.5 text-sm font-semibold hover:bg-secondary disabled:opacity-50"
        >
          {changingPassword ? "Atualizando…" : "Atualizar senha"}
        </button>
      </Card>
    </div>
  );
}

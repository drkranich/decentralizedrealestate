import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export function useAuthUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return { user, loading, signOut };
}

export type UserRole = "admin" | "owner" | "tenant";

/**
 * Real role for the current session, read from public.users.role (the
 * source of truth RLS policies key off), not just the JWT's user_metadata
 * (which can go stale). Used to pick which sidebar/pages to show under /app.
 */
export function useUserRole() {
  const { user, loading: userLoading } = useAuthUser();
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userLoading) return;
    if (!user) {
      setRole(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return;
        setRole((data?.role as UserRole | undefined) ?? "tenant");
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user, userLoading]);

  return { role, loading: loading || userLoading };
}

/**
 * Real avatar URL for the current session, read from public.users.avatar_url.
 * Used anywhere we render a user avatar (headers, sidebars) so a photo
 * uploaded from the Profile tab shows up everywhere consistently.
 */
export function useAvatarUrl() {
  const { user, loading: userLoading } = useAuthUser();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (userLoading || !user) {
      setAvatarUrl(null);
      return;
    }
    let cancelled = false;
    supabase
      .from("users")
      .select("avatar_url")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) setAvatarUrl(data?.avatar_url ?? null);
      });
    return () => {
      cancelled = true;
    };
  }, [user, userLoading]);

  return avatarUrl;
}

export function initials(nameOrEmail: string | null | undefined): string {
  if (!nameOrEmail) return "?";
  const parts = nameOrEmail.split(/[\s@.]+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}

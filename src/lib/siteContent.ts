import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

/**
 * Public-site copy, editable by the super admin at /admin/cms and stored in
 * public.site_content (one JSONB row per section). Every landing section
 * calls this with its own key + hardcoded defaults, so the page always
 * renders instantly and never breaks if a row is missing or still loading —
 * it just falls back to the defaults until (and unless) the DB values load.
 */
export function usePublicContent<T extends Record<string, string>>(sectionKey: string, defaults: T): T {
  const [data, setData] = useState<T>(defaults);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from("site_content")
      .select("data")
      .eq("section_key", sectionKey)
      .maybeSingle()
      .then(({ data: row }) => {
        if (cancelled || !row?.data) return;
        setData((prev) => ({ ...prev, ...(row.data as Partial<T>) }));
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionKey]);

  return data;
}

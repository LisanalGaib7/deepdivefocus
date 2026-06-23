/**
 * useIsAdmin — server-verified admin check via `is_admin()` RPC.
 *
 * Backed by `public.user_roles` (with a temporary email fallback inside the
 * DB function). Never trust client-side role flags for sensitive actions —
 * RLS policies must also enforce admin-only mutations.
 */
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import { logger } from "@/lib/logger";

export const useIsAdmin = () => {
  const { user, loading: authLoading } = useAuthContext();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      const { data, error } = await supabase.rpc("is_admin");
      if (cancelled) return;
      if (error) {
        logger.error("useIsAdmin", "is_admin RPC failed:", error);
        setIsAdmin(false);
      } else {
        setIsAdmin(!!data);
      }
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  return { isAdmin, loading: loading || authLoading };
};

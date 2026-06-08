/**
 * useProStatus — single source of truth for Pro subscription state.
 *
 * Authoritative source: Supabase `is_user_pro` RPC (server-side).
 * `localStorage` is a CACHE ONLY — never a grant authority. See
 * `src/features/monetization/README.md` for the full security contract.
 *
 * While SUBSCRIPTION_ENABLED is false, this hook short-circuits and reports
 * `isPro = false` (all paywall UI is hidden anyway, and limits in
 * `src/config/limits.ts` are not gated on isPro).
 */
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SUBSCRIPTION_ENABLED } from '@/config/featureFlags';

const PRO_KEY = 'deepdive_pro_status';

export const useProStatus = () => {
  const [isPro, setIsPro] = useState<boolean>(() => {
    if (!SUBSCRIPTION_ENABLED) return false;
    return localStorage.getItem(PRO_KEY) === 'true';
  });
  const [loading, setLoading] = useState(SUBSCRIPTION_ENABLED);

  // Check pro status from database
  const checkProStatus = useCallback(async () => {
    // [SUBSCRIPTION] gated — see src/features/monetization/README.md
    // Skip subscription reads entirely while the legacy monetization layer is disabled.
    if (!SUBSCRIPTION_ENABLED) {
      setIsPro(false);
      setLoading(false);
      return;
    }

    const { data: { session } } = await (supabase.auth as any).getSession();

    if (!session?.user) {
      // Guest mode: use localStorage cache only.
      setIsPro(localStorage.getItem(PRO_KEY) === 'true');
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.rpc('is_user_pro', {
      _user_id: session.user.id,
    });

    if (error) {
      console.error('Error checking pro status:', error);
      // Fallback to localStorage cache (best-effort, will reconcile on next check).
      setIsPro(localStorage.getItem(PRO_KEY) === 'true');
    } else {
      const proStatus = !!data;
      setIsPro(proStatus);
      // Sync to localStorage for offline/fast reads
      if (proStatus) {
        localStorage.setItem(PRO_KEY, 'true');
      } else {
        localStorage.removeItem(PRO_KEY);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    // When the flag is off, the effect is a no-op so we skip the call entirely.
    if (!SUBSCRIPTION_ENABLED) return;
    checkProStatus();
  }, [checkProStatus]);

  // Legacy activatePro for guest/demo mode
  const activatePro = useCallback(() => {
    localStorage.setItem(PRO_KEY, 'true');
    setIsPro(true);
  }, []);

  const deactivatePro = useCallback(() => {
    localStorage.removeItem(PRO_KEY);
    setIsPro(false);
  }, []);

  // While the flag is off, paywall UI is hidden but we still report
  // `isPro = false` so that any non-paywall logic (e.g. analytics labels)
  // does not accidentally mark every user as Pro. Permanent free perks
  // (task slot count, etc.) are now gated on HARD_CAP_* limits — not isPro.
  return {
    isPro,
    activatePro,
    deactivatePro,
    refreshProStatus: checkProStatus,
    proLoading: loading,
  };
};

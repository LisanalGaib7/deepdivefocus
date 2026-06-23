/**
 * useProStatus — single source of truth for Pro subscription state.
 *
 * Authoritative source: Supabase `is_user_pro` RPC (server-side).
 * `localStorage` is a CACHE ONLY — never a grant authority. See
 * `src/features/monetization/README.md` for the full security contract.
 */
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SUBSCRIPTION_ENABLED } from '@/config/featureFlags';
import { logger } from '@/lib/logger';

const PRO_KEY = 'deepdive_pro_status';

export const useProStatus = () => {
  const [isPro, setIsPro] = useState<boolean>(() => {
    if (!SUBSCRIPTION_ENABLED) return false;
    return localStorage.getItem(PRO_KEY) === 'true';
  });
  const [loading, setLoading] = useState(SUBSCRIPTION_ENABLED);

  const checkProStatus = useCallback(async () => {
    if (!SUBSCRIPTION_ENABLED) {
      setIsPro(false);
      setLoading(false);
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
      setIsPro(localStorage.getItem(PRO_KEY) === 'true');
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.rpc('is_user_pro', {
      _user_id: session.user.id,
    });

    if (error) {
      logger.error('useProStatus', 'Error checking pro status:', error);
      setIsPro(localStorage.getItem(PRO_KEY) === 'true');
    } else {
      const proStatus = !!data;
      setIsPro(proStatus);
      if (proStatus) {
        localStorage.setItem(PRO_KEY, 'true');
      } else {
        localStorage.removeItem(PRO_KEY);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!SUBSCRIPTION_ENABLED) return;
    checkProStatus();
  }, [checkProStatus]);

  const activatePro = useCallback(() => {
    localStorage.setItem(PRO_KEY, 'true');
    setIsPro(true);
  }, []);

  const deactivatePro = useCallback(() => {
    localStorage.removeItem(PRO_KEY);
    setIsPro(false);
  }, []);

  return {
    isPro,
    activatePro,
    deactivatePro,
    refreshProStatus: checkProStatus,
    proLoading: loading,
  };
};

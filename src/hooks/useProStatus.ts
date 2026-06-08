/**
 * useProStatus — single source of truth for Pro subscription state.
 * Checks Supabase pro_subscriptions table for authenticated users,
 * falls back to localStorage for guest mode.
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
    // [SUBSCRIPTION] 추후 AI 분석 리포트 Pro 기능과 함께 재활성화 예정
    // Skip subscription reads entirely while the legacy monetization layer is disabled.
    if (!SUBSCRIPTION_ENABLED) {
      setIsPro(false);
      setLoading(false);
      return;
    }

    const { data: { session } } = await (supabase.auth as any).getSession();
    
    if (!session?.user) {
      // Guest mode: use localStorage
      setIsPro(localStorage.getItem(PRO_KEY) === 'true');
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.rpc('is_user_pro', {
      _user_id: session.user.id,
    });

    if (error) {
      console.error('Error checking pro status:', error);
      // Fallback to localStorage
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

  // [SUBSCRIPTION] 추후 AI 분석 리포트 Pro 기능과 함께 재활성화 예정
  // When disabled, all users are treated as Pro so legacy limits are bypassed without deleting the code.
  const effectiveIsPro = SUBSCRIPTION_ENABLED ? isPro : true;

  return {
    isPro: effectiveIsPro,
    rawIsPro: isPro,
    activatePro,
    deactivatePro,
    refreshProStatus: checkProStatus,
    proLoading: loading,
  };
};

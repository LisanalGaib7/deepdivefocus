/**
 * useProStatus — single source of truth for Pro subscription state.
 * Currently uses localStorage for demo purposes; swap for Supabase
 * subscription check when payment is wired up.
 */
import { useState, useCallback } from 'react';

const PRO_KEY = 'deepdive_pro_status';

export const useProStatus = () => {
  const [isPro, setIsPro] = useState<boolean>(() => {
    return localStorage.getItem(PRO_KEY) === 'true';
  });

  const activatePro = useCallback(() => {
    localStorage.setItem(PRO_KEY, 'true');
    setIsPro(true);
  }, []);

  const deactivatePro = useCallback(() => {
    localStorage.removeItem(PRO_KEY);
    setIsPro(false);
  }, []);

  return { isPro, activatePro, deactivatePro };
};

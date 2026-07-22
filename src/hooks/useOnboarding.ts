import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "onboarding.trainingDive.completed.v1";

/**
 * Simple device-scoped onboarding flag. Backed by localStorage so it survives
 * refreshes but is intentionally per-device (no Supabase write).
 */
export function useOnboarding() {
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    try {
      const done = typeof window !== "undefined" && window.localStorage.getItem(STORAGE_KEY);
      if (!done) setShouldShow(true);
    } catch {
      // localStorage unavailable — skip onboarding rather than crash.
    }
  }, []);

  const complete = useCallback(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignore
    }
    setShouldShow(false);
  }, []);

  return { shouldShow, complete };
}

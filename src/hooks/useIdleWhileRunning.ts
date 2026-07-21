import { useEffect, useState } from "react";

/**
 * Returns true when `active` is on AND no pointer/touch/key activity
 * has occurred for `idleMs`. Any input resets to false immediately.
 * Disabled entirely when the user prefers reduced motion.
 */
export function useIdleWhileRunning(active: boolean, idleMs = 4000): boolean {
  const [idle, setIdle] = useState(false);

  useEffect(() => {
    if (!active) {
      setIdle(false);
      return;
    }
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    let timer: ReturnType<typeof setTimeout> | null = null;
    const kick = () => {
      setIdle(false);
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => setIdle(true), idleMs);
    };
    kick();

    const events: (keyof WindowEventMap)[] = [
      "pointermove",
      "pointerdown",
      "touchstart",
      "keydown",
      "wheel",
    ];
    events.forEach((e) => window.addEventListener(e, kick, { passive: true }));
    return () => {
      if (timer) clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, kick));
    };
  }, [active, idleMs]);

  return idle;
}

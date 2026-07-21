import { useEffect, useState } from "react";

interface DiveIgnitionProps {
  /** True during the initial dive-start transition window. */
  active: boolean;
}

/**
 * "Instrument Panel" dive-start cue. A single thin hairline sweeps horizontally
 * across the gauge area (~700ms), leaving a soft primary-color trail. Non-blocking:
 * sits behind the gauge, no numeric readout, no takeover.
 *
 * Skipped entirely under prefers-reduced-motion.
 */
const DiveIgnition = ({ active }: DiveIgnitionProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (active) {
      const prefersReduced =
        typeof window !== "undefined" &&
        window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      if (prefersReduced) return;
      setMounted(true);
      const t = setTimeout(() => setMounted(false), 900);
      return () => clearTimeout(t);
    }
  }, [active]);

  if (!mounted) return null;

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden rounded-full"
      aria-hidden
    >
      <div className="dive-ignition-sweep" />
    </div>
  );
};

export default DiveIgnition;

import { useEffect, useState } from "react";

interface DescentCeremonyProps {
  /** True during the initial dive-start transition window. */
  active: boolean;
  /** Target depth to tick toward during descent (from useGamification). Falls back to a symbolic value. */
  targetDepth?: number;
  /** Duration in ms — should match the parent's transition window (default 2000ms). */
  durationMs?: number;
}

/**
 * Fullscreen "Pressure Collapse" descent ritual played at dive start.
 * Purely presentational: parent controls when it appears via `active`.
 */
const DescentCeremony = ({ active, targetDepth = 482, durationMs = 2000 }: DescentCeremonyProps) => {
  const [mounted, setMounted] = useState(false);
  const [depth, setDepth] = useState(0);
  const [stress, setStress] = useState(0);

  // Mount/unmount with a small fade window
  useEffect(() => {
    if (active) {
      setMounted(true);
      setDepth(0);
      setStress(0);
      const start = performance.now();
      let raf = 0;
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / durationMs);
        // ease-out cubic
        const eased = 1 - Math.pow(1 - t, 3);
        setDepth(Math.round(targetDepth * eased));
        setStress(Math.round(82 * eased));
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(raf);
    } else if (mounted) {
      // fade out
      const t = setTimeout(() => setMounted(false), 300);
      return () => clearTimeout(t);
    }
  }, [active, targetDepth, durationMs, mounted]);

  if (!mounted) return null;

  return (
    <div
      className={`fixed inset-0 z-[9998] pointer-events-none flex items-center justify-center transition-opacity duration-300 ${
        active ? "opacity-100" : "opacity-0"
      }`}
      aria-hidden
    >
      {/* Vignette + backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className="absolute inset-0 shadow-[inset_0_0_140px_60px_rgba(0,0,0,1)]" />

      {/* Collapsing rings */}
      <div className="absolute w-[420px] h-[420px] rounded-full border border-primary/40 animate-ping" />
      <div className="absolute w-64 h-64 rounded-full border-2 border-primary animate-pulse" />

      {/* Centered readout */}
      <div className="relative text-center font-robotic text-primary">
        <div className="text-[11px] tracking-[0.5em] mb-3 uppercase animate-pulse">
          Pressure Increasing
        </div>
        <div
          className="text-6xl font-bold tabular-nums italic tracking-tighter"
          style={{ textShadow: "0 0 12px hsl(var(--primary) / 0.7)" }}
        >
          {depth}
          <span className="text-xl ml-2 opacity-50 not-italic">m</span>
        </div>
      </div>

      {/* Hull stress bar */}
      <div className="absolute inset-x-8 bottom-24 max-w-md mx-auto">
        <div className="flex justify-between mb-2 text-[10px] tracking-widest text-primary/80 font-robotic uppercase">
          <span>Hull Stress</span>
          <span className="tabular-nums">{stress}%</span>
        </div>
        <div className="h-1 w-full bg-slate-900/80 overflow-hidden">
          <div
            className="h-full bg-primary transition-[width] duration-100 ease-out"
            style={{
              width: `${stress}%`,
              boxShadow: "0 0 10px hsl(var(--primary) / 0.6)",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default DescentCeremony;

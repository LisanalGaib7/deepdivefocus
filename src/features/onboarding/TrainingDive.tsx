import { useEffect, useState } from "react";

interface Step {
  targetSelector: string;
  title: string;
  body: string;
  fallbackPosition?: "center";
}

const STEPS: Step[] = [
  {
    targetSelector: "[data-onboarding='dive-start']",
    title: "STEP 1 · DESCEND",
    body: "Tap the play button to start a dive. Your focus becomes depth.",
  },
  {
    targetSelector: "[data-onboarding='pearl']",
    title: "STEP 2 · GOLDEN PEARLS",
    body: "Complete dives to earn Pearls. Spend them in the Engineering Bay.",
  },
  {
    targetSelector: "[data-onboarding='priority-tab']",
    title: "STEP 3 · PRIORITY",
    body: "Rank tasks by urgency and impact before diving.",
  },
];

interface TrainingDiveProps {
  onComplete: () => void;
  onStepChange?: (index: number) => void;
}

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const PADDING = 10;

const TrainingDive = ({ onComplete, onStepChange }: TrainingDiveProps) => {
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);

  const current = STEPS[step];

  useEffect(() => {
    onStepChange?.(step);
  }, [step, onStepChange]);

  useEffect(() => {
    let raf = 0;
    const measure = () => {
      const el = document.querySelector<HTMLElement>(current.targetSelector);
      if (!el) {
        setRect(null);
        return;
      }
      const r = el.getBoundingClientRect();
      setRect({
        top: r.top - PADDING,
        left: r.left - PADDING,
        width: r.width + PADDING * 2,
        height: r.height + PADDING * 2,
      });
    };
    // Delay one frame so any tab transition settles.
    raf = requestAnimationFrame(measure);
    const onResize = () => measure();
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onResize, true);
    const interval = window.setInterval(measure, 400);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onResize, true);
      window.clearInterval(interval);
    };
  }, [current.targetSelector]);

  const isLast = step === STEPS.length - 1;

  const next = () => {
    if (isLast) onComplete();
    else setStep((s) => s + 1);
  };

  return (
    <div
      className="fixed inset-0 z-[95] flex items-end justify-center pointer-events-none"
      aria-live="polite"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop + spotlight */}
      {rect ? (
        <div
          className="coach-spotlight"
          style={{
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
          }}
        />
      ) : (
        <div className="fixed inset-0 bg-black/70 pointer-events-none" />
      )}

      {/* Tooltip card — anchored to bottom for one-hand reach */}
      <div className="relative w-full max-w-md mx-auto px-4 pb-[calc(env(safe-area-inset-bottom,0)+7rem)] pointer-events-auto">
        <div className="rounded-2xl border border-primary/30 bg-card/95 backdrop-blur-xl p-5 shadow-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-robotic tracking-[0.25em] text-primary uppercase">
              {current.title}
            </span>
            <span className="text-[10px] font-mono text-muted-foreground tabular-nums">
              {step + 1} / {STEPS.length}
            </span>
          </div>
          <p className="text-sm text-foreground/85 leading-relaxed mb-4">
            {current.body}
          </p>
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={onComplete}
              className="text-xs font-mono tracking-widest text-muted-foreground hover:text-foreground uppercase min-h-11 px-2"
            >
              Skip
            </button>
            <button
              onClick={next}
              className="min-h-11 px-6 rounded-lg bg-primary text-primary-foreground font-robotic tracking-widest text-xs uppercase font-bold transition-colors hover:bg-primary/90"
            >
              {isLast ? "Begin" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainingDive;

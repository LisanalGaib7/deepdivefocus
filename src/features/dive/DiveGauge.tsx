import { forwardRef } from "react";
import { Anchor } from "lucide-react";
import { TIMER_CONFIG } from "@/constants/gameConfig";

interface DiveGaugeProps {
  setDuration: number;
  timeLeft: number;
  isRunning: boolean;
  isDragging: boolean;
  displayProgress: number;
  depth: number;
  isAtMaxDepth: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onTouchStart: (e: React.TouchEvent) => void;
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

const DiveGauge = forwardRef<SVGSVGElement, DiveGaugeProps>(
  (
    {
      setDuration,
      timeLeft,
      isRunning,
      isDragging,
      displayProgress,
      depth,
      isAtMaxDepth,
      onMouseDown,
      onTouchStart,
    },
    ref,
  ) => {
    const cursor = !isRunning ? (isDragging ? "cursor-grabbing" : "cursor-grab") : "cursor-default";

    return (
      <div className="relative select-none">
        <svg
          ref={ref}
          className={`w-72 h-72 md:w-80 md:h-80 touch-none ${cursor}`}
          viewBox="-20 -20 340 340"
          onMouseDown={onMouseDown}
          onTouchStart={onTouchStart}
        >
          <defs>
            <filter id="gaugeGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="gaugeGlowIntense" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <circle cx="150" cy="150" r="135" fill="hsl(var(--background))" stroke="hsl(var(--border))" strokeWidth="1" />
          <circle cx="150" cy="150" r="105" fill="none" stroke="hsl(var(--border))" strokeWidth="1" opacity="0.5" />

          {Array.from({ length: 60 }).map((_, i) => {
            const segAngle = (i * 6 - 90) * (Math.PI / 180);
            const isMajor = i % 5 === 0;
            const outerR = 132;
            const innerR = isMajor ? 112 : 118;
            const segmentPercent = (i / 60) * 100;
            const isActive = segmentPercent < displayProgress;
            const x1 = 150 + outerR * Math.cos(segAngle);
            const y1 = 150 + outerR * Math.sin(segAngle);
            const x2 = 150 + innerR * Math.cos(segAngle);
            const y2 = 150 + innerR * Math.sin(segAngle);
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={isActive ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"}
                strokeWidth={isMajor ? 3 : 2}
                opacity={isActive ? 1 : isMajor ? 0.25 : 0.1}
                strokeLinecap="round"
                filter={isActive ? "url(#gaugeGlow)" : undefined}
                style={{ transition: isDragging ? "none" : "opacity 0.3s, stroke 0.3s" }}
              />
            );
          })}

          <circle cx="150" cy="150" r="136" fill="none" stroke="hsl(var(--primary))" strokeWidth="1.5" opacity="0.3" />

          {[5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60].map(minutes => {
            const angle = ((minutes / 60) * 360 - 90) * (Math.PI / 180);
            const labelR = 145;
            const x = 150 + labelR * Math.cos(angle);
            const y = 150 + labelR * Math.sin(angle);
            const segmentPercent = (minutes / 60) * 100;
            const isActive = segmentPercent <= displayProgress;
            return (
              <text
                key={minutes}
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={isActive ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"}
                className="text-[10px] font-bold"
                style={{ fontFamily: "'Orbitron', monospace" }}
                opacity={isActive ? 0.9 : 0.4}
              >
                {minutes}
              </text>
            );
          })}

          {displayProgress > 0 && (() => {
            const endAngle = (-90 + (displayProgress / 100) * 360) * (Math.PI / 180);
            const knobR = 132;
            const knobX = 150 + knobR * Math.cos(endAngle);
            const knobY = 150 + knobR * Math.sin(endAngle);
            return (
              <g filter="url(#gaugeGlowIntense)">
                <circle cx={knobX} cy={knobY} r="8" fill="hsl(var(--background))" stroke="hsl(var(--primary))" strokeWidth="3" />
                <circle cx={knobX} cy={knobY} r="3" fill="hsl(var(--primary))" />
              </g>
            );
          })()}

          <circle cx="150" cy="150" r="136" fill="transparent" />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div
            className="absolute inset-0 rounded-full pointer-events-none overflow-hidden opacity-[0.04]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, transparent, transparent 2px, hsl(var(--foreground)) 2px, hsl(var(--foreground)) 3px)",
              backgroundSize: "100% 3px",
              animation: "scanline-scroll 8s linear infinite",
            }}
          />

          <div className="text-4xl md:text-5xl font-extrabold tabular-nums tracking-wider font-robotic text-primary drop-shadow-[0_0_20px_hsl(var(--primary)/0.6)]">
            {formatTime(isDragging ? setDuration : timeLeft)}
          </div>

          {isRunning && (
            <div className="flex flex-col items-center mt-2">
              <div className="flex items-center gap-2 text-primary/80">
                <Anchor className="h-4 w-4" />
                <span className="font-robotic text-lg font-bold tracking-wider">{depth}m</span>
              </div>
              {isAtMaxDepth && (
                <p className="text-xs text-primary/40 font-robotic mt-1">ZONE LOCKED 🔒</p>
              )}
            </div>
          )}

          {!isRunning && !isDragging && (
            <p className="text-xs mt-2 text-primary/50 font-robotic tracking-wider">DRAG TO SET</p>
          )}
          {isDragging && (
            <p className="text-xs mt-2 animate-pulse text-primary/70 font-robotic tracking-wider">
              {formatTime(setDuration)} — RELEASE
            </p>
          )}
        </div>
      </div>
    );
  },
);

DiveGauge.displayName = "DiveGauge";

export default DiveGauge;

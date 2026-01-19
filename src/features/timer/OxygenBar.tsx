import { cn } from "@/lib/utils";

interface OxygenBarProps {
  oxygen: number;
  className?: string;
}

export const OxygenBar = ({ oxygen, className }: OxygenBarProps) => {
  const isLow = oxygen < 30;
  const isCritical = oxygen < 15;

  return (
    <div className={cn("w-full max-w-xs mx-auto", className)}>
      {/* HUD Label */}
      <div className="flex justify-between items-center mb-1.5">
        <span 
          className={cn(
            "text-xs font-robotic uppercase tracking-widest transition-colors duration-300",
            isLow ? "text-[hsl(var(--hud-emergency))]" : "text-[hsl(var(--hud-cyan))]"
          )}
        >
          O₂ Supply
        </span>
        <span 
          className={cn(
            "text-xs font-robotic tabular-nums transition-colors duration-300",
            isLow ? "text-[hsl(var(--hud-emergency))]" : "text-[hsl(var(--hud-cyan))]",
            isCritical && "animate-pulse"
          )}
        >
          {Math.round(oxygen)}%
        </span>
      </div>

      {/* Oxygen Bar Container - HUD Style */}
      <div 
        className={cn(
          "relative h-3 rounded-sm overflow-hidden transition-all duration-300",
          "border",
          isLow 
            ? "border-[hsl(var(--hud-emergency)/0.6)] bg-[hsl(var(--hud-emergency)/0.1)]" 
            : "border-[hsl(var(--hud-cyan)/0.4)] bg-[hsl(var(--hud-cyan)/0.05)]"
        )}
      >
        {/* Fill */}
        <div
          className={cn(
            "absolute inset-y-0 left-0 transition-all duration-300",
            isLow 
              ? "bg-[hsl(var(--hud-emergency))]" 
              : "bg-[hsl(var(--hud-cyan))]",
            isCritical && "animate-pulse"
          )}
          style={{ width: `${Math.max(0, Math.min(100, oxygen))}%` }}
        />

        {/* Scanlines overlay for HUD effect */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: `repeating-linear-gradient(
              0deg,
              transparent,
              transparent 1px,
              rgba(0,0,0,0.3) 1px,
              rgba(0,0,0,0.3) 2px
            )`,
          }}
        />

        {/* Glow effect */}
        <div
          className={cn(
            "absolute inset-0 transition-opacity duration-300",
            isLow 
              ? "shadow-[inset_0_0_10px_hsl(var(--hud-emergency)/0.5)]" 
              : "shadow-[inset_0_0_10px_hsl(var(--hud-cyan)/0.3)]"
          )}
        />
      </div>

      {/* Warning text */}
      {isLow && (
        <p 
          className={cn(
            "text-[10px] font-robotic uppercase tracking-wider mt-1 text-center",
            "text-[hsl(var(--hud-emergency))]",
            isCritical && "animate-pulse"
          )}
        >
          {isCritical ? "⚠ CRITICAL" : "LOW OXYGEN"}
        </p>
      )}
    </div>
  );
};

export default OxygenBar;

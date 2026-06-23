import { Circle } from "lucide-react";
import { memo } from "react";
import { cn } from "@/lib/utils";

/**
 * Single source of truth for the "golden pearl" visual badge.
 * Used by MissionCompleteModal, EngineeringBayModal, and upgrade buttons.
 *
 * Variants:
 *  - "header": large badge with pill background (Engineering Bay vessel header)
 *  - "reward": "+N PEARLS" style (mission complete reward)
 *  - "cost":   compact icon + number (upgrade button cost)
 */
interface PearlBadgeProps {
  amount: number;
  variant?: "header" | "reward" | "cost";
  className?: string;
}

const PearlBadge = ({ amount, variant = "cost", className }: PearlBadgeProps) => {
  if (variant === "header") {
    return (
      <div
        className={cn(
          "flex items-center gap-2 bg-pearl/10 border border-pearl/30 rounded-lg px-3 py-1.5 transition-colors duration-500",
          className,
        )}
      >
        <Circle className="h-4 w-4 text-pearl fill-pearl drop-shadow-[0_0_5px_hsl(var(--pearl)/0.8)] transition-colors duration-500" />
        <span className="text-pearl font-robotic text-sm transition-colors duration-500">
          {amount.toLocaleString()}
        </span>
      </div>
    );
  }

  if (variant === "reward") {
    return (
      <div
        className={cn(
          "flex items-center justify-center gap-2 pt-3 border-t border-border",
          className,
        )}
      >
        <Circle className="h-4 w-4 text-amber-400 fill-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.8)]" />
        <span className="text-amber-400 font-robotic text-sm">
          +{amount} PEARLS
        </span>
      </div>
    );
  }

  // cost
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Circle className="h-3 w-3 fill-current drop-shadow-[0_0_4px_hsl(var(--pearl)/0.6)]" />
      <span>{amount}</span>
    </div>
  );
};

export default memo(PearlBadge);

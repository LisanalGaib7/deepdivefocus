import { memo } from "react";
import ThemeSwitcher from "@/components/common/ThemeSwitcher";

interface DiveTimeCardProps {
  todayMinutes: number;
  showCalibration: boolean;
}

const DiveTimeCard = ({ todayMinutes, showCalibration }: DiveTimeCardProps) => {
  return (
    <div className="flex justify-center">
      <div className="relative inline-flex flex-col items-center rounded-2xl bg-background/40 backdrop-blur-md border border-primary/30 shadow-[0_0_20px_hsl(var(--primary)/0.15)] overflow-hidden">
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary/30 rounded-tl-xl" />
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary/30 rounded-tr-xl" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary/30 rounded-bl-xl" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary/30 rounded-br-xl" />

        <div className="flex flex-col items-center gap-3 px-10 py-5">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] uppercase tracking-[0.25em] text-primary font-bold">
              TODAY'S DIVE TIME
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-5xl md:text-6xl font-mono font-black text-foreground tracking-tight tabular-nums drop-shadow-[0_0_10px_hsl(var(--primary)/0.5)]">
              {todayMinutes}
            </span>
            <span className="text-base font-mono uppercase tracking-widest text-foreground/50 font-bold">
              mins
            </span>
          </div>
        </div>

        <div className="w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

        {showCalibration && (
          <div className="flex flex-col items-center gap-2 px-8 py-4 animate-fade-in">
            <span className="text-[9px] uppercase tracking-[0.2em] text-foreground/40 font-bold">
              CALIBRATION
            </span>
            <ThemeSwitcher />
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(DiveTimeCard);

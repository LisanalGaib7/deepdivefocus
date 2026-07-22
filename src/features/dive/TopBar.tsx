import { memo } from "react";
import { Crown, Menu } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import TopBarSheet from "@/features/dive/TopBarSheet";

interface TopBarProps {
  showProBadge: boolean;
  onOpenPricing: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  isSoundEnabled: boolean;
  onToggleSound: () => void;
  onOpenEngineeringBay: () => void;
  onLogout: () => void;
}

const TopBar = ({
  showProBadge,
  onOpenPricing,
  isFullscreen,
  onToggleFullscreen,
  isSoundEnabled,
  onToggleSound,
  onOpenEngineeringBay,
  onLogout,
}: TopBarProps) => {
  return (
    <>
      {showProBadge && (
        <div className="absolute top-4 left-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onOpenPricing}
                data-onboarding="pearl"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-yellow-500/50 bg-yellow-500/10 transition-all duration-300 hover:bg-yellow-500/20"
              >
                <Crown className="w-3.5 h-3.5 text-yellow-400 drop-shadow-[0_0_6px_rgba(234,179,8,0.8)]" />
                <span className="text-[10px] font-bold font-mono tracking-widest text-yellow-400">PRO</span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="font-mono text-xs tracking-wider">
              NUCLEAR REACTOR ACTIVE
            </TooltipContent>
          </Tooltip>
        </div>
      )}

      <div className="absolute top-4 right-4 flex items-center">
        <TopBarSheet
          isFullscreen={isFullscreen}
          onToggleFullscreen={onToggleFullscreen}
          isSoundEnabled={isSoundEnabled}
          onToggleSound={onToggleSound}
          onOpenEngineeringBay={onOpenEngineeringBay}
          onLogout={onLogout}
          trigger={
            <button
              className="min-h-11 min-w-11 p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors duration-300 flex items-center justify-center"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          }
        />
      </div>
    </>
  );
};

export default memo(TopBar);

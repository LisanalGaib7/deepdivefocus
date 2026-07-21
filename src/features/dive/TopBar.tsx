import { memo } from "react";
import { Crown, Wrench, Power, Volume2, VolumeX, Maximize, Minimize } from "lucide-react";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import GuidebookModal from "@/components/common/GuidebookModal";

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

const TOAST_CLASS =
  "!bg-card !border !border-primary/30 !backdrop-blur-md !shadow-[0_0_20px_hsl(var(--primary)/0.3)] !text-primary font-mono !text-xs !tracking-widest";

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
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-yellow-500/50 bg-yellow-500/10 transition-all duration-300 hover:bg-yellow-500/20"
                style={{ boxShadow: "0 0 12px rgba(234,179,8,0.3)" }}
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

      <div className="absolute top-4 right-4 flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => {
                onToggleFullscreen();
                toast(isFullscreen ? "STANDARD VIEW RESTORED" : "INITIATING FULL IMMERSION", {
                  duration: 2000,
                  position: "bottom-center",
                  className: TOAST_CLASS,
                });
              }}
              className={`p-2 rounded-lg transition-all duration-300 ${
                isFullscreen
                  ? "text-primary drop-shadow-[0_0_6px_hsl(var(--primary)/0.6)] hover:bg-primary/10"
                  : "text-muted-foreground/50 hover:bg-muted/10"
              }`}
              aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="font-mono text-xs tracking-wider">
            {isFullscreen ? "EXIT IMMERSION" : "FULL IMMERSION"}
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => {
                onToggleSound();
                toast(isSoundEnabled ? "SILENT RUNNING ACTIVATED" : "SONAR SYSTEMS ONLINE", {
                  duration: 2000,
                  position: "bottom-center",
                  className: TOAST_CLASS,
                });
              }}
              className={`p-2 rounded-lg transition-all duration-300 ${
                isSoundEnabled
                  ? "text-primary drop-shadow-[0_0_6px_hsl(var(--primary)/0.6)] hover:bg-primary/10"
                  : "text-muted-foreground/50 hover:bg-muted/10"
              }`}
              aria-label={isSoundEnabled ? "Mute notifications" : "Unmute notifications"}
            >
              {isSoundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="font-mono text-xs tracking-wider">
            {isSoundEnabled ? "SONAR ACTIVE" : "SILENT RUNNING"}
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onOpenEngineeringBay}
              className="p-2 text-muted-foreground hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-all duration-300"
              aria-label="Engineering Bay"
            >
              <Wrench className="w-5 h-5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="font-mono text-xs tracking-wider">
            ENGINEERING BAY
          </TooltipContent>
        </Tooltip>

        <GuidebookModal />

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onLogout}
              className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all duration-300"
              aria-label="Logout"
            >
              <Power className="w-5 h-5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="left" className="font-mono text-xs tracking-wider">
            SYSTEM SHUTDOWN
          </TooltipContent>
        </Tooltip>
      </div>
    </>
  );
};

export default memo(TopBar);

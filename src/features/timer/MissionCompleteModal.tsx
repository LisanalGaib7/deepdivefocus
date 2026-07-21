import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Creature, getRarityColor } from "@/data/creatures";
import { getPearlValue } from "@/lib/lootSystem";
import { formatMinutesSeconds } from "@/lib/formatTime";
import PixelCreature from "@/components/common/PixelCreature";
import PearlBadge from "@/components/common/PearlBadge";
import { Anchor, Sparkles } from "lucide-react";

interface MissionCompleteModalProps {
  open: boolean;
  onClose: () => void;
  maxDepth: number;
  creature: Creature | null;
  sessionDuration: number;
  /** True if this is the user's first time unlocking this creature. */
  isNewDiscovery?: boolean;
}

export const MissionCompleteModal = ({
  open,
  onClose,
  maxDepth,
  creature,
  sessionDuration,
  isNewDiscovery = false,
}: MissionCompleteModalProps) => {
  const pearls = creature ? getPearlValue(creature.rarity) : 0;

  // formatMinutesSeconds imported from @/lib/formatTime

  return (
    <AlertDialog open={open}>
        <AlertDialogContent className="bg-card border-primary/30 max-w-md max-h-[90vh] overflow-y-auto scrollbar-deep-sea p-4 sm:p-6">
        {/* Header with scan lines effect */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        </div>

        <AlertDialogHeader className="relative space-y-2">
          <div className="flex items-center justify-center mb-2">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
              <div className="relative bg-primary/10 border border-primary/50 rounded-full p-3">
                <Anchor className="h-6 w-6 text-primary" />
              </div>
            </div>
          </div>

          <AlertDialogTitle className="text-center font-robotic text-xl tracking-widest text-primary">
            SURFACE REACHED
          </AlertDialogTitle>

          <AlertDialogDescription className="text-center">
            <span className="text-muted-foreground font-robotic text-xs tracking-wider">
              DIVE COMPLETE
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Creature Reward Section — sonar-scanned reveal */}
        {creature && (
          <div className="relative flex flex-col items-center my-4">
            {/* Expanding sonar ping */}
            <div className="relative">
              <div
                className="absolute inset-0 rounded-full border border-primary/50 pointer-events-none"
                style={{ animation: "sonar 3s cubic-bezier(0.215,0.61,0.355,1) infinite" }}
              />
              <div
                className="w-40 h-40 rounded-full bg-background/60 border border-primary/30 flex items-center justify-center overflow-hidden"
                style={{ boxShadow: "inset 0 0 30px hsl(var(--primary) / 0.15)" }}
              >
                <PixelCreature type={creature.id} className="w-24 h-24" />
              </div>
              {isNewDiscovery && (
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] px-3 py-1 font-bold tracking-widest rounded-sm font-robotic flex items-center gap-1 whitespace-nowrap">
                  <Sparkles className="h-3 w-3" /> NEW BIOMASS
                </div>
              )}
            </div>

            <h3
              className={`mt-6 text-2xl font-robotic font-bold tracking-wide ${getRarityColor(
                creature.rarity
              )} drop-shadow-[0_0_10px_hsl(var(--primary))]`}
            >
              {creature.name}
            </h3>
            <p
              className={`text-[10px] font-robotic tracking-[0.3em] uppercase mt-1 ${
                creature.rarity === "Common"
                  ? "text-gray-400"
                  : creature.rarity === "Rare"
                  ? "text-primary"
                  : "text-amber-400"
              }`}
            >
              {creature.rarity}
            </p>

            <PearlBadge amount={pearls} variant="reward" className="mt-3" />
          </div>
        )}

        {/* Session log — glass panel with left neon accent */}
        <div
          className="p-4 border-l-2 border-primary rounded-r-md"
          style={{
            background:
              "linear-gradient(180deg, hsl(var(--primary) / 0.06) 0%, transparent 100%)",
          }}
        >
          <div className="text-[10px] opacity-60 mb-3 tracking-[0.3em] font-robotic text-primary uppercase">
            Session Log
          </div>
          <div className="flex justify-between items-end mb-2">
            <span className="text-xs opacity-70 uppercase font-robotic tracking-wider text-muted-foreground">
              Time Active
            </span>
            <span className="text-xl font-robotic tabular-nums text-white drop-shadow-[0_0_8px_hsl(var(--primary))]">
              {formatMinutesSeconds(sessionDuration)}
            </span>
          </div>
          <div className="flex justify-between items-end">
            <span className="text-xs opacity-70 uppercase font-robotic tracking-wider text-muted-foreground">
              Max Depth
            </span>
            <span className="text-xl font-robotic tabular-nums text-white drop-shadow-[0_0_8px_hsl(var(--primary))]">
              {maxDepth}m
            </span>
          </div>
        </div>

        <AlertDialogFooter className="mt-4 mb-2">
          <Button
            onClick={onClose}
            variant="outline"
            className="w-full bg-transparent border border-primary text-primary font-robotic uppercase tracking-widest h-11 transition-all duration-300 hover:bg-primary hover:text-primary-foreground hover:shadow-[0_0_15px_hsl(var(--primary)/0.5)]"
          >
            STORE DATA
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default MissionCompleteModal;

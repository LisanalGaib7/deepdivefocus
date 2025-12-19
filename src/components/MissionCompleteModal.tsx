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
import { getPearlValue, isCreatureCollected } from "@/lib/lootSystem";
import { Anchor, Gem, Sparkles } from "lucide-react";

interface MissionCompleteModalProps {
  open: boolean;
  onClose: () => void;
  maxDepth: number;
  creature: Creature | null;
  sessionDuration: number;
}

export const MissionCompleteModal = ({
  open,
  onClose,
  maxDepth,
  creature,
  sessionDuration,
}: MissionCompleteModalProps) => {
  const isNewDiscovery = creature ? !isCreatureCollected(creature.id) : false;
  const pearls = creature ? getPearlValue(creature.rarity) : 0;

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <AlertDialog open={open}>
      <AlertDialogContent className="bg-card border-hud-cyan/30 max-w-md">
        {/* Header with scan lines effect */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg">
          <div className="absolute inset-0 bg-gradient-to-b from-hud-cyan/5 to-transparent" />
        </div>

        <AlertDialogHeader className="relative">
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-hud-cyan/20 blur-xl rounded-full" />
              <div className="relative bg-hud-cyan/10 border border-hud-cyan/50 rounded-full p-4">
                <Anchor className="h-8 w-8 text-hud-cyan" />
              </div>
            </div>
          </div>

          <AlertDialogTitle className="text-center font-robotic text-2xl tracking-widest text-hud-cyan">
            SURFACE REACHED
          </AlertDialogTitle>

          <AlertDialogDescription className="text-center space-y-1">
            <span className="text-muted-foreground font-robotic text-sm tracking-wider">
              MISSION_COMPLETE // DIVE_SUCCESSFUL
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Stats Section */}
        <div className="grid grid-cols-2 gap-4 my-6">
          <div className="bg-muted/30 border border-border rounded-lg p-4 text-center">
            <p className="text-xs text-muted-foreground font-robotic tracking-wider mb-1">
              MAX_DEPTH
            </p>
            <p className="text-2xl font-robotic text-hud-cyan">{maxDepth}m</p>
          </div>
          <div className="bg-muted/30 border border-border rounded-lg p-4 text-center">
            <p className="text-xs text-muted-foreground font-robotic tracking-wider mb-1">
              DIVE_TIME
            </p>
            <p className="text-2xl font-robotic text-foreground">
              {formatDuration(sessionDuration)}
            </p>
          </div>
        </div>

        {/* Creature Reward Section */}
        {creature && (
          <div className="relative">
            <div className="bg-muted/20 border border-border rounded-xl p-6 text-center relative overflow-hidden">
              {/* Glow effect for new discoveries */}
              {isNewDiscovery && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-hud-cyan/10 to-transparent animate-pulse" />
              )}

              <div className="relative">
                {isNewDiscovery && (
                  <div className="flex items-center justify-center gap-1 text-hud-cyan text-xs font-robotic tracking-wider mb-3">
                    <Sparkles className="h-3 w-3" />
                    <span>NEW_DISCOVERY</span>
                    <Sparkles className="h-3 w-3" />
                  </div>
                )}

                <div className="text-6xl mb-3">{creature.icon}</div>

                <h3
                  className={`text-xl font-bold mb-1 ${getRarityColor(
                    creature.rarity
                  )}`}
                >
                  {creature.name}
                </h3>

                <p
                  className={`text-sm font-robotic tracking-wider ${getRarityColor(
                    creature.rarity
                  )} opacity-80`}
                >
                  [{creature.rarity.toUpperCase()}]
                </p>

                <p className="text-xs text-muted-foreground font-robotic tracking-wide mt-3">
                  {creature.description}
                </p>

                {/* Pearl reward */}
                <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-border">
                  <Gem className="h-4 w-4 text-yellow-400" />
                  <span className="text-yellow-400 font-robotic">
                    +{pearls} PEARLS
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        <AlertDialogFooter className="mt-4">
          <Button
            onClick={onClose}
            className="w-full bg-hud-cyan hover:bg-hud-cyan/80 text-background font-robotic tracking-wider h-12"
          >
            ADD TO COLLECTION
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default MissionCompleteModal;

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
import { 
  Anchor, 
  Circle, 
  Sparkles, 
  Fish, 
  Shell, 
  Star, 
  Waves, 
  Shield, 
  Grip, 
  Wind, 
  Flashlight, 
  Ghost, 
  Skull,
  HelpCircle,
  LucideIcon
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  Fish,
  Shell,
  Star,
  Waves,
  Sparkles,
  Shield,
  Grip,
  Wind,
  Flashlight,
  Anchor,
  Ghost,
  Skull,
};

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
      <AlertDialogContent className="bg-card border-hud-cyan/30 max-w-md max-h-[90vh] overflow-y-auto scrollbar-deep-sea p-4 sm:p-6">
        {/* Header with scan lines effect */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg">
          <div className="absolute inset-0 bg-gradient-to-b from-hud-cyan/5 to-transparent" />
        </div>

        <AlertDialogHeader className="relative space-y-2">
          <div className="flex items-center justify-center mb-2">
            <div className="relative">
              <div className="absolute inset-0 bg-hud-cyan/20 blur-xl rounded-full" />
              <div className="relative bg-hud-cyan/10 border border-hud-cyan/50 rounded-full p-3">
                <Anchor className="h-6 w-6 text-hud-cyan" />
              </div>
            </div>
          </div>

          <AlertDialogTitle className="text-center font-robotic text-xl tracking-widest text-hud-cyan">
            SURFACE REACHED
          </AlertDialogTitle>

          <AlertDialogDescription className="text-center">
            <span className="text-muted-foreground font-robotic text-xs tracking-wider">
              DIVE COMPLETE
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Stats Section */}
        <div className="grid grid-cols-2 gap-3 my-4">
          <div className="bg-muted/30 border border-border rounded-lg p-3 text-center">
            <p className="text-xs text-muted-foreground font-robotic tracking-wider mb-1">
              MAX DEPTH
            </p>
            <p className="text-xl font-robotic text-hud-cyan">{maxDepth}m</p>
          </div>
          <div className="bg-muted/30 border border-border rounded-lg p-3 text-center">
            <p className="text-xs text-muted-foreground font-robotic tracking-wider mb-1">
              DIVE TIME
            </p>
            <p className="text-xl font-robotic text-foreground">
              {formatDuration(sessionDuration)}
            </p>
          </div>
        </div>

        {/* Creature Reward Section */}
        {creature && (
          <div className="relative">
            <div className="bg-muted/20 border border-border rounded-xl p-4 text-center relative overflow-hidden">
              {/* Glow effect for new discoveries */}
              {isNewDiscovery && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-hud-cyan/10 to-transparent animate-pulse" />
              )}

              <div className="relative">
                {isNewDiscovery && (
                  <div className="flex items-center justify-center gap-1 text-hud-cyan text-xs font-robotic tracking-wider mb-2">
                    <Sparkles className="h-3 w-3" />
                    <span>NEW DISCOVERY</span>
                    <Sparkles className="h-3 w-3" />
                  </div>
                )}

                <div className="flex justify-center mb-2">
                  {(() => {
                    const IconComponent = iconMap[creature.icon] || HelpCircle;
                    return (
                      <div className="p-3 rounded-full bg-background/50 border border-hud-cyan/30" style={{ boxShadow: '0 0 20px hsl(var(--hud-cyan) / 0.5)' }}>
                        <IconComponent size={36} className="text-hud-cyan drop-shadow-[0_0_12px_hsl(var(--hud-cyan))]" />
                      </div>
                    );
                  })()}
                </div>

                <h3
                  className={`text-lg font-bold mb-0.5 ${getRarityColor(
                    creature.rarity
                  )}`}
                >
                  {creature.name}
                </h3>

                <p
                  className={`text-xs font-robotic tracking-widest uppercase ${
                    creature.rarity === 'Common' ? 'text-gray-400' :
                    creature.rarity === 'Rare' ? 'text-cyan-400' :
                    'text-amber-400'
                  }`}
                >
                  {creature.rarity.toUpperCase()}
                </p>

                {/* Traits List */}
                <div className="flex flex-col items-center gap-0.5 mt-3">
                  {creature.description.split('//').map((trait, index) => {
                    // Prettify the trait string
                    let cleanTrait = trait.trim();
                    // Remove UNIT. prefix if present
                    if (cleanTrait.startsWith('UNIT.')) {
                      cleanTrait = cleanTrait.slice(5);
                    }
                    // Replace underscores with spaces and convert to title case
                    cleanTrait = cleanTrait
                      .replace(/_/g, ' ')
                      .toLowerCase()
                      .split(' ')
                      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                      .join(' ');
                    
                    return (
                      <p key={index} className="text-xs text-gray-300 font-robotic tracking-wide">
                        <span className="text-hud-cyan/60 mr-2">•</span>
                        {cleanTrait}
                      </p>
                    );
                  })}
                </div>

                {/* Pearl reward */}
                <div className="flex items-center justify-center gap-2 mt-3 pt-3 border-t border-border">
                  <Circle className="h-4 w-4 text-amber-400 fill-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.8)]" />
                  <span className="text-amber-400 font-robotic text-sm">
                    +{pearls} PEARLS
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        <AlertDialogFooter className="mt-4 mb-2">
          <Button
            onClick={onClose}
            variant="outline"
            className="w-full bg-transparent border border-cyan-500 text-cyan-400 font-robotic uppercase tracking-widest h-11 transition-all duration-300 hover:bg-cyan-500 hover:text-black hover:shadow-[0_0_15px_rgba(6,182,212,0.5)]"
          >
            STORE DATA
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default MissionCompleteModal;

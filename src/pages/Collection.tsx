import { useState, useEffect } from "react";
import { 
  Lock, 
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
  HelpCircle,
  LucideIcon
} from "lucide-react";
import { CREATURES, Creature, getRarityColor } from "@/data/creatures";

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
import { getCollection } from "@/lib/lootSystem";

const Collection = () => {
  const [collectedIds, setCollectedIds] = useState<string[]>([]);

  useEffect(() => {
    setCollectedIds(getCollection());
  }, []);

  const isCollected = (creatureId: string) => collectedIds.includes(creatureId);
  const collectedCount = collectedIds.length;
  const totalCount = CREATURES.length;

  return (
    <div className="min-h-screen bg-background text-foreground px-4 py-8 pb-28">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-hud-cyan font-orbitron">
            BESTIARY
          </h1>
          <p className="text-muted-foreground text-sm font-mono">
            SPECIMENS_CATALOGUED: {collectedCount}/{totalCount}
          </p>
          {/* Progress bar */}
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden mt-4">
            <div 
              className="h-full bg-hud-cyan transition-all duration-500"
              style={{ 
                width: `${(collectedCount / totalCount) * 100}%`,
                boxShadow: '0 0 10px hsl(var(--hud-cyan))'
              }}
            />
          </div>
        </div>

        {/* Creature Grid */}
        <div className="grid grid-cols-2 gap-4">
          {CREATURES.map((creature) => (
            <CreatureCard 
              key={creature.id} 
              creature={creature} 
              unlocked={isCollected(creature.id)} 
            />
          ))}
        </div>
      </div>
    </div>
  );
};

interface CreatureCardProps {
  creature: Creature;
  unlocked: boolean;
}

const CreatureCard = ({ creature, unlocked }: CreatureCardProps) => {
  const rarityColor = getRarityColor(creature.rarity);
  
  const getBorderColor = () => {
    if (!unlocked) return 'border-border';
    switch (creature.rarity) {
      case 'Legendary':
        return 'border-yellow-400';
      case 'Rare':
        return 'border-hud-cyan';
      default:
        return 'border-muted-foreground';
    }
  };

  const getGlowStyle = () => {
    if (!unlocked) return {};
    switch (creature.rarity) {
      case 'Legendary':
        return { boxShadow: '0 0 20px rgba(250, 204, 21, 0.3), inset 0 0 20px rgba(250, 204, 21, 0.1)' };
      case 'Rare':
        return { boxShadow: '0 0 15px hsl(var(--hud-cyan) / 0.3), inset 0 0 15px hsl(var(--hud-cyan) / 0.1)' };
      default:
        return {};
    }
  };

  return (
    <div
      className={`relative rounded-xl border-2 p-4 transition-all duration-300 ${getBorderColor()} ${
        unlocked ? 'bg-card' : 'bg-card/50'
      }`}
      style={getGlowStyle()}
    >
      {/* Locked overlay */}
      {!unlocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm rounded-xl z-10">
          <div className="text-center">
            <Lock className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-xs text-muted-foreground font-mono">DEPTH: {creature.minDepth}m+</p>
          </div>
        </div>
      )}

      {/* Content */}
      <div className={`space-y-3 ${!unlocked ? 'opacity-30 blur-sm' : ''}`}>
        {/* Icon */}
        <div className="flex justify-center">
          {(() => {
            const IconComponent = iconMap[creature.icon] || HelpCircle;
            return (
              <div className="p-3 rounded-full bg-background/50 border border-hud-cyan/30" style={{ boxShadow: '0 0 15px hsl(var(--hud-cyan) / 0.3)' }}>
                <IconComponent size={32} className="text-hud-cyan drop-shadow-[0_0_8px_hsl(var(--hud-cyan))]" />
              </div>
            );
          })()}
        </div>

        {/* Name */}
        <h3 className={`text-sm font-bold text-center font-orbitron ${unlocked ? rarityColor : 'text-muted-foreground'}`}>
          {unlocked ? creature.name : '???'}
        </h3>

        {/* Rarity badge */}
        <div className="flex justify-center">
          <span className={`text-xs px-2 py-0.5 rounded-full border font-mono ${
            unlocked 
              ? creature.rarity === 'Legendary' 
                ? 'border-yellow-400 text-yellow-400' 
                : creature.rarity === 'Rare'
                  ? 'border-hud-cyan text-hud-cyan'
                  : 'border-muted-foreground text-muted-foreground'
              : 'border-muted text-muted-foreground'
          }`}>
            {creature.rarity.toUpperCase()}
          </span>
        </div>

        {/* Description */}
        {unlocked && (
          <p className="text-xs text-muted-foreground font-mono text-center leading-relaxed">
            {creature.description}
          </p>
        )}

        {/* Depth requirement */}
        <p className={`text-xs font-mono text-center ${unlocked ? 'text-hud-cyan' : 'text-muted'}`}>
          MIN_DEPTH: {creature.minDepth}m
        </p>
      </div>
    </div>
  );
};

export default Collection;

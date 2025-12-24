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
  LucideIcon,
  ShieldOff
} from "lucide-react";
import { CREATURES, Creature } from "@/data/creatures";
import { getCollection } from "@/lib/lootSystem";

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

// Parse description into clean trait lines
const parseTraits = (description: string): string[] => {
  return description
    .split('//')
    .map(trait => 
      trait
        .trim()
        .replace(/^UNIT\./, '')
        .replace(/_/g, ' ')
    )
    .filter(Boolean);
};

// Get rarity-based styles
const getRarityStyles = (rarity: string, unlocked: boolean) => {
  if (!unlocked) {
    return {
      border: 'border-slate-800',
      shadow: '',
      glow: {},
      iconGlow: 'drop-shadow-none',
      textColor: 'text-slate-600',
      iconColor: 'text-slate-700',
    };
  }

  switch (rarity) {
    case 'Legendary':
      return {
        border: 'border-amber-500',
        shadow: 'shadow-lg shadow-amber-500/30',
        glow: { boxShadow: '0 0 25px rgba(245, 158, 11, 0.3), inset 0 0 15px rgba(245, 158, 11, 0.1)' },
        iconGlow: 'drop-shadow-[0_0_12px_rgba(245,158,11,0.8)]',
        textColor: 'text-amber-400',
        iconColor: 'text-amber-400',
      };
    case 'Rare':
      return {
        border: 'border-cyan-500',
        shadow: 'shadow-lg shadow-cyan-500/30',
        glow: { boxShadow: '0 0 25px rgba(34, 211, 238, 0.3), inset 0 0 15px rgba(34, 211, 238, 0.1)' },
        iconGlow: 'drop-shadow-[0_0_12px_rgba(34,211,238,0.8)]',
        textColor: 'text-cyan-400',
        iconColor: 'text-cyan-400',
      };
    default:
      return {
        border: 'border-slate-700',
        shadow: 'shadow-md shadow-slate-900/50',
        glow: {},
        iconGlow: 'drop-shadow-[0_0_6px_rgba(148,163,184,0.4)]',
        textColor: 'text-slate-400',
        iconColor: 'text-slate-400',
      };
  }
};

const Collection = () => {
  const [collectedIds, setCollectedIds] = useState<string[]>([]);

  useEffect(() => {
    setCollectedIds(getCollection());
  }, []);

  const isCollected = (creatureId: string) => collectedIds.includes(creatureId);
  const collectedCount = collectedIds.length;
  const totalCount = CREATURES.length;

  return (
    <div className="min-h-screen bg-background text-foreground px-4 py-8 pb-28 relative overflow-hidden">
      {/* Deep sea radial gradient background */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 30%, rgba(8, 145, 178, 0.15) 0%, rgba(0, 0, 0, 0) 60%)',
        }}
      />
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 100%, rgba(6, 78, 95, 0.2) 0%, rgba(0, 0, 0, 0) 50%)',
        }}
      />

      <div className="max-w-2xl mx-auto space-y-6 relative z-10">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 
            className="text-4xl font-bold tracking-widest text-cyan-400 font-orbitron uppercase"
            style={{ 
              textShadow: '0 0 30px rgba(34, 211, 238, 0.8), 0 0 60px rgba(34, 211, 238, 0.4)' 
            }}
          >
            BESTIARY
          </h1>
          <p className="text-muted-foreground text-sm font-mono tracking-wider">
            SPECIMENS_CATALOGUED: <span className="text-cyan-400">{collectedCount}</span>/{totalCount}
          </p>
          {/* Progress bar */}
          <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden mt-4 border border-slate-800">
            <div 
              className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 transition-all duration-500"
              style={{ 
                width: `${(collectedCount / totalCount) * 100}%`,
                boxShadow: '0 0 15px rgba(34, 211, 238, 0.6)'
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
  const styles = getRarityStyles(creature.rarity, unlocked);
  const traits = parseTraits(creature.description);
  
  return (
    <div
      className={`relative rounded-xl border-2 p-4 transition-all duration-300 
        bg-black/40 backdrop-blur-md
        ${styles.border} ${styles.shadow}
        ${unlocked ? 'hover:scale-105 hover:border-opacity-100' : 'grayscale'}
      `}
      style={styles.glow}
    >
      {/* Locked overlay */}
      {!unlocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm rounded-xl z-10">
          <div className="text-center space-y-2">
            <Lock className="w-8 h-8 text-slate-600 mx-auto animate-pulse" />
            <p className="text-xs text-slate-500 font-mono tracking-wider">
              {Math.random() > 0.5 ? 'DATA ENCRYPTED' : 'SIGNAL LOST'}
            </p>
            <p className="text-[10px] text-slate-700 font-mono">
              DEPTH: {creature.minDepth}m+
            </p>
          </div>
        </div>
      )}

      {/* Content */}
      <div className={`space-y-3 ${!unlocked ? 'opacity-20 blur-sm' : ''}`}>
        {/* Icon */}
        <div className="flex justify-center">
          {(() => {
            const IconComponent = iconMap[creature.icon] || HelpCircle;
            return (
              <div 
                className={`p-3 rounded-full bg-black/50 border ${
                  unlocked 
                    ? creature.rarity === 'Legendary'
                      ? 'border-amber-500/40'
                      : creature.rarity === 'Rare'
                        ? 'border-cyan-500/40'
                        : 'border-slate-700/60'
                    : 'border-slate-800'
                }`}
              >
                <IconComponent 
                  size={48} 
                  className={`${styles.iconColor} ${styles.iconGlow}`} 
                />
              </div>
            );
          })()}
        </div>

        {/* Name */}
        <h3 className={`text-sm font-bold text-center font-orbitron uppercase tracking-wider ${styles.textColor}`}>
          {unlocked ? creature.name : '???'}
        </h3>

        {/* Rarity badge */}
        <div className="flex justify-center">
          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-mono tracking-widest ${
            unlocked 
              ? creature.rarity === 'Legendary' 
                ? 'border-amber-500/60 text-amber-400 bg-amber-500/10' 
                : creature.rarity === 'Rare'
                  ? 'border-cyan-500/60 text-cyan-400 bg-cyan-500/10'
                  : 'border-slate-600 text-slate-400 bg-slate-800/50'
              : 'border-slate-800 text-slate-600 bg-slate-900/50'
          }`}>
            {creature.rarity.toUpperCase()}
          </span>
        </div>

        {/* Traits List (Parsed Description) */}
        {unlocked && traits.length > 0 && (
          <div className="space-y-1 pt-2 border-t border-slate-800/50">
            {traits.map((trait, index) => (
              <p 
                key={index} 
                className="text-xs font-mono text-slate-500 flex items-start gap-1.5"
              >
                <span className="text-cyan-700">•</span>
                <span>{trait}</span>
              </p>
            ))}
          </div>
        )}

        {/* Depth requirement */}
        <p className={`text-[10px] font-mono text-center tracking-wider ${
          unlocked ? 'text-cyan-600' : 'text-slate-700'
        }`}>
          MIN_DEPTH: {creature.minDepth}m
        </p>
      </div>
    </div>
  );
};

export default Collection;

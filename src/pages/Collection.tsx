import { useState, useEffect } from "react";
import { Lock, Circle } from "lucide-react";
import { CREATURES, Creature } from "@/data/creatures";
import { getPearlValue } from "@/lib/lootSystem";
import { useAuthContext } from "@/contexts/AuthContext";
import { useUserCreatures } from "@/hooks/useUserCreatures";
import PixelCreature from "@/components/common/PixelCreature";

const UNLOCK_ALL_FOR_TESTING = false;

// Colors flow from CSS variables (--primary / --primary-deep) defined per-theme
// in src/index.css. Use Tailwind classes like `text-primary`, `border-primary`,
// `from-primary to-primary-deep`, or `hsl(var(--primary) / <alpha>)` inline.
// Note: creature IDs are used directly as PixelCreature `type` props.
// If a divergence is ever needed, map it inside creaturePixelData.ts.


// Single source of truth for rarity-driven styling in the Bestiary.
interface RarityStyle {
  border: string;
  shadow: string;
  glow: React.CSSProperties;
  textColor: string;
  badge: string;
  trait: string;
  frameShadow: string;
  frameBorderColor?: string;
}

const LOCKED_STYLE: RarityStyle = {
  border: 'border-slate-800',
  shadow: '',
  glow: {},
  textColor: 'text-slate-600',
  badge: 'border-slate-800 text-slate-600 bg-slate-900/50',
  trait: 'bg-slate-700/50 text-slate-400 border border-slate-600/30',
  frameShadow: '0 0 10px rgba(100, 116, 139, 0.2)',
};

const RARITY_STYLES: Record<string, RarityStyle> = {
  Legendary: {
    border: 'border-amber-500',
    shadow: 'shadow-lg shadow-amber-500/30',
    glow: { boxShadow: '0 0 25px rgba(245, 158, 11, 0.3), inset 0 0 15px rgba(245, 158, 11, 0.1)' },
    textColor: 'text-amber-400',
    badge: 'border-amber-500/60 text-amber-400 bg-amber-500/10',
    trait: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
    frameShadow: '0 0 20px rgba(245, 158, 11, 0.4), inset 0 0 10px rgba(245, 158, 11, 0.2)',
    frameBorderColor: 'rgba(245, 158, 11, 0.5)',
  },
  Epic: {
    border: 'border-purple-500',
    shadow: 'shadow-lg shadow-purple-500/30',
    glow: { boxShadow: '0 0 25px rgba(168, 85, 247, 0.3), inset 0 0 15px rgba(168, 85, 247, 0.1)' },
    textColor: 'text-purple-400',
    badge: 'border-purple-500/60 text-purple-400 bg-purple-500/10',
    trait: 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
    frameShadow: '0 0 20px rgba(168, 85, 247, 0.4), inset 0 0 10px rgba(168, 85, 247, 0.2)',
    frameBorderColor: 'rgba(168, 85, 247, 0.5)',
  },
  Rare: {
    border: 'border-blue-500',
    shadow: 'shadow-lg shadow-blue-500/20',
    glow: { boxShadow: '0 0 25px rgba(59, 130, 246, 0.25), inset 0 0 15px rgba(59, 130, 246, 0.1)' },
    textColor: 'text-blue-400',
    badge: 'border-blue-500/60 text-blue-400 bg-blue-500/10',
    trait: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
    frameShadow: '0 0 20px rgba(59, 130, 246, 0.4), inset 0 0 10px rgba(59, 130, 246, 0.2)',
    frameBorderColor: 'rgba(59, 130, 246, 0.5)',
  },
  Uncommon: {
    border: 'border-emerald-500',
    shadow: 'shadow-md shadow-emerald-500/20',
    glow: { boxShadow: '0 0 20px rgba(16, 185, 129, 0.2), inset 0 0 10px rgba(16, 185, 129, 0.1)' },
    textColor: 'text-emerald-400',
    badge: 'border-emerald-500/60 text-emerald-400 bg-emerald-500/10',
    trait: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
    frameShadow: '0 0 10px rgba(100, 116, 139, 0.2)',
    frameBorderColor: 'rgba(16, 185, 129, 0.5)',
  },
  Common: {
    border: 'border-slate-700',
    shadow: 'shadow-md shadow-slate-900/50',
    glow: {},
    textColor: 'text-slate-400',
    badge: 'border-slate-600 text-slate-400 bg-slate-800/50',
    trait: 'bg-slate-700/50 text-slate-400 border border-slate-600/30',
    frameShadow: '0 0 10px rgba(100, 116, 139, 0.2)',
  },
};

const getRarityStyle = (rarity: string, unlocked: boolean): RarityStyle =>
  unlocked ? (RARITY_STYLES[rarity] ?? RARITY_STYLES.Common) : LOCKED_STYLE;

const Collection = () => {
  const [collectedIds, setCollectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuthContext();
  const { fetchCreatures } = useUserCreatures();


  useEffect(() => {
    const loadCreatures = async () => {
      if (UNLOCK_ALL_FOR_TESTING) {
        setCollectedIds(CREATURES.map(c => c.id));
        setLoading(false);
        return;
      }
      // Load for both authenticated users AND guest mode
      setLoading(true);
      const creatures = await fetchCreatures();
      setCollectedIds(creatures.map(c => c.creature_id));
      setLoading(false);
    };
    loadCreatures();
  }, [fetchCreatures]);

  const isCollected = (creatureId: string) => collectedIds.includes(creatureId);
  const collectedCount = collectedIds.length;
  const totalCount = CREATURES.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground px-4 py-8 pb-28 flex items-center justify-center">
        <div className="animate-pulse text-primary font-robotic tracking-widest">
          SCANNING SPECIMENS...
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background text-foreground overflow-y-auto relative">
      {/* Deep sea radial gradient background */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 50% 30%, hsl(var(--primary) / 0.15) 0%, rgba(0, 0, 0, 0) 60%)`,
        }}
      />
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 50% 100%, hsl(var(--primary) / 0.2) 0%, rgba(0, 0, 0, 0) 50%)`,
        }}
      />

      <div className="max-w-2xl mx-auto px-4 py-8 pb-28 space-y-6 relative z-10">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 
            className="text-4xl font-bold tracking-widest text-primary font-robotic uppercase hud-glow-title"
          >
            BESTIARY
          </h1>
          <p className="text-muted-foreground text-sm font-mono tracking-wider">
            SPECIMENS CATALOGUED: <span className="text-primary">{collectedCount}</span>/{totalCount}
          </p>
          {/* Progress bar */}
          <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden mt-4 border border-slate-800">
            <div 
              className="h-full bg-gradient-to-r from-primary-deep to-primary transition-all duration-500"
              style={{ 
                width: `${(collectedCount / totalCount) * 100}%`,
                boxShadow: `0 0 15px hsl(var(--primary) / 0.6)`
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
  const styles = getRarityStyle(creature.rarity, unlocked);
  const pixelType = creature.id;

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
            <p className="text-xs text-slate-500 font-mono tracking-wider">DATA ENCRYPTED</p>
            <p className="text-[10px] text-slate-700 font-mono">DEPTH: {creature.minDepth}m+</p>
          </div>
        </div>
      )}

      {/* Content */}
      <div className={`space-y-3 ${!unlocked ? 'opacity-20 blur-sm' : ''}`}>
        {/* PixelCreature SVG in circular frame */}
        <div className="flex justify-center">
          <div
            className={`rounded-full overflow-hidden flex items-center justify-center bg-black/50 border-2 border-slate-700/50 ${pixelType === 'vampire_squid' ? 'w-24 h-24' : 'w-20 h-20'}`}
            style={unlocked ? { boxShadow: styles.frameShadow, borderColor: styles.frameBorderColor } : {}}
          >
            <PixelCreature type={pixelType} className={pixelType === 'vampire_squid' ? 'w-20 h-20' : 'w-16 h-16'} />
          </div>
        </div>


        {/* Name */}
        <h3 className={`text-sm font-bold text-center font-robotic uppercase tracking-wider ${styles.textColor}`}>
          {unlocked ? creature.name : '???'}
        </h3>

        {/* Rarity badge + Pearls */}
        <div className="flex justify-center items-center gap-2">
          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-mono tracking-widest ${styles.badge}`}>
            {creature.rarity.toUpperCase()}
          </span>
          {unlocked && (
            <span className="text-[10px] flex items-center gap-0.5 text-amber-300 font-mono">
              <Circle size={10} className="text-amber-400 fill-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.8)]" />
              {getPearlValue(creature.rarity)}
            </span>
          )}
        </div>

        {/* Traits */}
        {unlocked && creature.traits.length > 0 && (
          <div className="flex flex-wrap justify-center gap-1 pt-2 border-t border-slate-800/50">
            {creature.traits.map((trait, index) => (
              <span key={index} className={`text-[9px] px-1.5 py-0.5 rounded font-mono tracking-wide ${styles.trait}`}>
                {trait}
              </span>
            ))}
          </div>
        )}

        {/* Depth requirement */}
        <p className={`text-[10px] font-mono text-center tracking-wider ${unlocked ? 'text-primary/70' : 'text-slate-700'}`}>
          MIN DEPTH: {creature.minDepth}m
        </p>
      </div>
    </div>
  );
};

export default Collection;

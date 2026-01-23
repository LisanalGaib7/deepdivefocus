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
  Biohazard,
  Zap,
  Gem,
} from "lucide-react";
import { CREATURES, Creature, getRarityColor } from "@/data/creatures";
import { useAuthContext } from "@/contexts/AuthContext";
import { useUserCreatures } from "@/hooks/useUserCreatures";
import { useTheme, Theme } from "@/hooks/useTheme";

const iconMap: Record<string, LucideIcon> = {
  Fish,
  FishSymbol: Fish, // Fallback for FishSymbol
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
  Biohazard,
  Zap,
};

// Theme color mapping for dynamic styling
const getThemeColors = (theme: Theme) => {
  const themeMap: Record<Theme, {
    primary: string;
    primaryHex: string;
    gradient: string;
    glow: string;
    glowRgba: string;
    border: string;
    text: string;
    bg: string;
    bgLight: string;
    bullet: string;
    depthText: string;
  }> = {
    ocean: {
      primary: 'cyan',
      primaryHex: '#22d3ee',
      gradient: 'from-cyan-600 to-cyan-400',
      glow: 'rgba(34, 211, 238, 0.8)',
      glowRgba: 'rgba(34, 211, 238, 0.3)',
      border: 'border-cyan-500',
      text: 'text-cyan-400',
      bg: 'bg-cyan-500/10',
      bgLight: 'bg-cyan-900/20',
      bullet: 'text-cyan-700',
      depthText: 'text-cyan-600',
    },
    sage: {
      primary: 'green',
      primaryHex: '#4ade80',
      gradient: 'from-green-600 to-green-400',
      glow: 'rgba(74, 222, 128, 0.8)',
      glowRgba: 'rgba(74, 222, 128, 0.3)',
      border: 'border-green-500',
      text: 'text-green-400',
      bg: 'bg-green-500/10',
      bgLight: 'bg-green-900/20',
      bullet: 'text-green-700',
      depthText: 'text-green-600',
    },
    rose: {
      primary: 'rose',
      primaryHex: '#fb7185',
      gradient: 'from-rose-600 to-rose-400',
      glow: 'rgba(251, 113, 133, 0.8)',
      glowRgba: 'rgba(251, 113, 133, 0.3)',
      border: 'border-rose-500',
      text: 'text-rose-400',
      bg: 'bg-rose-500/10',
      bgLight: 'bg-rose-900/20',
      bullet: 'text-rose-700',
      depthText: 'text-rose-600',
    },
    lavender: {
      primary: 'violet',
      primaryHex: '#a78bfa',
      gradient: 'from-violet-600 to-violet-400',
      glow: 'rgba(167, 139, 250, 0.8)',
      glowRgba: 'rgba(167, 139, 250, 0.3)',
      border: 'border-violet-500',
      text: 'text-violet-400',
      bg: 'bg-violet-500/10',
      bgLight: 'bg-violet-900/20',
      bullet: 'text-violet-700',
      depthText: 'text-violet-600',
    },
    mono: {
      primary: 'gray',
      primaryHex: '#a3a3a3',
      gradient: 'from-gray-500 to-gray-300',
      glow: 'rgba(163, 163, 163, 0.8)',
      glowRgba: 'rgba(163, 163, 163, 0.3)',
      border: 'border-gray-500',
      text: 'text-gray-400',
      bg: 'bg-gray-500/10',
      bgLight: 'bg-gray-800/20',
      bullet: 'text-gray-600',
      depthText: 'text-gray-500',
    },
  };
  return themeMap[theme];
};

// getRarityColor is now imported from creatures.ts

// Get rarity-based styles with theme support
const getRarityStyles = (rarity: string, unlocked: boolean, themeColors: ReturnType<typeof getThemeColors>) => {
  if (!unlocked) {
    return {
      border: 'border-slate-800',
      shadow: '',
      glow: {},
      iconGlow: 'drop-shadow-none',
      textColor: 'text-slate-600',
      iconColor: 'text-slate-700',
      badgeBorder: 'border-slate-800',
      badgeText: 'text-slate-600',
      badgeBg: 'bg-slate-900/50',
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
        badgeBorder: 'border-amber-500/60',
        badgeText: 'text-amber-400',
        badgeBg: 'bg-amber-500/10',
      };
    case 'Epic':
      return {
        border: 'border-purple-500',
        shadow: 'shadow-lg shadow-purple-500/30',
        glow: { boxShadow: '0 0 25px rgba(168, 85, 247, 0.3), inset 0 0 15px rgba(168, 85, 247, 0.1)' },
        iconGlow: 'drop-shadow-[0_0_12px_rgba(168,85,247,0.8)]',
        textColor: 'text-purple-400',
        iconColor: 'text-purple-400',
        badgeBorder: 'border-purple-500/60',
        badgeText: 'text-purple-400',
        badgeBg: 'bg-purple-500/10',
      };
    case 'Rare':
      return {
        border: 'border-blue-500',
        shadow: 'shadow-lg shadow-blue-500/30',
        glow: { boxShadow: '0 0 25px rgba(59, 130, 246, 0.3), inset 0 0 15px rgba(59, 130, 246, 0.1)' },
        iconGlow: 'drop-shadow-[0_0_12px_rgba(59,130,246,0.8)]',
        textColor: 'text-blue-400',
        iconColor: 'text-blue-400',
        badgeBorder: 'border-blue-500/60',
        badgeText: 'text-blue-400',
        badgeBg: 'bg-blue-500/10',
      };
    case 'Uncommon':
      return {
        border: 'border-cyan-500',
        shadow: 'shadow-md shadow-cyan-500/20',
        glow: { boxShadow: '0 0 15px rgba(34, 211, 238, 0.2), inset 0 0 10px rgba(34, 211, 238, 0.1)' },
        iconGlow: 'drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]',
        textColor: 'text-cyan-400',
        iconColor: 'text-cyan-400',
        badgeBorder: 'border-cyan-500/60',
        badgeText: 'text-cyan-400',
        badgeBg: 'bg-cyan-500/10',
      };
    default: // Common
      return {
        border: 'border-slate-700',
        shadow: 'shadow-md shadow-slate-900/50',
        glow: {},
        iconGlow: 'drop-shadow-[0_0_6px_rgba(148,163,184,0.4)]',
        textColor: 'text-slate-400',
        iconColor: 'text-slate-400',
        badgeBorder: 'border-slate-600',
        badgeText: 'text-slate-400',
        badgeBg: 'bg-slate-800/50',
      };
  }
};

const Collection = () => {
  const [collectedIds, setCollectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentTheme } = useTheme();
  const { isAuthenticated } = useAuthContext();
  const { fetchCreatures } = useUserCreatures();
  const themeColors = getThemeColors(currentTheme);

  useEffect(() => {
    const loadCreatures = async () => {
      if (isAuthenticated) {
        setLoading(true);
        const creatures = await fetchCreatures();
        setCollectedIds(creatures.map(c => c.creature_id));
        setLoading(false);
      }
    };
    loadCreatures();
  }, [isAuthenticated, fetchCreatures]);

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
          background: `radial-gradient(ellipse at 50% 30%, ${themeColors.glowRgba.replace('0.3', '0.15')} 0%, rgba(0, 0, 0, 0) 60%)`,
        }}
      />
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 50% 100%, ${themeColors.glowRgba.replace('0.3', '0.2')} 0%, rgba(0, 0, 0, 0) 50%)`,
        }}
      />

      <div className="max-w-2xl mx-auto px-4 py-8 pb-28 space-y-6 relative z-10">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 
            className={`text-4xl font-bold tracking-widest ${themeColors.text} font-orbitron uppercase`}
            style={{ 
              textShadow: `0 0 30px ${themeColors.glow}, 0 0 60px ${themeColors.glowRgba}` 
            }}
          >
            BESTIARY
          </h1>
          <p className="text-muted-foreground text-sm font-mono tracking-wider">
            SPECIMENS_CATALOGUED: <span className={themeColors.text}>{collectedCount}</span>/{totalCount}
          </p>
          {/* Progress bar */}
          <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden mt-4 border border-slate-800">
            <div 
              className={`h-full bg-gradient-to-r ${themeColors.gradient} transition-all duration-500`}
              style={{ 
                width: `${(collectedCount / totalCount) * 100}%`,
                boxShadow: `0 0 15px ${themeColors.glowRgba.replace('0.3', '0.6')}`
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
              themeColors={themeColors}
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
  themeColors: ReturnType<typeof getThemeColors>;
}

const CreatureCard = ({ creature, unlocked, themeColors }: CreatureCardProps) => {
  const styles = getRarityStyles(creature.rarity, unlocked, themeColors);
  
  // Get capsule styles based on rarity
  const getCapsuleStyles = () => {
    if (!unlocked) {
      return {
        container: 'bg-slate-900/30 border-slate-800/40',
        innerGlow: 'bg-slate-800/10',
        pulse: '',
        glowColor: 'transparent',
      };
    }
    switch (creature.rarity) {
      case 'Legendary':
        return {
          container: 'bg-amber-900/20 border-amber-500/60',
          innerGlow: 'bg-amber-500/10',
          pulse: 'animate-pulse',
          glowColor: 'rgba(245, 158, 11, 0.3)',
        };
      case 'Epic':
        return {
          container: 'bg-purple-900/20 border-purple-500/60',
          innerGlow: 'bg-purple-500/10',
          pulse: 'animate-pulse',
          glowColor: 'rgba(168, 85, 247, 0.3)',
        };
      case 'Rare':
        return {
          container: 'bg-blue-900/20 border-blue-500/60',
          innerGlow: 'bg-blue-500/10',
          pulse: 'animate-pulse',
          glowColor: 'rgba(59, 130, 246, 0.3)',
        };
      case 'Uncommon':
        return {
          container: 'bg-cyan-900/20 border-cyan-500/60',
          innerGlow: 'bg-cyan-500/10',
          pulse: '',
          glowColor: 'rgba(34, 211, 238, 0.2)',
        };
      default:
        return {
          container: 'bg-slate-800/30 border-slate-600/40',
          innerGlow: 'bg-slate-500/5',
          pulse: '',
          glowColor: 'transparent',
        };
    }
  };

  const capsuleStyles = getCapsuleStyles();
  
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
        {/* Holographic Icon Capsule */}
        <div className="flex justify-center">
          {(() => {
            const IconComponent = iconMap[creature.icon] || HelpCircle;

            return (
              <div className="relative">
                {/* Outer pulsing ring for higher rarities */}
                {unlocked && creature.rarity !== 'Common' && creature.rarity !== 'Uncommon' && (
                  <div 
                    className={`absolute -inset-1 rounded-full ${capsuleStyles.pulse}`}
                    style={{
                      backgroundColor: capsuleStyles.glowColor,
                      boxShadow: `0 0 20px ${capsuleStyles.glowColor}`
                    }}
                  />
                )}
                
                {/* Main capsule container */}
                <div 
                  className={`relative w-16 h-16 rounded-full border-2 flex items-center justify-center overflow-hidden ${capsuleStyles.container}`}
                  style={{
                    boxShadow: unlocked && capsuleStyles.glowColor !== 'transparent'
                      ? `inset 0 0 15px ${capsuleStyles.glowColor}, 0 0 10px ${capsuleStyles.glowColor}`
                      : 'inset 0 0 10px rgba(100, 116, 139, 0.2)'
                  }}
                >
                  {/* Inner glow layer */}
                  <div className={`absolute inset-0 rounded-full ${capsuleStyles.innerGlow}`} />
                  
                  {/* Scan lines effect */}
                  {unlocked && (
                    <div 
                      className="absolute inset-0 rounded-full opacity-20 pointer-events-none"
                      style={{
                        background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)'
                      }}
                    />
                  )}
                  
                  {/* Floating icon */}
                  <div className={unlocked ? 'animate-float' : ''}>
                    <IconComponent 
                      size={32} 
                      strokeWidth={1.5}
                      className={`relative z-10 ${styles.iconColor}`}
                      style={{
                        filter: unlocked && capsuleStyles.glowColor !== 'transparent'
                          ? `drop-shadow(0 0 12px ${capsuleStyles.glowColor.replace('0.3', '0.8').replace('0.2', '0.8')})`
                          : unlocked ? 'drop-shadow(0 0 6px rgba(148,163,184,0.4))' : 'none'
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Name */}
        <h3 className={`text-sm font-bold text-center font-orbitron uppercase tracking-wider ${styles.textColor}`}>
          {unlocked ? creature.name : '???'}
        </h3>

        {/* Rarity badge + Pearls */}
        <div className="flex justify-center items-center gap-2">
          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-mono tracking-widest ${styles.badgeBorder} ${styles.badgeText} ${styles.badgeBg}`}>
            {creature.rarity.toUpperCase()}
          </span>
          {unlocked && (
            <span className="text-[10px] px-2 py-0.5 rounded-full border border-amber-500/40 text-amber-300 bg-amber-500/10 font-mono flex items-center gap-1">
              <Gem size={10} className="text-amber-400" />
              {creature.pearls}
            </span>
          )}
        </div>

        {/* Traits as badges */}
        {unlocked && creature.traits && creature.traits.length > 0 && (
          <div className="flex flex-wrap justify-center gap-1 pt-2">
            {creature.traits.map((trait, index) => (
              <span 
                key={index} 
                className={`text-[9px] px-1.5 py-0.5 rounded border font-mono ${styles.badgeBorder} ${styles.badgeText} ${styles.badgeBg} opacity-80`}
              >
                {trait}
              </span>
            ))}
          </div>
        )}

        {/* Depth requirement */}
        <p className={`text-[10px] font-mono text-center tracking-wider ${
          unlocked ? themeColors.depthText : 'text-slate-700'
        }`}>
          MIN_DEPTH: {creature.minDepth}m
        </p>
      </div>
    </div>
  );
};

export default Collection;

export type CreatureRarity = 'Common' | 'Rare' | 'Legendary';

export interface Creature {
  id: string;
  name: string;
  minDepth: number;
  rarity: CreatureRarity;
  description: string;
  icon: string;
}

export const CREATURES: Creature[] = [
  // 0-100m: Common tier
  {
    id: 'sardine',
    name: 'Silver Sardine',
    minDepth: 0,
    rarity: 'Common',
    description: 'UNIT.SARDINE // BASIC_LIFEFORM // SIGNAL_WEAK',
    icon: 'Fish',
  },
  {
    id: 'crab',
    name: 'Hermit Crab',
    minDepth: 25,
    rarity: 'Common',
    description: 'UNIT.CRAB // SHELL_DETECTED // MOBILITY_LOW',
    icon: 'Shell',
  },
  {
    id: 'starfish',
    name: 'Crimson Starfish',
    minDepth: 50,
    rarity: 'Common',
    description: 'UNIT.STARFISH // REGENERATIVE // STATIC_ENTITY',
    icon: 'Star',
  },
  {
    id: 'seahorse',
    name: 'Drift Seahorse',
    minDepth: 75,
    rarity: 'Common',
    description: 'UNIT.SEAHORSE // CAMOUFLAGE_ACTIVE // FRAGILE',
    icon: 'Waves',
  },

  // 100-500m: Rare tier
  {
    id: 'jellyfish',
    name: 'Neon Jellyfish',
    minDepth: 100,
    rarity: 'Rare',
    description: 'UNIT.JELLYFISH // BIOLUMINESCENT // TOXIN_WARNING',
    icon: 'Sparkles',
  },
  {
    id: 'turtle',
    name: 'Ancient Sea Turtle',
    minDepth: 150,
    rarity: 'Rare',
    description: 'UNIT.TURTLE // AGE_UNKNOWN // WISDOM_DETECTED',
    icon: 'Shield',
  },
  {
    id: 'octopus',
    name: 'Phantom Octopus',
    minDepth: 250,
    rarity: 'Rare',
    description: 'UNIT.OCTOPUS // INTELLIGENCE_HIGH // INK_ARMED',
    icon: 'Grip',
  },
  {
    id: 'manta',
    name: 'Shadow Manta Ray',
    minDepth: 400,
    rarity: 'Rare',
    description: 'UNIT.MANTA // WINGSPAN_MASSIVE // SILENT_GLIDE',
    icon: 'Wind',
  },

  // 500m+: Legendary tier
  {
    id: 'anglerfish',
    name: 'Abyssal Anglerfish',
    minDepth: 500,
    rarity: 'Legendary',
    description: 'UNIT.ANGLER // LURE_ACTIVE // PREDATOR_APEX',
    icon: 'Flashlight',
  },
  {
    id: 'giant_squid',
    name: 'Kraken Spawn',
    minDepth: 750,
    rarity: 'Legendary',
    description: 'UNIT.SQUID // TENTACLES_10 // MYTH_CONFIRMED',
    icon: 'Anchor',
  },
  {
    id: 'glowing_shark',
    name: 'Spectral Shark',
    minDepth: 1000,
    rarity: 'Legendary',
    description: 'UNIT.SHARK // THERMAL_ZERO // GHOST_PROTOCOL',
    icon: 'Ghost',
  },
  {
    id: 'leviathan',
    name: 'Void Leviathan',
    minDepth: 1500,
    rarity: 'Legendary',
    description: 'UNIT.??? // DATA_CORRUPTED // RUN.',
    icon: 'Skull',
  },
];

// Helper function to get creatures available at a given depth
export const getCreaturesAtDepth = (depth: number): Creature[] => {
  return CREATURES.filter(creature => creature.minDepth <= depth);
};

// Helper function to get rarity color
export const getRarityColor = (rarity: CreatureRarity): string => {
  switch (rarity) {
    case 'Common':
      return 'text-muted-foreground';
    case 'Rare':
      return 'text-hud-cyan';
    case 'Legendary':
      return 'text-yellow-400';
    default:
      return 'text-foreground';
  }
};

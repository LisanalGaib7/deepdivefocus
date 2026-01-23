export type CreatureRarity = 'Common' | 'Uncommon' | 'Rare' | 'Legendary';

export interface Creature {
  id: string;
  name: string;
  minDepth: number;
  rarity: CreatureRarity;
  description: string;
  icon: string;
  pearls: number;
  traits: string[];
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
    pearls: 10,
    traits: ['Basic', 'Swarm'],
  },
  {
    id: 'crab',
    name: 'Hermit Crab',
    minDepth: 25,
    rarity: 'Common',
    description: 'UNIT.CRAB // SHELL_DETECTED // MOBILITY_LOW',
    icon: 'Shell',
    pearls: 10,
    traits: ['Shell', 'Defensive'],
  },
  {
    id: 'starfish',
    name: 'Crimson Starfish',
    minDepth: 50,
    rarity: 'Common',
    description: 'UNIT.STARFISH // REGENERATIVE // STATIC_ENTITY',
    icon: 'Star',
    pearls: 10,
    traits: ['Regenerative', 'Static'],
  },
  {
    id: 'seahorse',
    name: 'Drift Seahorse',
    minDepth: 75,
    rarity: 'Common',
    description: 'UNIT.SEAHORSE // CAMOUFLAGE_ACTIVE // FRAGILE',
    icon: 'Waves',
    pearls: 10,
    traits: ['Camouflage', 'Fragile'],
  },

  // 100-500m: Rare tier (with new creatures)
  {
    id: 'jellyfish',
    name: 'Neon Jellyfish',
    minDepth: 100,
    rarity: 'Rare',
    description: 'UNIT.JELLYFISH // BIOLUMINESCENT // TOXIN_WARNING',
    icon: 'Sparkles',
    pearls: 50,
    traits: ['Bioluminescent', 'Toxic'],
  },
  {
    id: 'electric_eel',
    name: 'Electric Eel',
    minDepth: 120,
    rarity: 'Common',
    description: 'UNIT.EEL // HIGH_VOLTAGE // BATTERY_DETECTED',
    icon: 'Zap',
    pearls: 15,
    traits: ['Electric', 'Danger'],
  },
  {
    id: 'turtle',
    name: 'Ancient Sea Turtle',
    minDepth: 150,
    rarity: 'Rare',
    description: 'UNIT.TURTLE // AGE_UNKNOWN // WISDOM_DETECTED',
    icon: 'Shield',
    pearls: 50,
    traits: ['Ancient', 'Wise'],
  },
  {
    id: 'octopus',
    name: 'Phantom Octopus',
    minDepth: 250,
    rarity: 'Rare',
    description: 'UNIT.OCTOPUS // INTELLIGENCE_HIGH // INK_ARMED',
    icon: 'Grip',
    pearls: 50,
    traits: ['Intelligent', 'Camouflage'],
  },
  {
    id: 'manta',
    name: 'Shadow Manta Ray',
    minDepth: 400,
    rarity: 'Rare',
    description: 'UNIT.MANTA // WINGSPAN_MASSIVE // SILENT_GLIDE',
    icon: 'Wind',
    pearls: 50,
    traits: ['Majestic', 'Silent'],
  },

  // 500m+: Legendary tier (with new creatures)
  {
    id: 'anglerfish',
    name: 'Abyssal Anglerfish',
    minDepth: 500,
    rarity: 'Legendary',
    description: 'UNIT.ANGLER // LURE_ACTIVE // PREDATOR_APEX',
    icon: 'Flashlight',
    pearls: 200,
    traits: ['Apex', 'Lure'],
  },
  {
    id: 'giant_isopod',
    name: 'Giant Isopod',
    minDepth: 600,
    rarity: 'Uncommon',
    description: 'UNIT.ISOPOD // SCAVENGER // ARMOR_HEAVY',
    icon: 'Bug',
    pearls: 40,
    traits: ['Tank', 'Ancient'],
  },
  {
    id: 'giant_squid',
    name: 'Kraken Spawn',
    minDepth: 750,
    rarity: 'Legendary',
    description: 'UNIT.SQUID // TENTACLES_10 // MYTH_CONFIRMED',
    icon: 'Anchor',
    pearls: 200,
    traits: ['Mythical', 'Massive'],
  },
  {
    id: 'blobfish',
    name: 'Blobfish',
    minDepth: 900,
    rarity: 'Rare',
    description: 'UNIT.BLOB // STRUCTURE_UNSTABLE // ERROR_AESTHETICS',
    icon: 'Cloud',
    pearls: 75,
    traits: ['Soft', 'Meme'],
  },
  {
    id: 'glowing_shark',
    name: 'Spectral Shark',
    minDepth: 1000,
    rarity: 'Legendary',
    description: 'UNIT.SHARK // THERMAL_ZERO // GHOST_PROTOCOL',
    icon: 'Ghost',
    pearls: 200,
    traits: ['Spectral', 'Predator'],
  },
  {
    id: 'dumbo_octopus',
    name: 'Dumbo Octopus',
    minDepth: 1300,
    rarity: 'Rare',
    description: 'UNIT.OCTOPUS // HOVER_MODE // EARS_DETECTED',
    icon: 'Smile',
    pearls: 90,
    traits: ['Cute', 'Floating'],
  },
  {
    id: 'leviathan',
    name: 'Void Leviathan',
    minDepth: 1500,
    rarity: 'Legendary',
    description: 'UNIT.??? // DATA_CORRUPTED // RUN.',
    icon: 'Skull',
    pearls: 500,
    traits: ['Unknown', 'Terror'],
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
    case 'Uncommon':
      return 'text-emerald-400';
    case 'Rare':
      return 'text-hud-cyan';
    case 'Legendary':
      return 'text-yellow-400';
    default:
      return 'text-foreground';
  }
};

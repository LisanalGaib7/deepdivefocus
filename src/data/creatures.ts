import { LucideIcon } from 'lucide-react';

export type CreatureRarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';

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
  // TIER 1: SHALLOW WATERS (0m - 100m)
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
    pearls: 15,
    traits: ['Regenerative', 'Static'],
  },
  {
    id: 'seahorse',
    name: 'Drift Seahorse',
    minDepth: 75,
    rarity: 'Common',
    description: 'UNIT.SEAHORSE // CAMOUFLAGE_ACTIVE // FRAGILE',
    icon: 'Waves',
    pearls: 15,
    traits: ['Camouflage', 'Fragile'],
  },
  // TIER 2: TWILIGHT ZONE (100m - 500m)
  {
    id: 'jellyfish',
    name: 'Neon Jellyfish',
    minDepth: 100,
    rarity: 'Uncommon',
    description: 'UNIT.JELLYFISH // BIOLUMINESCENT // TOXIN_WARNING',
    icon: 'Sparkles',
    pearls: 30,
    traits: ['Bioluminescent', 'Toxic'],
  },
  {
    id: 'electric_eel',
    name: 'Electric Eel',
    minDepth: 120,
    rarity: 'Uncommon',
    description: 'UNIT.EEL // HIGH_VOLTAGE // BATTERY_DETECTED',
    icon: 'Zap',
    pearls: 40,
    traits: ['Electric', 'Danger'],
  },
  {
    id: 'turtle',
    name: 'Ancient Sea Turtle',
    minDepth: 180,
    rarity: 'Uncommon',
    description: 'UNIT.TURTLE // AGE_UNKNOWN // WISDOM_DETECTED',
    icon: 'Shield',
    pearls: 45,
    traits: ['Ancient', 'Wise'],
  },
  {
    id: 'octopus',
    name: 'Phantom Octopus',
    minDepth: 250,
    rarity: 'Uncommon',
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
    pearls: 60,
    traits: ['Majestic', 'Silent'],
  },
  // TIER 3: MIDNIGHT ZONE (500m - 1000m)
  {
    id: 'anglerfish',
    name: 'Abyssal Anglerfish',
    minDepth: 500,
    rarity: 'Rare',
    description: 'UNIT.ANGLER // LURE_ACTIVE // PREDATOR_APEX',
    icon: 'Flashlight',
    pearls: 70,
    traits: ['Apex', 'Lure'],
  },
  {
    id: 'giant_isopod',
    name: 'Giant Isopod',
    minDepth: 600,
    rarity: 'Rare',
    description: 'UNIT.ISOPOD // SCAVENGER // ARMOR_HEAVY',
    icon: 'Bug',
    pearls: 75,
    traits: ['Tank', 'Ancient'],
  },
  {
    id: 'giant_squid',
    name: 'Kraken Spawn',
    minDepth: 750,
    rarity: 'Epic',
    description: 'UNIT.SQUID // TENTACLES_10 // MYTH_CONFIRMED',
    icon: 'Anchor',
    pearls: 100,
    traits: ['Mythical', 'Massive'],
  },
  {
    id: 'volcano_snail',
    name: 'Magma Volcano Snail',
    minDepth: 900,
    rarity: 'Epic',
    description: 'UNIT.SNAIL // SHELL_IRON // CORE_MOLTEN',
    icon: 'Flame',
    pearls: 120,
    traits: ['Armored', 'Magma'],
  },
  // TIER 4: THE ABYSS (1000m+)
  {
    id: 'glowing_shark',
    name: 'Spectral Shark',
    minDepth: 1000,
    rarity: 'Epic',
    description: 'UNIT.SHARK // THERMAL_ZERO // GHOST_PROTOCOL',
    icon: 'Ghost',
    pearls: 150,
    traits: ['Spectral', 'Predator'],
  },
  {
    id: 'dumbo_octopus',
    name: 'Dumbo Octopus',
    minDepth: 1300,
    rarity: 'Legendary',
    description: 'UNIT.OCTOPUS // HOVER_MODE // EARS_DETECTED',
    icon: 'Smile',
    pearls: 200,
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

export const getCreaturesAtDepth = (depth: number): Creature[] => {
  return CREATURES.filter(creature => creature.minDepth <= depth);
};

export const getRarityColor = (rarity: CreatureRarity): string => {
  switch (rarity) {
    case 'Common': return 'text-muted-foreground';
    case 'Uncommon': return 'text-emerald-400';
    case 'Rare': return 'text-hud-cyan';
    case 'Epic': return 'text-purple-400 drop-shadow-[0_0_5px_rgba(192,132,252,0.5)]';
    case 'Legendary': return 'text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]';
    default: return 'text-foreground';
  }
};

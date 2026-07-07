import { LucideIcon } from "lucide-react";

export type CreatureRarity = "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary";

// NOTE: Pearl rewards are NOT stored per-creature.
// Single source of truth: PEARL_VALUES in src/constants/gameConfig.ts,
// looked up via getPearlValue(rarity) in src/lib/lootSystem.ts.
export interface Creature {
  id: string;
  name: string;
  minDepth: number;
  rarity: CreatureRarity;
  description: string;
  icon: string;
  traits: string[];
}

export const CREATURES: Creature[] = [
  // TIER 1: SHALLOW WATERS (0m - 100m)
  {
    id: "sardine",
    name: "Silver Sardine",
    minDepth: 0,
    rarity: "Common",
    description: "UNIT.SARDINE // BASIC_LIFEFORM // SIGNAL_WEAK",
    icon: "Fish",
    traits: ["Basic", "Swarm"],
  },
  {
    id: "clownfish",
    name: "Clownfish",
    minDepth: 10,
    rarity: "Common",
    description: "UNIT.CLOWNFISH // VIBRANT_PATTERN // SYMBIOTIC_LINK",
    icon: "Fish",
    traits: ["Vibrant", "Symbiotic"],
  },
  {
    id: "crab",
    name: "Hermit Crab",
    minDepth: 25,
    rarity: "Common",
    description: "UNIT.CRAB // SHELL_DETECTED // MOBILITY_LOW",
    icon: "Shell",
    traits: ["Shell", "Defensive"],
  },
  {
    id: "starfish",
    name: "Crimson Starfish",
    minDepth: 50,
    rarity: "Common",
    description: "UNIT.STARFISH // REGENERATIVE // STATIC_ENTITY",
    icon: "Star",
    traits: ["Regenerative", "Static"],
  },
  {
    id: "seahorse",
    name: "Drift Seahorse",
    minDepth: 75,
    rarity: "Common",
    description: "UNIT.SEAHORSE // CAMOUFLAGE_ACTIVE // FRAGILE",
    icon: "Waves",
    traits: ["Camouflage", "Fragile"],
  },
  {
    id: "pufferfish",
    name: "Pufferfish",
    minDepth: 90,
    rarity: "Uncommon",
    description: "UNIT.PUFFERFISH // INFLATION_READY // TOXIN_DETECTED",
    icon: "CircleDot",
    traits: ["Inflatable", "Toxic"],
  },
  // TIER 2: TWILIGHT ZONE (100m - 500m)
  {
    id: "jellyfish",
    name: "Neon Jellyfish",
    minDepth: 100,
    rarity: "Uncommon",
    description: "UNIT.JELLYFISH // BIOLUMINESCENT // TOXIN_WARNING",
    icon: "Sparkles",
    traits: ["Bioluminescent", "Toxic"],
  },
  {
    id: "electric_eel",
    name: "Electric Eel",
    minDepth: 120,
    rarity: "Uncommon",
    description: "UNIT.EEL // HIGH_VOLTAGE // BATTERY_DETECTED",
    icon: "Zap",
    traits: ["Electric", "Danger"],
  },
  {
    id: "turtle",
    name: "Ancient Sea Turtle",
    minDepth: 180,
    rarity: "Uncommon",
    description: "UNIT.TURTLE // AGE_UNKNOWN // WISDOM_DETECTED",
    icon: "Shield",
    traits: ["Ancient", "Wise"],
  },
  {
    id: "nautilus",
    name: "Nautilus",
    minDepth: 200,
    rarity: "Uncommon",
    description: "UNIT.NAUTILUS // SPIRAL_SHELL // ANCIENT_LINEAGE",
    icon: "Shell",
    traits: ["Ancient", "Spiral"],
  },
  {
    id: "octopus",
    name: "Phantom Octopus",
    minDepth: 250,
    rarity: "Uncommon",
    description: "UNIT.OCTOPUS // INTELLIGENCE_HIGH // INK_ARMED",
    icon: "Grip",
    traits: ["Intelligent", "Camouflage"],
  },
  {
    id: "sea_angel",
    name: "Sea Angel",
    minDepth: 320,
    rarity: "Rare",
    description: "UNIT.SEA_ANGEL // TRANSLUCENT_BODY // CORE_LUMINOUS",
    icon: "Sparkles",
    traits: ["Translucent", "Ethereal"],
  },
  {
    id: "manta",
    name: "Shadow Manta Ray",
    minDepth: 400,
    rarity: "Rare",
    description: "UNIT.MANTA // WINGSPAN_MASSIVE // SILENT_GLIDE",
    icon: "Wind",
    traits: ["Majestic", "Silent"],
  },
  // TIER 3: MIDNIGHT ZONE (500m - 1000m)
  {
    id: "anglerfish",
    name: "Abyssal Anglerfish",
    minDepth: 500,
    rarity: "Rare",
    description: "UNIT.ANGLER // LURE_ACTIVE // PREDATOR_APEX",
    icon: "Flashlight",
    traits: ["Apex", "Lure"],
  },
  {
    id: "giant_isopod",
    name: "Giant Isopod",
    minDepth: 600,
    rarity: "Rare",
    description: "UNIT.ISOPOD // SCAVENGER // ARMOR_HEAVY",
    icon: "Bug",
    traits: ["Tank", "Ancient"],
  },
  {
    id: "barreleye",
    name: "Barreleye",
    minDepth: 680,
    rarity: "Rare",
    description: "UNIT.BARRELEYE // TRANSPARENT_DOME // OPTICS_UPWARD",
    icon: "ScanEye",
    traits: ["Transparent", "Observant"],
  },
  {
    id: "giant_squid",
    name: "Kraken Spawn",
    minDepth: 750,
    rarity: "Epic",
    description: "UNIT.SQUID // TENTACLES_10 // MYTH_CONFIRMED",
    icon: "Anchor",
    traits: ["Mythical", "Massive"],
  },
  {
    id: "vampire_squid",
    name: "Vampire Squid",
    minDepth: 820,
    rarity: "Epic",
    description: "UNIT.VAMPIRE_SQUID // CLOAK_DEPLOYED // BIOLUMINESCENT_EYES",
    icon: "Ghost",
    traits: ["Eerie", "Cloaked"],
  },
  {
    id: "volcano_snail",
    name: "Magma Volcano Snail",
    minDepth: 900,
    rarity: "Epic",
    description: "UNIT.SNAIL // SHELL_IRON // CORE_MOLTEN",
    icon: "Flame",
    traits: ["Armored", "Magma"],
  },
  // TIER 4: THE ABYSS (1000m+)
  {
    id: "glowing_shark",
    name: "Spectral Shark",
    minDepth: 1000,
    rarity: "Epic",
    description: "UNIT.SHARK // THERMAL_ZERO // GHOST_PROTOCOL",
    icon: "Ghost",
    traits: ["Spectral", "Predator"],
  },
  {
    id: "solar_golden_dragonfish",
    name: "Solar Golden Dragonfish",
    minDepth: 1300,
    rarity: "Legendary",
    description: "UNIT.DRAGON // SOLAR_CORE // RADIANCE_INFINITE",
    icon: "Sun",
    traits: ["Radiant", "Majestic"],
  },
  {
    id: "astral_leviathan",
    name: "Astral Leviathan",
    minDepth: 1500,
    rarity: "Legendary",
    description: "UNIT.UNKNOWN // COSMOS_BOUND // STARS_WITHIN",
    icon: "Skull",
    traits: ["Cosmic", "Ancient"],
  },
];

export const getCreaturesAtDepth = (depth: number): Creature[] => {
  return CREATURES.filter((creature) => creature.minDepth <= depth);
};

export const getRarityColor = (rarity: CreatureRarity): string => {
  switch (rarity) {
    case "Common":
      return "text-muted-foreground";
    case "Uncommon":
      return "text-emerald-400";
    case "Rare":
      return "text-hud-cyan";
    case "Epic":
      return "text-purple-400 drop-shadow-[0_0_5px_rgba(192,132,252,0.5)]";
    case "Legendary":
      return "text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]";
    default:
      return "text-foreground";
  }
};

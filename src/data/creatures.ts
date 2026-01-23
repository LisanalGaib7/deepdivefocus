import { LucideIcon } from "lucide-react";

export type CreatureRarity = "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary";

export interface Creature {
  id: string;
  name: string;
  minDepth: number; // 발견 가능한 최소 깊이
  rarity: CreatureRarity;
  pearls: number; // 획득 시 보상 (화폐)
  description: string; // 시스템 로그 스타일 설명
  traits: string[]; // 생물 특성 태그
  icon: string; // Lucide 아이콘 이름 (문자열로 저장)
}

export const CREATURES: Creature[] = [
  // ==========================================
  // TIER 1: SHALLOW WATERS (0m - 500m)
  // ==========================================
  {
    id: "sardine",
    name: "Silver Sardine",
    minDepth: 0,
    rarity: "Common",
    pearls: 10,
    description: "UNIT.SARDINE // BASIC_LIFEFORM // SIGNAL_WEAK",
    traits: ["Schooling", "Small"],
    icon: "Fish",
  },
  {
    id: "crab",
    name: "Hermit Crab",
    minDepth: 50,
    rarity: "Common",
    pearls: 15,
    description: "UNIT.CRAB // SHELL_DETECTED // MOBILITY_LOW",
    traits: ["Armored", "Scavenger"],
    icon: "Shell", // Lucide에 없는 경우 대체 아이콘 필요, 일단 Shell 유지
  },
  {
    id: "neon_jelly", // New!
    name: "Neon Jelly",
    minDepth: 150,
    rarity: "Uncommon",
    pearls: 25,
    description: "UNIT.JELLY // BIOLUMINESCENT // TOXIN_TRACE",
    traits: ["Glowing", "Drifting"],
    icon: "Sparkles", // Sparkles 아이콘 활용
  },
  {
    id: "pixel_clownfish", // New!
    name: "Pixel Clownfish",
    minDepth: 300,
    rarity: "Uncommon",
    pearls: 30,
    description: "UNIT.CLOWN // PATTERN_VIBRANT // SYMBIOTIC_LINK",
    traits: ["Fast", "Colorful"],
    icon: "FishSymbol", // 없으면 Fish로 대체
  },

  // ==========================================
  // TIER 2: TWILIGHT ZONE (500m - 1500m)
  // ==========================================
  {
    id: "ghost_lantern", // New!
    name: "Ghost Lantern",
    minDepth: 500,
    rarity: "Rare",
    pearls: 60,
    description: "UNIT.ANGLER // LURE_ACTIVE // JAW_STRENGTH_HIGH",
    traits: ["Predator", "Lure"],
    icon: "Flashlight",
  },
  {
    id: "crystal_shrimp", // New!
    name: "Crystal Shrimp",
    minDepth: 800,
    rarity: "Rare",
    pearls: 70,
    description: "UNIT.SHRIMP // TRANSPARENCY_100% // STEALTH_MODE",
    traits: ["Invisible", "Tiny"],
    icon: "Ghost",
  },
  {
    id: "shadow_manta",
    name: "Shadow Manta",
    minDepth: 1200,
    rarity: "Rare",
    pearls: 85,
    description: "UNIT.MANTA // WINGSPAN_MASSIVE // SILENT_DRIVE",
    traits: ["Majestic", "Glider"],
    icon: "Wind",
  },

  // ==========================================
  // TIER 3: MIDNIGHT ZONE (1500m - 3000m)
  // ==========================================
  {
    id: "vampire_squid", // New!
    name: "Vampire Squid",
    minDepth: 1600,
    rarity: "Epic",
    pearls: 150,
    description: "UNIT.SQUID // CLOAKING_FIELD // ANCIENT_DNA",
    traits: ["Ancient", "Cloaked"],
    icon: "Biohazard", // 또는 Grip
  },
  {
    id: "iron_snail", // New!
    name: "Iron-Plate Snail",
    minDepth: 2200,
    rarity: "Epic",
    pearls: 180,
    description: "UNIT.GASTROPOD // SHELL_METALLIC // HEAT_RESIST",
    traits: ["Indestructible", "Heavy"],
    icon: "Shield",
  },

  // ==========================================
  // TIER 4: THE ABYSS (3000m+)
  // ==========================================
  {
    id: "leviathan",
    name: "Void Leviathan",
    minDepth: 3500,
    rarity: "Legendary",
    pearls: 500,
    description: "WARNING: GIGANTIC_SIGNATURE // DATA_CORRUPTED // RUN.",
    traits: ["Boss", "Unknown"],
    icon: "Skull",
  },
  {
    id: "glitch_whale", // New!
    name: "Glitch Whale",
    minDepth: 5000,
    rarity: "Legendary",
    pearls: 1000,
    description: "ERROR_404 // REALITY_DISTORTION // SYSTEM_FAILURE",
    traits: ["Glitch", "Digital"],
    icon: "Zap",
  },
];

// Helper: 현재 깊이에서 발견 가능한 생물 필터링
export const getCreaturesAtDepth = (depth: number): Creature[] => {
  return CREATURES.filter((creature) => creature.minDepth <= depth);
};

// Helper: 희귀도별 텍스트 색상 (Tailwind/CSS 변수 기준)
export const getRarityColor = (rarity: CreatureRarity): string => {
  switch (rarity) {
    case "Common":
      return "text-slate-400";
    case "Uncommon":
      return "text-cyan-400";
    case "Rare":
      return "text-blue-500"; // 또는 text-primary
    case "Epic":
      return "text-purple-400";
    case "Legendary":
      return "text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]"; // 빛나는 효과
    default:
      return "text-white";
  }
};

// ======================
// TIMER CONFIGURATION
// ======================
export const TIMER_CONFIG = {
  MAX_TIME_SECONDS: 60 * 60,        // 60 minutes max
  MIN_TIME_SECONDS: 60,              // 1 minute min
  DEFAULT_DURATION_SECONDS: 25 * 60, // 25 minutes default (Pomodoro)
  MAX_TASKS: 10,
} as const;

// ======================
// DEPTH & DIVING MECHANICS
// ======================
export const DEPTH_CONFIG = {
  DEPTH_MULTIPLIER: 5,   // Base multiplier for depth calculation
  DEPTH_EXPONENT: 0.7,   // Time exponent for depth curve
  // Formula: DEPTH_MULTIPLIER * engineMultiplier * (timeElapsed ^ DEPTH_EXPONENT)
  
  // Hull max depths by tier (physics-based balance)
  HULL_MAX_DEPTHS: [2000, 3500, 6000, 9000, 12000] as readonly number[],
  // Tier 1: 2000m, Tier 2: 3500m, Tier 3: 6000m, Tier 4: 9000m, Tier 5: 12000m (Challenger Deep)
} as const;

// Engine speed multipliers by tier (physics-based balance)
// Higher multipliers needed to overcome time^0.7 drag curve
export const ENGINE_MULTIPLIERS = [1.0, 1.75, 3.0, 4.5, 6.0] as const;
// Tier 1: 100%, Tier 2: 175%, Tier 3: 300%, Tier 4: 450%, Tier 5: 600%

// Helper functions
export const getHullMaxDepth = (tier: number): number => {
  const index = Math.min(Math.max(tier - 1, 0), DEPTH_CONFIG.HULL_MAX_DEPTHS.length - 1);
  return DEPTH_CONFIG.HULL_MAX_DEPTHS[index];
};

export const getEngineMultiplier = (tier: number): number => {
  const index = Math.min(Math.max(tier - 1, 0), ENGINE_MULTIPLIERS.length - 1);
  return ENGINE_MULTIPLIERS[index];
};

export const getEngineSpeedPercent = (tier: number): number => {
  return Math.round(getEngineMultiplier(tier) * 100);
};

// ======================
// OXYGEN & PENALTY SYSTEM
// ======================
export const OXYGEN_CONFIG = {
  MAX_OXYGEN: 100,              // Starting oxygen level
  PENALTY_MULTIPLIER: 5,        // Base penalty per second away
  DEPTH_PENALTY_DIVISOR: 500,   // Depth divisor for penalty scaling
  // Formula: TimeAway * PENALTY_MULTIPLIER * (1 + depth / DEPTH_PENALTY_DIVISOR)
} as const;

// ======================
// LOOT & RARITY SYSTEM
// ======================
export const RARITY_CONFIG = {
  DEPTH_DIVISOR: 1000, // Normalize: depthRatio = depth/1000 (0-3 range for 0-3000m)
  MAX_DEPTH: 3000,     // Reference max depth for balance calculations
  // Target distribution at 3000m: Legendary 7%, Epic 13%, Rare 30%, Common+Uncommon 50%
} as const;

// Single source of truth for pearl rewards by rarity tier
export const PEARL_VALUES = {
  Common: 10,
  Uncommon: 25,
  Rare: 50,
  Epic: 150,
  Legendary: 500,
} as const;

// ======================
// CREATURE DEPTH THRESHOLDS
// ======================
export const DEPTH_TIERS = {
  COMMON: { min: 0, max: 100 },
  RARE: { min: 100, max: 500 },
  LEGENDARY: { min: 500, max: Infinity },
} as const;

// ======================
// UPGRADE DEFAULTS
// ======================
export const DEFAULT_UPGRADE_LEVELS = {
  engine: 1,
  oxygenTank: 1,
  hullArmor: 1,
} as const;

// ======================
// UPGRADE COSTS (HARDCORE MODE)
// ======================
// Cost to upgrade FROM tier N to tier N+1
// Index 0 = cost to go from Tier 1 → Tier 2
export const UPGRADE_COSTS = {
  tier2: 2_000,    // Tier 1 → 2: Significant initial effort
  tier3: 8_000,    // Tier 2 → 3: Mid-game milestone
  tier4: 20_000,   // Tier 3 → 4: Late-game achievement
  tier5: 40_000,   // Tier 4 → 5: End-game goal (months of focus)
} as const;

// Helper to get upgrade cost based on current tier
export const getUpgradeCost = (currentTier: number): number => {
  switch (currentTier) {
    case 1: return UPGRADE_COSTS.tier2;
    case 2: return UPGRADE_COSTS.tier3;
    case 3: return UPGRADE_COSTS.tier4;
    case 4: return UPGRADE_COSTS.tier5;
    default: return 0; // Max tier reached
  }
};

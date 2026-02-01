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
  // Formula: DEPTH_MULTIPLIER * engineLevel * (timeElapsed ^ DEPTH_EXPONENT)
  
  // Hull depth limits by armor level (future: submarine upgrades)
  BASE_MAX_DEPTH: 2000,  // Default max depth for hull level 1 (~75 min to reach)
  DEPTH_PER_HULL_LEVEL: 500, // Additional depth per hull upgrade
  // Formula: BASE_MAX_DEPTH + (hullLevel - 1) * DEPTH_PER_HULL_LEVEL
} as const;

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

export const PEARL_VALUES = {
  Common: 10,
  Uncommon: 25,
  Rare: 50,
  Epic: 100,
  Legendary: 200,
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

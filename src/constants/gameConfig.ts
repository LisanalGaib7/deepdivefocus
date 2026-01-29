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
  DEPTH_DIVISOR: 1000, // Normalize depth to 0-1.5+ range
  WEIGHTS: {
    COMMON: { base: 1.0, minimum: 0.05 },           // 1.0 → 0.05 (fast decay)
    RARE: { base: 0.3, depthMultiplier: 0.25 },     // 0.3 → 0.675 at 1500m (linear)
    LEGENDARY: { base: 0.05, depthMultiplier: 0.8 }, // 0.05 → 1.85 at 1500m (exponential ^2)
  },
} as const;

export const PEARL_VALUES = {
  Common: 10,
  Rare: 50,
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

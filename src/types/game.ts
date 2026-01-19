import { DEFAULT_UPGRADE_LEVELS, OXYGEN_CONFIG } from "@/constants/gameConfig";

// Upgrade levels for submarine equipment
export interface Upgrades {
  engine: number;      // Affects depth gained per focus minute
  oxygenTank: number;  // Affects oxygen capacity/recovery
  hullArmor: number;   // Affects penalty resistance
}

// Persistent user profile (saved to storage)
export interface UserProfile {
  totalDepth: number;  // Cumulative depth reached across all sessions
  pearls: number;      // Currency earned from diving
  upgrades: Upgrades;  // Equipment upgrade levels
}

// Active game session state
export interface GameSession {
  currentDepth: number;   // Depth in the current session (meters)
  oxygenLevel: number;    // Starts at 100, decreases on penalty
  isEmergency: boolean;   // True if oxygen hits 0
}

// Default values for new users
export const DEFAULT_UPGRADES: Upgrades = { ...DEFAULT_UPGRADE_LEVELS };

export const DEFAULT_USER_PROFILE: UserProfile = {
  totalDepth: 0,
  pearls: 0,
  upgrades: DEFAULT_UPGRADES,
};

export const DEFAULT_GAME_SESSION: GameSession = {
  currentDepth: 0,
  oxygenLevel: OXYGEN_CONFIG.MAX_OXYGEN,
  isEmergency: false,
};

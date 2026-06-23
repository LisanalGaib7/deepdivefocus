/**
 * Single source of truth for all localStorage keys used in the app.
 * Adding a new persisted value? Put the key here, never hardcode strings elsewhere.
 */
export const STORAGE_KEYS = {
  theme: "deepDiveTheme",
  tasks: "deepDiveTasks",
  sessions: "deepDiveSessions",
  guestCreatures: "deepdive_guest_creatures",
  proStatus: "deepdive_pro_status",
  soundEnabled: "deepdive_sound_enabled",
  engineLevel: "deepdive_engine_level",
  hullLevel: "deepdive_hull_level",
  pendingRewards: "deepdive_pending_rewards",
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

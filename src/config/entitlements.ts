/**
 * Capability map for the future Pro tier.
 *
 * Decision (locked in): the next Pro launch is "AI analysis reports only".
 * Existing limits (task count, analytics range, vessel classes) are
 * effectively permanent free perks and should NOT come back as paywalls.
 *
 * This file defines the SHAPE of the capability check that components will
 * eventually consume via `useProEntitlements()`. The hook itself is
 * intentionally NOT implemented yet — wiring it up too early would force a
 * second refactor once payment + server-side entitlement source is in place.
 *
 * When ready to implement:
 *   1. Create src/hooks/useProEntitlements.ts that returns ProEntitlements.
 *   2. Source the booleans from the server (is_user_pro RPC + per-feature
 *      flags), never from localStorage alone.
 *   3. Replace ad-hoc `isPro` checks at call sites with capability checks
 *      (e.g. `entitlements.aiReports` instead of `isPro`).
 *
 * Keep this type STABLE — adding capabilities is additive (safe), removing
 * or renaming them is a breaking change for every call site.
 */

export interface ProEntitlements {
  /** AI-generated focus/analytics reports. Primary Pro value prop. */
  aiReports: boolean;

  // TODO: add new capabilities here as Pro evolves.
  // Examples for future consideration (DO NOT enable without product sign-off):
  //   advancedExport?: boolean;
  //   customThemes?: boolean;
}

/** Default entitlements for non-Pro / flag-off state. */
export const NO_ENTITLEMENTS: ProEntitlements = {
  aiReports: false,
};

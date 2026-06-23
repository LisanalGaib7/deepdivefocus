/**
 * Single entry point for "is this gated behind Pro?" decisions.
 *
 * Why this file exists:
 *   Before this, components called `SUBSCRIPTION_ENABLED && !isPro && ...`
 *   inline. That made it easy to:
 *     - forget a check when the flag was flipped back on,
 *     - drift between paywall copy and actual enforcement,
 *     - miss a guard when adding a new Pro capability.
 *
 *   Now every gating decision lives here. Components ask capability questions
 *   ("can I add another task?", "is this analytics range locked?"), not
 *   subscription questions.
 *
 * When Pro is re-enabled for AI reports:
 *   - flip SUBSCRIPTION_ENABLED in src/config/featureFlags.ts
 *   - add new capability hooks here (e.g. useAiReportGating)
 *   - call sites already consume hooks, so they pick it up for free.
 */

import { useProStatus } from "@/hooks/useProStatus";
import { SUBSCRIPTION_ENABLED } from "@/config/featureFlags";
import { HARD_CAP_TASKS, LEGACY_FREE_TASK_LIMIT } from "@/config/limits";
import type { TimeRange } from "@/hooks/useSessionStats";

/** Top-level switch: should we even render monetization UI (pricing/upgrade modals)? */
export const useMonetizationUI = () => {
  const { isPro, activatePro } = useProStatus();
  return {
    enabled: SUBSCRIPTION_ENABLED,
    isPro,
    activatePro,
  };
};

export interface TaskGating {
  /** Effective slot ceiling for the current user (free limit OR hard cap). */
  limit: number;
  /** Hard performance cap — always enforced, regardless of subscription. */
  hardCap: number;
  /** True if the user has hit the free-tier soft limit and a paywall should fire. */
  hitFreeLimit: (currentCount: number) => boolean;
  /** True if even Pro users would be blocked (hardware-style cap). */
  hitHardCap: (currentCount: number) => boolean;
  /** Should the "SLOT [n/m]" counter chip render at all? */
  showSlotCounter: boolean;
  /** Should the "↑ UPGRADE" inline hint render? */
  showUpgradeHint: boolean;
}

export const useTaskGating = (): TaskGating => {
  const { isPro } = useProStatus();
  const gatingActive = SUBSCRIPTION_ENABLED && !isPro;
  const limit = gatingActive ? LEGACY_FREE_TASK_LIMIT : HARD_CAP_TASKS;

  return {
    limit,
    hardCap: HARD_CAP_TASKS,
    hitFreeLimit: (count) => gatingActive && count >= LEGACY_FREE_TASK_LIMIT,
    hitHardCap: (count) => count >= HARD_CAP_TASKS,
    showSlotCounter: SUBSCRIPTION_ENABLED,
    showUpgradeHint: gatingActive,
  };
};

/** History/analytics range gating. Free users only see today + this week. */
const LOCKED_RANGES: ReadonlyArray<TimeRange> = ["month", "year", "all"];

export const useHistoryRangeLock = (range: TimeRange) => {
  const { isPro } = useProStatus();
  const isLocked =
    SUBSCRIPTION_ENABLED && !isPro && LOCKED_RANGES.includes(range);
  return { isLocked };
};

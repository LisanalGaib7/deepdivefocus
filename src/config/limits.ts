/**
 * Single source of truth for app-wide limits.
 * Marketing copy AND runtime enforcement MUST both read from here so they
 * never drift apart.
 *
 * Two distinct kinds of limits:
 *
 * 1. HARD_CAP_*  — always enforced, regardless of subscription state.
 *                  Reason: performance / UX / data-shape sanity, not monetization.
 *
 * 2. LEGACY_FREE_* — the old free-tier ceiling that was gated behind a
 *                    subscription. Only meaningful when SUBSCRIPTION_ENABLED
 *                    is true. Kept around because the legacy paywall code is
 *                    preserved (see src/features/monetization).
 *                    Future Pro plan is "AI reports only" — these limits are
 *                    not expected to come back.
 */

// Performance/UX ceiling on simultaneous priority missions. Always enforced.
export const HARD_CAP_TASKS = 10;

// Old free-tier slot count. Only used if SUBSCRIPTION_ENABLED is flipped back on.
// [SUBSCRIPTION] gated, do not delete.
export const LEGACY_FREE_TASK_LIMIT = 2;

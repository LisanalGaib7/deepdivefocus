/**
 * Subscription helpers used by admin tooling (and any future self-serve
 * checkout flow). Kept separate from PricingModal presentation so the
 * date math is testable without pulling in the modal.
 */

export type PlanType = "monthly" | "yearly" | "lifetime";

/** Sentinel far-future date used to represent "lifetime" subscriptions. */
export const LIFETIME_ENDS_AT = "2099-12-31T23:59:59Z";

/**
 * ISO end-date for a subscription starting now, based on plan type.
 * `lifetime` returns LIFETIME_ENDS_AT so the DB column stays non-null.
 */
export const computeSubscriptionEndsAt = (plan: PlanType, from: Date = new Date()): string => {
  if (plan === "lifetime") return LIFETIME_ENDS_AT;
  const d = new Date(from);
  if (plan === "yearly") {
    d.setFullYear(d.getFullYear() + 1);
  } else {
    d.setMonth(d.getMonth() + 1);
  }
  return d.toISOString();
};

/**
 * Checkout adapter — INTENTIONALLY EMPTY.
 *
 * Purpose: keep payment-provider integration behind a single seam so swapping
 * Stripe / Paddle / Apple IAP / Google Play later does not touch UI code.
 *
 * Today: PricingModal calls a local `onActivatePro` callback (localStorage
 * toggle) for legacy demo flows. When real checkout is wired up, implement
 * `startCheckout` here and route the modal through it.
 *
 * Capacitor caveat: iOS/Android may require platform IAP (Apple/Google) for
 * digital subscriptions. Pick the adapter at runtime based on Capacitor
 * platform detection, not at build time.
 */

import type { Database } from "@/integrations/supabase/types";

type PlanType = Database["public"]["Enums"]["plan_type"];

export interface CheckoutAdapter {
  startCheckout(plan: PlanType): Promise<{ success: boolean; error?: string }>;
}

// TODO: implement when SUBSCRIPTION_ENABLED is flipped back on.
export const checkoutAdapter: CheckoutAdapter | null = null;

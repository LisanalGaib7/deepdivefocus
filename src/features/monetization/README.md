# Monetization (gated)

All UI in this folder is currently hidden behind `SUBSCRIPTION_ENABLED` in
`src/config/featureFlags.ts`. The components are preserved intentionally —
**do not delete** them.

## Why it's off

Direction changed: the next Pro launch will be **AI analysis reports only**.
Existing limits (task slot count, full analytics range, vessel classes) are
now permanent free perks. The legacy "limit + upsell" UX is paused, not
removed, in case marketing wants to A/B it again.

## Reactivation checklist

When flipping `SUBSCRIPTION_ENABLED = true`, walk this list **before** shipping:

### 1. Decide what Pro actually unlocks now
- If still "AI reports only": stop using `isPro` directly at call sites —
  implement `useProEntitlements()` from `src/config/entitlements.ts` and
  gate features by capability (`entitlements.aiReports`), not by `isPro`.
- If reverting to legacy "task slot + analytics range" gating: re-audit
  every site that currently reads `HARD_CAP_TASKS` from `src/config/limits.ts`
  and decide which ones should switch to `LEGACY_FREE_TASK_LIMIT`.

### 2. Source of truth for Pro status — MUST be server
- `useProStatus` falls back to `localStorage['deepdive_pro_status']` for
  guest mode. **Users can edit localStorage.** Never let it be the sole
  authority for granting paid features.
- Authoritative check: `supabase.rpc('is_user_pro', ...)`. UI may cache the
  result but every paywalled action must re-verify or rely on a server-side
  enforcement point (RLS / edge function).
- Verified (2026-06): RLS on `pro_subscriptions` blocks user-side INSERT /
  UPDATE / DELETE (admin-only). Users can only `SELECT` their own row.
  Re-verify this if migrations have run since.

### 3. `is_user_pro` RPC lifetime handling
- Current definition checks `status = 'active' AND ends_at > now()` only.
- Lifetime plans therefore depend on whatever `ends_at` was inserted (i.e.
  far-future date). If you add real lifetime SKUs, update the RPC to also
  short-circuit on `plan_type = 'lifetime'`.

### 4. localStorage key versioning
- Stale `deepdive_pro_status=true` may exist in users' browsers from when
  the flag was on. If you do NOT want those users auto-Pro on reactivation,
  bump the key (e.g. `deepdive_pro_status_v2`) so old values are ignored.

### 5. Checkout adapter
- Wire `src/features/monetization/checkout.ts` to the chosen provider.
- For Capacitor builds, route to Apple/Google IAP per Apple/Google policy.

### 6. Limit constants
- Single source: `src/config/limits.ts`. Never hardcode `10`, `2`, etc.
  anywhere else. Update the constants and both UI copy + enforcement track.

### 7. Plan enum
- `plan_type` is a Postgres enum (`monthly | yearly | lifetime`). Adding a
  new SKU = `ALTER TYPE ADD VALUE` (non-breaking). Renaming/removing IS
  breaking. Prefer adding capabilities to `ProEntitlements` over expanding
  enum + switch statements across the codebase.

### 8. Manual QA pass (no automated tests exist yet)
After flipping the flag, manually verify with two accounts (one Pro, one free):
- Free account: can add up to `LEGACY_FREE_TASK_LIMIT` tasks, sees
  `UpgradeRequiredModal` on attempt #3, PRO badge hidden, blurred analytics
  ranges where applicable.
- Pro account: can add up to `HARD_CAP_TASKS`, sees PRO badge, full
  analytics, no paywall overlays. Hitting `HARD_CAP_TASKS` shows the
  hard-cap toast (not the upgrade modal).
- Admin page (`/admin/subscriptions`): always reachable regardless of flag,
  granting Pro to a test user immediately reflects in their session after
  `refreshProStatus`.

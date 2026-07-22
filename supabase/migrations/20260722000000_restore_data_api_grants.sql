-- Restore Data API grants and policy-function EXECUTE rights.
--
-- Two separate layers must both pass for a request to succeed:
--   1. GRANT  — role may touch the table/function at all
--   2. RLS    — which rows that role may see
-- Tightening (1) while relying on (2) makes every request 403.
--
-- Context: 20260721174028 revoked EXECUTE on is_admin/has_role/is_user_pro from
-- `authenticated`, assuming RLS policies could still call them. They cannot —
-- policy expressions are evaluated as the querying role, so the revoke made every
-- policy that calls is_admin()/has_role() fail with permission denied.
-- Trigger/internal helpers stay revoked as that migration intended.

GRANT USAGE ON SCHEMA public TO anon, authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public
  TO anon, authenticated;

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public
  TO anon, authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO anon, authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO anon, authenticated;

-- Functions referenced from RLS policies (and the is_user_pro RPC the client calls).
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_user_pro(uuid) TO authenticated;


-- Revoke EXECUTE from anon/authenticated on SECURITY DEFINER helper/trigger functions
-- that should not be called directly by end users. Keep RPCs (spend_pearls, award_session_rewards)
-- callable by authenticated clients. has_role/is_admin/is_user_pro are still usable inside
-- RLS policies because policies run under the definer of the function itself.

REVOKE EXECUTE ON FUNCTION public.log_audit_event(text, uuid, uuid, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_user_pro(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.audit_user_roles_change() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.mark_session_unverified_on_update() FROM PUBLIC, anon, authenticated;

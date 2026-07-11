
-- Lock down internal audit helpers so nothing outside our SECURITY DEFINER paths can call them.
REVOKE ALL ON FUNCTION public.audit_user_roles_change() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.log_audit_event(text, uuid, uuid, jsonb) FROM PUBLIC, anon, authenticated;

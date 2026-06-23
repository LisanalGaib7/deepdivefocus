
-- 1) hardcoded_admin_email_bypass: drop email-based admin policies + remove email fallback
DROP POLICY IF EXISTS "Admin view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin view all subscriptions" ON public.pro_subscriptions;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT public.has_role(auth.uid(), 'admin')
$$;

-- 2) focus_sessions_is_verified_self_set: enforce server-controlled integrity via trigger
CREATE OR REPLACE FUNCTION public.enforce_focus_session_integrity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path TO 'public'
AS $$
DECLARE
  max_pearls integer;
BEGIN
  -- Client may never mark a session as verified
  NEW.is_verified := false;

  -- Bound pearls earned to a generous ceiling based on duration
  -- (depth/10 + creature bonus ≤ duration/10 + 200 across realistic engine tiers)
  max_pearls := GREATEST(50, COALESCE(NEW.duration, 0) / 10 + 200);
  IF NEW.pearls_earned IS NULL OR NEW.pearls_earned < 0 THEN
    NEW.pearls_earned := 0;
  ELSIF NEW.pearls_earned > max_pearls THEN
    NEW.pearls_earned := max_pearls;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS focus_sessions_enforce_integrity ON public.focus_sessions;
CREATE TRIGGER focus_sessions_enforce_integrity
BEFORE INSERT OR UPDATE ON public.focus_sessions
FOR EACH ROW EXECUTE FUNCTION public.enforce_focus_session_integrity();

-- 3) user_creatures_unauthorized_insert: only allow unlocking creatures the user actually rolled in a session
DROP POLICY IF EXISTS "Users can insert their own creatures" ON public.user_creatures;
CREATE POLICY "Users can insert creatures earned in a session"
ON public.user_creatures
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM public.focus_sessions fs
    WHERE fs.user_id = auth.uid()
      AND fs.creature_id = user_creatures.creature_id
  )
);

-- 4) SECURITY DEFINER function exposure: revoke EXECUTE from public/anon for internal helpers
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.mark_session_unverified_on_update() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.enforce_focus_session_integrity() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_user_pro(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;

-- Keep RLS-callable helpers available to signed-in users (required by policies)
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_user_pro(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

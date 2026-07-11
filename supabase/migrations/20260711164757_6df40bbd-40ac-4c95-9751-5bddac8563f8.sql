
-- 1) Audit log table
CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  actor_user_id uuid,
  target_user_id uuid,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_logs_created_at ON public.audit_logs (created_at DESC);
CREATE INDEX idx_audit_logs_event_type ON public.audit_logs (event_type);
CREATE INDEX idx_audit_logs_actor ON public.audit_logs (actor_user_id);
CREATE INDEX idx_audit_logs_target ON public.audit_logs (target_user_id);

-- Grants: no anon, no authenticated write. Reads gated via RLS. Service role full access.
GRANT SELECT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can read. No INSERT/UPDATE/DELETE policies exist, so authenticated cannot write
-- directly through the Data API — writes only via SECURITY DEFINER paths below.
CREATE POLICY "Admins can view audit logs"
  ON public.audit_logs FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- 2) Internal helper (SECURITY DEFINER) to append audit rows. Not exposed to Data API.
CREATE OR REPLACE FUNCTION public.log_audit_event(
  p_event_type text,
  p_actor uuid,
  p_target uuid,
  p_details jsonb
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.audit_logs (event_type, actor_user_id, target_user_id, details)
  VALUES (p_event_type, p_actor, p_target, COALESCE(p_details, '{}'::jsonb));
END;
$$;

REVOKE ALL ON FUNCTION public.log_audit_event(text, uuid, uuid, jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.log_audit_event(text, uuid, uuid, jsonb) TO service_role;

-- 3) Rewrite award_session_rewards to also emit audit log
CREATE OR REPLACE FUNCTION public.award_session_rewards(p_task_name text, p_duration integer, p_depth integer, p_pearls integer, p_creature_id text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id uuid := auth.uid();
  v_session_id uuid;
  v_max_pearls integer;
  v_actual_pearls integer;
  v_new_total_pearls integer;
  v_new_total_depth integer;
  v_safe_task text;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '42501';
  END IF;

  IF p_duration IS NULL OR p_duration < 0 OR p_duration > 86400 THEN
    RAISE EXCEPTION 'Invalid duration: %', p_duration USING ERRCODE = '22023';
  END IF;
  IF p_depth IS NULL OR p_depth < 0 OR p_depth > 100000 THEN
    RAISE EXCEPTION 'Invalid depth: %', p_depth USING ERRCODE = '22023';
  END IF;

  v_max_pearls := GREATEST(50, COALESCE(p_duration, 0) / 10 + 200);
  v_actual_pearls := GREATEST(0, LEAST(COALESCE(p_pearls, 0), v_max_pearls));

  v_safe_task := COALESCE(NULLIF(trim(p_task_name), ''), 'Deep Dive');

  INSERT INTO public.focus_sessions (
    user_id, task_name, duration, depth_reached, pearls_earned, creature_id, is_verified
  ) VALUES (
    v_user_id, v_safe_task, p_duration, p_depth, v_actual_pearls, p_creature_id, true
  )
  RETURNING id INTO v_session_id;

  UPDATE public.profiles
  SET total_pearls = COALESCE(total_pearls, 0) + v_actual_pearls,
      total_depth  = COALESCE(total_depth, 0)  + p_depth
  WHERE user_id = v_user_id
  RETURNING total_pearls, total_depth INTO v_new_total_pearls, v_new_total_depth;

  IF NOT FOUND THEN
    INSERT INTO public.profiles (user_id, total_pearls, total_depth)
    VALUES (v_user_id, v_actual_pearls, p_depth)
    RETURNING total_pearls, total_depth INTO v_new_total_pearls, v_new_total_depth;
  END IF;

  IF p_creature_id IS NOT NULL THEN
    INSERT INTO public.user_creatures (user_id, creature_id)
    VALUES (v_user_id, p_creature_id)
    ON CONFLICT (user_id, creature_id) DO NOTHING;
  END IF;

  -- Audit log
  PERFORM public.log_audit_event(
    'pearls.award',
    v_user_id,
    v_user_id,
    jsonb_build_object(
      'session_id', v_session_id,
      'task_name', v_safe_task,
      'duration', p_duration,
      'depth', p_depth,
      'pearls_requested', p_pearls,
      'pearls_awarded', v_actual_pearls,
      'pearls_capped', (COALESCE(p_pearls, 0) > v_max_pearls),
      'creature_id', p_creature_id,
      'total_pearls_after', v_new_total_pearls,
      'total_depth_after', v_new_total_depth
    )
  );

  RETURN jsonb_build_object(
    'session_id',    v_session_id,
    'pearls_earned', v_actual_pearls,
    'total_pearls',  v_new_total_pearls,
    'total_depth',   v_new_total_depth
  );
END;
$function$;

-- 4) Rewrite spend_pearls to also emit audit log
CREATE OR REPLACE FUNCTION public.spend_pearls(p_amount integer)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id uuid := auth.uid();
  v_current integer;
  v_new_total integer;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '42501';
  END IF;
  IF p_amount IS NULL OR p_amount <= 0 THEN
    RAISE EXCEPTION 'Invalid amount' USING ERRCODE = '22023';
  END IF;

  SELECT COALESCE(total_pearls, 0) INTO v_current
  FROM public.profiles
  WHERE user_id = v_user_id
  FOR UPDATE;

  IF v_current IS NULL THEN
    RAISE EXCEPTION 'Profile not found' USING ERRCODE = 'P0002';
  END IF;
  IF v_current < p_amount THEN
    -- Log failed attempt (potential abuse signal)
    PERFORM public.log_audit_event(
      'pearls.spend_failed',
      v_user_id,
      v_user_id,
      jsonb_build_object('reason', 'insufficient_pearls', 'requested', p_amount, 'current', v_current)
    );
    RAISE EXCEPTION 'Insufficient pearls' USING ERRCODE = '22023';
  END IF;

  UPDATE public.profiles
  SET total_pearls = v_current - p_amount
  WHERE user_id = v_user_id
  RETURNING total_pearls INTO v_new_total;

  PERFORM public.log_audit_event(
    'pearls.spend',
    v_user_id,
    v_user_id,
    jsonb_build_object('amount', p_amount, 'total_pearls_before', v_current, 'total_pearls_after', v_new_total)
  );

  RETURN jsonb_build_object('total_pearls', v_new_total);
END;
$function$;

-- 5) Trigger on user_roles: audit role grants and revocations
CREATE OR REPLACE FUNCTION public.audit_user_roles_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.log_audit_event(
      'role.granted',
      auth.uid(),
      NEW.user_id,
      jsonb_build_object('role', NEW.role, 'db_user', current_user)
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM public.log_audit_event(
      'role.revoked',
      auth.uid(),
      OLD.user_id,
      jsonb_build_object('role', OLD.role, 'db_user', current_user)
    );
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    PERFORM public.log_audit_event(
      'role.updated',
      auth.uid(),
      NEW.user_id,
      jsonb_build_object('old_role', OLD.role, 'new_role', NEW.role, 'db_user', current_user)
    );
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_audit_user_roles ON public.user_roles;
CREATE TRIGGER trg_audit_user_roles
AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
FOR EACH ROW EXECUTE FUNCTION public.audit_user_roles_change();

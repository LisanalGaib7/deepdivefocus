-- =========================================================
-- 1. focus_sessions.pearls_earned : NULL 값 보정 후 NOT NULL
-- =========================================================
UPDATE public.focus_sessions SET pearls_earned = 0 WHERE pearls_earned IS NULL;
ALTER TABLE public.focus_sessions ALTER COLUMN pearls_earned SET NOT NULL;
ALTER TABLE public.focus_sessions ALTER COLUMN pearls_earned SET DEFAULT 0;

-- =========================================================
-- 2. enforce_focus_session_integrity : SECURITY DEFINER RPC 예외 처리
--    일반 클라이언트가 직접 INSERT/UPDATE할 때만 is_verified를 false로 강제.
--    내부 RPC(award_session_rewards) 경유 시 verified 유지.
-- =========================================================
CREATE OR REPLACE FUNCTION public.enforce_focus_session_integrity()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  max_pearls integer;
BEGIN
  -- 직접 데이터 API로 들어온 경우(authenticated/anon)는 항상 unverified
  IF current_user NOT IN ('postgres', 'service_role', 'supabase_admin') THEN
    NEW.is_verified := false;
  END IF;

  -- 진주 보상 상한 (악성 클라이언트 방어)
  max_pearls := GREATEST(50, COALESCE(NEW.duration, 0) / 10 + 200);
  IF NEW.pearls_earned IS NULL OR NEW.pearls_earned < 0 THEN
    NEW.pearls_earned := 0;
  ELSIF NEW.pearls_earned > max_pearls THEN
    NEW.pearls_earned := max_pearls;
  END IF;

  RETURN NEW;
END;
$$;

-- 트리거가 이미 붙어있지 않다면 부착 (기존 함수는 트리거 없이 정의만 돼있었음)
DROP TRIGGER IF EXISTS enforce_focus_session_integrity_trigger ON public.focus_sessions;
CREATE TRIGGER enforce_focus_session_integrity_trigger
  BEFORE INSERT OR UPDATE ON public.focus_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_focus_session_integrity();

-- mark_session_unverified_on_update도 트리거가 누락돼있던 것 같으니 보강
DROP TRIGGER IF EXISTS mark_session_unverified_on_update_trigger ON public.focus_sessions;
CREATE TRIGGER mark_session_unverified_on_update_trigger
  BEFORE UPDATE ON public.focus_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.mark_session_unverified_on_update();

-- =========================================================
-- 3. profiles 통화 컬럼(total_pearls, total_depth) 위변조 방지 트리거
--    클라이언트 PATCH로 임의 변경 금지. RPC 통해서만 변경 가능.
-- =========================================================
CREATE OR REPLACE FUNCTION public.prevent_profile_currency_tampering()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF current_user NOT IN ('postgres', 'service_role', 'supabase_admin') THEN
    IF NEW.total_pearls IS DISTINCT FROM OLD.total_pearls THEN
      RAISE EXCEPTION 'total_pearls can only be modified through award_session_rewards or spend_pearls RPCs'
        USING ERRCODE = '42501';
    END IF;
    IF NEW.total_depth IS DISTINCT FROM OLD.total_depth THEN
      RAISE EXCEPTION 'total_depth can only be modified through award_session_rewards RPC'
        USING ERRCODE = '42501';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_profile_currency_tampering_trigger ON public.profiles;
CREATE TRIGGER prevent_profile_currency_tampering_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_profile_currency_tampering();

-- =========================================================
-- 4. 다이브 보상 일괄 처리 RPC (세션 + 진주 + 깊이 + 도감 = 한 트랜잭션)
-- =========================================================
CREATE OR REPLACE FUNCTION public.award_session_rewards(
  p_task_name text,
  p_duration integer,
  p_depth integer,
  p_pearls integer,
  p_creature_id text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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

  -- 입력 검증
  IF p_duration IS NULL OR p_duration < 0 OR p_duration > 86400 THEN
    RAISE EXCEPTION 'Invalid duration: %', p_duration USING ERRCODE = '22023';
  END IF;
  IF p_depth IS NULL OR p_depth < 0 OR p_depth > 100000 THEN
    RAISE EXCEPTION 'Invalid depth: %', p_depth USING ERRCODE = '22023';
  END IF;

  -- 진주 상한 (트리거와 동일 공식)
  v_max_pearls := GREATEST(50, COALESCE(p_duration, 0) / 10 + 200);
  v_actual_pearls := GREATEST(0, LEAST(COALESCE(p_pearls, 0), v_max_pearls));

  v_safe_task := COALESCE(NULLIF(trim(p_task_name), ''), 'Deep Dive');

  -- 검증된 세션 저장
  INSERT INTO public.focus_sessions (
    user_id, task_name, duration, depth_reached, pearls_earned, creature_id, is_verified
  ) VALUES (
    v_user_id, v_safe_task, p_duration, p_depth, v_actual_pearls, p_creature_id, true
  )
  RETURNING id INTO v_session_id;

  -- 누적치 갱신 (위변조 트리거 우회: SECURITY DEFINER로 current_user=postgres)
  UPDATE public.profiles
  SET total_pearls = COALESCE(total_pearls, 0) + v_actual_pearls,
      total_depth  = COALESCE(total_depth, 0)  + p_depth
  WHERE user_id = v_user_id
  RETURNING total_pearls, total_depth INTO v_new_total_pearls, v_new_total_depth;

  -- 프로필이 없으면(엣지케이스) 생성
  IF NOT FOUND THEN
    INSERT INTO public.profiles (user_id, total_pearls, total_depth)
    VALUES (v_user_id, v_actual_pearls, p_depth)
    RETURNING total_pearls, total_depth INTO v_new_total_pearls, v_new_total_depth;
  END IF;

  -- 도감 등록 (idempotent)
  IF p_creature_id IS NOT NULL THEN
    INSERT INTO public.user_creatures (user_id, creature_id)
    VALUES (v_user_id, p_creature_id)
    ON CONFLICT (user_id, creature_id) DO NOTHING;
  END IF;

  RETURN jsonb_build_object(
    'session_id',    v_session_id,
    'pearls_earned', v_actual_pearls,
    'total_pearls',  v_new_total_pearls,
    'total_depth',   v_new_total_depth
  );
END;
$$;

REVOKE ALL ON FUNCTION public.award_session_rewards(text, integer, integer, integer, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.award_session_rewards(text, integer, integer, integer, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.award_session_rewards(text, integer, integer, integer, text) TO service_role;

-- =========================================================
-- 5. 진주 차감 RPC (엔지니어링 베이 업그레이드용)
--    FOR UPDATE 잠금으로 동시성 안전.
-- =========================================================
CREATE OR REPLACE FUNCTION public.spend_pearls(p_amount integer)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
    RAISE EXCEPTION 'Insufficient pearls' USING ERRCODE = '22023';
  END IF;

  UPDATE public.profiles
  SET total_pearls = v_current - p_amount
  WHERE user_id = v_user_id
  RETURNING total_pearls INTO v_new_total;

  RETURN jsonb_build_object('total_pearls', v_new_total);
END;
$$;

REVOKE ALL ON FUNCTION public.spend_pearls(integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.spend_pearls(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.spend_pearls(integer) TO service_role;
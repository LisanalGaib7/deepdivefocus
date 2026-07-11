
-- 1) Revoke anon EXECUTE from auth-required RPCs (least privilege)
REVOKE EXECUTE ON FUNCTION public.award_session_rewards(text, integer, integer, integer, text) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.spend_pearls(integer) FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.award_session_rewards(text, integer, integer, integer, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.spend_pearls(integer) TO authenticated;

-- 2) Tighten RLS policies from `public` role to `authenticated`
-- focus_sessions
DROP POLICY IF EXISTS "Users can view their own sessions" ON public.focus_sessions;
DROP POLICY IF EXISTS "Users can insert their own sessions" ON public.focus_sessions;
DROP POLICY IF EXISTS "Users can update their own sessions" ON public.focus_sessions;
DROP POLICY IF EXISTS "Users can delete their own sessions" ON public.focus_sessions;
CREATE POLICY "Users can view their own sessions" ON public.focus_sessions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own sessions" ON public.focus_sessions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own sessions" ON public.focus_sessions FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own sessions" ON public.focus_sessions FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- tasks
DROP POLICY IF EXISTS "Users can view their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can create their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can update their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can delete their own tasks" ON public.tasks;
CREATE POLICY "Users can view their own tasks" ON public.tasks FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own tasks" ON public.tasks FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own tasks" ON public.tasks FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own tasks" ON public.tasks FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- user_creatures view policy tighten
DROP POLICY IF EXISTS "Users can view their own creatures" ON public.user_creatures;
CREATE POLICY "Users can view their own creatures" ON public.user_creatures FOR SELECT TO authenticated USING (auth.uid() = user_id);

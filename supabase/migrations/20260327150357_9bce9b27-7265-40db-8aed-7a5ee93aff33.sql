
-- Drop existing admin policies and recreate with both auth.email() and jwt fallback
DROP POLICY IF EXISTS "Admin can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin can view all subscriptions" ON public.pro_subscriptions;
DROP POLICY IF EXISTS "Admin can insert subscriptions" ON public.pro_subscriptions;
DROP POLICY IF EXISTS "Admin can update subscriptions" ON public.pro_subscriptions;

-- Create a security definer function to check admin status
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT coalesce(auth.email(), auth.jwt()->>'email', '') = 'aaaehgus@gmail.com'
$$;

-- Profiles: admin can view all
CREATE POLICY "Admin can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (public.is_admin());

-- Subscriptions: admin can view all
CREATE POLICY "Admin can view all subscriptions"
ON public.pro_subscriptions FOR SELECT
TO authenticated
USING (public.is_admin());

-- Subscriptions: admin can insert
CREATE POLICY "Admin can insert subscriptions"
ON public.pro_subscriptions FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

-- Subscriptions: admin can update
CREATE POLICY "Admin can update subscriptions"
ON public.pro_subscriptions FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());


-- Allow admin to view all profiles for the admin dashboard
CREATE POLICY "Admin can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (
  (auth.jwt()->>'email') = 'aaaehgus@gmail.com'
);

-- Allow admin to view all subscriptions
CREATE POLICY "Admin can view all subscriptions"
ON public.pro_subscriptions FOR SELECT
TO authenticated
USING (
  (auth.jwt()->>'email') = 'aaaehgus@gmail.com'
);

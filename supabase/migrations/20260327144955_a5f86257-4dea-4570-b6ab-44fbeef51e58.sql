
-- Drop old policies
DROP POLICY IF EXISTS "Admin can insert subscriptions" ON public.pro_subscriptions;
DROP POLICY IF EXISTS "Admin can update subscriptions" ON public.pro_subscriptions;

-- Recreate with correct admin email
CREATE POLICY "Admin can insert subscriptions"
ON public.pro_subscriptions FOR INSERT
TO authenticated
WITH CHECK (
  (auth.jwt()->>'email') = 'aaaehgus@gmail.com'
);

CREATE POLICY "Admin can update subscriptions"
ON public.pro_subscriptions FOR UPDATE
TO authenticated
USING (
  (auth.jwt()->>'email') = 'aaaehgus@gmail.com'
)
WITH CHECK (
  (auth.jwt()->>'email') = 'aaaehgus@gmail.com'
);

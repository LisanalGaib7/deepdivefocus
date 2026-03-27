
-- Admin can insert subscriptions (check via auth.jwt() email)
CREATE POLICY "Admin can insert subscriptions"
ON public.pro_subscriptions FOR INSERT
TO authenticated
WITH CHECK (
  (auth.jwt()->>'email') = 'gkswjdals0821@gmail.com'
);

-- Admin can update subscriptions
CREATE POLICY "Admin can update subscriptions"
ON public.pro_subscriptions FOR UPDATE
TO authenticated
USING (
  (auth.jwt()->>'email') = 'gkswjdals0821@gmail.com'
)
WITH CHECK (
  (auth.jwt()->>'email') = 'gkswjdals0821@gmail.com'
);

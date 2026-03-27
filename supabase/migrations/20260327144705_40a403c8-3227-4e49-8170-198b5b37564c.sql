
-- Create plan type enum
CREATE TYPE public.plan_type AS ENUM ('monthly', 'yearly', 'lifetime');

-- Create pro_subscriptions table
CREATE TABLE public.pro_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  plan_type plan_type NOT NULL DEFAULT 'lifetime',
  status TEXT NOT NULL DEFAULT 'active',
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ends_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT '2099-12-31T23:59:59Z',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pro_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can view their own subscription
CREATE POLICY "Users can view their own subscription"
ON public.pro_subscriptions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Create a security definer function to check pro status (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.is_user_pro(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.pro_subscriptions
    WHERE user_id = _user_id
      AND status = 'active'
      AND ends_at > now()
  )
$$;

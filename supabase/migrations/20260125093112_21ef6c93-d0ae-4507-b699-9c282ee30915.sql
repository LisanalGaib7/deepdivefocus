-- Add is_verified column to track authentic timer completions vs manual edits
ALTER TABLE public.focus_sessions 
ADD COLUMN is_verified boolean NOT NULL DEFAULT false;

-- Mark all existing sessions as verified (they were created through the app)
UPDATE public.focus_sessions SET is_verified = true;

-- Add UPDATE policy so users can edit their own sessions
CREATE POLICY "Users can update their own sessions"
ON public.focus_sessions
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create a trigger function to automatically set is_verified to false on manual updates
-- This ensures any edit (even via API) marks the session as unverified
CREATE OR REPLACE FUNCTION public.mark_session_unverified_on_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If the update is changing duration, depth, or pearls, mark as unverified
  -- But allow the initial insert to set is_verified = true
  IF OLD.is_verified = true AND (
    NEW.duration != OLD.duration OR 
    NEW.depth_reached != OLD.depth_reached OR
    NEW.pearls_earned != OLD.pearls_earned
  ) THEN
    NEW.is_verified := false;
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for the function
CREATE TRIGGER enforce_unverified_on_edit
BEFORE UPDATE ON public.focus_sessions
FOR EACH ROW
EXECUTE FUNCTION public.mark_session_unverified_on_update();
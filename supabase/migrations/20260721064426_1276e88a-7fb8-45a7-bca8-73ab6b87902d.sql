ALTER TABLE public.tasks
  ADD COLUMN urgency smallint CHECK (urgency BETWEEN 1 AND 5),
  ADD COLUMN impact smallint CHECK (impact BETWEEN 1 AND 5),
  ADD COLUMN effort_minutes smallint CHECK (effort_minutes IN (5,15,30,60,120));
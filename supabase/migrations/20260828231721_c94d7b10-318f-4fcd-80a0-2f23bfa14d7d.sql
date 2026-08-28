ALTER TABLE public.teams DROP CONSTRAINT IF EXISTS teams_name_key;
DROP INDEX IF EXISTS public.teams_name_key;
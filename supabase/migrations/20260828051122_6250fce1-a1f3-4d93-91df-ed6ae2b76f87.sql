ALTER TABLE public.matches
  ADD COLUMN IF NOT EXISTS phase text NOT NULL DEFAULT 'scheduled',
  ADD COLUMN IF NOT EXISTS first_half_started_at timestamptz,
  ADD COLUMN IF NOT EXISTS second_half_started_at timestamptz,
  ADD COLUMN IF NOT EXISTS stoppage_minutes integer NOT NULL DEFAULT 0;

-- backfill phase from existing status
UPDATE public.matches SET phase = 'finished' WHERE status = 'finished' AND phase = 'scheduled';
UPDATE public.matches SET phase = 'second_half' WHERE status = 'live' AND phase = 'scheduled';

CREATE OR REPLACE FUNCTION public.sync_match_status_from_phase()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.phase IN ('first_half', 'halftime', 'second_half') THEN
    NEW.status := 'live';
  ELSIF NEW.phase = 'finished' THEN
    NEW.status := 'finished';
  ELSE
    NEW.status := 'scheduled';
  END IF;

  IF NEW.phase = 'first_half' AND NEW.first_half_started_at IS NULL THEN
    NEW.first_half_started_at := now();
  END IF;
  IF NEW.phase = 'second_half' AND NEW.second_half_started_at IS NULL THEN
    NEW.second_half_started_at := now();
  END IF;

  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_match_status_from_phase_trg ON public.matches;
CREATE TRIGGER sync_match_status_from_phase_trg
BEFORE INSERT OR UPDATE OF phase, first_half_started_at, second_half_started_at ON public.matches
FOR EACH ROW EXECUTE FUNCTION public.sync_match_status_from_phase();

-- Admin write access
GRANT SELECT, INSERT, UPDATE, DELETE ON public.matches TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.match_events TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.league_standings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.top_scorers TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.teams TO authenticated;
GRANT ALL ON public.matches TO service_role;
GRANT ALL ON public.match_events TO service_role;
GRANT ALL ON public.league_standings TO service_role;
GRANT ALL ON public.top_scorers TO service_role;
GRANT ALL ON public.teams TO service_role;

DROP POLICY IF EXISTS "Admins manage matches" ON public.matches;
CREATE POLICY "Admins manage matches" ON public.matches FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins manage match events" ON public.match_events;
CREATE POLICY "Admins manage match events" ON public.match_events FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins manage standings" ON public.league_standings;
CREATE POLICY "Admins manage standings" ON public.league_standings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins manage top scorers" ON public.top_scorers;
CREATE POLICY "Admins manage top scorers" ON public.top_scorers FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins manage teams" ON public.teams;
CREATE POLICY "Admins manage teams" ON public.teams FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
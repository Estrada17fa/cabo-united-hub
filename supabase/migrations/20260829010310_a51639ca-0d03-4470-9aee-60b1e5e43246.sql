-- ENUMS
CREATE TYPE public.match_phase AS ENUM ('scheduled','first_half','halftime','second_half','finished','postponed','canceled');
CREATE TYPE public.match_event_type AS ENUM ('goal','own_goal','penalty_goal','penalty_miss','yellow','red','substitution','note','var');
CREATE TYPE public.match_stage AS ENUM ('regular','final');

-- TEAMS
CREATE TABLE public.teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  short_name text,
  logo_url text,
  group_name text,
  city text,
  is_ours boolean NOT NULL DEFAULT false,
  season text NOT NULL DEFAULT '2026',
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.teams TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.teams TO authenticated;
GRANT ALL ON public.teams TO service_role;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "teams_public_read" ON public.teams FOR SELECT USING (true);
CREATE POLICY "teams_admin_write" ON public.teams FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- MATCHES
CREATE TABLE public.matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  season text NOT NULL DEFAULT '2026',
  matchday integer,
  group_name text,
  stage public.match_stage NOT NULL DEFAULT 'regular',
  home_team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  away_team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  kickoff_at timestamptz NOT NULL,
  venue text,
  phase public.match_phase NOT NULL DEFAULT 'scheduled',
  first_half_started_at timestamptz,
  second_half_started_at timestamptz,
  stoppage_minutes integer NOT NULL DEFAULT 0,
  home_score integer NOT NULL DEFAULT 0,
  away_score integer NOT NULL DEFAULT 0,
  manual_score boolean NOT NULL DEFAULT false,
  home_pens integer,
  away_pens integer,
  home_points integer NOT NULL DEFAULT 0,
  away_points integer NOT NULL DEFAULT 0,
  stream_url text,
  tickets_url text,
  highlights_url text,
  is_featured boolean NOT NULL DEFAULT false,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT matches_teams_differ CHECK (home_team_id <> away_team_id)
);
CREATE INDEX matches_kickoff_idx ON public.matches (kickoff_at);
CREATE INDEX matches_phase_idx ON public.matches (phase);
GRANT SELECT ON public.matches TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.matches TO authenticated;
GRANT ALL ON public.matches TO service_role;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "matches_public_read" ON public.matches FOR SELECT USING (true);
CREATE POLICY "matches_admin_write" ON public.matches FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- MATCH EVENTS
CREATE TABLE public.match_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  minute integer NOT NULL DEFAULT 0,
  minute_extra integer,
  type public.match_event_type NOT NULL,
  team_id uuid REFERENCES public.teams(id) ON DELETE SET NULL,
  player_id uuid REFERENCES public.players(id) ON DELETE SET NULL,
  player_name text,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX match_events_match_idx ON public.match_events (match_id, minute);
GRANT SELECT ON public.match_events TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.match_events TO authenticated;
GRANT ALL ON public.match_events TO service_role;
ALTER TABLE public.match_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "match_events_public_read" ON public.match_events FOR SELECT USING (true);
CREATE POLICY "match_events_admin_write" ON public.match_events FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- STANDINGS
CREATE TABLE public.league_standings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  season text NOT NULL DEFAULT '2026',
  group_name text,
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  played integer NOT NULL DEFAULT 0,
  won integer NOT NULL DEFAULT 0,
  drawn integer NOT NULL DEFAULT 0,
  lost integer NOT NULL DEFAULT 0,
  goals_for integer NOT NULL DEFAULT 0,
  goals_against integer NOT NULL DEFAULT 0,
  goal_diff integer NOT NULL DEFAULT 0,
  points integer NOT NULL DEFAULT 0,
  manual_adjustment integer NOT NULL DEFAULT 0,
  adjustment_note text,
  form text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (season, team_id)
);
GRANT SELECT ON public.league_standings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.league_standings TO authenticated;
GRANT ALL ON public.league_standings TO service_role;
ALTER TABLE public.league_standings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "standings_public_read" ON public.league_standings FOR SELECT USING (true);
CREATE POLICY "standings_admin_write" ON public.league_standings FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- TOP SCORERS
CREATE TABLE public.top_scorers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  season text NOT NULL DEFAULT '2026',
  player_name text NOT NULL,
  team_id uuid REFERENCES public.teams(id) ON DELETE CASCADE,
  player_id uuid REFERENCES public.players(id) ON DELETE SET NULL,
  goals integer NOT NULL DEFAULT 0,
  assists integer NOT NULL DEFAULT 0,
  matches_played integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.top_scorers TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.top_scorers TO authenticated;
GRANT ALL ON public.top_scorers TO service_role;
ALTER TABLE public.top_scorers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "scorers_public_read" ON public.top_scorers FOR SELECT USING (true);
CREATE POLICY "scorers_admin_write" ON public.top_scorers FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- PREDICTIONS
CREATE TABLE public.match_predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  match_id uuid NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  home_score integer NOT NULL,
  away_score integer NOT NULL,
  rewarded boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, match_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.match_predictions TO authenticated;
GRANT ALL ON public.match_predictions TO service_role;
ALTER TABLE public.match_predictions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "predictions_own_read" ON public.match_predictions FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "predictions_own_insert" ON public.match_predictions FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "predictions_own_update" ON public.match_predictions FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- MAN OF THE MATCH VOTES
CREATE TABLE public.motm_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  match_id uuid NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  player_id uuid NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, match_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.motm_votes TO authenticated;
GRANT ALL ON public.motm_votes TO service_role;
ALTER TABLE public.motm_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "motm_own_read" ON public.motm_votes FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "motm_own_insert" ON public.motm_votes FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "motm_own_update" ON public.motm_votes FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- LIVE REACTIONS
CREATE TABLE public.match_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  match_id uuid NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  kind text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX match_reactions_match_idx ON public.match_reactions (match_id, created_at DESC);
GRANT SELECT, INSERT ON public.match_reactions TO authenticated;
GRANT ALL ON public.match_reactions TO service_role;
ALTER TABLE public.match_reactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reactions_read_all" ON public.match_reactions FOR SELECT TO authenticated USING (true);
CREATE POLICY "reactions_own_insert" ON public.match_reactions FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- POINTS ENGINE
CREATE OR REPLACE FUNCTION public.compute_match_points(
  _home_score integer, _away_score integer, _home_pens integer, _away_pens integer
) RETURNS TABLE(home_points integer, away_points integer)
LANGUAGE plpgsql IMMUTABLE SET search_path = public AS $$
DECLARE hp integer := 0; ap integer := 0;
BEGIN
  IF _home_score IS NULL OR _away_score IS NULL THEN
    RETURN QUERY SELECT 0, 0; RETURN;
  END IF;

  IF _home_score > _away_score THEN
    hp := 3; ap := 0;
  ELSIF _away_score > _home_score THEN
    ap := CASE WHEN (_away_score - _home_score) >= 2 THEN 4 ELSE 3 END;
    hp := 0;
  ELSE
    hp := 1; ap := 1;
    IF _home_score >= 2 THEN
      IF COALESCE(_home_pens,0) > COALESCE(_away_pens,0) THEN hp := 2;
      ELSIF COALESCE(_away_pens,0) > COALESCE(_home_pens,0) THEN ap := 2;
      END IF;
    END IF;
  END IF;

  RETURN QUERY SELECT hp, ap;
END $$;

CREATE OR REPLACE FUNCTION public.matches_apply_points() RETURNS trigger
LANGUAGE plpgsql SET search_path = public AS $$
DECLARE p record;
BEGIN
  IF NEW.phase = 'finished' THEN
    SELECT * INTO p FROM public.compute_match_points(NEW.home_score, NEW.away_score, NEW.home_pens, NEW.away_pens);
    NEW.home_points := p.home_points;
    NEW.away_points := p.away_points;
  ELSE
    NEW.home_points := 0;
    NEW.away_points := 0;
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END $$;

CREATE TRIGGER trg_matches_points BEFORE INSERT OR UPDATE ON public.matches
FOR EACH ROW EXECUTE FUNCTION public.matches_apply_points();

CREATE OR REPLACE FUNCTION public.recalculate_standings(_season text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.league_standings (season, team_id, group_name)
  SELECT t.season, t.id, t.group_name FROM public.teams t
   WHERE t.season = _season AND t.active
  ON CONFLICT (season, team_id) DO UPDATE SET group_name = EXCLUDED.group_name;

  WITH sides AS (
    SELECT home_team_id AS team_id, home_score AS gf, away_score AS ga, home_points AS pts, kickoff_at
      FROM public.matches WHERE season = _season AND phase = 'finished'
    UNION ALL
    SELECT away_team_id, away_score, home_score, away_points, kickoff_at
      FROM public.matches WHERE season = _season AND phase = 'finished'
  ), agg AS (
    SELECT team_id,
           count(*)::int AS played,
           count(*) FILTER (WHERE gf > ga)::int AS won,
           count(*) FILTER (WHERE gf = ga)::int AS drawn,
           count(*) FILTER (WHERE gf < ga)::int AS lost,
           COALESCE(sum(gf),0)::int AS goals_for,
           COALESCE(sum(ga),0)::int AS goals_against,
           COALESCE(sum(pts),0)::int AS points
      FROM sides GROUP BY team_id
  ), formed AS (
    SELECT team_id, string_agg(res, '' ORDER BY kickoff_at) AS form FROM (
      SELECT team_id, kickoff_at,
             CASE WHEN gf > ga THEN 'W' WHEN gf = ga THEN 'D' ELSE 'L' END AS res,
             row_number() OVER (PARTITION BY team_id ORDER BY kickoff_at DESC) AS rn
        FROM sides
    ) x WHERE rn <= 5 GROUP BY team_id
  )
  UPDATE public.league_standings s
     SET played = COALESCE(a.played,0),
         won = COALESCE(a.won,0),
         drawn = COALESCE(a.drawn,0),
         lost = COALESCE(a.lost,0),
         goals_for = COALESCE(a.goals_for,0),
         goals_against = COALESCE(a.goals_against,0),
         goal_diff = COALESCE(a.goals_for,0) - COALESCE(a.goals_against,0),
         points = COALESCE(a.points,0) + s.manual_adjustment,
         form = f.form,
         updated_at = now()
    FROM (SELECT 1) dummy
    LEFT JOIN agg a ON a.team_id = s.team_id
    LEFT JOIN formed f ON f.team_id = s.team_id
   WHERE s.season = _season;
END $$;

CREATE OR REPLACE FUNCTION public.matches_refresh_standings() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public.recalculate_standings(COALESCE(NEW.season, OLD.season));
  RETURN NULL;
END $$;

CREATE TRIGGER trg_matches_standings AFTER INSERT OR UPDATE OR DELETE ON public.matches
FOR EACH ROW EXECUTE FUNCTION public.matches_refresh_standings();

-- SCORE FROM TIMELINE
CREATE OR REPLACE FUNCTION public.match_events_sync_score() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_match_id uuid; m record; h integer; a integer;
BEGIN
  v_match_id := COALESCE(NEW.match_id, OLD.match_id);
  SELECT * INTO m FROM public.matches WHERE id = v_match_id;
  IF NOT FOUND OR m.manual_score THEN RETURN NULL; END IF;

  SELECT
    count(*) FILTER (WHERE (e.type IN ('goal','penalty_goal') AND e.team_id = m.home_team_id)
                        OR (e.type = 'own_goal' AND e.team_id = m.away_team_id)),
    count(*) FILTER (WHERE (e.type IN ('goal','penalty_goal') AND e.team_id = m.away_team_id)
                        OR (e.type = 'own_goal' AND e.team_id = m.home_team_id))
    INTO h, a
  FROM public.match_events e WHERE e.match_id = v_match_id;

  UPDATE public.matches SET home_score = COALESCE(h,0), away_score = COALESCE(a,0), updated_at = now()
   WHERE id = v_match_id;
  RETURN NULL;
END $$;

CREATE TRIGGER trg_match_events_score AFTER INSERT OR UPDATE OR DELETE ON public.match_events
FOR EACH ROW EXECUTE FUNCTION public.match_events_sync_score();

CREATE TRIGGER trg_teams_updated BEFORE UPDATE ON public.teams
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- REALTIME
ALTER TABLE public.matches REPLICA IDENTITY FULL;
ALTER TABLE public.match_events REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.matches;
ALTER PUBLICATION supabase_realtime ADD TABLE public.match_events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.match_reactions;
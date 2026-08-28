-- 1. TEAMS: metadatos de liga
ALTER TABLE public.teams
  ADD COLUMN IF NOT EXISTS short_name text,
  ADD COLUMN IF NOT EXISTS group_name text,
  ADD COLUMN IF NOT EXISTS season text NOT NULL DEFAULT '2025-2026',
  ADD COLUMN IF NOT EXISTS active boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS is_ours boolean NOT NULL DEFAULT false;

CREATE UNIQUE INDEX IF NOT EXISTS teams_name_season_key ON public.teams (name, season);
CREATE UNIQUE INDEX IF NOT EXISTS teams_one_ours_per_season ON public.teams (season) WHERE is_ours;

-- 2. MATCHES: grupo, penales, etapa, puntos
ALTER TABLE public.matches
  ADD COLUMN IF NOT EXISTS group_name text,
  ADD COLUMN IF NOT EXISTS home_pens integer,
  ADD COLUMN IF NOT EXISTS away_pens integer,
  ADD COLUMN IF NOT EXISTS stage text NOT NULL DEFAULT 'regular',
  ADD COLUMN IF NOT EXISTS round_name text,
  ADD COLUMN IF NOT EXISTS home_points integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS away_points integer NOT NULL DEFAULT 0;

-- 3. LEAGUE_STANDINGS: ajuste manual + clave única
ALTER TABLE public.league_standings
  ADD COLUMN IF NOT EXISTS manual_adjustment integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS adjustment_note text;

DELETE FROM public.league_standings a
 USING public.league_standings b
 WHERE a.ctid < b.ctid AND a.season = b.season AND a.team = b.team;

CREATE UNIQUE INDEX IF NOT EXISTS league_standings_season_team_key
  ON public.league_standings (season, team);

-- 4. Reglamento de puntos
CREATE OR REPLACE FUNCTION public.compute_match_points(
  _home_score integer, _away_score integer, _home_pens integer, _away_pens integer
) RETURNS integer[]
LANGUAGE plpgsql IMMUTABLE
SET search_path = public
AS $$
DECLARE h integer := COALESCE(_home_score, 0); a integer := COALESCE(_away_score, 0);
BEGIN
  IF h > a THEN
    RETURN ARRAY[3, 0];
  ELSIF a > h THEN
    RETURN ARRAY[0, CASE WHEN (a - h) >= 2 THEN 4 ELSE 3 END];
  ELSIF h >= 2 THEN
    -- empate con 2 o mas goles por lado: penales
    IF COALESCE(_home_pens, 0) > COALESCE(_away_pens, 0) THEN
      RETURN ARRAY[2, 1];
    ELSIF COALESCE(_away_pens, 0) > COALESCE(_home_pens, 0) THEN
      RETURN ARRAY[1, 2];
    ELSE
      RETURN ARRAY[1, 1];
    END IF;
  ELSE
    RETURN ARRAY[1, 1];
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.matches_apply_points()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE pts integer[];
BEGIN
  IF NEW.phase = 'finished' OR NEW.status = 'finished' THEN
    pts := public.compute_match_points(NEW.home_score, NEW.away_score, NEW.home_pens, NEW.away_pens);
    NEW.home_points := pts[1];
    NEW.away_points := pts[2];
  ELSE
    NEW.home_points := 0;
    NEW.away_points := 0;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_matches_apply_points ON public.matches;
CREATE TRIGGER trg_matches_apply_points
  BEFORE INSERT OR UPDATE ON public.matches
  FOR EACH ROW EXECUTE FUNCTION public.matches_apply_points();

-- 5. Recalculo de posiciones (preserva ajustes manuales)
CREATE OR REPLACE FUNCTION public.recalculate_standings(_season text DEFAULT NULL)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_season text; v_rows integer := 0;
BEGIN
  v_season := COALESCE(_season, (SELECT season FROM public.matches ORDER BY match_date DESC LIMIT 1), '2025-2026');

  WITH sides AS (
    SELECT home_team AS team, group_name, home_score AS gf, away_score AS gc, home_points AS pts
      FROM public.matches
     WHERE season = v_season AND stage = 'regular' AND (phase = 'finished' OR status = 'finished')
    UNION ALL
    SELECT away_team AS team, group_name, away_score AS gf, home_score AS gc, away_points AS pts
      FROM public.matches
     WHERE season = v_season AND stage = 'regular' AND (phase = 'finished' OR status = 'finished')
  ),
  agg AS (
    SELECT team,
           max(group_name) AS group_name,
           count(*)::int AS jj,
           count(*) FILTER (WHERE gf > gc)::int AS jg,
           count(*) FILTER (WHERE gf = gc)::int AS je,
           count(*) FILTER (WHERE gf < gc)::int AS jp,
           COALESCE(sum(gf), 0)::int AS gf,
           COALESCE(sum(gc), 0)::int AS gc,
           COALESCE(sum(pts), 0)::int AS pts
      FROM sides GROUP BY team
  ),
  base AS (
    SELECT t.name AS team,
           COALESCE(a.group_name, t.group_name) AS group_name,
           COALESCE(a.jj, 0) AS jj, COALESCE(a.jg, 0) AS jg,
           COALESCE(a.je, 0) AS je, COALESCE(a.jp, 0) AS jp,
           COALESCE(a.gf, 0) AS gf, COALESCE(a.gc, 0) AS gc,
           COALESCE(a.pts, 0) AS raw_pts,
           COALESCE(s.manual_adjustment, 0) AS adj,
           s.adjustment_note
      FROM public.teams t
      LEFT JOIN agg a ON a.team = t.name
      LEFT JOIN public.league_standings s ON s.team = t.name AND s.season = v_season
     WHERE t.active AND t.season = v_season
  ),
  ranked AS (
    SELECT *, (raw_pts + adj) AS total_pts,
           row_number() OVER (
             PARTITION BY COALESCE(group_name, 'general')
             ORDER BY (raw_pts + adj) DESC, (gf - gc) DESC, gf DESC, team ASC
           )::int AS pos
      FROM base
  )
  INSERT INTO public.league_standings
    (season, team, group_name, pos, jj, jg, je, jp, gf, gc, dg, pts, manual_adjustment, adjustment_note, updated_at)
  SELECT v_season, team, group_name, pos, jj, jg, je, jp, gf, gc, (gf - gc), total_pts, adj, adjustment_note, now()
    FROM ranked
  ON CONFLICT (season, team) DO UPDATE SET
    group_name = EXCLUDED.group_name, pos = EXCLUDED.pos, jj = EXCLUDED.jj,
    jg = EXCLUDED.jg, je = EXCLUDED.je, jp = EXCLUDED.jp, gf = EXCLUDED.gf,
    gc = EXCLUDED.gc, dg = EXCLUDED.dg, pts = EXCLUDED.pts, updated_at = now();

  GET DIAGNOSTICS v_rows = ROW_COUNT;

  DELETE FROM public.league_standings s
   WHERE s.season = v_season
     AND NOT EXISTS (
       SELECT 1 FROM public.teams t WHERE t.name = s.team AND t.season = v_season AND t.active
     );

  RETURN v_rows;
END $$;

CREATE OR REPLACE FUNCTION public.matches_refresh_standings()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public.recalculate_standings(COALESCE(NEW.season, OLD.season));
  RETURN NULL;
END $$;

DROP TRIGGER IF EXISTS trg_matches_refresh_standings ON public.matches;
CREATE TRIGGER trg_matches_refresh_standings
  AFTER INSERT OR UPDATE OR DELETE ON public.matches
  FOR EACH ROW EXECUTE FUNCTION public.matches_refresh_standings();

CREATE OR REPLACE FUNCTION public.set_standings_adjustment(_season text, _team text, _adjustment integer, _note text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;
  UPDATE public.league_standings
     SET manual_adjustment = COALESCE(_adjustment, 0), adjustment_note = NULLIF(_note, ''), updated_at = now()
   WHERE season = _season AND team = _team;
  PERFORM public.recalculate_standings(_season);
END $$;

-- 6. Permisos
GRANT SELECT ON public.teams, public.matches, public.league_standings, public.top_scorers TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.teams, public.matches, public.league_standings, public.top_scorers TO authenticated;
GRANT ALL ON public.teams, public.matches, public.league_standings, public.top_scorers TO service_role;
GRANT EXECUTE ON FUNCTION public.recalculate_standings(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_standings_adjustment(text, text, integer, text) TO authenticated;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='teams' AND policyname='teams_admin_write') THEN
    CREATE POLICY teams_admin_write ON public.teams FOR ALL TO authenticated
      USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='top_scorers' AND policyname='top_scorers_admin_write') THEN
    CREATE POLICY top_scorers_admin_write ON public.top_scorers FOR ALL TO authenticated
      USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='league_standings' AND policyname='league_standings_admin_write') THEN
    CREATE POLICY league_standings_admin_write ON public.league_standings FOR ALL TO authenticated
      USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
  END IF;
END $$;
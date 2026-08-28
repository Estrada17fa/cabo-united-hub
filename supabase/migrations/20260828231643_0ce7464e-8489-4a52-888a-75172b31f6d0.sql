REVOKE ALL ON FUNCTION public.recalculate_standings(text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.set_standings_adjustment(text, text, integer, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.matches_refresh_standings() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.recalculate_standings(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_standings_adjustment(text, text, integer, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.recalculate_standings(_season text DEFAULT NULL)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_season text; v_rows integer := 0;
BEGIN
  IF auth.uid() IS NOT NULL AND NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

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

REVOKE ALL ON FUNCTION public.recalculate_standings(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.recalculate_standings(text) TO authenticated;
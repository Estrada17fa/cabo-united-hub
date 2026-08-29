CREATE OR REPLACE FUNCTION public.recalculate_standings(_season text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
  ), stats AS (
    SELECT s.id,
           COALESCE(a.played,0) AS played,
           COALESCE(a.won,0) AS won,
           COALESCE(a.drawn,0) AS drawn,
           COALESCE(a.lost,0) AS lost,
           COALESCE(a.goals_for,0) AS goals_for,
           COALESCE(a.goals_against,0) AS goals_against,
           COALESCE(a.points,0) AS points,
           f.form
      FROM public.league_standings s
      LEFT JOIN agg a ON a.team_id = s.team_id
      LEFT JOIN formed f ON f.team_id = s.team_id
     WHERE s.season = _season
  )
  UPDATE public.league_standings s
     SET played = st.played,
         won = st.won,
         drawn = st.drawn,
         lost = st.lost,
         goals_for = st.goals_for,
         goals_against = st.goals_against,
         goal_diff = st.goals_for - st.goals_against,
         points = st.points + s.manual_adjustment,
         form = st.form,
         updated_at = now()
    FROM stats st
   WHERE st.id = s.id;
END $function$;
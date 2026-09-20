CREATE INDEX IF NOT EXISTS idx_matches_season_kickoff ON public.matches (season, kickoff_at);
CREATE INDEX IF NOT EXISTS idx_matches_kickoff ON public.matches (kickoff_at);
CREATE INDEX IF NOT EXISTS idx_league_standings_season_points ON public.league_standings (season, points DESC, goal_diff DESC, goals_for DESC);
CREATE INDEX IF NOT EXISTS idx_top_scorers_season_goals ON public.top_scorers (season, goals DESC, assists DESC);
CREATE INDEX IF NOT EXISTS idx_match_events_match ON public.match_events (match_id, minute DESC, created_at DESC);
DROP TRIGGER IF EXISTS trg_matches_refresh_standings ON public.matches;
DROP TRIGGER IF EXISTS trg_matches_apply_points ON public.matches;
DROP TRIGGER IF EXISTS sync_match_status_from_phase_trg ON public.matches;

DROP TABLE IF EXISTS public.match_events CASCADE;
DROP TABLE IF EXISTS public.matches CASCADE;
DROP TABLE IF EXISTS public.league_standings CASCADE;
DROP TABLE IF EXISTS public.top_scorers CASCADE;
DROP TABLE IF EXISTS public.teams CASCADE;

DROP FUNCTION IF EXISTS public.matches_refresh_standings() CASCADE;
DROP FUNCTION IF EXISTS public.matches_apply_points() CASCADE;
DROP FUNCTION IF EXISTS public.sync_match_status_from_phase() CASCADE;
DROP FUNCTION IF EXISTS public.recalculate_standings(text) CASCADE;
DROP FUNCTION IF EXISTS public.compute_match_points(integer, integer, integer, integer) CASCADE;
DROP FUNCTION IF EXISTS public.set_standings_adjustment(text, text, integer, text) CASCADE;

DROP TYPE IF EXISTS public.match_status CASCADE;
DROP TYPE IF EXISTS public.match_event_type CASCADE;
DROP TYPE IF EXISTS public.match_source CASCADE;
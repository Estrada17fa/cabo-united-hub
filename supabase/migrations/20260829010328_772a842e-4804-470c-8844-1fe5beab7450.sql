REVOKE EXECUTE ON FUNCTION public.matches_refresh_standings() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.match_events_sync_score() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.recalculate_standings(text) FROM anon, public;

CREATE OR REPLACE FUNCTION public.admin_recalculate_standings(_season text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;
  PERFORM public.recalculate_standings(_season);
END $$;

REVOKE EXECUTE ON FUNCTION public.admin_recalculate_standings(text) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.admin_recalculate_standings(text) TO authenticated;
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS live_stream_url text;

ALTER TABLE public.matches REPLICA IDENTITY FULL;
ALTER TABLE public.match_events REPLICA IDENTITY FULL;

DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.matches;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.match_events;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;
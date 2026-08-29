ALTER TABLE public.seasons ADD COLUMN IF NOT EXISTS season_key text;

CREATE UNIQUE INDEX IF NOT EXISTS seasons_season_key_uidx ON public.seasons (season_key) WHERE season_key IS NOT NULL;

GRANT SELECT ON public.seasons TO anon;

DROP POLICY IF EXISTS "Authenticated view seasons" ON public.seasons;
CREATE POLICY "Public view seasons" ON public.seasons FOR SELECT TO anon, authenticated USING (true);

INSERT INTO public.seasons (name, season_key, start_date, end_date, cc_reset_date, status)
SELECT 'Primera Premier', '2026', '2026-01-01', '2026-12-31', '2026-12-31', 'active'
WHERE NOT EXISTS (SELECT 1 FROM public.seasons WHERE season_key = '2026');
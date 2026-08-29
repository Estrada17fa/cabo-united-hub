ALTER TABLE public.seasons
  ADD COLUMN IF NOT EXISTS points_rules jsonb NOT NULL DEFAULT jsonb_build_object(
    'home_win', 3, 'away_win_2plus', 4, 'away_win_1', 3,
    'draw', 1, 'draw_pens_bonus', 1, 'loss', 0,
    'tiebreakers', jsonb_build_array('points','goal_diff','goals_for')
  ),
  ADD COLUMN IF NOT EXISTS qualifiers_count integer NOT NULL DEFAULT 4,
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT false;

CREATE UNIQUE INDEX IF NOT EXISTS seasons_single_active_idx
  ON public.seasons ((is_active)) WHERE is_active;

UPDATE public.seasons SET is_active = true
 WHERE id = (SELECT id FROM public.seasons WHERE status = 'active'::season_status_enum ORDER BY start_date DESC LIMIT 1)
   AND NOT EXISTS (SELECT 1 FROM public.seasons WHERE is_active);

CREATE POLICY "players_admin_write" ON public.players
  FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE TABLE IF NOT EXISTS public.news (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  slug text,
  excerpt text,
  content text,
  image_url text,
  author text,
  published boolean NOT NULL DEFAULT false,
  published_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.news TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.news TO authenticated;
GRANT ALL ON public.news TO service_role;

ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;

CREATE POLICY "news_public_read" ON public.news
  FOR SELECT USING (published);

CREATE POLICY "news_admin_write" ON public.news
  FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE TRIGGER trg_news_updated
  BEFORE UPDATE ON public.news
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
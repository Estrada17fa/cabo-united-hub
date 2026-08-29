CREATE TABLE public.place_categories (
  slug text PRIMARY KEY,
  label text NOT NULL,
  icon text NOT NULL DEFAULT 'star',
  color text NOT NULL DEFAULT '#00ABC4',
  gradient text,
  sort_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.place_categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.place_categories TO authenticated;
GRANT ALL ON public.place_categories TO service_role;

ALTER TABLE public.place_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "place_categories_public_read"
  ON public.place_categories FOR SELECT
  USING (true);

CREATE POLICY "place_categories_admin_write"
  ON public.place_categories FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE TRIGGER update_place_categories_updated_at
  BEFORE UPDATE ON public.place_categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.place_categories (slug, label, icon, color, gradient, sort_order) VALUES
  ('restaurantes', 'Restaurantes', 'utensils', '#F59E0B', 'linear-gradient(135deg, hsl(20 80% 40%) 0%, hsl(340 60% 30%) 100%)', 1),
  ('bares', 'Bares', 'beer', '#FF6B6B', 'linear-gradient(135deg, hsl(350 70% 38%) 0%, hsl(300 50% 24%) 100%)', 2),
  ('tours', 'Tours', 'waves', '#2DD4A7', 'linear-gradient(135deg, hsl(190 70% 32%) 0%, hsl(210 60% 22%) 100%)', 3),
  ('tiendas', 'Tiendas', 'shopping-bag', '#8B5CF6', 'linear-gradient(135deg, hsl(265 55% 38%) 0%, hsl(230 50% 24%) 100%)', 4),
  ('hoteles', 'Hoteles', 'bed-double', '#3B82F6', 'linear-gradient(135deg, hsl(220 50% 30%) 0%, hsl(180 40% 20%) 100%)', 5),
  ('playas', 'Playas', 'umbrella', '#22D3EE', 'linear-gradient(135deg, hsl(190 65% 34%) 0%, hsl(45 55% 30%) 100%)', 6),
  ('estadio', 'Estadio', 'shield', '#00ABC4', 'linear-gradient(135deg, hsl(188 70% 28%) 0%, hsl(200 55% 16%) 100%)', 7),
  ('cafes', 'Cafés', 'coffee', '#D97706', 'linear-gradient(135deg, hsl(30 55% 32%) 0%, hsl(15 40% 18%) 100%)', 8),
  ('miradores', 'Miradores', 'mountain', '#A3A3A3', 'linear-gradient(135deg, hsl(210 25% 34%) 0%, hsl(220 25% 18%) 100%)', 9),
  ('vida-nocturna', 'Vida nocturna', 'music', '#E879F9', 'linear-gradient(135deg, hsl(295 55% 36%) 0%, hsl(250 50% 20%) 100%)', 10);

ALTER TABLE public.places
  ALTER COLUMN category TYPE text USING category::text;

ALTER TABLE public.places
  ADD CONSTRAINT places_category_fkey
  FOREIGN KEY (category) REFERENCES public.place_categories(slug)
  ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE public.places
  ALTER COLUMN category SET DEFAULT 'restaurantes';
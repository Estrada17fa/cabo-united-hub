ALTER TABLE public.news ADD COLUMN IF NOT EXISTS category text;

CREATE TABLE public.fan_posts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  author text NOT NULL,
  handle text,
  network text NOT NULL DEFAULT 'instagram',
  text text NOT NULL,
  image_url text,
  link_url text,
  published boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.fan_posts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fan_posts TO authenticated;
GRANT ALL ON public.fan_posts TO service_role;

ALTER TABLE public.fan_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published fan posts"
  ON public.fan_posts FOR SELECT
  USING (published = true OR public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage fan posts"
  ON public.fan_posts FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE TRIGGER fan_posts_updated_at
  BEFORE UPDATE ON public.fan_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.youth_team (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL DEFAULT '',
  tournament text NOT NULL DEFAULT '',
  description text,
  image_url text,
  visible boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.youth_team TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.youth_team TO authenticated;
GRANT ALL ON public.youth_team TO service_role;

ALTER TABLE public.youth_team ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view visible youth team info"
  ON public.youth_team FOR SELECT
  USING (visible = true OR public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage youth team info"
  ON public.youth_team FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE TRIGGER youth_team_updated_at
  BEFORE UPDATE ON public.youth_team
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.youth_team (name, tournament, description, visible)
VALUES (
  'Los Cabos United Juvenil',
  'Copa Telmex',
  'Nuestro equipo juvenil representa al club en la Copa Telmex, el torneo amateur más grande de México. Es el primer paso del proyecto formativo de Los Cabos United: jugadores cabeños compitiendo con el escudo del paraíso.',
  true
);
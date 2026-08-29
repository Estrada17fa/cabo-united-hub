CREATE TABLE public.shop_hero_slides (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url text,
  eyebrow text,
  title text NOT NULL,
  subtitle text,
  cta_label text,
  cta_url text,
  sort_order integer NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.shop_hero_slides TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.shop_hero_slides TO authenticated;
GRANT ALL ON public.shop_hero_slides TO service_role;

ALTER TABLE public.shop_hero_slides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view published hero slides"
  ON public.shop_hero_slides FOR SELECT
  USING (published = true OR public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage hero slides"
  ON public.shop_hero_slides FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE TRIGGER shop_hero_slides_updated_at
  BEFORE UPDATE ON public.shop_hero_slides
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.shop_banners (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url text,
  bg_color text,
  title text NOT NULL,
  body text,
  cta_label text,
  cta_url text,
  sort_order integer NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.shop_banners TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.shop_banners TO authenticated;
GRANT ALL ON public.shop_banners TO service_role;

ALTER TABLE public.shop_banners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view published banners"
  ON public.shop_banners FOR SELECT
  USING (published = true OR public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage banners"
  ON public.shop_banners FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE TRIGGER shop_banners_updated_at
  BEFORE UPDATE ON public.shop_banners
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
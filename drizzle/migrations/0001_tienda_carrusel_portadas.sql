ALTER TABLE public.shop_hero_slides
  ADD COLUMN IF NOT EXISTS image_mobile_url text,
  ADD COLUMN IF NOT EXISTS show_cta boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS cta_type text NOT NULL DEFAULT 'page',
  ADD COLUMN IF NOT EXISTS cta_ref text,
  ADD COLUMN IF NOT EXISTS starts_at timestamptz,
  ADD COLUMN IF NOT EXISTS ends_at timestamptz;
ALTER TABLE public.shop_hero_slides ALTER COLUMN title SET DEFAULT '';

CREATE TABLE IF NOT EXISTS public.store_line_covers (
  line text PRIMARY KEY,
  image_url text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.store_line_covers TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.store_line_covers TO authenticated;
GRANT ALL ON public.store_line_covers TO service_role;
ALTER TABLE public.store_line_covers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public reads line covers" ON public.store_line_covers FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage line covers" ON public.store_line_covers FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "tienda_public_read" ON storage.objects FOR SELECT USING (bucket_id = 'tienda');
CREATE POLICY "tienda_admin_insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'tienda' AND public.is_admin(auth.uid()));
CREATE POLICY "tienda_admin_update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'tienda' AND public.is_admin(auth.uid()));
CREATE POLICY "tienda_admin_delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'tienda' AND public.is_admin(auth.uid()));
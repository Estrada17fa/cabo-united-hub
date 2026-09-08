-- places
DROP POLICY IF EXISTS "Published places are viewable by everyone" ON public.places;
CREATE POLICY "Anon reads published places" ON public.places FOR SELECT TO anon USING (published);
CREATE POLICY "Auth reads published places" ON public.places FOR SELECT TO authenticated USING (published OR public.is_admin(auth.uid()));

-- fan_routes
DROP POLICY IF EXISTS "Published routes are viewable by everyone" ON public.fan_routes;
CREATE POLICY "Anon reads published routes" ON public.fan_routes FOR SELECT TO anon USING (published);
CREATE POLICY "Auth reads published routes" ON public.fan_routes FOR SELECT TO authenticated USING (published OR public.is_admin(auth.uid()));

-- fan_route_stops
DROP POLICY IF EXISTS "Stops of published routes are viewable by everyone" ON public.fan_route_stops;
CREATE POLICY "Anon reads stops of published routes" ON public.fan_route_stops FOR SELECT TO anon
  USING (EXISTS (SELECT 1 FROM public.fan_routes r WHERE r.id = fan_route_stops.route_id AND r.published));
CREATE POLICY "Auth reads stops of published routes" ON public.fan_route_stops FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.fan_routes r WHERE r.id = fan_route_stops.route_id AND r.published) OR public.is_admin(auth.uid()));

-- fan_posts
DROP POLICY IF EXISTS "Anyone can view published fan posts" ON public.fan_posts;
CREATE POLICY "Anon reads published fan posts" ON public.fan_posts FOR SELECT TO anon USING (published = true);
CREATE POLICY "Auth reads published fan posts" ON public.fan_posts FOR SELECT TO authenticated USING (published = true OR public.is_admin(auth.uid()));

-- shop_hero_slides
DROP POLICY IF EXISTS "Public can view published hero slides" ON public.shop_hero_slides;
CREATE POLICY "Anon reads published hero slides" ON public.shop_hero_slides FOR SELECT TO anon USING (published = true);
CREATE POLICY "Auth reads published hero slides" ON public.shop_hero_slides FOR SELECT TO authenticated USING (published = true OR public.is_admin(auth.uid()));

-- shop_banners
DROP POLICY IF EXISTS "Public can view published banners" ON public.shop_banners;
CREATE POLICY "Anon reads published banners" ON public.shop_banners FOR SELECT TO anon USING (published = true);
CREATE POLICY "Auth reads published banners" ON public.shop_banners FOR SELECT TO authenticated USING (published = true OR public.is_admin(auth.uid()));

-- youth_team
DROP POLICY IF EXISTS "Anyone can view visible youth team info" ON public.youth_team;
CREATE POLICY "Anon reads visible youth team" ON public.youth_team FOR SELECT TO anon USING (visible = true);
CREATE POLICY "Auth reads visible youth team" ON public.youth_team FOR SELECT TO authenticated USING (visible = true OR public.is_admin(auth.uid()));

-- ensure grants
GRANT SELECT ON public.places, public.fan_routes, public.fan_route_stops, public.fan_posts,
  public.shop_hero_slides, public.shop_banners, public.youth_team TO anon, authenticated;
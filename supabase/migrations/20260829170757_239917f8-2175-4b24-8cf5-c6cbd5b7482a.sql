CREATE TYPE public.place_category AS ENUM ('restaurantes','bares','tours','tiendas','hoteles');
CREATE TYPE public.place_tier AS ENUM ('basico','destacado','patrocinador');

CREATE TABLE public.places (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug text,
  name text NOT NULL,
  category public.place_category NOT NULL DEFAULT 'restaurantes',
  tier public.place_tier NOT NULL DEFAULT 'basico',
  description text,
  area text,
  hours text,
  lat numeric,
  lng numeric,
  photo_url text,
  photo_gradient text,
  whatsapp text,
  visited_by integer,
  going_today integer,
  rating numeric,
  featured boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.places TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.places TO authenticated;
GRANT ALL ON public.places TO service_role;

ALTER TABLE public.places ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published places are viewable by everyone"
  ON public.places FOR SELECT
  USING (published OR public.is_admin(auth.uid()));

CREATE POLICY "Admins manage places"
  ON public.places FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE TABLE public.fan_routes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  icon text NOT NULL DEFAULT 'flag',
  color text,
  duration text,
  sort_order integer NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.fan_routes TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fan_routes TO authenticated;
GRANT ALL ON public.fan_routes TO service_role;

ALTER TABLE public.fan_routes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published routes are viewable by everyone"
  ON public.fan_routes FOR SELECT
  USING (published OR public.is_admin(auth.uid()));

CREATE POLICY "Admins manage fan routes"
  ON public.fan_routes FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE TABLE public.fan_route_stops (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  route_id uuid NOT NULL REFERENCES public.fan_routes(id) ON DELETE CASCADE,
  place_id uuid NOT NULL REFERENCES public.places(id) ON DELETE CASCADE,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX fan_route_stops_route_idx ON public.fan_route_stops(route_id, position);

GRANT SELECT ON public.fan_route_stops TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fan_route_stops TO authenticated;
GRANT ALL ON public.fan_route_stops TO service_role;

ALTER TABLE public.fan_route_stops ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Stops of published routes are viewable by everyone"
  ON public.fan_route_stops FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.fan_routes r WHERE r.id = route_id AND r.published)
    OR public.is_admin(auth.uid())
  );

CREATE POLICY "Admins manage fan route stops"
  ON public.fan_route_stops FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE TRIGGER update_places_updated_at BEFORE UPDATE ON public.places
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_fan_routes_updated_at BEFORE UPDATE ON public.fan_routes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
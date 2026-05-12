-- Players table
CREATE TABLE public.players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  jersey_number int,
  position text,
  photo_url text,
  short_bio text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view players" ON public.players FOR SELECT USING (true);

-- Roles
CREATE TYPE public.app_role AS ENUM ('fan','staff','admin');
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Users see own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Pass tier enum
CREATE TYPE public.pass_tier AS ENUM ('fan','gold','premium','platino');
CREATE TYPE public.payment_status AS ENUM ('free','pending','mock_paid','paid','failed');
CREATE TYPE public.qr_kind AS ENUM ('master','match','benefit','experience');

-- Fan passes
CREATE TABLE public.fan_passes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  birth_date date NOT NULL,
  phone text NOT NULL,
  favorite_player_id uuid REFERENCES public.players(id) ON DELETE SET NULL,
  tier pass_tier NOT NULL DEFAULT 'fan',
  status text NOT NULL DEFAULT 'active',
  payment_status payment_status NOT NULL DEFAULT 'free',
  pass_code text NOT NULL UNIQUE,
  issued_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.fan_passes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Fans see own pass" ON public.fan_passes FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'staff') OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Fans insert own pass" ON public.fan_passes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Fans update own pass" ON public.fan_passes FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- QR tokens
CREATE TABLE public.qr_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pass_id uuid NOT NULL REFERENCES public.fan_passes(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  kind qr_kind NOT NULL,
  ref_id text,
  expires_at timestamptz,
  redeemed_at timestamptz,
  redeemed_by_staff uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.qr_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Fans see own tokens" ON public.qr_tokens FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.fan_passes p WHERE p.id = pass_id AND p.user_id = auth.uid())
  OR public.has_role(auth.uid(),'staff') OR public.has_role(auth.uid(),'admin')
);

-- Redemptions history
CREATE TABLE public.pass_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pass_id uuid NOT NULL REFERENCES public.fan_passes(id) ON DELETE CASCADE,
  qr_token_id uuid REFERENCES public.qr_tokens(id) ON DELETE SET NULL,
  kind qr_kind NOT NULL,
  ref_id text,
  label text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.pass_redemptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Fans see own redemptions" ON public.pass_redemptions FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.fan_passes p WHERE p.id = pass_id AND p.user_id = auth.uid())
  OR public.has_role(auth.uid(),'staff') OR public.has_role(auth.uid(),'admin')
);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER trg_players_updated BEFORE UPDATE ON public.players FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_passes_updated BEFORE UPDATE ON public.fan_passes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed players
INSERT INTO public.players (name, jersey_number, position, short_bio) VALUES
('Carlos "El Tiburón" Mendoza', 10, 'Delantero', 'Capitán y goleador histórico'),
('Diego Rivera', 7, 'Mediocampista', 'Motor del equipo'),
('Andrés Salazar', 1, 'Portero', 'Muralla bajo los tres palos'),
('Luis "Marlin" Ortega', 9, 'Delantero', 'Joya de la cantera'),
('Mateo Castillo', 4, 'Defensa central', 'Líder de la zaga'),
('Iván Robles', 11, 'Extremo', 'Velocidad pura por banda'),
('Pablo Aguirre', 8, 'Mediocampista', 'Visión y pase'),
('Sergio Núñez', 5, 'Lateral', 'Subidas y entrega total');
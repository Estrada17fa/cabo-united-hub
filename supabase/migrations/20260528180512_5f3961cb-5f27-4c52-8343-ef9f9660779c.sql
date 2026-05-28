
-- ============ GAMES CATALOG ============
CREATE TABLE public.games (
  id text PRIMARY KEY,
  name text NOT NULL,
  subtitle text,
  icon text,
  status text NOT NULL DEFAULT 'available' CHECK (status IN ('play','available','soon')),
  tier text NOT NULL DEFAULT 'standard' CHECK (tier IN ('standard','premium')),
  xp_reward integer NOT NULL DEFAULT 0,
  cc_reward integer NOT NULL DEFAULT 0,
  sort_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.games TO anon, authenticated;
GRANT ALL ON public.games TO service_role;

ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active games" ON public.games
  FOR SELECT USING (active = true);
CREATE POLICY "Admins manage games" ON public.games
  FOR ALL USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- ============ GAME PLAYS (immutable ledger) ============
CREATE TABLE public.game_plays (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  game_id text NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  score integer,
  result jsonb,
  xp_awarded integer NOT NULL DEFAULT 0,
  cc_awarded integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_game_plays_user ON public.game_plays(user_id, created_at DESC);
CREATE INDEX idx_game_plays_game ON public.game_plays(game_id, created_at DESC);

GRANT SELECT ON public.game_plays TO authenticated;
GRANT ALL ON public.game_plays TO service_role;

ALTER TABLE public.game_plays ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own plays" ON public.game_plays
  FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::app_role));

-- ============ REWARDS CATALOG ============
CREATE TABLE public.rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  description text,
  image_url text,
  icon text,
  cc_cost integer NOT NULL CHECK (cc_cost >= 0),
  stock integer,
  tier text NOT NULL DEFAULT 'standard' CHECK (tier IN ('standard','premium')),
  sort_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.rewards TO anon, authenticated;
GRANT ALL ON public.rewards TO service_role;

ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active rewards" ON public.rewards
  FOR SELECT USING (active = true);
CREATE POLICY "Admins manage rewards" ON public.rewards
  FOR ALL USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- ============ REWARD REDEMPTIONS ============
CREATE TABLE public.reward_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  reward_id uuid NOT NULL REFERENCES public.rewards(id) ON DELETE RESTRICT,
  cc_spent integer NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','fulfilled','cancelled')),
  code text,
  fulfilled_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_redemptions_user ON public.reward_redemptions(user_id, created_at DESC);

GRANT SELECT ON public.reward_redemptions TO authenticated;
GRANT ALL ON public.reward_redemptions TO service_role;

ALTER TABLE public.reward_redemptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own redemptions" ON public.reward_redemptions
  FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins update redemptions" ON public.reward_redemptions
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- ============ FUNCTIONS ============

-- Record a minigame play and award points
CREATE OR REPLACE FUNCTION public.record_game_play(
  _game_id text,
  _score integer DEFAULT NULL,
  _result jsonb DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_game public.games%ROWTYPE;
  v_play_id uuid;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'auth_required';
  END IF;

  SELECT * INTO v_game FROM public.games WHERE id = _game_id AND active;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'game_not_found';
  END IF;

  IF v_game.status = 'soon' THEN
    RAISE EXCEPTION 'game_not_available';
  END IF;

  INSERT INTO public.game_plays (user_id, game_id, score, result, xp_awarded, cc_awarded)
  VALUES (v_user, _game_id, _score, _result, v_game.xp_reward, v_game.cc_reward)
  RETURNING id INTO v_play_id;

  PERFORM public.award_points(
    v_user, v_game.xp_reward, v_game.cc_reward,
    'game'::tx_type, _game_id, v_game.name
  );

  RETURN v_play_id;
END;
$$;

-- Redeem a reward by spending Cabo Coins
CREATE OR REPLACE FUNCTION public.redeem_reward(_reward_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_reward public.rewards%ROWTYPE;
  v_cc integer;
  v_redemption_id uuid;
  v_code text;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'auth_required';
  END IF;

  SELECT * INTO v_reward FROM public.rewards WHERE id = _reward_id AND active FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'reward_not_found';
  END IF;

  IF v_reward.stock IS NOT NULL AND v_reward.stock <= 0 THEN
    RAISE EXCEPTION 'out_of_stock';
  END IF;

  SELECT cc INTO v_cc FROM public.profiles WHERE id = v_user FOR UPDATE;
  IF v_cc IS NULL OR v_cc < v_reward.cc_cost THEN
    RAISE EXCEPTION 'insufficient_cc';
  END IF;

  v_code := 'RW-' || upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 8));

  INSERT INTO public.reward_redemptions (user_id, reward_id, cc_spent, code)
  VALUES (v_user, _reward_id, v_reward.cc_cost, v_code)
  RETURNING id INTO v_redemption_id;

  -- Log negative CC transaction (no multiplier on spend)
  INSERT INTO public.transactions (user_id, type, xp_delta, cc_delta, source, description, metadata)
  VALUES (
    v_user, 'redeem'::tx_type, 0, -v_reward.cc_cost,
    v_reward.slug, 'Canje: ' || v_reward.title,
    jsonb_build_object('reward_id', _reward_id, 'redemption_id', v_redemption_id, 'code', v_code)
  );

  UPDATE public.profiles SET cc = cc - v_reward.cc_cost, updated_at = now() WHERE id = v_user;

  IF v_reward.stock IS NOT NULL THEN
    UPDATE public.rewards SET stock = stock - 1 WHERE id = _reward_id;
  END IF;

  RETURN v_redemption_id;
END;
$$;

-- ============ SEED DATA ============
INSERT INTO public.games (id, name, subtitle, icon, status, tier, xp_reward, cc_reward, sort_order) VALUES
  ('quiniela',        'Quiniela del Paraíso', 'Predice la jornada completa', 'Ticket',  'play',      'standard', 150, 30, 1),
  ('arma-tu-11',      'Arma tu 11',           'Tu alineación ideal',          'Users',   'available', 'standard', 100, 20, 2),
  ('marcador-exacto', 'Marcador Exacto',      'Acierta el resultado',         'Target',  'play',      'premium',  200, 40, 3),
  ('visitas-paraiso', 'Visitas al Paraíso',   'Check-in en el estadio',       'MapPin',  'available', 'standard',  50, 10, 4),
  ('trivia',          'Trivia',               'Pon a prueba tu fanatismo',    'Brain',   'soon',      'standard',   0,  0, 5),
  ('amo-del-partido', 'Amo del Partido',      'Vota al MVP del juego',        'Crown',   'soon',      'standard',   0,  0, 6)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.rewards (slug, title, description, icon, cc_cost, tier, sort_order) VALUES
  ('boletos-partido',     'Boletos para el próximo partido',  'Asiste al próximo partido en casa con boletos cortesía de Los Cabos United.', 'Ticket',     5000, 'standard', 1),
  ('pase-amo-descuento',  'Pase del Amo · 20% en tienda',     'Acceso preferencial y 20% de descuento permanente en la tienda oficial.',      'Crown',     10000, 'premium',  2),
  ('jersey-firmado',      'Jersey oficial firmado',           'Llévate un jersey oficial autografiado por todo el plantel.',                  'ShoppingBag',15000, 'premium',  3),
  ('experiencia-vestuario','Experiencia en el vestuario',     'Conoce el vestuario oficial y vive el día de partido como un jugador.',        'Gift',      25000, 'premium',  4)
ON CONFLICT (slug) DO NOTHING;

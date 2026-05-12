
-- 1. Extend profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS xp integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS cc integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS level smallint NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS email_verified boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS phone_verified boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS identity_verified boolean NOT NULL DEFAULT false;

-- 2. Transaction type enum
DO $$ BEGIN
  CREATE TYPE public.tx_type AS ENUM ('bonus','mission','checkin','game','redeem','purchase','adjust');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 3. Transactions ledger
CREATE TABLE IF NOT EXISTS public.transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type public.tx_type NOT NULL,
  xp_delta integer NOT NULL DEFAULT 0,
  cc_delta integer NOT NULL DEFAULT 0,
  source text,
  description text,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_transactions_user_created ON public.transactions(user_id, created_at DESC);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users see own transactions" ON public.transactions;
CREATE POLICY "Users see own transactions" ON public.transactions
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'::app_role));

-- (No INSERT/UPDATE/DELETE policies — only SECURITY DEFINER functions write.)

-- 4. Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  kind text NOT NULL,
  title text NOT NULL,
  body text,
  metadata jsonb,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON public.notifications(user_id, created_at DESC);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users see own notifications" ON public.notifications;
CREATE POLICY "Users see own notifications" ON public.notifications
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users mark own notifications read" ON public.notifications;
CREATE POLICY "Users mark own notifications read" ON public.notifications
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 5. Missions catalog + user progress
CREATE TABLE IF NOT EXISTS public.missions (
  id text PRIMARY KEY,
  title text NOT NULL,
  description text,
  xp_reward integer NOT NULL DEFAULT 0,
  cc_reward integer NOT NULL DEFAULT 0,
  is_starter boolean NOT NULL DEFAULT false,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view missions" ON public.missions;
CREATE POLICY "Anyone can view missions" ON public.missions
  FOR SELECT TO anon, authenticated USING (active = true);

INSERT INTO public.missions (id,title,description,xp_reward,cc_reward,is_starter)
VALUES
  ('verify_email','Verifica tu correo','Confirma tu email para recibir noticias del Paraíso',50,10,true),
  ('verify_phone','Verifica tu teléfono','Confirma tu número para futuros boletos y check-ins',50,10,true),
  ('complete_profile','Completa tu perfil','Foto, fecha de nacimiento y ciudad',50,10,true),
  ('first_checkin','Primer check-in','Acude a tu primer partido en el Paraíso',100,20,true)
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.user_missions (
  user_id uuid NOT NULL,
  mission_id text NOT NULL REFERENCES public.missions(id) ON DELETE CASCADE,
  completed_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, mission_id)
);

ALTER TABLE public.user_missions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users see own missions" ON public.user_missions;
CREATE POLICY "Users see own missions" ON public.user_missions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- 6. Onboarding tracking
CREATE TABLE IF NOT EXISTS public.user_onboarding (
  user_id uuid PRIMARY KEY,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_onboarding ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users see own onboarding" ON public.user_onboarding;
CREATE POLICY "Users see own onboarding" ON public.user_onboarding
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users insert own onboarding" ON public.user_onboarding;
CREATE POLICY "Users insert own onboarding" ON public.user_onboarding
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users update own onboarding" ON public.user_onboarding;
CREATE POLICY "Users update own onboarding" ON public.user_onboarding
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 7. Level-up trigger
CREATE OR REPLACE FUNCTION public.compute_level(_xp integer)
RETURNS smallint
LANGUAGE sql IMMUTABLE
AS $$
  SELECT CASE
    WHEN _xp >= 25000 THEN 5
    WHEN _xp >= 12000 THEN 4
    WHEN _xp >= 5000 THEN 3
    WHEN _xp >= 2000 THEN 2
    WHEN _xp >= 500 THEN 1
    ELSE 0
  END::smallint;
$$;

CREATE OR REPLACE FUNCTION public.update_level_on_xp()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_level smallint;
  level_names text[] := ARRAY['Visitante','Local','Cabeño','Amo','Amo del Paraíso','Leyenda del Paraíso'];
BEGIN
  new_level := public.compute_level(NEW.xp);
  IF new_level <> COALESCE(OLD.level, 0) THEN
    NEW.level := new_level;
    IF new_level > COALESCE(OLD.level, 0) THEN
      INSERT INTO public.notifications (user_id, kind, title, body, metadata)
      VALUES (
        NEW.id,
        'level_up',
        '¡Subiste de nivel!',
        'Ahora eres ' || level_names[new_level + 1],
        jsonb_build_object('level', new_level, 'level_name', level_names[new_level + 1])
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_update_level_on_xp ON public.profiles;
CREATE TRIGGER trg_update_level_on_xp
BEFORE UPDATE OF xp ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_level_on_xp();

-- 8. award_points function
CREATE OR REPLACE FUNCTION public.award_points(
  _user_id uuid,
  _xp integer,
  _cc integer,
  _type public.tx_type,
  _source text,
  _description text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_multiplier numeric := 1;
  v_xp integer;
  v_cc integer;
  v_tx_id uuid;
  v_tier pass_tier;
BEGIN
  -- Look up active pass tier (if any)
  SELECT tier INTO v_tier
  FROM public.fan_passes
  WHERE user_id = _user_id AND status = 'active'
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_tier IN ('premium','platino') THEN
    v_multiplier := 2;
  END IF;

  v_xp := floor(_xp * v_multiplier)::integer;
  v_cc := floor(_cc * v_multiplier)::integer;

  INSERT INTO public.transactions (user_id, type, xp_delta, cc_delta, source, description, metadata)
  VALUES (
    _user_id, _type, v_xp, v_cc, _source, _description,
    jsonb_build_object('multiplier', v_multiplier, 'tier', v_tier)
  )
  RETURNING id INTO v_tx_id;

  UPDATE public.profiles
  SET xp = xp + v_xp,
      cc = cc + v_cc,
      updated_at = now()
  WHERE id = _user_id;

  RETURN v_tx_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.award_points(uuid,integer,integer,public.tx_type,text,text) TO authenticated;

-- 9. Mark mission complete (idempotent) + award
CREATE OR REPLACE FUNCTION public.complete_mission(_user_id uuid, _mission_id text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_mission public.missions%ROWTYPE;
BEGIN
  IF EXISTS (SELECT 1 FROM public.user_missions WHERE user_id = _user_id AND mission_id = _mission_id) THEN
    RETURN false;
  END IF;

  SELECT * INTO v_mission FROM public.missions WHERE id = _mission_id AND active;
  IF NOT FOUND THEN RETURN false; END IF;

  INSERT INTO public.user_missions (user_id, mission_id) VALUES (_user_id, _mission_id);
  PERFORM public.award_points(_user_id, v_mission.xp_reward, v_mission.cc_reward, 'mission'::tx_type, _mission_id, v_mission.title);
  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.complete_mission(uuid, text) TO authenticated;

-- 10. Extend handle_new_user to award welcome bonus
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_full_name TEXT;
  v_username TEXT;
  v_phone TEXT;
  v_birth_date DATE;
  v_fav_player UUID;
  v_tier pass_tier;
  v_pay payment_status;
  v_pass_code TEXT;
BEGIN
  v_full_name := COALESCE(
    NEW.raw_user_meta_data->>'display_name',
    NEW.raw_user_meta_data->>'full_name',
    split_part(NEW.email, '@', 1)
  );
  v_username := NULLIF(NEW.raw_user_meta_data->>'username', '');
  v_phone := NULLIF(NEW.raw_user_meta_data->>'phone', '');
  v_birth_date := NULLIF(NEW.raw_user_meta_data->>'birth_date', '')::DATE;
  v_fav_player := NULLIF(NEW.raw_user_meta_data->>'favorite_player_id', '')::UUID;

  v_tier := COALESCE(NULLIF(NEW.raw_user_meta_data->>'tier', '')::pass_tier, 'fan'::pass_tier);
  v_pay := CASE WHEN v_tier = 'fan' THEN 'free'::payment_status ELSE 'pending'::payment_status END;

  INSERT INTO public.profiles (id, display_name, avatar_url, username, phone, birth_date, favorite_player_id, email_verified)
  VALUES (
    NEW.id, v_full_name, NEW.raw_user_meta_data->>'avatar_url',
    v_username, v_phone, v_birth_date, v_fav_player,
    COALESCE(NEW.email_confirmed_at IS NOT NULL, false)
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'fan'::app_role)
  ON CONFLICT DO NOTHING;

  IF v_phone IS NOT NULL AND v_birth_date IS NOT NULL THEN
    v_pass_code := public.generate_pass_code(v_tier, v_full_name);
    INSERT INTO public.fan_passes (
      user_id, full_name, birth_date, phone,
      tier, payment_status, pass_code,
      favorite_player_id, status
    ) VALUES (
      NEW.id, v_full_name, v_birth_date, v_phone,
      v_tier, v_pay, v_pass_code, v_fav_player,
      CASE WHEN v_tier = 'fan' THEN 'active' ELSE 'pending_payment' END
    )
    ON CONFLICT DO NOTHING;
  END IF;

  -- Welcome bonus
  PERFORM public.award_points(NEW.id, 50, 10, 'bonus'::tx_type, 'welcome', 'Bienvenido al Paraíso');

  RETURN NEW;
END;
$function$;

-- Ensure trigger exists on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 11. Avatars storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Avatar images publicly readable" ON storage.objects;
CREATE POLICY "Avatar images publicly readable" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Users upload own avatar" ON storage.objects;
CREATE POLICY "Users upload own avatar" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users update own avatar" ON storage.objects;
CREATE POLICY "Users update own avatar" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users delete own avatar" ON storage.objects;
CREATE POLICY "Users delete own avatar" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

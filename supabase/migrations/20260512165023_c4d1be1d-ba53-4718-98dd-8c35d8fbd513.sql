
-- 1. Extend profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS birth_date DATE,
  ADD COLUMN IF NOT EXISTS favorite_player_id UUID REFERENCES public.players(id) ON DELETE SET NULL;

CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_lower_unique
  ON public.profiles (LOWER(username))
  WHERE username IS NOT NULL;

-- 2. Pass code generator
CREATE OR REPLACE FUNCTION public.generate_pass_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_code TEXT;
  attempts INT := 0;
BEGIN
  LOOP
    new_code := 'LCU-' || upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 6));
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.fan_passes WHERE pass_code = new_code);
    attempts := attempts + 1;
    IF attempts > 10 THEN
      RAISE EXCEPTION 'Could not generate unique pass code';
    END IF;
  END LOOP;
  RETURN new_code;
END;
$$;

-- 3. Replace handle_new_user to create profile + fan pass with chosen tier
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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

  INSERT INTO public.profiles (id, display_name, avatar_url, username, phone, birth_date, favorite_player_id)
  VALUES (
    NEW.id,
    v_full_name,
    NEW.raw_user_meta_data->>'avatar_url',
    v_username,
    v_phone,
    v_birth_date,
    v_fav_player
  )
  ON CONFLICT (id) DO NOTHING;

  -- Default fan role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'fan'::app_role)
  ON CONFLICT DO NOTHING;

  -- Create fan pass (only if we have required data)
  IF v_phone IS NOT NULL AND v_birth_date IS NOT NULL THEN
    v_pass_code := public.generate_pass_code();
    INSERT INTO public.fan_passes (
      user_id, full_name, birth_date, phone,
      tier, payment_status, pass_code,
      favorite_player_id, status
    ) VALUES (
      NEW.id, v_full_name, v_birth_date, v_phone,
      v_tier, v_pay, v_pass_code,
      v_fav_player,
      CASE WHEN v_tier = 'fan' THEN 'active' ELSE 'pending_payment' END
    )
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

-- 4. Ensure trigger exists on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Add user_roles unique constraint to support ON CONFLICT
CREATE UNIQUE INDEX IF NOT EXISTS user_roles_user_role_unique
  ON public.user_roles (user_id, role);

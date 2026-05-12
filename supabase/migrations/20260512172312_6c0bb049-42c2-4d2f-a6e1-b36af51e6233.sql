-- New pass code generator: LCU-<TIER><INITIALS><N>
CREATE EXTENSION IF NOT EXISTS unaccent;

CREATE OR REPLACE FUNCTION public.generate_pass_code(_tier pass_tier, _full_name text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $function$
DECLARE
  tier_letter TEXT;
  cleaned TEXT;
  parts TEXT[];
  initials TEXT := '';
  i INT;
  n INT;
  candidate TEXT;
  attempts INT;
BEGIN
  tier_letter := CASE _tier
    WHEN 'fan' THEN 'F'
    WHEN 'gold' THEN 'G'
    WHEN 'premium' THEN 'P'
    WHEN 'platino' THEN 'X'
    ELSE 'F'
  END;

  cleaned := upper(regexp_replace(unaccent(coalesce(_full_name, 'LCU')), '[^A-Za-z\s]', '', 'g'));
  parts := regexp_split_to_array(trim(cleaned), '\s+');

  IF array_length(parts, 1) IS NULL OR array_length(parts, 1) = 0 THEN
    initials := 'LCU';
  ELSIF array_length(parts, 1) = 1 THEN
    initials := rpad(left(parts[1], 1), 3, left(parts[1], 1));
  ELSIF array_length(parts, 1) = 2 THEN
    initials := left(parts[1], 1) || left(parts[2], 1) || left(parts[2], 1);
  ELSE
    FOR i IN 1..LEAST(array_length(parts, 1), 3) LOOP
      initials := initials || left(parts[i], 1);
    END LOOP;
  END IF;

  initials := rpad(left(initials, 3), 3, 'X');

  -- 1..10
  attempts := 0;
  WHILE attempts < 20 LOOP
    n := 1 + floor(random() * 10)::INT;
    candidate := 'LCU-' || tier_letter || initials || n::TEXT;
    IF NOT EXISTS (SELECT 1 FROM public.fan_passes WHERE pass_code = candidate) THEN
      RETURN candidate;
    END IF;
    attempts := attempts + 1;
  END LOOP;

  -- 1..99
  attempts := 0;
  WHILE attempts < 30 LOOP
    n := 1 + floor(random() * 99)::INT;
    candidate := 'LCU-' || tier_letter || initials || n::TEXT;
    IF NOT EXISTS (SELECT 1 FROM public.fan_passes WHERE pass_code = candidate) THEN
      RETURN candidate;
    END IF;
    attempts := attempts + 1;
  END LOOP;

  -- 1..999
  attempts := 0;
  WHILE attempts < 50 LOOP
    n := 1 + floor(random() * 999)::INT;
    candidate := 'LCU-' || tier_letter || initials || n::TEXT;
    IF NOT EXISTS (SELECT 1 FROM public.fan_passes WHERE pass_code = candidate) THEN
      RETURN candidate;
    END IF;
    attempts := attempts + 1;
  END LOOP;

  RAISE EXCEPTION 'Could not generate unique pass code';
END;
$function$;

-- Update handle_new_user to use the new signature
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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
      v_tier, v_pay, v_pass_code,
      v_fav_player,
      CASE WHEN v_tier = 'fan' THEN 'active' ELSE 'pending_payment' END
    )
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$function$;
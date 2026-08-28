CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_full_name TEXT;
  v_first TEXT;
  v_lastp TEXT;
  v_lastm TEXT;
  v_username TEXT;
  v_phone TEXT;
  v_birth_date DATE;
  v_fav_player UUID;
  v_tier pass_tier;
  v_pay payment_status;
  v_pass_code TEXT;
  v_marketing BOOLEAN;
  v_terms BOOLEAN;
BEGIN
  v_first := NULLIF(NEW.raw_user_meta_data->>'first_name', '');
  v_lastp := NULLIF(NEW.raw_user_meta_data->>'last_name_p', '');
  v_lastm := NULLIF(NEW.raw_user_meta_data->>'last_name_m', '');

  v_full_name := COALESCE(
    NULLIF(trim(concat_ws(' ', v_first, v_lastp, v_lastm)), ''),
    NEW.raw_user_meta_data->>'display_name',
    NEW.raw_user_meta_data->>'full_name',
    split_part(NEW.email, '@', 1)
  );

  v_username := NULLIF(NEW.raw_user_meta_data->>'username', '');
  v_phone := NULLIF(NEW.raw_user_meta_data->>'phone', '');
  v_birth_date := NULLIF(NEW.raw_user_meta_data->>'birth_date', '')::DATE;
  v_fav_player := NULLIF(NEW.raw_user_meta_data->>'favorite_player_id', '')::UUID;
  v_marketing := COALESCE((NEW.raw_user_meta_data->>'marketing_consent')::boolean, false);
  v_terms := COALESCE((NEW.raw_user_meta_data->>'terms_accepted')::boolean, false);

  v_tier := COALESCE(NULLIF(NEW.raw_user_meta_data->>'tier', '')::pass_tier, 'fan'::pass_tier);
  v_pay := CASE WHEN v_tier = 'fan' THEN 'free'::payment_status ELSE 'pending'::payment_status END;

  INSERT INTO public.profiles (
    id, display_name, avatar_url, username, phone, birth_date, favorite_player_id, email_verified,
    first_name, last_name_p, last_name_m,
    marketing_consent, marketing_consent_at, terms_accepted_at
  )
  VALUES (
    NEW.id, v_full_name, NEW.raw_user_meta_data->>'avatar_url',
    v_username, v_phone, v_birth_date, v_fav_player,
    COALESCE(NEW.email_confirmed_at IS NOT NULL, false),
    v_first, v_lastp, v_lastm,
    v_marketing,
    CASE WHEN v_marketing THEN now() ELSE NULL END,
    CASE WHEN v_terms THEN now() ELSE NULL END
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
      CASE WHEN v_tier = 'fan' THEN 'active' ELSE 'waitlist' END
    )
    ON CONFLICT DO NOTHING;
  END IF;

  PERFORM public.award_points(NEW.id, 50, 10, 'bonus'::tx_type, 'welcome', 'Bienvenido al Paraíso');

  RETURN NEW;
END;
$function$;
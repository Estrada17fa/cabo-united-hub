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
  SELECT tier INTO v_tier
  FROM public.fan_passes
  WHERE user_id = _user_id AND status = 'active'
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_tier IN ('premium','platino') THEN
    v_multiplier := 1.5;
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
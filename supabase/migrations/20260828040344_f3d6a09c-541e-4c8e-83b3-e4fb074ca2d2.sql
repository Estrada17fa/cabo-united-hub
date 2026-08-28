DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;

CREATE POLICY "Users view own profile or admins view all"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id OR public.has_role(auth.uid(), 'admin'::app_role));

CREATE OR REPLACE VIEW public.public_profiles
WITH (security_invoker = off) AS
  SELECT id, display_name, username, avatar_url, level, xp
  FROM public.profiles;

GRANT SELECT ON public.public_profiles TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.admin_list_fan_passes()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  full_name text,
  email text,
  phone text,
  tier pass_tier,
  status text,
  payment_status payment_status,
  birth_date date,
  pass_code text,
  marketing_consent boolean,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    fp.id,
    fp.user_id,
    fp.full_name,
    u.email::text,
    fp.phone,
    fp.tier,
    fp.status,
    fp.payment_status,
    fp.birth_date,
    fp.pass_code,
    COALESCE(p.marketing_consent, false),
    fp.created_at
  FROM public.fan_passes fp
  LEFT JOIN public.profiles p ON p.id = fp.user_id
  LEFT JOIN auth.users u ON u.id = fp.user_id
  WHERE public.has_role(auth.uid(), 'admin'::app_role)
  ORDER BY fp.created_at DESC;
$$;

REVOKE ALL ON FUNCTION public.admin_list_fan_passes() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_list_fan_passes() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_fan_passes() TO service_role;
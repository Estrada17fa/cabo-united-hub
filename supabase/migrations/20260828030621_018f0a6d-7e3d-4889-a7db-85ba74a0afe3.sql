-- 1. profiles: nombres separados + consentimientos
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS first_name text,
  ADD COLUMN IF NOT EXISTS last_name_p text,
  ADD COLUMN IF NOT EXISTS last_name_m text,
  ADD COLUMN IF NOT EXISTS marketing_consent boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS marketing_consent_at timestamptz,
  ADD COLUMN IF NOT EXISTS terms_accepted_at timestamptz;

-- 2. fan_passes.status: permitir waitlist
ALTER TABLE public.fan_passes DROP CONSTRAINT IF EXISTS fan_passes_status_check;
ALTER TABLE public.fan_passes
  ADD CONSTRAINT fan_passes_status_check
  CHECK (status IN ('active','pending_payment','waitlist','expired','cancelled'));

-- 3. locations: descuentos por nivel
ALTER TABLE public.locations
  ADD COLUMN IF NOT EXISTS discount_fan integer,
  ADD COLUMN IF NOT EXISTS discount_gold integer,
  ADD COLUMN IF NOT EXISTS discount_premium integer,
  ADD COLUMN IF NOT EXISTS discount_platino integer;

-- 4. business_users: ligar cuenta de acceso
ALTER TABLE public.business_users
  ADD COLUMN IF NOT EXISTS user_id uuid;

CREATE UNIQUE INDEX IF NOT EXISTS business_users_user_id_key
  ON public.business_users (user_id) WHERE user_id IS NOT NULL;

DROP POLICY IF EXISTS "Self by user_id" ON public.business_users;
CREATE POLICY "Self by user_id" ON public.business_users
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.business_location_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT location_id FROM public.business_users
   WHERE user_id = _user_id AND active
   LIMIT 1
$$;

-- 5. checkins: negocios ven/registran canjes de su local
DROP POLICY IF EXISTS "Business sees own location checkins" ON public.checkins;
CREATE POLICY "Business sees own location checkins" ON public.checkins
  FOR SELECT TO authenticated
  USING (location_id = public.business_location_id(auth.uid()));

-- un canje por usuario, por negocio, por día
ALTER TABLE public.checkins
  ADD COLUMN IF NOT EXISTS checkin_day date NOT NULL DEFAULT (now() AT TIME ZONE 'America/Mazatlan')::date;

CREATE UNIQUE INDEX IF NOT EXISTS checkins_one_per_user_location_day
  ON public.checkins (user_id, location_id, checkin_day)
  WHERE type IN ('visit','consumption');

-- 6. disponibilidad de username en vivo
CREATE OR REPLACE FUNCTION public.check_username_available(_username text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT NOT EXISTS (
    SELECT 1 FROM public.profiles
     WHERE lower(username) = lower(trim(_username))
       AND (auth.uid() IS NULL OR id <> auth.uid())
  )
$$;

GRANT EXECUTE ON FUNCTION public.check_username_available(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.business_location_id(uuid) TO authenticated;
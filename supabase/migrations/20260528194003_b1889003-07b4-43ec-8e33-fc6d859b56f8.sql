
-- ============ PART 1: ENUMS & profiles columns ============
DO $$ BEGIN
  CREATE TYPE public.subscription_tier_enum AS ENUM ('FAN','GOLD','PREMIUM','PLATINO');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.level_status_enum AS ENUM ('permanent','active','at_risk','demoted');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS subscription_tier public.subscription_tier_enum NOT NULL DEFAULT 'FAN',
  ADD COLUMN IF NOT EXISTS subscription_expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS subscription_started_at timestamptz,
  ADD COLUMN IF NOT EXISTS xp_multiplier numeric(3,2) NOT NULL DEFAULT 1.00,
  ADD COLUMN IF NOT EXISTS cc_multiplier numeric(3,2) NOT NULL DEFAULT 1.00,
  ADD COLUMN IF NOT EXISTS season_xp integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_season_xp integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS level_status public.level_status_enum NOT NULL DEFAULT 'permanent',
  ADD COLUMN IF NOT EXISTS level_name text,
  ADD COLUMN IF NOT EXISTS stripe_customer_id text,
  ADD COLUMN IF NOT EXISTS parental_consent boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS parental_consent_at timestamptz;

-- ============ PART 3 (extend) tx_type values ============
ALTER TYPE public.tx_type ADD VALUE IF NOT EXISTS 'earn';
ALTER TYPE public.tx_type ADD VALUE IF NOT EXISTS 'spend';
ALTER TYPE public.tx_type ADD VALUE IF NOT EXISTS 'refund';
ALTER TYPE public.tx_type ADD VALUE IF NOT EXISTS 'adjustment';
ALTER TYPE public.tx_type ADD VALUE IF NOT EXISTS 'season_reset';
ALTER TYPE public.tx_type ADD VALUE IF NOT EXISTS 'signup_bonus';

-- ============ PART 3: New tables ============

-- 3.1 seasons
DO $$ BEGIN
  CREATE TYPE public.season_status_enum AS ENUM ('upcoming','active','reset_warning','closed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.seasons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  cc_reset_date date NOT NULL,
  status public.season_status_enum NOT NULL DEFAULT 'upcoming',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.seasons TO authenticated;
GRANT ALL ON public.seasons TO service_role;
ALTER TABLE public.seasons ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Authenticated view seasons" ON public.seasons FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Admins manage seasons" ON public.seasons FOR ALL TO authenticated
    USING (public.has_role(auth.uid(),'admin'::app_role))
    WITH CHECK (public.has_role(auth.uid(),'admin'::app_role));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 3.2 monthly_player_votes
CREATE TABLE IF NOT EXISTS public.monthly_player_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  player_id uuid NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  month_year text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, month_year)
);
GRANT SELECT, INSERT ON public.monthly_player_votes TO authenticated;
GRANT ALL ON public.monthly_player_votes TO service_role;
ALTER TABLE public.monthly_player_votes ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Users see own votes" ON public.monthly_player_votes FOR SELECT TO authenticated USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Users insert own vote" ON public.monthly_player_votes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 3.3 monthly_player_winners
CREATE TABLE IF NOT EXISTS public.monthly_player_winners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  month_year text UNIQUE NOT NULL,
  winner_player_id uuid REFERENCES public.players(id),
  total_votes integer NOT NULL,
  announced_at timestamptz
);
GRANT SELECT ON public.monthly_player_winners TO authenticated, anon;
GRANT ALL ON public.monthly_player_winners TO service_role;
ALTER TABLE public.monthly_player_winners ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Anyone view winners" ON public.monthly_player_winners FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Admins manage winners" ON public.monthly_player_winners FOR ALL TO authenticated
    USING (public.has_role(auth.uid(),'admin'::app_role))
    WITH CHECK (public.has_role(auth.uid(),'admin'::app_role));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 3.4 season_achievements
DO $$ BEGIN
  CREATE TYPE public.achievement_type_enum AS ENUM ('top_ranking','first_leyenda','stadium_perfect');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.season_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id uuid NOT NULL REFERENCES public.seasons(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  achievement_type public.achievement_type_enum NOT NULL,
  rank integer,
  metric_value numeric,
  prize_description text,
  delivered boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.season_achievements TO authenticated;
GRANT ALL ON public.season_achievements TO service_role;
ALTER TABLE public.season_achievements ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Users see own achievements" ON public.season_achievements FOR SELECT TO authenticated
    USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'::app_role));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Admins manage achievements" ON public.season_achievements FOR ALL TO authenticated
    USING (public.has_role(auth.uid(),'admin'::app_role))
    WITH CHECK (public.has_role(auth.uid(),'admin'::app_role));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 3.5 audit_log
CREATE TABLE IF NOT EXISTS public.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  action text NOT NULL,
  entity_type text,
  entity_id uuid,
  details jsonb,
  ip_address text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.audit_log TO authenticated;
GRANT ALL ON public.audit_log TO service_role;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Admins read audit" ON public.audit_log FOR SELECT TO authenticated
    USING (public.has_role(auth.uid(),'admin'::app_role));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 3.6 locations
DO $$ BEGIN
  CREATE TYPE public.location_type_enum AS ENUM ('stadium','sponsor');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type public.location_type_enum NOT NULL,
  business_name text,
  visit_xp integer NOT NULL DEFAULT 50,
  visit_cc integer NOT NULL DEFAULT 10,
  consumption_xp integer NOT NULL DEFAULT 120,
  consumption_cc integer NOT NULL DEFAULT 20,
  qr_static_code text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.locations TO authenticated, anon;
GRANT ALL ON public.locations TO service_role;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Anyone view active locations" ON public.locations FOR SELECT USING (active = true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Admins manage locations" ON public.locations FOR ALL TO authenticated
    USING (public.has_role(auth.uid(),'admin'::app_role))
    WITH CHECK (public.has_role(auth.uid(),'admin'::app_role));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 3.7 checkins
DO $$ BEGIN
  CREATE TYPE public.checkin_type_enum AS ENUM ('visit','consumption','stadium_matchday','stadium_regular');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.checkins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  location_id uuid NOT NULL REFERENCES public.locations(id) ON DELETE CASCADE,
  type public.checkin_type_enum NOT NULL,
  qr_code_used text,
  consumption_amount numeric,
  verified boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.checkins TO authenticated;
GRANT ALL ON public.checkins TO service_role;
ALTER TABLE public.checkins ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Users see own checkins" ON public.checkins FOR SELECT TO authenticated
    USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'::app_role));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
-- No INSERT policy: only via SECURITY DEFINER function (future).

-- 3.8 business_users
CREATE TABLE IF NOT EXISTS public.business_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id uuid NOT NULL REFERENCES public.locations(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.business_users TO authenticated;
GRANT ALL ON public.business_users TO service_role;
ALTER TABLE public.business_users ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Self by email" ON public.business_users FOR SELECT TO authenticated
    USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()) OR public.has_role(auth.uid(),'admin'::app_role));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Admins manage business_users" ON public.business_users FOR ALL TO authenticated
    USING (public.has_role(auth.uid(),'admin'::app_role))
    WITH CHECK (public.has_role(auth.uid(),'admin'::app_role));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============ PART 4: Immutable transactions ledger ============
CREATE OR REPLACE FUNCTION public.transactions_block_update()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'Las transacciones son inmutables. Para revertir un movimiento, crear una nueva transaccion tipo refund o adjustment.';
END; $$;

CREATE OR REPLACE FUNCTION public.transactions_block_delete()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'Las transacciones no se pueden eliminar. Son un ledger inmutable.';
END; $$;

DROP TRIGGER IF EXISTS trg_transactions_no_update ON public.transactions;
CREATE TRIGGER trg_transactions_no_update
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.transactions_block_update();

DROP TRIGGER IF EXISTS trg_transactions_no_delete ON public.transactions;
CREATE TRIGGER trg_transactions_no_delete
  BEFORE DELETE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.transactions_block_delete();

-- ============ PART 5: award_points_v2 + spend_cabo_coins ============
CREATE OR REPLACE FUNCTION public.award_points_v2(
  p_user_id uuid,
  p_xp integer,
  p_cc integer,
  p_source text,
  p_description text,
  p_source_type text DEFAULT 'game',
  p_apply_multiplier boolean DEFAULT true
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_xp_mult numeric := 1;
  v_cc_mult numeric := 1;
  v_tier subscription_tier_enum;
  v_xp_final integer;
  v_cc_final integer;
  v_old_level smallint;
  v_new_level smallint;
  v_new_xp integer;
  v_new_cc integer;
BEGIN
  SELECT xp_multiplier, cc_multiplier, subscription_tier, level
    INTO v_xp_mult, v_cc_mult, v_tier, v_old_level
  FROM profiles WHERE id = p_user_id FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'profile_not_found';
  END IF;

  IF p_apply_multiplier THEN
    v_xp_final := floor(p_xp * v_xp_mult)::int;
    v_cc_final := floor(p_cc * v_cc_mult)::int;
  ELSE
    v_xp_final := p_xp;
    v_cc_final := p_cc;
  END IF;

  INSERT INTO transactions (user_id, type, xp_delta, cc_delta, source, description, metadata)
  VALUES (p_user_id, 'earn'::tx_type, v_xp_final, v_cc_final, p_source, p_description,
          jsonb_build_object('source_type', p_source_type, 'xp_multiplier', v_xp_mult, 'cc_multiplier', v_cc_mult, 'tier', v_tier));

  UPDATE profiles
     SET xp = xp + v_xp_final,
         cc = cc + v_cc_final,
         season_xp = season_xp + v_xp_final,
         updated_at = now()
   WHERE id = p_user_id
  RETURNING xp, cc, level INTO v_new_xp, v_new_cc, v_new_level;

  RETURN jsonb_build_object(
    'xp_awarded', v_xp_final,
    'cc_awarded', v_cc_final,
    'new_total_xp', v_new_xp,
    'new_total_cc', v_new_cc,
    'new_level', v_new_level,
    'level_up', v_new_level > COALESCE(v_old_level, 0)
  );
END; $$;

CREATE OR REPLACE FUNCTION public.spend_cabo_coins(
  p_user_id uuid,
  p_cc integer,
  p_source text,
  p_description text,
  p_source_type text DEFAULT 'redemption'
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_cc integer;
  v_new_cc integer;
BEGIN
  IF p_cc <= 0 THEN RAISE EXCEPTION 'invalid_amount'; END IF;

  SELECT cc INTO v_cc FROM profiles WHERE id = p_user_id FOR UPDATE;
  IF v_cc IS NULL OR v_cc < p_cc THEN
    RAISE EXCEPTION 'Saldo insuficiente de Cabo Coins';
  END IF;

  INSERT INTO transactions (user_id, type, xp_delta, cc_delta, source, description, metadata)
  VALUES (p_user_id, 'spend'::tx_type, 0, -p_cc, p_source, p_description,
          jsonb_build_object('source_type', p_source_type));

  UPDATE profiles SET cc = cc - p_cc, updated_at = now()
   WHERE id = p_user_id RETURNING cc INTO v_new_cc;

  RETURN jsonb_build_object('cc_spent', p_cc, 'new_total_cc', v_new_cc);
END; $$;

-- ============ PART 6: level helpers + extend BEFORE trigger ============
CREATE OR REPLACE FUNCTION public.calculate_fan_zone_level(total_xp integer)
RETURNS integer LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE
    WHEN total_xp >= 25000 THEN 6
    WHEN total_xp >= 12000 THEN 5
    WHEN total_xp >= 5000  THEN 4
    WHEN total_xp >= 2000  THEN 3
    WHEN total_xp >= 500   THEN 2
    ELSE 1
  END;
$$;

CREATE OR REPLACE FUNCTION public.get_level_name(level smallint)
RETURNS text LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE level
    WHEN 1 THEN 'Visitante'
    WHEN 2 THEN 'Local'
    WHEN 3 THEN 'Cabeño'
    WHEN 4 THEN 'Amo'
    WHEN 5 THEN 'Amo del Paraíso'
    WHEN 6 THEN 'Leyenda del Paraíso'
    ELSE 'Visitante'
  END;
$$;

-- Extend existing BEFORE UPDATE trigger function (keep behavior, add level_name + level_status, never decrement)
CREATE OR REPLACE FUNCTION public.update_level_on_xp()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  new_level smallint;
  new_name text;
BEGIN
  new_level := public.calculate_fan_zone_level(NEW.xp)::smallint;

  -- Never decrement
  IF new_level < COALESCE(OLD.level, 0) THEN
    new_level := OLD.level;
  END IF;

  NEW.level := new_level;
  new_name := public.get_level_name(new_level);
  NEW.level_name := new_name;

  IF new_level >= 5 THEN
    NEW.level_status := 'active'::level_status_enum;
  ELSE
    NEW.level_status := 'permanent'::level_status_enum;
  END IF;

  IF new_level > COALESCE(OLD.level, 0) THEN
    INSERT INTO public.notifications (user_id, kind, title, body, metadata)
    VALUES (NEW.id, 'level_up', '¡Subiste de nivel!',
            'Ahora eres ' || new_name,
            jsonb_build_object('level', new_level, 'level_name', new_name));
  END IF;

  RETURN NEW;
END; $$;

-- Backfill level_name for existing rows
UPDATE public.profiles SET level_name = public.get_level_name(GREATEST(level,1)::smallint) WHERE level_name IS NULL;

-- ============ PART 7: profiles.subscription_tier -> fan_passes.tier sync + multipliers ============
CREATE OR REPLACE FUNCTION public.sync_subscription_tier()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.subscription_tier IN ('PREMIUM','PLATINO') THEN
    NEW.xp_multiplier := 1.50;
    NEW.cc_multiplier := 1.50;
  ELSE
    NEW.xp_multiplier := 1.00;
    NEW.cc_multiplier := 1.00;
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_sync_subscription_tier_before ON public.profiles;
CREATE TRIGGER trg_sync_subscription_tier_before
  BEFORE UPDATE OF subscription_tier ON public.profiles
  FOR EACH ROW WHEN (OLD.subscription_tier IS DISTINCT FROM NEW.subscription_tier)
  EXECUTE FUNCTION public.sync_subscription_tier();

CREATE OR REPLACE FUNCTION public.sync_subscription_to_fan_pass()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_tier pass_tier;
BEGIN
  v_tier := lower(NEW.subscription_tier::text)::pass_tier;
  UPDATE public.fan_passes
     SET tier = v_tier, updated_at = now()
   WHERE user_id = NEW.id;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_sync_subscription_to_fan_pass ON public.profiles;
CREATE TRIGGER trg_sync_subscription_to_fan_pass
  AFTER UPDATE OF subscription_tier ON public.profiles
  FOR EACH ROW WHEN (OLD.subscription_tier IS DISTINCT FROM NEW.subscription_tier)
  EXECUTE FUNCTION public.sync_subscription_to_fan_pass();

-- ============ PART 8: lock down transactions UPDATE/DELETE (defense-in-depth) ============
DO $$ BEGIN
  CREATE POLICY "No updates to ledger" ON public.transactions FOR UPDATE USING (false) WITH CHECK (false);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "No deletes from ledger" ON public.transactions FOR DELETE USING (false);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

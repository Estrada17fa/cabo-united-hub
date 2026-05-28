
-- ============ PART 4: Parental consent ============
CREATE TABLE IF NOT EXISTS public.parental_consent_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  tutor_name text NOT NULL,
  tutor_email text NOT NULL,
  tutor_phone text,
  tutor_relationship text NOT NULL,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  confirmed_at timestamptz,
  ip_address text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.parental_consent_requests TO authenticated;
GRANT ALL ON public.parental_consent_requests TO service_role;
ALTER TABLE public.parental_consent_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own consent requests"
  ON public.parental_consent_requests FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users insert own consent requests"
  ON public.parental_consent_requests FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_parental_consent_user ON public.parental_consent_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_parental_consent_token ON public.parental_consent_requests(token_hash);

-- ============ PART 4: Helper is_minor_user ============
CREATE OR REPLACE FUNCTION public.is_minor_user(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT COALESCE(
    (SELECT (extract(year from age(birth_date)) < 18)
       FROM public.profiles WHERE id = _user_id),
    false
  );
$$;
REVOKE ALL ON FUNCTION public.is_minor_user(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_minor_user(uuid) TO authenticated, service_role;

-- ============ PART 8: Role helpers ============
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT public.has_role(_user_id, _role::app_role);
$$;
REVOKE ALL ON FUNCTION public.has_role(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, text) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT public.has_role(_user_id, 'admin'::app_role)
      OR public.has_role(_user_id, 'super_admin'::app_role);
$$;
REVOKE ALL ON FUNCTION public.is_admin(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT public.has_role(_user_id, 'super_admin'::app_role);
$$;
REVOKE ALL ON FUNCTION public.is_super_admin(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_super_admin(uuid) TO authenticated, service_role;

-- Constraint: super_admin y business no coexisten
CREATE OR REPLACE FUNCTION public.user_roles_check_conflict()
RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
DECLARE
  has_business boolean;
  has_super boolean;
BEGIN
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = NEW.user_id AND role::text = 'business')
    INTO has_business;
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = NEW.user_id AND role::text = 'super_admin')
    INTO has_super;

  IF NEW.role::text = 'super_admin' AND has_business THEN
    RAISE EXCEPTION 'role_conflict: super_admin no puede coexistir con business';
  END IF;
  IF NEW.role::text = 'business' AND has_super THEN
    RAISE EXCEPTION 'role_conflict: business no puede coexistir con super_admin';
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_user_roles_check_conflict ON public.user_roles;
CREATE TRIGGER trg_user_roles_check_conflict
  BEFORE INSERT OR UPDATE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.user_roles_check_conflict();

-- ============ PART 6: Level maintenance ============
CREATE OR REPLACE FUNCTION public.check_level_maintenance(p_user_id uuid)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
DECLARE
  v_level smallint;
  v_season_xp integer;
  v_threshold integer;
  v_status text;
BEGIN
  SELECT level, season_xp INTO v_level, v_season_xp
    FROM public.profiles WHERE id = p_user_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'profile_not_found'; END IF;

  IF v_level <= 4 THEN
    RETURN jsonb_build_object('status','permanent','action','none','level',v_level);
  END IF;

  v_threshold := CASE v_level WHEN 5 THEN 1000 WHEN 6 THEN 2500 ELSE 0 END;

  IF v_season_xp >= v_threshold THEN
    v_status := 'safe';
  ELSIF v_season_xp >= (v_threshold * 0.6)::int THEN
    v_status := 'at_risk';
  ELSE
    v_status := 'critical';
  END IF;

  RETURN jsonb_build_object(
    'status', v_status,
    'action', CASE WHEN v_status='safe' THEN 'none' ELSE 'warn' END,
    'level', v_level,
    'current', v_season_xp,
    'threshold', v_threshold,
    'missing', GREATEST(0, v_threshold - v_season_xp)
  );
END $$;
REVOKE ALL ON FUNCTION public.check_level_maintenance(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_level_maintenance(uuid) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.run_level_demotion_check()
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE
  r record;
  v_new_level smallint;
  v_new_status level_status_enum;
  v_threshold integer;
  v_demoted integer := 0;
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'forbidden: requires admin role';
  END IF;

  FOR r IN
    SELECT id, level, season_xp
      FROM public.profiles
     WHERE level IN (5,6) AND level_status::text IN ('active','at_risk')
  LOOP
    v_threshold := CASE r.level WHEN 5 THEN 1000 WHEN 6 THEN 2500 END;

    IF r.season_xp < v_threshold THEN
      v_new_level := (r.level - 1)::smallint;
      v_new_status := CASE WHEN v_new_level = 5 THEN 'active'::level_status_enum
                           ELSE 'demoted'::level_status_enum END;

      INSERT INTO public.transactions (user_id, type, xp_delta, cc_delta, source, description, metadata)
      VALUES (r.id, 'adjustment'::tx_type, 0, 0, 'season_end_demotion',
              'Democión al cierre de temporada por no alcanzar umbral de mantenimiento',
              jsonb_build_object('from_level', r.level, 'to_level', v_new_level,
                                 'season_xp', r.season_xp, 'threshold', v_threshold));

      UPDATE public.profiles
         SET level = v_new_level,
             level_name = public.get_level_name(v_new_level),
             level_status = v_new_status,
             updated_at = now()
       WHERE id = r.id;

      INSERT INTO public.notifications (user_id, kind, title, body, metadata)
      VALUES (r.id, 'level_demoted', 'Cambio de nivel',
              'No alcanzaste el umbral de mantenimiento. Tu nivel se ajustó; puedes recuperarlo la próxima temporada.',
              jsonb_build_object('from_level', r.level, 'to_level', v_new_level));

      v_demoted := v_demoted + 1;
    ELSE
      INSERT INTO public.audit_log (user_id, action, entity_type, entity_id, details)
      VALUES (r.id, 'level_maintained', 'profile', r.id,
              jsonb_build_object('level', r.level, 'season_xp', r.season_xp, 'threshold', v_threshold));
    END IF;
  END LOOP;

  UPDATE public.profiles SET last_season_xp = season_xp, season_xp = 0, updated_at = now();
  RETURN v_demoted;
END $$;
REVOKE ALL ON FUNCTION public.run_level_demotion_check() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.run_level_demotion_check() TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.run_level_at_risk_warning()
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE
  r record;
  v_check jsonb;
  v_warned integer := 0;
  v_reset_date date;
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'forbidden: requires admin role';
  END IF;

  SELECT cc_reset_date INTO v_reset_date
    FROM public.seasons WHERE status = 'active'::season_status_enum LIMIT 1;
  IF v_reset_date IS NULL THEN RAISE EXCEPTION 'no_active_season'; END IF;
  IF (v_reset_date - CURRENT_DATE) > 30 THEN RETURN 0; END IF;

  FOR r IN
    SELECT id FROM public.profiles
     WHERE level IN (5,6) AND level_status = 'active'::level_status_enum
  LOOP
    v_check := public.check_level_maintenance(r.id);
    IF v_check->>'status' IN ('at_risk','critical') THEN
      UPDATE public.profiles SET level_status = 'at_risk'::level_status_enum, updated_at = now()
       WHERE id = r.id;

      INSERT INTO public.notifications (user_id, kind, title, body, metadata)
      VALUES (r.id, 'level_at_risk', 'Mantén tu nivel',
              'Te faltan ' || (v_check->>'missing') || ' XP esta temporada para mantener tu nivel.',
              v_check);

      INSERT INTO public.audit_log (user_id, action, entity_type, entity_id, details)
      VALUES (r.id, 'level_at_risk_warned', 'profile', r.id, v_check);

      v_warned := v_warned + 1;
    END IF;
  END LOOP;
  RETURN v_warned;
END $$;
REVOKE ALL ON FUNCTION public.run_level_at_risk_warning() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.run_level_at_risk_warning() TO authenticated, service_role;

-- ============ PART 7: Recuperación desde 'demoted' en trigger ============
CREATE OR REPLACE FUNCTION public.update_level_on_xp()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE
  new_level smallint;
  new_name text;
  recovered boolean := false;
BEGIN
  new_level := public.calculate_fan_zone_level(NEW.xp)::smallint;

  IF new_level < COALESCE(OLD.level, 0) THEN
    new_level := OLD.level;
  END IF;

  IF COALESCE(OLD.level_status::text, '') = 'demoted' THEN
    IF OLD.level = 4 AND NEW.xp >= 12000 AND NEW.season_xp >= 600 THEN
      new_level := 5; NEW.level_status := 'active'::level_status_enum; recovered := true;
    ELSIF OLD.level = 5 AND NEW.xp >= 25000 AND NEW.season_xp >= 2500 THEN
      new_level := 6; NEW.level_status := 'active'::level_status_enum; recovered := true;
    END IF;
  END IF;

  NEW.level := new_level;
  new_name := public.get_level_name(new_level);
  NEW.level_name := new_name;

  IF NOT recovered AND new_level <> COALESCE(OLD.level, -1) THEN
    IF new_level >= 5 THEN
      NEW.level_status := 'active'::level_status_enum;
    ELSE
      NEW.level_status := 'permanent'::level_status_enum;
    END IF;
  END IF;

  IF new_level > COALESCE(OLD.level, 0) THEN
    INSERT INTO public.notifications (user_id, kind, title, body, metadata)
    VALUES (NEW.id,
            CASE WHEN recovered THEN 'level_recovered' ELSE 'level_up' END,
            CASE WHEN recovered THEN '¡Recuperaste tu nivel!' ELSE '¡Subiste de nivel!' END,
            CASE WHEN recovered THEN 'Recuperaste tu nivel ' || new_name
                 ELSE 'Ahora eres ' || new_name END,
            jsonb_build_object('level', new_level, 'level_name', new_name, 'recovered', recovered));
  END IF;

  RETURN NEW;
END $$;

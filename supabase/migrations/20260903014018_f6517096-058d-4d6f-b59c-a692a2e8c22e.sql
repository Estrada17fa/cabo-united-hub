-- 1) match_reactions: no broad read of every user's activity
DROP POLICY IF EXISTS reactions_read_all ON public.match_reactions;
CREATE POLICY reactions_read_own ON public.match_reactions
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

ALTER PUBLICATION supabase_realtime DROP TABLE public.match_reactions;

-- 2) parental_consent_requests: hide token_hash from the requesting user
DROP POLICY IF EXISTS "Users see own consent requests" ON public.parental_consent_requests;
CREATE POLICY "Admins see consent requests" ON public.parental_consent_requests
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE OR REPLACE VIEW public.parental_consent_status
WITH (security_invoker = on) AS
  SELECT id, user_id, tutor_name, tutor_email, tutor_relationship,
         expires_at, confirmed_at, created_at
    FROM public.parental_consent_requests;

GRANT SELECT ON public.parental_consent_status TO authenticated;

CREATE POLICY "Users see own consent status" ON public.parental_consent_requests
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- 3) fixed search_path
CREATE OR REPLACE FUNCTION public.compute_level(_xp integer)
 RETURNS smallint
 LANGUAGE sql
 IMMUTABLE
 SET search_path TO 'public'
AS $function$
  SELECT CASE
    WHEN _xp >= 25000 THEN 5
    WHEN _xp >= 12000 THEN 4
    WHEN _xp >= 5000 THEN 3
    WHEN _xp >= 2000 THEN 2
    WHEN _xp >= 500 THEN 1
    ELSE 0
  END::smallint;
$function$;
DROP POLICY IF EXISTS "Users see own consent status" ON public.parental_consent_requests;

DROP VIEW IF EXISTS public.parental_consent_status;

CREATE OR REPLACE FUNCTION public.my_parental_consent_status()
RETURNS TABLE(id uuid, tutor_name text, tutor_email text, tutor_relationship text,
              expires_at timestamptz, confirmed_at timestamptz, created_at timestamptz)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT r.id, r.tutor_name, r.tutor_email, r.tutor_relationship,
         r.expires_at, r.confirmed_at, r.created_at
    FROM public.parental_consent_requests r
   WHERE r.user_id = auth.uid()
   ORDER BY r.created_at DESC
$$;

REVOKE ALL ON FUNCTION public.my_parental_consent_status() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.my_parental_consent_status() TO authenticated, service_role;
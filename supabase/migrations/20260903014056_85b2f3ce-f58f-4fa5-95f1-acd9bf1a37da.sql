REVOKE ALL ON FUNCTION public.my_parental_consent_status() FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.my_parental_consent_status() TO authenticated, service_role;
DROP VIEW IF EXISTS public.public_profiles;

CREATE OR REPLACE FUNCTION public.get_leaderboard(_limit integer DEFAULT 10)
RETURNS TABLE (
  id uuid,
  display_name text,
  username text,
  avatar_url text,
  level smallint,
  xp integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.display_name, p.username, p.avatar_url, p.level, p.xp
  FROM public.profiles p
  WHERE p.xp > 0
  ORDER BY p.xp DESC
  LIMIT LEAST(GREATEST(COALESCE(_limit, 10), 1), 100);
$$;

REVOKE ALL ON FUNCTION public.get_leaderboard(integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_leaderboard(integer) TO anon, authenticated, service_role;
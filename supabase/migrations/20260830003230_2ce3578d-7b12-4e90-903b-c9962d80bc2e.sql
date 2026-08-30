UPDATE public.profiles p
SET email_verified = true
FROM auth.users u
WHERE u.id = p.id
  AND u.email_confirmed_at IS NOT NULL
  AND p.email_verified IS NOT TRUE;
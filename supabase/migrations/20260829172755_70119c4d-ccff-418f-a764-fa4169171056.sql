ALTER TABLE public.places ADD COLUMN IF NOT EXISTS logo_url text;

DROP POLICY IF EXISTS "avatars_admin_manage_league_assets" ON storage.objects;

CREATE POLICY "avatars_admin_manage_league_assets"
ON storage.objects
FOR ALL
TO authenticated
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = ANY (ARRAY['teams','tournaments','players','places','place-logos'])
  AND public.is_admin(auth.uid())
)
WITH CHECK (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = ANY (ARRAY['teams','tournaments','players','places','place-logos'])
  AND public.is_admin(auth.uid())
);
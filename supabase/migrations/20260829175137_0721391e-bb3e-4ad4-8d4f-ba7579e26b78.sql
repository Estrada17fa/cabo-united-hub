DROP POLICY IF EXISTS "avatars_admin_manage_league_assets" ON storage.objects;

CREATE POLICY "avatars_admin_manage_league_assets"
ON storage.objects
FOR ALL
TO authenticated
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = ANY (ARRAY['teams','tournaments','players','places','place-logos','tienda'])
  AND public.is_admin(auth.uid())
)
WITH CHECK (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = ANY (ARRAY['teams','tournaments','players','places','place-logos','tienda'])
  AND public.is_admin(auth.uid())
);
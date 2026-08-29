ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS venue text;
ALTER TABLE public.seasons ADD COLUMN IF NOT EXISTS logo_url text;

DROP POLICY IF EXISTS "avatars_admin_manage_league_assets" ON storage.objects;
CREATE POLICY "avatars_admin_manage_league_assets" ON storage.objects
  FOR ALL TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] IN ('teams','tournaments','players')
    AND public.is_admin(auth.uid())
  )
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] IN ('teams','tournaments','players')
    AND public.is_admin(auth.uid())
  );

DROP POLICY IF EXISTS "avatars_public_read" ON storage.objects;
CREATE POLICY "avatars_public_read" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'avatars');
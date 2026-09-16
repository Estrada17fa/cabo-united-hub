drop policy "avatars_admin_manage_league_assets" on storage.objects;

create policy "avatars_admin_manage_league_assets"
on storage.objects for all to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = any (array['teams','tournaments','players','places','place-logos','tienda','sponsors'])
  and is_admin(auth.uid())
)
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = any (array['teams','tournaments','players','places','place-logos','tienda','sponsors'])
  and is_admin(auth.uid())
);
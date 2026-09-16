# Fix: error de policy al subir logo de patrocinador

## Diagnóstico

Las imágenes del panel de admin se suben al bucket `avatars` (público). La política `avatars_admin_manage_league_assets` permite a los admins subir/leer/editar/borrar solo en estas carpetas:

`teams, tournaments, players, places, place-logos, tienda`

El formulario de Patrocinadores sube a la carpeta `sponsors`, que NO está en esa lista. Resultado: cualquier subida de logo de patrocinador falla con "new row violates row-level security policy" (el error de "policy"). Es un bug de configuración, no algo que hayas hecho mal.

## Solución (1 cambio de base de datos)

Ejecutar una migración que actualice la política para incluir la carpeta `sponsors`:

```sql
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
```

## Verificación

- Subir un logo desde Admin → Patrocinadores y confirmar que se guarda y se ve en el carrusel.
- Confirmar que las demás subidas (equipos, plantel, lugares, tienda) siguen funcionando.

No se toca ningún otro componente ni página.

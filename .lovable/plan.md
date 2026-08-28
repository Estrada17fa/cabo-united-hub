# Permisos de perfiles + Panel de administración

## Parte 1 — Cerrar la lectura de perfiles

Hoy la política de lectura de `profiles` es abierta a cualquier usuario autenticado (`USING (true)`), así que sí expone teléfono, fecha de nacimiento, ciudad y `stripe_customer_id` de todos.

Sí hay una pantalla que depende de leer perfiles ajenos: el **Ranking general de Fan Zone** (`RankingCard`) lee `display_name`, `username`, `xp`, `level` de todos los perfiles. Por eso, además de cerrar la política, se crea una fuente pública mínima para el ranking.

Cambios en base de datos:

- Reemplazar la política de lectura: cada usuario ve solo su propio perfil; los admins ven todos (`auth.uid() = id OR has_role(auth.uid(), 'admin')`).
- Crear una vista pública `public_profiles` que exponga únicamente `id`, `display_name`, `username`, `avatar_url`, `level`, `xp` (sin teléfono, fecha de nacimiento, ciudad ni datos de pago), con lectura permitida a usuarios autenticados y visitantes.
- `RankingCard` pasa a leer de esa vista, sin cambios visuales.

## Parte 2 — Panel de administración

### Acceso

- Nueva ruta `/admin`, protegida: al entrar se verifica el rol `admin` (RPC `has_role`). Si no lo tiene, redirige a Inicio sin renderizar nada del panel.
- No se crea ninguna pantalla para auto-asignarse el rol. Los primeros admins se insertan manualmente en `user_roles`.
- Todos los admins tienen acceso completo, sin niveles diferenciados.

### Estructura

Layout de admin con menú lateral simple y contenido a la derecha, siguiendo la estética oscura del sitio. El menú se alimenta de una lista de secciones en un solo archivo, para que Comercios, Patrocinadores, Pagos y Temporadas se agreguen después solo añadiendo una entrada. Por ahora hay una sección funcional: **Lista de espera de Abonos**.

### Lista de espera de Abonos (`/admin/abonos`)

Tabla de solo lectura con los pases (`waitlist`, `active`, `pending_payment`) mostrando: nombre completo, correo, teléfono, nivel, fecha de nacimiento, fecha de registro y si aceptó marketing.

- Filtros por nivel (Fan/Gold/Premium/Platino) y por estado.
- Buscador por nombre o correo.
- Botón "Exportar CSV" que descarga exactamente la vista filtrada actual.
- Sin edición en esta pantalla.

## Detalles técnicos

- El correo no vive en `profiles` ni en `fan_passes` (está en el esquema de autenticación), así que la lista se sirve con una función `security definer` `admin_list_fan_passes()` que valida `has_role(auth.uid(), 'admin')` y devuelve pase + datos de perfil + correo. Sin el rol, la función lanza error.
- Filtrado, búsqueda, orden y exportación CSV se hacen en el cliente sobre el resultado de esa función (el volumen actual de pases es pequeño); el CSV se genera con escapado de comas/comillas y descarga vía `Blob`.
- Archivos nuevos: `src/pages/admin/AdminLayout.tsx`, `src/pages/admin/AbonosWaitlist.tsx`, `src/hooks/useIsAdmin.ts`, `src/lib/csv.ts`. Editados: `src/App.tsx` (rutas anidadas de `/admin`) y `src/components/fan-zone/RankingCard.tsx` (leer la vista pública).
- Una migración cubre: política de `profiles`, vista `public_profiles` con sus grants, y la función de listado con `GRANT EXECUTE` a usuarios autenticados.

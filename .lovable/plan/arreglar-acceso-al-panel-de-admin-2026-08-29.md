# Arreglar acceso al panel de admin

## Diagnóstico (verificado)

- Tu cuenta `e.estrada@loscabosunited.mx` ya tiene los roles `admin` y `super_admin`, y el correo está confirmado. Los permisos están bien.
- El problema está en la verificación que hace la app: existen dos versiones de la función `has_role` en la base (una recibe el rol como tipo `app_role` y otra como texto). Al llamarla desde la app, el servidor responde con error `PGRST203` ("no puede elegir la mejor candidata") en lugar de `true`. Comprobado con una llamada real a la API.
- Resultado: `useIsAdmin` interpreta el error como "no eres admin" y `/admin` te redirige a Inicio.
- Además, no hay ningún enlace a `/admin` en el header ni en el menú lateral, así que tampoco hay forma de llegar al panel desde la interfaz.

## Qué se hará

1. Dejar una sola versión de `has_role` en la base (se elimina la duplicada que recibe el rol como texto, revisando antes que ninguna política dependa de ella). Así la llamada deja de ser ambigua.
2. Hacer la verificación de admin más robusta en el cliente: usar la función `is_admin`, que no tiene duplicados, con `has_role` como respaldo.
3. Agregar un acceso visible al panel: en el menú lateral (y en el mini pase/menú de usuario) aparece "Panel de administración" solo si la cuenta tiene rol admin, con el mismo lenguaje visual actual (ícono de librería, sin adorno).

## Detalle técnico

- Migración: `DROP FUNCTION public.has_role(uuid, text)` previa verificación de dependencias en políticas y triggers; se conserva `has_role(uuid, app_role)` con su `GRANT EXECUTE` a `authenticated`.
- `src/hooks/useIsAdmin.ts`: llamar `supabase.rpc("is_admin", { _user_id })`; si devuelve error, reintentar con `has_role`. Estado `isAdmin` sin cambios en su API para no tocar `AdminLayout`.
- `src/components/layout/Header.tsx`: entrada condicional al menú usando `useIsAdmin`, apuntando a `/admin`.

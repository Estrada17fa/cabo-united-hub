# Cuenta de admin para e.estrada@loscabosunited.mx

## Estado actual (verificado)
No existe ningún usuario con correo de loscabosunited.mx en la base. Los roles viven en la tabla `user_roles` y el acceso a `/admin` se valida con el rol `admin`/`super_admin`.

Por seguridad, la contraseña de una cuenta no se puede crear desde aquí: el registro debe hacerlo la persona desde la app. Lo que sí se puede dejar listo es que, en el momento en que ese correo se registre y confirme, quede como admin automáticamente.

## Qué se hará

1. Regla automática en la base: cuando se cree (o confirme) un usuario cuyo correo sea exactamente `e.estrada@loscabosunited.mx` y ya tenga el correo verificado, se le asigna el rol `super_admin` sin pasos manuales.
2. Se aplica también de forma retroactiva: si el usuario ya existe cuando corra el cambio, se le asigna el rol de inmediato.
3. Tú creas la cuenta normalmente en la app con ese correo, confirmas el correo desde la liga que llega, e inicias sesión: `/admin` y `/admin/match-zone` quedan disponibles para empezar a subir equipos, partidos, posiciones y goleo.

## Detalle técnico
- Función `security definer` que inserta en `public.user_roles (user_id, 'super_admin')` con `on conflict do nothing`, condicionada a `email_confirmed_at is not null` y coincidencia exacta del correo (evita escalación por dominio).
- Dos triggers en `auth.users`: `after insert` y `after update of email_confirmed_at` (solo en la transición null → no null).
- Nota: el trigger existente `trg_user_roles_check_conflict` impide que `super_admin` coexista con `business`; no aplica en este caso.

## Alternativa
Si prefieres que el permiso sea solo para esa persona y sin regla permanente, puedo en su lugar esperar a que te registres y asignar el rol una sola vez con un cambio de datos puntual. Dime si prefieres esa opción.

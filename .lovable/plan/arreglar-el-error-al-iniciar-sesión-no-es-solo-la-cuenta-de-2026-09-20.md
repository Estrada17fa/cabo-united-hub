# Arreglar el error al iniciar sesión (no es solo la cuenta de admin)

## Diagnóstico (verificado ahora)

- Los intentos de inicio de sesión en el sitio publicado están respondiendo con **tiempo de espera agotado del servidor** (`POST /token` → 504 tras ~10 segundos). Eso explica el "se queda cargando" y luego "Error al iniciar sesión". Lo mismo está pasando con los registros nuevos (`/signup` → 504).
- La cuenta `e.estrada@loscabosunited.mx` está perfectamente bien: correo confirmado, contraseña activa, sin bloqueos, y con los roles `admin` y `super_admin`. El problema no es de permisos ni de esa cuenta en particular: cualquiera que intente entrar ahora mismo tiene el mismo error.
- La causa está en la base de datos: está saturada. En los últimos minutos hay consultas canceladas por tiempo excedido, avisos de respaldo de registro pendiente, y el panel de métricas no responde. El servicio de autenticación no logra hablar con la base y corta la petición.
- Contribuyen dos cosas concretas:
  1. El servidor de base de datos está en el tamaño más pequeño disponible ("Tiny"), mientras el sitio recibe mucho tráfico: la consulta de partidos sola se ejecutó 5,399 veces, con picos de más de 2 segundos.
  2. Hay 8 conexiones abiertas "a medias" (transacciones sin cerrar), una de ellas desde hace 22 días, ocupando recursos del servidor.

## Qué se hará

1. **Liberar el servidor**: cerrar las conexiones colgadas que llevan días abiertas sin actividad. Es inmediato y sin pérdida de datos.
2. **Subir el tamaño del servidor de base de datos** al siguiente nivel para que aguante el tráfico actual de la afición. Implica un reinicio breve (uno o dos minutos) en el que el sitio puede verse lento.
3. **Bajar la carga desde el sitio**: agregar índices a la consulta de partidos (la que más peso tiene) y ampliar el tiempo que se reutiliza esa información en el navegador, para que no se vuelva a pedir a cada rato.
4. **Comprobar el resultado**: iniciar sesión de verdad con la cuenta de admin y confirmar que entra y que `/admin` abre, además de revisar que ya no haya tiempos de espera agotados en los registros del servidor.

## Detalle técnico

- `pg_terminate_backend` sobre las sesiones en `idle in transaction` con antigüedad mayor a 1 hora (excluyendo la sesión propia).
- `resize_compute` del proyecto de Tiny a Small.
- Migración: índices en `matches (season, kickoff_at)` y `matches (kickoff_at)`; revisar con `EXPLAIN (ANALYZE)` que la consulta de PostgREST los use.
- `useMatches` / `useLeague`: subir `staleTime` y `gcTime` para reducir refetch; sin cambios visuales.
- Verificación: `analytics_query` sobre `auth_logs` (ausencia de 504 en `/token`) y prueba real de login con Playwright.

## Nota

Si tras liberar conexiones y subir el servidor el login sigue agotando el tiempo, el siguiente paso es revisar el volumen de tráfico real y considerar un tamaño mayor; te lo diría con los números en mano antes de gastar más.

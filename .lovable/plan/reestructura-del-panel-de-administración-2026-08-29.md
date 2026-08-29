# Reestructura del panel de administración

## Diagnóstico (verificado)

### Por qué se siente trabado

1. **La app no divide código: al abrir `/admin` se carga TODO el sitio.** Medido en el navegador: la ruta `/admin/match-zone` descarga **150 módulos del proyecto, incluidas las 22 páginas** (Inicio, Club, Tienda, Fan Zone, etc.). No existe ni un `React.lazy` en el proyecto: `src/App.tsx` importa todas las páginas de forma directa. Entrar al panel arrastra el peso completo del sitio público.
2. **Cada página, incluido el panel, monta el shell público completo**: header, banda de patrocinadores animada y la sincronización de carrito con Shopify. Verificado: en `/admin` se dispara una petición a Shopify que **falla por CORS** en cada carga, y se repiten 3 lecturas de `profiles` y 3 de `fan_passes` por montaje.
3. **`MatchZoneAdmin.tsx` es un monolito de 919 líneas** con 6 pestañas. Las pestañas sí se montan de una en una, pero cada una lista **todo sin paginar** y cada guardado invalida 4 consultas a la vez (`matches`, `teams`, `standings`, `scorers`), y cada escritura en partidos dispara además el recálculo de la tabla en la base. Con un torneo real (cientos de partidos y eventos) eso son 4 refetch por cada clic de marcador.
4. **Honesto sobre el límite del diagnóstico**: con los datos actuales de la base (0 partidos, 1 equipo, 0 posiciones, 0 goleadores) el panel abre en ~2 s y las 6 pestañas responden sin congelarse. Es decir, el congelamiento no se reproduce hoy por volumen de datos: lo que está medido y es real es el peso de arranque (punto 1 y 2) y el patrón de refetch múltiple (punto 3). Primer paso de la construcción: dejar el panel aislado y perezoso, y confirmar contigo si el trabón desaparece; si persiste, se mide con datos de prueba cargados.

### Qué existe hoy del admin de Torneo (se completa, no se duplica)

- `/admin` con `AdminLayout` protegido por rol admin (`useIsAdmin` → `is_admin`), menú lateral con 2 ítems: Lista de espera y Match Zone.
- `MatchZoneAdmin` con 6 pestañas ya funcionales: **En vivo** (fase, marcador, penales, compensación, destacar, link de transmisión, eventos del timeline), **Partidos** (alta con jornada/equipos/fecha/sede/grupo/fase + lista con borrado), **Equipos** (alta con nombre, corto, ciudad, grupo, URL de escudo + marcar "nuestro"), **Posiciones** (recalcular + ajuste manual por equipo), **Goleo** (alta manual con jugador, equipo, goles, asistencias) y **Torneo** (alta/edición de temporadas con nombre, clave, fechas, estado).
- Base de datos ya lista: `teams`, `matches`, `match_events`, `league_standings` (con `manual_adjustment` y `adjustment_note`), `top_scorers`, `seasons` (con `season_key`), reglas de puntos en `compute_match_points` (3 local, 4 visita por 2+, 3 visita por 1, empate 1+1 con penales) y recálculo automático por trigger. RLS de escritura solo admin en todas ellas.
- Lo que **falta**: nada de esto vive en una sola fuente de verdad — el código usa `SEASON = "2026"` fijo en `src/hooks/useLeague.ts` y todos los formularios escriben con esa constante, en lugar del torneo marcado como activo. Además: no hay subida de escudos (solo URL), no hay edición de un partido existente (solo alta y borrado), no hay lista por jornada, no hay campos de reglas/clasificados en `seasons`, `players` no tiene permiso de escritura para admin (solo lectura pública) y **no existe tabla de noticias**.

## Qué se va a construir

### 1. Panel a una sola página que carga sola

- `/admin` queda como **una sola página** con menú lateral; cada sección se monta con `React.lazy` + `Suspense` y solo consulta sus propios datos al abrirse.
- El resto del sitio también pasa a carga perezosa en las rutas, para que entrar al panel no descargue Inicio, Club ni Tienda.
- El panel se saca del shell público (sin banda de patrocinadores ni sincronización de Shopify): shell propio, oscuro, con el mismo sistema de diseño (hairline `#1F2329`, fondo `#0D0F13`, cyan `#00ABC4`, Inter + Space Grotesk).
- Menú inicial: **Torneo · Plantel · Noticias**, más la Lista de espera existente. El menú se define en un solo arreglo con su componente perezoso, así agregar una sección es añadir una línea.
- Patrón único en todas las secciones: **lista + hoja lateral (sheet) de formulario** para crear y editar.

### 2. Sección Torneo (fuente única de verdad)

Sub-pestañas dentro de Torneo:

1. **Configuración**: nombre real visible, clave de temporada, fechas, estado (en curso / terminado), botón "marcar como activo" (solo un torneo activo), cuántos equipos clasifican, y el resumen editable de las reglas de puntos ya existentes (victoria local, bonus de visita por 2+, empate con penales, criterios de desempate). Todo el sitio pasa a leer el torneo activo desde aquí; se elimina la constante fija `"2026"`.
2. **Equipos**: alta y edición con nombre, nombre corto, ciudad, grupo, **subida de escudo** (nuevo bucket público de imágenes) y marca "nuestro equipo". Reutiliza los equipos ya capturados.
3. **Partidos**: formulario completo por partido (jornada, local, visitante, fecha/hora, sede, estado, marcador, penales, **link de transmisión + en vivo**, goleadores y eventos del timeline con minuto: gol, autogol, penal, tarjeta, cambio, MT, final). Lista agrupada por jornada con edición rápida en hoja lateral.
4. **Posiciones**: tabla calculada automáticamente con las reglas configuradas (botón recalcular) + **ajuste manual** por equipo con puntos y nota del motivo, visible en la tabla como excepción.
5. **Goleo**: manual — elegir jugador (del plantel o nombre libre), club y goles/asistencias.

### 3. Plantel y Noticias (bases)

- **Plantel**: alta/edición de jugadores (nombre, dorsal, posición, foto, bio, activo). Requiere permisos de escritura de admin en la tabla de jugadores.
- **Noticias**: tabla nueva (título, resumen, contenido, imagen, autor, fecha de publicación, publicado/borrador) con lista + editor. Lectura pública solo de publicadas; escritura solo admin.

## Detalles técnicos

- **Rutas**: `src/App.tsx` pasa a `lazy()` + `Suspense`; `/admin/*` en su propio shell (`AdminShell`) fuera de `AppLayout`. Guard con `useIsAdmin`, sin renderizar contenido antes de resolver el rol.
- **Estructura de archivos**: `src/pages/admin/AdminShell.tsx`, `src/pages/admin/sections/index.ts` (registro de secciones con `lazy`), `src/pages/admin/sections/Torneo/*` (Config, Equipos, Partidos, Posiciones, Goleo), `Plantel.tsx`, `Noticias.tsx`. `MatchZoneAdmin.tsx` se descompone en esas piezas (se conserva la lógica de En vivo dentro de Partidos).
- **Datos**: hooks nuevos por sección con `queryKey` propia y invalidación quirúrgica (solo la clave afectada, no las 4). `useLeague` deja de exportar `SEASON` fijo y expone `useActiveSeason()` (temporada con estado activo) que alimenta Match Zone e Inicio.
- **Migraciones**: columnas de configuración en `seasons` (reglas de puntos en JSON, número de clasificados, marca de activo con índice único parcial); política de escritura admin en `players`; tabla `news` con GRANTs, RLS y trigger de `updated_at`; bucket público `team-logos` para escudos y fotos del plantel.
- **Sin cambios en el diseño público**: solo se sustituye la fuente de la temporada activa; los componentes visuales de Match Zone e Inicio quedan igual.

# Visita Los Cabos: alta real de lugares y rutas

## Diagnóstico (verificado)

- **No existe ninguna tabla** de lugares ni rutas en la base. Todo es estático en `src/lib/visita-los-cabos-data.ts` (497 líneas): 12 lugares aprox. en `PLACES`, 3 rutas en `FAN_ROUTES`, `FEATURED_PLACE_IDS` a mano, `CATEGORY_META` (colores por categoría), `SPONSOR_GOLD`, `LCU_CYAN` y el token público de Mapbox.
- **Cómo se pinta hoy**: `ConoceLosCabos.tsx` importa `PLACES` y filtra en memoria; `MapView.tsx` recorre `PLACES` y crea un marcador por lugar con el color de su categoría (dorado + estrella si `tier === "patrocinador"`); `FeaturedStrip.tsx` usa `FEATURED_PLACE_IDS`; `PlaceDetail.tsx` muestra foto (degradado), horario, área, rating, "van hoy", WhatsApp, "Cómo llegar" y un bloque de **reseñas de ejemplo**; `RoutesPanel.tsx` lista `FAN_ROUTES` con número de paradas y duración (sin paradas reales).
- **Panel de admin**: `src/pages/admin/AdminShell.tsx` con secciones lazy (Torneo, Plantel, Noticias, Afición, Lista de espera). Ya existen `AdminSheet.tsx`, `AdminUI.tsx` e `ImageUploadField.tsx` (subida a bucket público con carpetas) — se reutilizan tal cual.
- Los "reviews" son puramente inventados y no hay sistema de reseñas; según tus reglas no se construyen ahora.

## Modelo de datos (backend)

Tabla `places`:
- `id`, `slug`, `name`, `category` (enum: restaurantes, bares, tours, tiendas, hoteles), `tier` (enum: basico, destacado, patrocinador)
- `description`, `area` (zona/corredor), `hours` (texto libre)
- `lat`, `lng` (numeric)
- `photo_url` (imagen subida), `photo_gradient` (fallback/color por lugar)
- `whatsapp`
- Stats manuales, nulables: `visited_by`, `going_today`, `rating`
- `featured` (para "Lugares Destacados"), `sort_order`, `published`, timestamps

Tabla `fan_routes`: `id`, `name`, `description`, `icon`, `color`, `duration` (texto), `sort_order`, `published`, timestamps.

Tabla `fan_route_stops`: `id`, `route_id`, `place_id`, `position`. El número de paradas se calcula de aquí.

Seguridad: RLS en las tres — lectura pública solo de filas `published` (grant a `anon` y `authenticated`), escritura completa solo para admin vía `is_admin(auth.uid())`, más `service_role`. GRANTs explícitos en la misma migración.

## Panel de admin: sección "Visita Los Cabos"

Nueva entrada lazy en `AdminShell` (`src/pages/admin/sections/Visita/`), con dos pestañas:

1. **Lugares** — lista compacta (foto/color, nombre, categoría, chip de patrocinador, publicado/borrador) + hoja lateral de alta/edición:
   - Nombre, tipo, tier, zona, descripción, horario, WhatsApp.
   - **Mini-mapa Mapbox** dentro de la hoja: buscador de dirección (geocoding con el token público, ya disponible en el cliente) + pin arrastrable; guarda `lat`/`lng`. También permite pegar coordenadas a mano.
   - Foto con `ImageUploadField` (carpeta `places`) y selector de degradado por lugar como respaldo.
   - Stats manuales (fans visitaron, van hoy, rating) — vacío = no se muestra en el sitio.
   - Switches: destacado y publicado. Campos que no aplican al tipo (p. ej. horario en tours) se pueden dejar vacíos y simplemente no se pintan.
2. **Rutas** — lista + hoja: nombre, descripción, ícono, color, duración estimada, publicado, y constructor de **paradas ordenadas** eligiendo lugares ya capturados (agregar, quitar, subir/bajar). El contador de paradas se deriva.

Orden de construcción: Lugares primero, Rutas después.

## El sitio

- Nuevos hooks (`src/hooks/useVisitaLosCabos.ts`) con React Query: `usePlaces()`, `useFanRoutes()` (rutas con sus paradas y los lugares de cada parada).
- `ConoceLosCabos.tsx`, `MapView.tsx`, `FeaturedStrip.tsx`, `PlaceDetail.tsx` y `RoutesPanel.tsx` pasan a consumir los datos reales manteniendo **exactamente** el look actual: colores por categoría desde `CATEGORY_META`, dorado + estrella para patrocinador, cyan solo en chrome, hairline.
- Filtros y buscador operan sobre los lugares reales; "Lugares Destacados" usa el flag `featured` con `sort_order`.
- `PlaceDetail`: campos vacíos no se renderizan (horario, WhatsApp, stats). "Cómo llegar" se genera de `lat/lng`. **El bloque de reseñas se retira** (era 100% ejemplo y no hay reseñas reales; se puede añadir después como feature propio).
- Estados de carga y vacío discretos (skeletons hairline) para que el mapa nunca se vea roto.
- **Limpieza al final**: cuando el flujo real esté funcionando, se borran `PLACES`, `FAN_ROUTES`, `FEATURED_PLACE_IDS` y los tipos de ejemplo de `visita-los-cabos-data.ts`, dejando ahí solo `CATEGORY_META`, `SPONSOR_GOLD`, `LCU_CYAN` y el token. Para no dejar la página vacía, migro tus lugares y rutas de ejemplo actuales como filas iniciales en **borrador** (no publicadas), listas para que las edites, publiques o elimines desde el panel.

## Notas técnicas

- No se toca Match Zone, Mi Club, Fan Zone ni el shell público.
- No se construye check-in ni reseñas: las stats son columnas manuales.
- El geocoding/mini-mapa usa el token público de Mapbox ya presente en el cliente (Mapbox GL JS + Geocoding), sin secretos nuevos.
- Verificación: build, y revisión en móvil (393px) y desktop del mapa con pines reales, detalle de lugar y rutas.

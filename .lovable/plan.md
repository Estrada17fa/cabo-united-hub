# Tipos de lugar administrables (con ícono y color)

Hoy las categorías de Visita Los Cabos están fijas en código y en un tipo de la base: solo existen Restaurantes, Bares, Tours, Tiendas y Hoteles, con ícono y color escritos a mano en `src/lib/visita-los-cabos-data.ts`. Agregar "Playa" o "Estadio" requiere tocar código. La idea es moverlas a la base y administrarlas desde el panel.

## Qué vas a poder hacer

- Nueva sección en el panel: **Visita Los Cabos → Categorías**.
- Crear, editar, reordenar, activar/desactivar tipos de lugar.
- Por cada categoría: nombre, ícono (elegido de una galería visual), color del pin, degradado de respaldo para tarjetas sin foto, orden y estado activo.
- Al capturar un lugar, el selector de categoría se llena con las categorías reales de la base.
- Los filtros del mapa, los pines, las tarjetas destacadas, el detalle del lugar y las rutas usan automáticamente el nombre, ícono y color que definas.
- Se crean desde el arranque las 5 actuales más **Playa**, **Estadio**, **Cafés**, **Miradores** y **Vida nocturna** (editables o borrables).

## Detalles técnicos

**Base de datos (una migración)**
- Nueva tabla `place_categories`: `slug` único, `label`, `icon` (nombre del ícono Lucide), `color`, `gradient`, `sort_order`, `active`, timestamps + trigger de `updated_at`.
- GRANTs: `select` a `anon` y `authenticated` (catálogo público), `all` a `service_role`; RLS activo con lectura pública y escritura solo para admins vía `is_admin(auth.uid())`.
- `places.category` pasa de enum `place_category` a `text` con FK a `place_categories.slug` (`on update cascade`, `on delete restrict`), preservando los valores existentes. Igual para las lecturas de `fan_route_stops` (no cambia estructura, solo el tipo derivado).
- Semilla con las 5 categorías actuales (mismos íconos/colores que hoy) y las nuevas.

**Frontend**
- Nuevo hook `usePlaceCategories()` que devuelve las categorías activas indexadas por slug, con fallback si aún no cargan.
- `src/lib/visita-los-cabos-data.ts`: `PlaceCategory` pasa a `string`; `CATEGORY_META`/`CATEGORY_GRADIENT` se conservan solo como respaldo mínimo mientras carga la consulta.
- `MapView.tsx`: los pines dejan de depender de la lista manual de SVGs (`categoryIconSvg`) y se renderizan con un root de React por marcador, así cualquier ícono de Lucide funciona sin agregar rutas SVG a mano.
- `CategoryIcon.tsx`: resolución dinámica de íconos desde el mapa `icons` de `lucide-react`, con `Star` como respaldo.
- `FilterPills`, `FeaturedStrip`, `PlaceDetail`, `RoutesPanel` y `Rutas.tsx` (admin) leen la metadata del hook.
- `Lugares.tsx` (admin): selector de categoría alimentado desde la base.
- Nuevo `src/pages/admin/sections/Visita/Categorias.tsx` con CRUD, orden por arrastrar/flechas, selector visual de ícono (galería curada de ~40 íconos Lucide de lugares) y selector de color; registrado como pestaña en `Visita/index.tsx`.

**Nota:** las categorías en uso no se pueden borrar (la FK lo impide); en ese caso el panel sugiere desactivarla o reasignar los lugares.

# Tienda: imágenes de relleno + velocidad percibida sin mover la base

La mudanza de región queda descartada. Esto cubre los dos puntos pedidos.

## Diagnóstico 1: de dónde salen las imágenes de ejemplo de la Tienda

**Causa encontrada, es código, no caché.** Está en un solo lugar:

`src/components/tienda/HeroCarousel.tsx` tiene un arreglo `FALLBACK` con **tres slides de ejemplo hardcodeados** que importan las imágenes de diseño inicial `src/assets/tienda-hero-1.jpg`, `-2.jpg`, `-3.jpg`, con textos inventados ("Temporada 25/26", "Hoodies bordados", "Piezas contadas"). La línea 53 hace: si la consulta aún no trajo datos → **muestra los tres de ejemplo**.

Y aquí está el detalle que explica lo que ves: en la base **sí hay un slide real** ("Temporada 26/27 / Jersey Oficial", con foto subida al almacenamiento) y es el único publicado. Pero como la consulta al hero viaja a París (~200 ms) y el arreglo de ejemplo se pinta desde el primer instante, **la Tienda arranca mostrando el carrusel viejo de ejemplo y solo después salta al real**. Con conexión lenta ese "después" se alarga y parece que la tienda quedó en las imágenes viejas.

Revisión de las otras tres piezas que pediste:

- **Hero editorial** → origen: `FALLBACK` de ejemplo primero, luego `shop_hero_slides` (1 fila real publicada). **Aquí está el bug.**
- **Banners** (`PromoBanner`) → origen: solo `shop_banners`. La tabla está **vacía (0 filas)**, así que hoy no se pinta ningún banner. Sin imágenes de ejemplo.
- **Tarjetas de producto** (`ProductCard`) → origen: **Shopify real**, imágenes del propio catálogo. Sin imágenes de ejemplo.
- **Fotos de producto de ejemplo** (`src/assets/tienda/jersey-local.jpg`, `bufanda.jpg`, etc.): quedaron en el proyecto pero **ya no las usa ningún componente** — son peso muerto del diseño inicial.

No es caché, no hay service worker, no hay caché persistida todavía. Es el arreglo de respaldo hardcodeado.

### Arreglo

1. Eliminar el arreglo `FALLBACK` y sus tres importaciones de `HeroCarousel.tsx`.
2. Mientras carga: **esqueleto** del hero (mismo tamaño y forma, sin contenido inventado) — no salta ni cambia el diseño.
3. Si la tabla no tiene slides publicados: **no se pinta el hero** (estado vacío limpio), la Tienda arranca directo en el catálogo. Nunca contenido de ejemplo.
4. Borrar del proyecto los archivos de imagen huérfanos: `tienda-hero-1/2/3.jpg` y las seis fotos de `src/assets/tienda/`.

## Diagnóstico 2 y plan de caché (base sigue en París)

Medido antes: consultas de 7-19 ms, latencia a Francia ~150-250 ms por viaje, ~10 peticiones en la portada y varias encadenadas. `QueryClient` hoy es `new QueryClient()` sin opciones: `staleTime: 0`, nada persistido, cada carga en frío paga todo de nuevo.

1. **Caché persistida en el navegador** (`localStorage` + persistidor de React Query). A partir de la primera visita, el contenido casi-estático se pinta al instante desde el navegador y se refresca por detrás (stale-while-revalidate).
2. **`staleTime` por tipo de dato**, deliberadamente en minutos, no horas:
   - Editorial (plantel, noticias, lugares, tipos de lugar, patrocinadores, equipos, torneo, hero/banners de tienda): **5 min**.
   - Liga (partidos, posiciones, goleo): **1 min**.
   - Partido en vivo, marcador y eventos: **sin caché larga**, se mantiene fresco como hoy.
   - Perfil/pase del usuario: sin persistir (dato personal fuera del almacenamiento local).
3. **Romper el encadenamiento**: hoy `useMatches`/`useStandings`/`useScorers` esperan a que `useActiveSeason` conteste. Se resuelve pidiendo torneo activo y datos de liga en paralelo (temporada resuelta del lado de la base), eliminando un viaje completo a París de la ruta crítica.
4. **Consultas más ligeras**: columnas explícitas en lugar de `select *` en partidos, posiciones, lugares, patrocinadores, hero y banners; y límite en partidos (jornada actual + próximos, no las 234 de golpe). El calendario completo se sigue pudiendo ver, se carga al abrirlo.
5. **Cada bloque independiente**: cada sección de la portada pinta con su propio esqueleto en cuanto llegan SUS datos. La tienda (Shopify) o el plantel no bloquean a las demás.

### Que la caché NO deje contenido viejo pegado

- **Nunca se sirve caché sin refrescar**: se pinta lo guardado y en el mismo momento se dispara la petición de fondo. Un cambio en el panel aparece en el siguiente refresco (segundos), y como máximo tras el `staleTime` del tipo de dato (5 min editorial, 1 min liga).
- **Invalidación al desplegar**: la caché persistida se guarda con una clave que incluye la versión del sitio (`buster`). Al publicar una versión nueva, la clave cambia y **la caché vieja se descarta sola**.
- **Vida máxima**: la caché guardada expira a las 24 h; pasado eso se pide todo de nuevo aunque el usuario no haya vuelto.
- **Escrituras del admin**: tras guardar en el panel se invalida la consulta correspondiente, así el propio administrador ve su cambio de inmediato, no en 5 min.

## Detalles técnicos

- `src/components/tienda/HeroCarousel.tsx`: quitar `FALLBACK` y los tres `import`; añadir esqueleto en carga y retorno nulo si no hay slides.
- Borrar `src/assets/tienda-hero-1.jpg`, `-2.jpg`, `-3.jpg` y `src/assets/tienda/*.jpg` (huérfanos).
- `src/App.tsx`: `QueryClient` con `defaultOptions` (`staleTime`, `gcTime`, `refetchOnWindowFocus: false`, `retry: 1`) + `PersistQueryClientProvider` con `createSyncStoragePersister` (`localStorage`, `buster` = versión de build, `maxAge` 24 h) y `shouldDehydrateQuery` que excluye consultas de usuario/pase/vivo.
- `src/hooks/useLeague.ts`: desacoplar `useSeasonKey` de las consultas de liga; `MATCH_SELECT` con columnas explícitas; límite en partidos.
- `src/hooks/useClub.ts`, `useVisitaLosCabos.ts`, `useSponsors.ts`, `useShopContent.ts`, `usePlaceCategories.ts`: columnas explícitas y `staleTime` por consulta.
- Sin cambios de diseño, funcionalidad ni esquema. No hay migraciones.

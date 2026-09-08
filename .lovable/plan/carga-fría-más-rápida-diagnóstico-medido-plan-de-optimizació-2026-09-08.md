# Carga fría más rápida: diagnóstico medido + plan de optimización

## PASO 1 — Diagnóstico (medido con una compilación real del sitio)

### 1. Descarga inicial (JavaScript)
Compilación de producción: las rutas **sí** están divididas (hay ~40 archivos pequeños: Tienda 33 KB, Club 17 KB, Accesos 28 KB, admin 4–12 KB…), pero **todo el peso real está en un solo archivo compartido**:

```text
index-*.js   3,442 KB  (901 KB comprimido)   <-- se descarga SIEMPRE al entrar
Tienda           33 KB
ZonaPartido      33 KB
Club             17 KB
...resto         < 30 KB cada una
```

Es decir: dividir por rutas ya funciona, pero no sirve de nada porque casi 1 MB comprimido viaja en la primera carga. Causas concretas encontradas:

- **El mapa (mapbox-gl) se carga en la home.** `HomeMiniMap` lo importa de forma directa, así que la librería del mapa (la más pesada del proyecto, con su hoja de estilos) entra en la primera carga aunque el mapa esté abajo y sea solo un adelanto decorativo.
- **El registro/login completo se carga en la home.** `Index` importa `AuthFlow` + `AuthModal` + previsualización del pase de forma directa (con validaciones, países, Turnstile), aunque solo se usan si el usuario abre el modal.
- **No hay separación de librerías comunes** (React, animaciones, base de datos, formularios, gráficas, carruseles): todo se apila en ese único archivo, y cualquier cambio futuro invalida la caché completa del visitante recurrente.

### 2. Imágenes
Todas están en JPG/PNG sin versión moderna: **12 MB en total** en el proyecto. Las más pesadas:

| Imagen | Peso | Dónde |
|---|---|---|
| mobile-team-bg.jpg | 2.2 MB | Accesos |
| don-koll.jpg | 2.1 MB | Tu Club |
| adn-cabeno.jpg | 993 KB | Tu Club |
| accesos-page-hero.jpg | 957 KB | Accesos |
| sponsor-05.png | 88 KB | banda de patrocinadores (en todas las páginas) |
| stadium-hero.jpg | 63 KB | portada de Inicio (aceptable) |

- Cero WebP/AVIF, cero `srcset`: en celular se baja la misma imagen gigante que en escritorio.
- La carga diferida existe solo en algunos componentes sueltos (escudos, fotos de jugadores); en Inicio y en los bloques de abajo las imágenes se piden de inmediato.
- Sin placeholder: mientras bajan quedan huecos y la página “salta”.
- `tienda-hero-jersey.jpg` (3 MB) y `accesos-hero.jpg` (957 KB) están en el proyecto y **no se usan**.

### 3. Consultas al abrir Inicio
La home dispara **~9–10 consultas** a la vez: productos de la tienda, lugares, tipos de lugar, noticias, plantel, muro de afición, equipo juvenil, temporada activa y calendario de partidos.

- El cliente de datos **no tiene caché configurada** (`new QueryClient()` sin ajustes) y la mayoría de estos hooks **no** definen tiempo de frescura: plantel, noticias, lugares, afición, juvenil y partidos se vuelven a pedir en cada visita y cada vez que el usuario regresa a la pestaña, aunque casi nunca cambian.
- Solo tienen caché: productos, patrocinadores, contenido de tienda, tipos de lugar y temporada activa (2–5 min).
- Tiempo real: correctamente limitado a los eventos del partido (`match_events`), no está “todo en vivo”. Eso está bien y no se toca.
- Ninguna consulta bloquea el HTML, pero la portada no se pinta con contenido propio hasta que llegan datos, porque varios bloques no tienen esqueleto de carga.

**Resumen de causas reales:** (1) casi 1 MB de código comprimido en la primera carga, dominado por el mapa y el registro cargados en la home; (2) imágenes JPG/PNG de 1–2 MB sin formato moderno ni tamaños por dispositivo; (3) datos casi estáticos sin caché, repedidos en cada visita.

## PASO 2 — Optimización propuesta

### A. Bajar la descarga inicial
1. Cargar el mapa solo cuando se necesita: `HomeMiniMap` y `MapView` pasan a carga diferida (`lazy` + `Suspense`) y el adelanto de Inicio se monta solo al acercarse por scroll. El mapa deja de pesar en la primera carga.
2. `AuthFlow`, `AuthModal` y la previsualización del pase pasan a carga diferida en Inicio y en la tarjeta de próximo partido: solo bajan al abrir el modal.
3. Separar librerías comunes en grupos estables (React/router, animaciones, base de datos, formularios, mapa, gráficas) para que el visitante recurrente reutilice la caché.
4. Borrar las dos imágenes no usadas y revisar barriles de componentes que arrastran piezas no utilizadas.
Meta: primera carga por debajo de ~250 KB comprimidos.

### B. Imágenes
1. Generar versiones WebP/AVIF comprimidas y varios tamaños (móvil/tablet/escritorio) para las imágenes del proyecto, con `srcset`; las pesadas de 1–2 MB bajan a decenas de KB.
2. Un componente único de imagen con `loading="lazy"` + `decoding="async"` + relación de aspecto fija para todo lo que está debajo de la primera pantalla, y carga prioritaria solo para la portada.
3. Placeholder difuso/tono sólido mientras cargan, sin cambiar el diseño ni provocar saltos.
4. Las imágenes que suben desde el panel (plantel, noticias, lugares, tienda) se piden al tamaño que se muestra, no en original.

### C. Datos: caché de lo estático, en vivo solo el partido
1. Caché por defecto en el cliente de datos (frescura ~5 min, conservación 24 h, sin repetir al volver a la pestaña).
2. Frescura larga para lo casi fijo: plantel, noticias, afición, juvenil, lugares, tipos de lugar, equipos, posiciones, goleo, calendario.
3. Frescura corta solo para el partido protagonista y su marcador; el tiempo real de eventos se queda igual.
4. Guardar la caché en el navegador para que la segunda visita pinte al instante.
5. Esqueletos de carga por bloque: la portada y lo visible aparecen de inmediato y cada sección se pinta al llegar sus datos, sin esperar al resto.

### D. Primera pantalla rápida
Portada + tarjeta de partido se renderizan primero; tienda, mapa, afición y Fan Zone se montan al acercarse por scroll.

## Reglas respetadas
Sin cambios de diseño ni de funcionalidad; Match Zone, Tu Club, tienda y panel siguen igual. Todo es rendimiento.

## Detalles técnicos
- `vite.config.ts`: `build.rollupOptions.output.manualChunks` por grupos; añadir generación de WebP/AVIF y variantes por ancho para los assets del repo.
- `React.lazy` + `Suspense` para `HomeMiniMap`, `MapView`, `AuthFlow`, `AuthModal`, `FanPassPreview`, `StripeEmbeddedCheckout`.
- `QueryClient` con `defaultOptions.queries`: `staleTime: 5 * 60_000`, `gcTime: 24h`, `refetchOnWindowFocus: false`, `retry: 1`; `staleTime` explícito por hook en `useClub`, `useLeague`, `useVisitaLosCabos`; persistencia en `localStorage`.
- Nuevo `components/ui-lcu/SmartImage.tsx` (srcset + lazy + aspect-ratio + placeholder) usado en Inicio, Club, Tienda y Visita Los Cabos.
- Hook de observador de intersección para montar bloques bajo la primera pantalla.
- Sin migraciones ni cambios en base de datos.

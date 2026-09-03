# Carga instantánea al cambiar de página

Hoy, al entrar a una página nueva, se ve un spinner en blanco porque pasan tres cosas en serie: se descarga el código de esa página, luego se piden los datos, y sólo entonces se dibuja algo. Además, cada visita vuelve a pedir datos que ya se tenían.

## Qué se va a hacer

**1. Precargar el código de las páginas antes de que se haga clic**
- Al terminar de cargar el inicio, precargar en segundo plano (idle) las rutas principales: Match Zone, Tu Club, Tienda, Conoce Los Cabos, Fan Zone, Mi Pase.
- Precargar también al pasar el mouse por encima / tocar un enlace del header, menú y bottom nav.
- Resultado: al hacer clic, el código ya está en memoria y la navegación es inmediata.

**2. Caché global de datos (react-query)**
- Configurar valores por defecto: `staleTime` 5 min, `gcTime` 30 min, sin refetch al enfocar la ventana, sin reintentos infinitos.
- Así, la segunda visita a una página muestra los datos al instante desde caché y actualiza en silencio.
- Prefetch de las consultas más usadas (partidos, tabla, plantel, patrocinadores, catálogo de tienda, lugares) apenas arranca la app.

**3. Skeletons en lugar de spinner de página completa**
- Cada página renderiza de inmediato su estructura (título, tabs, tarjetas en gris) y sólo las piezas con datos muestran skeleton.
- Cambiar el fallback de `Suspense` por un skeleton de layout, no un spinner centrado.

**4. Aligerar el paquete inicial**
- Mapbox (`mapbox-gl`, ~200 KB+), `recharts`, `html-to-image` y el CSS del mapa se cargan sólo cuando el componente que los usa aparece en pantalla (import dinámico + carga al entrar en viewport para el mini-mapa de inicio).
- Dividir vendor en chunks (`react`, `supabase`, `framer-motion`, `radix`) para mejor caché entre navegaciones.

**5. Tienda (Shopify) más rápida**
- El catálogo se precarga al arrancar y se comparte entre Tienda, Buscar y ficha de producto; al abrir un producto se usa el dato ya cacheado del listado mientras llega el detalle completo (sin pantalla vacía).

## Detalles técnicos

- `QueryClient` con `defaultOptions.queries`: `staleTime: 5*60_000`, `gcTime: 30*60_000`, `refetchOnWindowFocus: false`, `retry: 1`.
- Módulo `src/lib/route-preload.ts` con mapa ruta → `() => import(...)`, compartido por `App.tsx` (lazy) y los enlaces de navegación; disparo con `requestIdleCallback`.
- `src/lib/prefetch.ts` con `queryClient.prefetchQuery` de las claves existentes en `useLeague`, `useClub`, `useSponsors`, `useProducts`, `useVisitaLosCabos`.
- Componentes de skeleton reutilizables en `src/components/lcu` siguiendo el look actual (cards #0D0F13, hairline #1F2329).
- `vite.config.ts`: `build.rollupOptions.output.manualChunks` para vendors.
- Sin cambios de diseño ni de lógica de negocio: mismos datos, mismas vistas.

## Nota

Esto hace la navegación interna prácticamente instantánea. La primera carga absoluta del sitio seguirá dependiendo del render en el navegador; si más adelante quieres HTML servido ya renderizado (mejor primer pintado y SEO), existe la opción de migrar a la plantilla nueva con SSR — [qué aporta la actualización](https://lovable.dev/blog/building-apps-using-tanstack-start).

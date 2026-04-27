## Nueva página de inicio — hub editorial de Los Cabos United

La página `/` actual es un placeholder (logo + 3 contadores en 0). La voy a reconstruir como una **experiencia real de inicio** que muestra lo más importante de cada sección de la app y lleva al usuario a explorarla. Sigue el sistema de diseño dark + acento `#00abc4` ya establecido y reutiliza datos/lógica que ya existen.

### Estructura (de arriba hacia abajo)

1. **Hero atmosférico**
   - Imagen de fondo `stadium-hero.jpg` con gradient overlay oscuro.
   - Escudo + "TEMPORADA 2025–26" en label cyan, título "Los Cabos United", subtítulo corto sobre la pasión y el club.
   - Dos CTAs: "Ver Match Zone" (primario cyan) y "Únete a la afición" (glass) → `/accesos`.
   - Animación de entrada con framer-motion.

2. **Próximo partido / Partido en vivo**
   - Reusa `MatchHeroCard` y la query exacta de `ZonaPartido` (live → finished < 24h → next scheduled).
   - Si está en vivo, renderiza `LiveMatchPlayer`; si no, `MatchHeroCard` con countdown.
   - Header de sección "PRÓXIMO PARTIDO" + link "Ver todos →" hacia `/zona-partido`.

3. **Accesos rápidos (bento grid)**
   - Grid 2×3 (mobile) / 3 columnas (desktop) de tarjetas con icon + título + subtítulo:
     - Tu Club → `/club`
     - Match Zone → `/zona-partido`
     - Fan Zone → `/fan-zone`
     - Accesos → `/accesos`
     - Tienda → `/tienda`
     - Conoce Los Cabos → `/conoce-los-cabos`
   - Cada card con hover glow sutil del acento de la sección, animación stagger al entrar.

4. **Sé Amo del Paraíso (banner de membresías)**
   - Banner full-width con gradient `#001a1f → #0a0a0a`, título "Únete y sé Amo del Paraíso", 3 chips con los tiers (Gold / Premium / Platino) y precio desde, CTA "Ver accesos" → `/accesos`.
   - Reutiliza el mismo lenguaje visual de la página `/accesos`.

5. **Tienda Oficial — destacados**
   - Carrusel horizontal scroll-snap de productos destacados de Shopify usando `useShopifyProducts` (los primeros 6).
   - Reusa `EditorialProductCard` para mantener consistencia.
   - Header "TIENDA OFICIAL" + link "Ver tienda →".
   - Skeletons mientras carga; oculta la sección elegantemente si no hay productos.

6. **Fan Zone — minijuegos teaser**
   - Si hay sesión: muestra mini versión de `FanStatsHero` (puntos + nivel + ranking).
   - Si no hay sesión: card invitando a registrarse para ganar puntos, con CTA que abre `AuthModal`.
   - Debajo, 3 cards horizontales con los minijuegos destacados desde `GAMES`.

7. **Conoce Los Cabos — strip editorial**
   - Strip horizontal con 4–5 lugares destacados (`FeaturedStrip` o cards propias usando `PLACES`).
   - Header "VISITA LOS CABOS" + link "Explorar mapa →" hacia `/conoce-los-cabos`.

8. **Patrocinadores**
   - Mini reminder: "Hecho posible por nuestros patrocinadores" + link a `/patrocinios`.
   - El sponsor carousel global del footer ya lo cubre, así que aquí solo un micro-CTA — no duplicar.

### Detalles técnicos

- Todo en `src/pages/Index.tsx`. Componentes auxiliares pequeños inline o en `src/components/home/` si crecen (`HomeHero`, `QuickAccessGrid`, `AccesosBanner`, `ShopStrip`, `FanZoneTeaser`, `LosCabosStrip`).
- Reutilizar componentes existentes: `MatchHeroCard`, `LiveMatchPlayer`, `EditorialProductCard`, `FanStatsHero`, `FeaturedStrip`, `AuthModal`.
- Datos:
  - Match: `supabase.from("matches")` con la lógica live/finished/scheduled de `ZonaPartido`.
  - Productos: `useShopifyProducts()`.
  - Lugares: `PLACES` de `@/lib/visita-los-cabos-data`.
  - Juegos: `GAMES` de `@/components/fan-zone/games`.
  - Usuario: `useAuth()`.
- Animaciones: framer-motion con `whileInView` para revelar secciones al hacer scroll, stagger en grids.
- Mobile-first: todo el layout funciona en 375px; carruseles horizontales con `snap-x snap-mandatory` y `scrollbar-hide`.
- Sin tocar navbar, footer, sponsor carousel, ni otras páginas. Sin cambiar tokens globales.

### Lo que NO cambia

- Rutas existentes, navbar, footer, sponsor carousel global.
- Otras páginas (`/zona-partido`, `/tienda`, `/accesos`, etc.) quedan intactas.
- Tokens de diseño / variables CSS globales.

### Archivos a crear/editar

- Editar: `src/pages/Index.tsx` (reescritura completa).
- Crear (opcional, si los componentes inline crecen demasiado): `src/components/home/HomeHero.tsx`, `QuickAccessGrid.tsx`, `AccesosBanner.tsx`, `ShopStrip.tsx`, `FanZoneTeaser.tsx`, `LosCabosStrip.tsx`.

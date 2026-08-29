# Plan: Rediseño de la página INICIO (riqueza visual + nuevo orden)

## Diagnóstico

- `src/pages/Index.tsx` hoy es funcional pero plana: todo son tarjetas uniformes, sin hero inmersivo, con poca presencia visual.
- El Hero actual vive en una tarjeta con borde (`rounded-2xl border bg-surface-1`) en lugar de una foto a todo lo ancho fundida al fondo.
- Componentes/hooks reales ya disponibles para reusar (sin duplicar):
  - `useActiveSeason()` — nombre del torneo activo para el eyebrow del Hero.
  - `useFeaturedMatch()` + `NextMatchCard` — próximo partido / en vivo / resultado.
  - `useClubPlayers()` + lógica `groupOf()` de `RosterSection` (constante GROUPS) — plantel agrupado por posición.
  - `useFanPosts()` — posts reales de afición con red/autor/texto/imagen.
  - `useClubNews(3)`, `useYouthTeam()`, `SeasonSummary`.
  - `useProducts()` (Shopify), `usePlaces()` + `HomeMiniMap` + `useCategoryMeta`.
  - `MiniGameCard` + `GAMES` — mismas tarjetas teaser que usa la página Fan Zone.
  - `LcuTabs` (variante `underline`), `SectionHeader`, `lcuButtonClasses`.
- Acento de estado EN VIVO: rosa del sistema `#F199C1` (confirmado por el usuario).

## Cambios

### 1. Hero inmersivo (sin tarjeta)
- Foto del estadio a todo lo ancho con márgenes negativos (`-mx-4 md:-mx-6 -mt-4`) — sin borde, sin recuadro.
- Degradado de abajo hacia arriba que funde la foto con el fondo `#060708` de la página.
- Encima: escudo, eyebrow con el nombre del torneo activo real, "Tu equipo. Tu paraíso.", CTA "Obtener mi pase" / "Ver mi pase" (con sesión) + "Ya tengo cuenta". Se conserva el flujo de auth actual (AuthFlow + AuthModal).

### 2. Match Zone (2ª sección, con presencia)
- `pre`: `NextMatchCard` con cuenta regresiva (ya existe).
- `live`: tarjeta con dot pulsante y etiqueta "EN VIVO" en rosa `#F199C1`, marcador grande Space Grotesk y botón "Ver en vivo" rosa.
- `finished`: último resultado sobrio. `empty`: estado elegante con enlace a Match Zone.

### 3. Tu Club (3ª sección) — sub-bloques en este orden
- `SeasonSummary` (resumen de temporada real, ya existe).
- **Plantel con tabs**: `LcuTabs` subrayado (Porteros/Defensas/Mediocampistas/Delanteros/Cuerpo técnico), datos reales de `useClubPlayers`. Cada grupo se desliza horizontal (scroll sin scrollbar visible, cards 104px, foto + número dorsal) y botón "Ver todos (N)" que expande a grid. CTA "Ver plantel completo" → /club. Tarjetas sin flip.
- **Afición**: mini-carrusel horizontal de posts reales (`useFanPosts`) con ícono de red (Facebook/Instagram/X), autor, texto e imagen; CTA a /club. Oculto si no hay posts.
- **Equipo juvenil**: card ancha con foto + degradado a negro, nombre del equipo y etiqueta del torneo (Copa Telmex). Oculto si no hay equipo.
- **Noticias**: grid de 3 con foto h-36 + degradado, fecha y título (mismo patrón visual que Mi Club).

### 4. Tienda Oficial (4ª) — como quedó, `ProductCard` + `useProducts`.

### 5. Visita Los Cabos (5ª) — como quedó: mini-mapa real + carrusel de lugares con icono/color de categoría.

### 6. Fan Zone teaser (6ª) — más llamativa, vibra de su página
- Card hero: sello "Próximamente", título "Juega y gana siendo de los nuestros", texto, CTA "Crear mi cuenta gratis" / "Ir a Fan Zone" (con sesión).
- "Qué va a haber": grid 2×4 con las mismas `MiniGameCard` de la página Fan Zone (4 minijuegos con sello Próximamente).
- "Qué se gana": 3 pills visuales (Cabo Coins, Niveles, Premios) con imágenes y degradado.
- Sin ranking ni puntos falsos.

### Detalles de sistema
- Todo dentro del sistema: fondo `#060708`, superficies `bg-surface-1` + hairline, cyan `#00ABC4` solo en chrome (eyebrows, "Ver todo", iconos de sección). Rosa `#F199C1` únicamente en el estado en vivo.
- Inter + Space Grotesk, números tabulares; radios 16px/12px; cero ornamento.
- Estados vacíos elegantes (sin ceros ni placeholders).
- Solo se edita `src/pages/Index.tsx`; se añade componente `XLogo` inline (como en FanWall) para la etiqueta de red X. No se toca ninguna otra página ni el admin.

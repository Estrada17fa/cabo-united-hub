# Rediseño de INICIO: resumen real del sitio

## Diagnóstico (qué hay hoy en `src/pages/Index.tsx`, 1211 líneas)

El Inicio es hoy la página **menos conectada** del sitio: casi todo su contenido está escrito a mano dentro del propio archivo.

| Bloque | Fuente hoy | Realidad |
|---|---|---|
| Hero | Imágenes + texto local. CTA único "Únete a la afición" → `/accesos` | No usa el flujo de auth (`AuthFlow` / `AuthModal`) ni cambia si hay sesión |
| Tarjetas de abonos en el hero | `HERO_ABONOS` local con precios ($0 / $1,499 / $2,499 / $4,499) | Debe eliminarse |
| Plantel | `CLUB_ROSTER`: 22 jugadores **inventados** (Rafael Márquez, Bruno Cardozo…) | Mi Club ya lee `players` real con `useClubPlayers()` |
| Academia | `CLUB_ACADEMY_CATEGORIES` local (Semillero, Curso de Verano) + CTA "Inscribe a tu hijo" | No existe esa sección; lo real es el equipo juvenil (`useYouthTeam()`) |
| Noticias | `CLUB_NEWS`: 3 noticias inventadas con fechas de 2025 | Existe `useClubNews()` + `NewsSection` real |
| Fan Zone | `RankingCard` + `PrizesCarouselCard` ("Juega y Gana Premios") | Fan Zone es página teaser "próximamente"; el ranking y los puntos no existen |
| Tienda | `useProducts()` → Shopify real | Correcto, solo homologar el look |
| Visita Los Cabos | `usePlaces()` real, pero con `CATEGORY_THEME` local hardcodeado (5 categorías) | Las categorías ya son dinámicas (`usePlaceCategories`); falta el mini-mapa |
| Próximo partido | No existe en Inicio | Disponible vía `useFeaturedMatch()` + `NextMatchCard` |

Sobre el look: el archivo usa colores literales (`#00abc4`, `#0f0f0f`, `rgba(255,255,255,0.07)`) en lugar de los tokens del sistema (`bg-surface-1`, `border-hairline`, `text-primary`), tipografías por `style={{fontSize}}` en vez de las utilidades (`text-display-*`, `num-display`), y el cyan aparece en eyebrows, títulos, "ver todo", iconos y chips a la vez — exactamente el "regado" que hay que corregir.

## Plan

### 1. Hero
- Se conserva la foto, el escudo y "Tu equipo. **Tu paraíso.**".
- Eyebrow de temporada leído del torneo activo (`useActiveSeason`), no hardcodeado.
- CTA principal: **"Obtener mi pase"** → abre `AuthFlow` (el registro de 3 pasos que ya existe). Con sesión activa cambia a **"Ver mi pase"** → `/mi-pase`.
- CTA secundario de texto: "Ya tengo cuenta · Iniciar sesión" → `AuthModal` (mismo diálogo del header). Se oculta con sesión.
- Se elimina el degradado radial cyan decorativo; queda solo el degradado a negro para legibilidad.

### 2. Fuera el bloque de abonos
Se borran `HERO_ABONOS` y `HeroAbonoCards` por completo. Ningún precio en Inicio.

### 3. Próximo partido (nuevo, arriba)
Debajo del hero, tarjeta de próximo partido con `useFeaturedMatch()` y el `NextMatchCard` de Match Zone, con CTA "Ir a Match Zone". Si no hay partido programado, el bloque no se muestra.

### 4. Tu Club con datos reales
- **Plantel**: se borran las 22 fichas inventadas; se usa `useClubPlayers()`. Vista resumen: carrusel horizontal de las tarjetas del plantel (mismo formato visual que Mi Club, sin el flip para no duplicar lógica) + "Ver plantel completo".
- **Noticias**: se borra `CLUB_NEWS`; se reutiliza `NewsSection` (o su hook `useClubNews(3)`) mostrando las 3 publicadas más recientes.
- **Equipo juvenil**: reemplaza Academia. Se reutiliza `YouthTeamCard` con `useYouthTeam()` — informativo (nombre, torneo, descripción, foto), sin "inscribe a tu hijo" ni niveles.
- Estados vacíos con una línea sobria ("Pronto habrá noticias del club.", etc.), nunca ceros ni placeholders.

### 5. Fan Zone → teaser
Se eliminan `RankingCard` y `PrizesCarouselCard` de Inicio. Queda una tarjeta: título "Fan Zone · Próximamente", una línea ("Minijuegos, Cabo Coins y premios para la afición"), tres chips de lo que viene y CTA "Ir a Fan Zone" (+ "Crear cuenta" si no hay sesión). Cero números.

### 6. Visita Los Cabos con mini-mapa
- Bloque nuevo con **mini-mapa Mapbox** (altura ~220px móvil / 280px desktop) que pinta los pines reales de `usePlaces()` con los mismos íconos/colores de categoría (`usePlaceCategories`), sin controles ni interacción de arrastre; el mapa entero es un enlace a `/conoce-los-cabos` y hay un CTA "Explorar mapa".
- Debajo, la tira de lugares destacados, ahora con las categorías dinámicas en vez del `CATEGORY_THEME` local.

### 7. Tienda
Se mantiene el catálogo Shopify real; solo se homologa el marco (superficies, hairline, tipografía) dejando las fotos de producto como protagonistas y el cyan únicamente en el botón/precio de oferta.

### 8. Homologación del look
- Reemplazar todos los literales de color por tokens (`bg-surface-1/2/3`, `border-hairline`, `text-foreground`, `text-secondary-fg`, `text-muted-foreground`, `text-primary`).
- Usar el `SectionHeader` compartido de `@/components/ui-lcu` y borrar el `SectionHeader` local; se van los eyebrows cyan con guioncito y los "Ver todo" en cyan (pasan a texto secundario).
- Tipografía: `text-display-*` para títulos, `num-display` (Space Grotesk tabular) para números; se quitan los `style={{fontSize}}` sueltos.
- Radios 16px en tarjetas, 11–12px en tiles/botones; se elimina `SectionDivider` (el hairline de las tarjetas ya separa) y las sombras/glows decorativos.

## Verificación
- Recorrido con Playwright en viewport móvil (393px) revisando hero con y sin sesión, plantel, noticias, juvenil, teaser de Fan Zone y mini-mapa.
- `rg` para confirmar que no quedan datos de ejemplo (`CLUB_ROSTER`, `CLUB_NEWS`, `HERO_ABONOS`, `CATEGORY_THEME`) ni precios en Inicio.

## Notas técnicas
- Solo se toca `src/pages/Index.tsx` y se agrega un componente de mini-mapa (`src/components/home/HomeMiniMap.tsx`) porque el `MapView` de Visita está acoplado a la selección/filtros de esa página; comparte el mismo token, íconos y metadata de categorías.
- Sin cambios en base de datos, auth, admin ni en Match Zone / Mi Club / Fan Zone / Visita / Tienda.

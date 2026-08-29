# Inicio: riqueza visual y nuevo orden

## Diagnóstico

Lo que hay hoy en `src/pages/Index.tsx`:

- El hero es una tarjeta con borde (`rounded-2xl border`) y la foto recortada dentro: por eso se siente plano y desconectado.
- Orden actual: Hero → Match Zone → Tu Club → Fan Zone → Tienda → Visita. Fan Zone queda a media página y en versión "tímida" (un párrafo y un link).
- El plantel en Inicio es un carrusel plano de 10 jugadores sin agrupar por posición.
- No hay bloque de Afición, aunque `useFanPosts()` ya existe y el admin ya cura esos posts.
- Noticias y juvenil ya leen datos reales, pero con tarjetas pequeñas y sin tratamiento de foto.
- El eyebrow de temporada del hero no existe; `useActiveSeason()` ya expone `name` / `season_key`.

Piezas reales reutilizables (no se duplican ni se modifican):

- `useFeaturedMatch()` (estado `live` / `pre` / `post`) y `NextMatchCard` de Match Zone.
- `useClubPlayers`, `useClubNews`, `useFanPosts`, `useYouthTeam`, `SeasonSummary`.
- `usePlaces` + `HomeMiniMap`, `useProducts` + `ProductCard`.
- Fan Zone: `GAMES` y `MiniGameCard` (mismos minijuegos que su página, en estado "Próximamente").
- `LcuTabs`, `SectionHeader`, `lcuButtonClasses`, `useActiveSeason`.

## Nuevo orden

Hero → Match Zone → Tu Club (temporada + plantel + afición + juvenil + noticias) → Tienda Oficial → Visita Los Cabos → Fan Zone.

## Cambios

### 1. Hero inmersivo
Foto a todo lo ancho, sin borde ni recuadro: se sale del contenedor a full-bleed y termina en un degradado a `#060708` que funde con Match Zone. Encima: escudo, eyebrow con el nombre real de la temporada activa, título "Tu equipo. Tu paraíso.", CTA "Obtener mi pase" (o "Ver mi pase" con sesión) + enlace "Ya tengo cuenta". Se conserva el flujo `AuthFlow` / `AuthModal` tal cual.

### 2. Match Zone destacado
Primera sección después del hero, con más presencia. Con partido programado: `NextMatchCard` (escudos, fecha, countdown). En vivo: tarjeta destacada con marcador, punto rojo "EN VIVO" y CTA fuerte "Ver en vivo". Finalizado: último resultado sobrio. Sin partidos: estado vacío elegante con CTA a Match Zone.

### 3. Plantel con tabs por posición
Tabs Porteros / Defensas / Mediocampistas / Delanteros / Cuerpo Técnico (solo los grupos con jugadores), misma agrupación que Mi Club. Cada grupo se desliza horizontalmente; botón "Ver todos" expande el grupo en grilla. Tarjetas visualmente iguales a Mi Club pero sin flip. Al final, "Ver plantel completo" → Mi Club.

### 4. Afición (nuevo)
Mini-carrusel horizontal con los posts reales curados en el admin: etiqueta de red, autor, texto e imagen. CTA "Ver toda la afición" → Mi Club. Si no hay posts, la sección no se renderiza.

### 5. Noticias y juvenil con más cuerpo
Noticias: tarjetas con foto más alta y degradado a la base con el título encima. Juvenil: tarjeta ancha con foto, degradado y chip del torneo.

### 6. Fan Zone llamativa (al final)
Bloque con tratamiento más rico dentro del sistema: superficie oscura, título fuerte "Juega y gana siendo de los nuestros · Próximamente", los mismos minijuegos de su página como preview con sello "Próximamente", tres píldoras de recompensa (Cabo Coins, niveles, premios) y CTA "Crear mi cuenta" / "Ir a Fan Zone". Sin ranking ni puntos falsos.

### 7. Tienda y Visita
Se conservan como están (catálogo Shopify real, mini-mapa con pines reales), solo cambian de posición.

## Detalles técnicos

- Único archivo editado: `src/pages/Index.tsx`. Se pueden extraer subcomponentes locales dentro del mismo archivo (Hero, MatchBlock, RosterTabs, FanStrip, FanZoneTeaser) para mantenerlo legible.
- Full-bleed del hero con `-mx-4 md:-mx-6` respecto al contenedor actual y `mask`/gradiente `from-background` al pie; el resto de la página mantiene su padding.
- Cyan solo en chrome: eyebrows, "ver todo", tabs activos, botón primario. Nada de glows nuevos.
- Estados vacíos por bloque (sin partido, sin plantel, sin noticias, sin afición) con texto sobrio, sin ceros ni placeholders.
- No se toca Match Zone, Mi Club, Fan Zone, Visita, Tienda ni el admin; solo se consumen sus hooks y componentes.

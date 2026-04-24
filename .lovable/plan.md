

# Match Zone en vivo: reproductor + card compacta

## Qué cambia

Cuando un partido está **EN VIVO** (no aplica a finalizado ni próximo), la página `/zona-partido` muestra:

1. **Reproductor embebido en vivo** (YouTube o Facebook) ocupando el ancho completo arriba.
2. **Card compacta debajo** (ancho 100%, más baja que la actual) con:
   - Marcador y escudos de los equipos
   - Línea del tiempo (`MatchTimeline`)
   - Solo 2 botones: **Vota por el Amo del Partido** (primario) + **Visita Los Cabos** (secundario)
   - Se elimina **Ver en Vivo** (ya no aplica, el video está arriba)

Para partidos **próximos** o **finalizados**, la `MatchHeroCard` actual se queda exactamente como está (sin cambios).

## Layout en vivo

```text
┌───────────────────────────────────────┐
│   🔴 EN VIVO  ·  Jornada X  ·  45'    │  ← badge live
├───────────────────────────────────────┤
│                                       │
│       [ REPRODUCTOR YOUTUBE/FB ]      │  ← 16:9, ancho 100%
│                                       │
├───────────────────────────────────────┤
│  🛡 Local  2 — VS — 1  Visitante 🛡   │  ← card compacta
│  ─────────●──────●──────────────●──   │  ← timeline
│  [ 🏆 Vota por el Amo ] [ 📍 Visita ] │  ← 2 CTAs
└───────────────────────────────────────┘
```

## Detalles técnicos

**1. Fuente del stream**
- Usar el campo existente `match.live_stream_url` de la tabla `matches`.
- Detectar plataforma por URL:
  - YouTube (`youtube.com/watch?v=`, `youtu.be/`, `youtube.com/live/`) → embed `https://www.youtube.com/embed/{id}?autoplay=1&mute=1`
  - Facebook (`facebook.com/.../videos/`, `fb.watch/`) → embed `https://www.facebook.com/plugins/video.php?href={encoded}&autoplay=1&mute=1`
- Si `live_stream_url` está vacío o el formato no se reconoce: mostrar fallback con mensaje "Transmisión próximamente" + botón a redes sociales del club.

**2. Componente nuevo: `LiveMatchPlayer.tsx`**
- Recibe `match` como prop.
- Renderiza:
  - Header pequeño con badge `EN VIVO {minuto}'` + jornada
  - `<iframe>` 16:9 responsive con `aspect-video` de Tailwind, `rounded-2xl`, borde verde sutil (mismo `hsl(142 76% 45% / 0.5)` que ya se usa)
  - Card compacta debajo con: escudos pequeños (usar `TeamCrest`), marcador grande centrado, timeline, 2 botones
- Mantener estética dark bento: fondo `#121212`, primary cyan para acentos del marcador, tipografía Poppins bold.

**3. Integración en `ZonaPartido.tsx`**
- Si `featuredMatch.status === "live"` → renderizar `<LiveMatchPlayer match={featuredMatch} />` en lugar de `<MatchHeroCard />`.
- En cualquier otro caso (scheduled / finished) → mantener `<MatchHeroCard />` como hoy.
- Tabs (`MatchTabs`) y secciones (`PartidosSection`, `LeagueTables`) no cambian.

**4. Botones en la card compacta**
- **Vota por el Amo del Partido**: mismo estilo primario verde animado que ya existe en `MatchHeroCard` (full width o 60%).
- **Visita Los Cabos**: estilo secundario glass/outline (40%).
- Layout: grid 2 columnas en mobile y desktop, gap-2.

**5. Responsive**
- Mobile: reproductor full width con padding lateral mínimo, card compacta debajo apilada.
- Desktop: mismo layout vertical (no se divide en columnas) para mantener foco en el video.

## Archivos a crear / modificar

- **Nuevo**: `src/components/match-zone/LiveMatchPlayer.tsx`
- **Nuevo**: `src/lib/streamUrl.ts` (helper `getEmbedUrl(url): { platform, embedUrl } | null`)
- **Modificado**: `src/pages/ZonaPartido.tsx` (switch entre `LiveMatchPlayer` y `MatchHeroCard` según `status`)

## Lo que NO se toca

- `MatchHeroCard.tsx` (queda igual para próximos/finalizados)
- Tablas de liga, lista de partidos, tabs, hook `useLiveMatch`, esquema de DB
- Estética general, navegación, otras páginas

## Requisito de datos

Para que el reproductor funcione, cada partido en vivo necesita tener `live_stream_url` poblado con el link público del stream de YouTube o Facebook. Si está vacío, se muestra el fallback automáticamente.


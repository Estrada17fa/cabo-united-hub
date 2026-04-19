
## Plan: Marcador en vivo + Timeline para Match Zone

### Contexto
Cuando llega la hora del partido, el countdown debe transformarse automáticamente en una experiencia "EN VIVO" con marcador, timeline de eventos y botón de transmisión.

### Datos disponibles
- `matches`: tiene `home_score`, `away_score`, `status`, `match_date`, `match_time`
- `match_events`: tiene `match_id`, `event_type`, `minute`, `team`, `player_name`, `description` — perfecto para el timeline
- Falta: campo para URL de transmisión en vivo

### Cambios necesarios

**1. Base de datos (migración)**
- Agregar columna `live_stream_url` (text, nullable) a `matches` para el botón "VER EN VIVO"

**2. Hook `useLiveMatch` (nuevo)**
- Detecta si el partido está "en vivo": `match_time <= now <= match_time + 2h` o `status === 'live'`
- Calcula minuto actual del partido
- Suscripción realtime a `matches` (cambios de score) y `match_events` (nuevos eventos)

**3. Componente `LiveScoreboard` (nuevo)**
- Reemplaza al `CountdownTimer` cuando el partido está en vivo
- Marcador grande tipo: `2 — 1` con badge pulsante "EN VIVO" rojo
- Minuto del partido animado (ej. `67'`)
- Animación pulse en el marcador cuando hay gol nuevo

**4. Componente `MatchTimeline` (nuevo)**
- Timeline vertical moderna (línea central con nodos a izquierda/derecha según equipo local/visitante)
- Iconos por tipo de evento: ⚽ gol, 🟨 amarilla, 🟥 roja, 🔄 cambio
- Animación stagger con framer-motion al cargar
- Nuevos eventos entran con `slide-in` + glow primary
- Scroll horizontal en mobile, vertical en desktop

**5. Actualizar `MatchHeroCard.tsx`**
- Lógica condicional:
  - Si `isLive` → mostrar `LiveScoreboard` + `MatchTimeline` + botón "VER EN VIVO" (rojo pulsante)
  - Si no → mostrar `CountdownTimer` + botones existentes (Boletos / Visita Los Cabos)
- Botón "VER EN VIVO": abre `live_stream_url` en nueva pestaña; si no hay URL, deshabilitado con tooltip

**6. Actualizar realtime publication**
- `ALTER PUBLICATION supabase_realtime ADD TABLE matches, match_events`

### Estructura visual del timeline (mobile-first)
```text
   LOCAL          |          VISITA
 ⚽ Pérez 23'    ●
                  ●─── 🟨 López 31'
 🔄 Cambio 45'   ●
                  ●─── ⚽ García 58'
```
Línea vertical central en `hsl(189 100% 38% / 0.3)`, nodos circulares con glow.

### Archivos a tocar
- `supabase/migrations/...` — agregar `live_stream_url` + realtime
- `src/hooks/useLiveMatch.tsx` (nuevo)
- `src/components/match-zone/LiveScoreboard.tsx` (nuevo)
- `src/components/match-zone/MatchTimeline.tsx` (nuevo)
- `src/components/match-zone/MatchHeroCard.tsx` (editar — render condicional)

### Pregunta menor
Si no hay `live_stream_url` cargada, el botón "VER EN VIVO" se mostrará deshabilitado. Los eventos del timeline son demo hasta que se inserten datos reales en `match_events`.

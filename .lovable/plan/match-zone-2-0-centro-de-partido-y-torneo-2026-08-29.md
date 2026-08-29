# Match Zone 2.0 — Centro de partido y torneo

Objetivo: una sola página que funcione como "segunda pantalla" del aficionado. En día de partido manda el en vivo; el resto de los días manda el próximo partido y el torneo. Todo editable desde el panel de admin con la mínima cantidad de clics posible.

## Decisiones de producto (lo que propongo, no literal)

1. **Una sola vista con estado, no pestañas grandes.** La página detecta el momento y se reordena sola:
   - **Día de partido en vivo** → Live Room arriba (video + marcador + minuto + timeline), torneo abajo.
   - **Pre-partido** (sin partido en curso) → Next Match Card con cuenta regresiva, sede, rival y CTA de boletos; torneo abajo.
   - **Post-partido reciente (48 h)** → resultado final con timeline resumida y liga de vuelta al centro.
   Así nadie ve una sección vacía y no hay que "elegir" nada.

2. **El en vivo pide cuenta, el resto es abierto.** Marcador, minuto, timeline, tabla y calendario son públicos (bueno para SEO y para compartir). Solo el reproductor queda tras el muro: se ve el marco borroso con el marcador encima y un botón que abre el mismo formulario de registro/login que ya existe (`AuthModal` / `AuthFlow`, misma tabla). Argumento visible: "Crea tu cuenta gratis y gana XP viendo el partido".

3. **Marcador automático desde la timeline.** El admin no lleva dos contadores: cada evento de gol que captura suma al marcador; el marcador manual queda como override por si hay que corregir. Realtime al público, sin recargar.

4. **Reloj por fases, no por cronómetro libre.** `scheduled → 1T → descanso → 2T → finalizado` con marcas de tiempo; el minuto se calcula en el cliente (45+N con compensación). Nada avanza solo: el admin manda.

5. **Extras que sí aportan (y no son ruido):**
   - **Reacciones en vivo + contador de fans conectados** (realtime, sin chat: cero moderación, mucha sensación de multitud).
   - **Predicción de marcador** antes del silbatazo: acierto = XP/Cabo Coins. Conecta Match Zone con Fan Zone y da razón para volver antes de cada partido.
   - **Jugador del partido**: votación abierta durante el 2T y post-partido; el resultado alimenta el jugador del mes que ya existe.
   - **Compartible**: tarjeta de resultado final descargable (mismo recurso que ya usamos en el pase) para Stories.
   - **CTA de boletos contextual**: solo aparece en partidos de local y se convierte en "Ver cómo llegar" cuando arranca el partido.
   - **Recordatorio**: "Avísame" que agrega el partido al calendario del teléfono (.ics, sin backend).

## Diseño (sistema propio, aparte del resto del sitio)

Look de app deportiva, oscuro y editorial. Bento sí, pero jerárquico: un módulo héroe ancho arriba y mosaico abajo, no una cuadrícula plana de cajas iguales.

- **Superficies**: negro profundo con un gradiente sutil de estadio detrás del héroe; tarjetas con borde de 1 px muy tenue y esquinas 24 px; sin sombras pesadas.
- **Acentos**: cian para datos y navegación; rosa reservado exclusivamente para el estado EN VIVO (punto pulsante, borde del reproductor). Verde/ámbar/rojo solo en zonas de clasificación de la tabla.
- **Tipografía**: Poppins según las reglas del proyecto (Bold títulos y marcadores, Semibold chips/etiquetas, Regular texto). Marcador en cifras muy grandes con números tabulares.
- **Datos densos legibles**: tabla de posiciones con escudos, fila propia resaltada, racha de últimos 5 en puntitos; scroll horizontal contenido en móvil.
- **Movimiento discreto**: entradas con fade/rise, marcador que hace flip al cambiar, gol con destello del acento, timeline que crece desde el minuto. Nada rebota.
- **Mobile-first 393 px**, todo con área táctil ≥ 44 px, sticky bar inferior con marcador comprimido cuando el video queda fuera de vista.

### Estructura de la página

```text
[ chip EN VIVO / PRÓXIMO ]         estado del momento
┌───────────────────────────────┐
│  LIVE ROOM / NEXT MATCH       │  video o cuenta regresiva
│  escudos · marcador · minuto  │
│  reacciones · fans viendo      │
└───────────────────────────────┘
[ Timeline del partido ]           eventos con icono y minuto
[ Boletos ]      [ Predicción ]    bento 2 col
[ Jugador del partido ]
── Torneo ─────────────────────
[ Posiciones | Partidos | Goleo | Equipos ]   tabs internas
```

## Panel de admin (`/admin/match-zone`)

Pensado para operarse con una mano desde la banca:

- **Consola de partido (pestaña principal)**: selector del partido destacado, campo del link de YouTube/Facebook con vista previa del embed, botones grandes de fase (Iniciar 1T · Descanso · Iniciar 2T · Finalizar), compensación, y captura de evento en un solo renglón (minuto · tipo · jugador · equipo) que ya suma al marcador. Override manual del marcador. Aviso si un partido quedó abierto >150 min.
- **Torneo**: equipos (nombre, corto, escudo a storage, grupo, "es nuestro"), partidos (jornada, grupo, fecha, sede, marcador, penales, link de boletos), posiciones calculadas con ajuste manual + nota y botón de recalcular, goleo, fase final.
- Todo con la automatización de puntos del reglamento (local 3, visita con +2 goles 4, empate ≥2 goles con penales 1+1) recalculando la tabla al guardar.

## Detalles técnicos

**Base de datos (migración nueva, el modelo anterior se borró):**
- `teams` (nombre, short_name, escudo, grupo, is_ours, season, active)
- `matches` (season, jornada, grupo, home/away, fecha, sede, `phase`, marcas de inicio de cada mitad, `stoppage_minutes`, marcador, penales, `stream_url`, `tickets_url`, `is_featured`, `home_points`/`away_points`)
- `match_events` (match_id, minuto, tipo enum: gol, autogol, penal, amarilla, roja, cambio, nota; jugador, equipo, descripción) + trigger que recalcula el marcador desde los goles salvo override
- `league_standings` (+ `manual_adjustment`, `adjustment_note`) recalculada por función/trigger; `top_scorers`
- `match_predictions` (user_id, match_id, home/away, único por usuario+partido) y `motm_votes`
- `match_reactions` (agregado por partido y tipo, con rate limit por usuario)
- RLS: lectura pública de torneo, escritura solo admin; predicciones/votos/reacciones solo del propio usuario; GRANTs explícitos en cada tabla.
- Realtime en `matches`, `match_events` y reacciones.

**Frontend** (`src/components/match-zone/`, sistema visual propio en tokens locales del módulo):
`MatchZoneShell` (decide el estado), `LiveRoom`, `StreamGate`, `Scoreboard`, `MatchClock`, `MatchTimeline`, `NextMatchCard` (countdown + .ics), `TicketsCTA`, `PredictionCard`, `MotmVote`, `LiveReactions`, `TournamentPanel` (tabs) con `StandingsTable`, `FixturesList`, `TopScorers`, `TeamsGrid`; hooks `useMatchZone`, `useLiveMatch`, `useLeague`.
Admin: `src/pages/admin/MatchZoneAdmin.tsx` con pestañas Consola / Torneo y entrada nueva en `ADMIN_SECTIONS`.
También se reactiva la validación de partido en `issue-match-qr` contra el nuevo `matches`.

## Orden de construcción

1. Migración del modelo de torneo + partido + eventos, con puntos y tabla automáticos.
2. Admin: consola de partido y CRUD de torneo (para poder cargar datos reales de inmediato).
3. Match Zone pública: shell por estado, Live Room con muro de acceso, timeline, torneo.
4. Capa de engagement: predicción, jugador del partido, reacciones, compartible, .ics.

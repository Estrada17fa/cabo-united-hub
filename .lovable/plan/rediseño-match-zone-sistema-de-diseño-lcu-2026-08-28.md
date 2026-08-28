# Rediseño Match Zone + sistema de diseño LCU

## Paso 1 — Diagnóstico (estado real)

**1. Estructura actual de Match Zone (`/zona-partido`)**
- `ZonaPartido.tsx` elige el partido destacado con 3 consultas en cascada (en curso por fase → finalizado últimas 24h → siguiente programado) y muestra dos chips (`MatchTabs`): "En vivo" y "Liga".
- Modo En vivo: si la fase es activa muestra `LiveMatchPlayer` (iframe + timeline + gate de login); si no, `MatchHeroCard` con cuenta regresiva.
- Modo Liga: `LeagueTables` con tarjeta del club (fila apretada de 4 mini-cuadros), 4 tabs de texto plano (Partidos / Posiciones / Fase final / Goleo) y subcomponentes ya construidos: `LeagueFixtures`, `StandingsTable`, `FinalStageBracket`, `TopScorersBoard`, `LeagueScoringInfo`, `LeagueGroupSwitch`, `TeamCrest`.
- Problemas detectados: colores hardcodeados fuera del tema (verde `hsl(142 76% 45%)` en el reproductor, `#121212` literal), tipografía única sin jerarquía display, densidad excesiva (texto de 9–11px), cero textura de marca, cyan usado en muchos elementos a la vez, y componentes con estilos duplicados en cada archivo en lugar de primitivas compartidas.

**2. Modelo de datos de la liga** (todo ya existe en el backend)
- `matches`: temporada, jornada, grupo, local/visita, marcador, penales, sede, `live_stream_url`, `match_summary_url`, `status` (scheduled/live/finished), `phase` (scheduled → first_half → halftime → second_half → finished), `first_half_started_at`, `second_half_started_at`, `stoppage_minutes`, `stage`, `home_points`/`away_points` automáticos.
- `league_standings` (recalculada por trigger + `manual_adjustment`), `top_scorers`, `teams` (escudo, grupo, `is_ours`), `match_events` (minuto, tipo, jugador, equipo), `players` (foto, número).
- "Nuestro próximo partido" hoy NO filtra por nuestro equipo: toma cualquier partido programado. Se corrige.
- El campo de link de transmisión y el estado por partido **ya existen**; no hace falta migración para eso.

**3. Login y gate del en vivo**
- `useAuth` + `AuthModal` (login) y `AuthFlow` (registro en 3 pasos). En `LiveMatchPlayer` el gate ya cubre solo el video; el resto ya es público. Se conserva intacto, solo se reestiliza.

**4. Admin**
- `/admin/match-zone` (`MatchZoneAdmin.tsx`, un solo archivo grande) con pestañas Equipos / Partidos / Posiciones / Goleo / En vivo; ya edita `live_stream_url`, fase, marcador y eventos de `match_events`.

## Decisiones de UX que cambio respecto al pedido (con razón)

1. **Tipografía**: usaré Poppins en todas sus variantes (400–900) como se confirmó; la jerarquía "display" se logra con tamaño/tracking/peso extremo (títulos 900 con tracking negativo, números tabulares grandes) vía token `--font-display`, listo para cambiar a otra fuente en una línea.
2. **Sin campos nuevos en la base de datos**: `live_stream_url` + `status`/`phase` ya cubren el Paso 3. Añadir un segundo toggle sería estado duplicado y contradictorio.
3. **La fase manual manda siempre** (tu elección): el reloj y el "EN VIVO" salen de la fase. La hora del partido solo *sugiere* al admin ("este partido ya debió empezar / lleva 150 min abierto"), evitando marcadores congelados y transmisiones fantasma.
4. **Cuenta regresiva y reproductor son el mismo hero**, un solo componente que cambia de contenido según fase — no dos tarjetas distintas.
5. **Timeline siempre visible**: en vivo el del partido en curso; sin partido, el del último jugado con etiqueta "Último partido", para que la página nunca se sienta vacía.
6. **Cyan con disciplina**: solo hero/foco y estado activo. Rosa exclusivo para EN VIVO y un dato puntual. Marcadores y stats en blanco, no en cyan.
7. **Goleo con foto real** desde `players.photo_url` haciendo match por nombre; sin foto, iniciales sobre superficie elevada (nunca gris placeholder).
8. **Assets**: genero foto de estadio oscurecida premium y un patrón de ola SVG con identidad LCU, reemplazables cuando subas los reales.

## Paso 2 — Sistema de diseño (base de todo el sitio)

Tokens en `index.css` + `tailwind.config.ts`:
- `--background: #000000`; superficies `--surface-1 #0D0D0F`, `--surface-2 #141418`, `--surface-3` para hover; bordes `--border-hairline`.
- `--primary` cyan `#00ABC4`, `--pop` rosa `#F199C1`; texto `--foreground`, `--text-secondary`, `--text-label`.
- Radios `--radius-card: 22px`; sombras/glow suaves; escala de espaciado generosa; `--font-display` / `--font-body`.
- Utilidades: `.surface`, `.surface-2`, `.wave-motif` (patrón de ola en máscara, baja opacidad), `.text-display-xl/lg/md`, `.num-hero` (tabular nums).

Componentes base nuevos en `src/components/ui-lcu/`:
`HeroCard`, `BentoTile`, `MatchCard`, `SectionHeader`, `LcuTabs` (pill y underline), `LcuButton` (primary cyan / ghost / outline), `LiveBadge` (pulso rosa), `Crest` (escudo real con fallback de iniciales), `WaveMotif`. Micro-animaciones con Framer Motion: entrada escalonada de tarjetas, pulso del badge, tick de la cuenta regresiva.

## Paso 2b — Match Zone rediseñada

**Toggle EN VIVO / LIGA**: pills compactos, altura cómoda, indicador cyan animado, punto rosa cuando hay partido en vivo.

**Modo EN VIVO**
- Hero único sobre foto de estadio oscurecida + ola sutil:
  - Con partido nuestro en fase activa y link: cabecera (escudos reales, marcador grande, minuto, `LiveBadge` rosa) + reproductor embebido; sin sesión, overlay "Inicia sesión o crea tu cuenta para ver el partido en vivo" con botones a login y registro (gate solo del video).
  - Sin en vivo: cuenta regresiva enorme (D / H / M / S en tiles) al próximo partido **de LCU**, con escudo del rival, fecha, hora, sede y chip Local/Visita, más CTA de boletos si es de local.
  - Embed inteligente: YouTube/Facebook se embeben (`getEmbedUrl` ya existe, lo amplío a Twitch/Vimeo/`.m3u8` y links genéricos); si no es embebible, botón "Ver transmisión".
- Debajo: **Timeline** vertical mobile / horizontal desktop con iconos por tipo (gol + autor, tarjetas, cambios, inicio, MT, final), nuestro equipo resaltado en cyan, y en vivo con refresco automático.
- Cierre: mini-tarjeta "Cómo se puntúa" y acceso rápido a Posiciones.

**Modo LIGA**
- HeroCard "Nuestro equipo": escudo grande + mosaico bento (PTS destacado, POS, JJ, DIF, G-E-P) con números grandes.
- Tabs con peso visual: **Partidos** (agrupados por jornada, escudos reales, próximo partido resaltado, penales en chip, boletos en locales nuestros), **Posiciones** (escudos, fila nuestra en cyan, racha de 5, zonas de clasificación), **Fase final** (bracket o estado vacío elegante), **Goleo** (podio con foto de jugador + lista).

## Paso 3 — Admin (`/admin/match-zone`)

- Se divide el archivo en componentes por pestaña (mantiene funcionalidad, gana mantenibilidad).
- Pestaña Partidos: campo de link de transmisión con **validación y vista previa** del embed detectado, selector de fase/estado, marcador, penales, sede, jornada, grupo.
- Aviso inteligente: banderas "debió iniciar" (pasó la hora y sigue programado) y "abierto hace >150 min" para cerrar partidos olvidados.
- Pestaña En vivo: control de fase, minuto agregado y alta rápida de eventos del timeline (gol con jugador de `players`, tarjeta, cambio, MT, final), utilizable en vivo o post-partido; los goles quedan atribuidos al jugador para poder alimentar el goleo.

## Alcance técnico

- Archivos nuevos: `src/components/ui-lcu/*`, `src/assets/wave-motif.svg`, foto de hero generada, `src/components/match-zone/LiveHero.tsx`, `MatchTimelineV2.tsx`, `admin/match-zone/*`.
- Reescritura de estilos en `MatchTabs`, `LeagueTables`, `LeagueFixtures`, `StandingsTable`, `TopScorersBoard`, `FinalStageBracket`, `MatchHeroCard`, `LiveMatchPlayer` usando solo tokens (se eliminan verdes y hex hardcodeados).
- `useLeague`/`ZonaPartido`: el próximo partido se filtra por el equipo `is_ours`.
- Sin migraciones de base de datos. Sin cambios en auth.

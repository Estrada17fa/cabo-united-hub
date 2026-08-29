# Match Zone — rediseño y nuevo sistema visual del sitio

Referencia confirmada con la imagen adjunta. Detalles leídos de ella, ya incorporados: label superior en mayúsculas con tracking amplio y gris muted ("PRÓXIMO PARTIDO · JORNADA 12"); matchup con escudo · nombre en dos líneas · "VS" gris · rival + escudo; 4 tiles de countdown con número grande tabular y label chico en mayúsculas (segundos en cyan, el resto en blanco); meta en una fila con iconos de calendario y pin; chip "LOCAL" con borde y texto cyan; botón primario cyan de ancho completo; encabezado "Torneo" con selector "Apertura 2026" a la derecha; tabs de subrayado; tabla con encabezado en mayúsculas muted, escudos chicos y la fila de LCU con barra cyan a la izquierda, número y puntos en cyan y nombre en negrita. Bottom nav de 5 ítems: Inicio · Match Zone · Tu Club · Fan Zone · Tienda.

## Diagnóstico de cómo está hoy

- `ZonaPartido.tsx` ya tiene un hero adaptativo (en vivo / próximo / post), timeline, torneo con tabs y extras (predicción, jugador del partido, reacciones). El modelo de datos está completo y con realtime: `teams` (con `is_ours`), `matches` (fase manual, `stream_url`, `tickets_url`), `match_events`, `league_standings`, `top_scorers`. No hay que duplicar nada.
- El look actual no corresponde: tarjetas sin borde hairline, radios de 24px, acento rosa (`pop`) usado en el estado EN VIVO, tabs tipo pill (`LcuTabs`), escudos como círculos con iniciales, tipografía Poppins.
- `useFeaturedMatch` **no filtra por nuestro equipo**: toma cualquier partido próximo del torneo. Bug confirmado a corregir.
- No existe bottom nav; la navegación vive en `Header` + menú lateral.
- Fuentes: solo Poppins cargada en `index.html` y mapeada en Tailwind.

## Decisiones confirmadas

- Tipografía nueva **global**: Inter para UI/cuerpo, Space Grotesk para números y display. Reemplaza la regla de Poppins en todo el sitio.
- Bottom nav **global**, presente en toda la app.

## 1. Sistema de diseño (base para todo el sitio)

Tokens nuevos en `index.css` + `tailwind.config.ts`:

- Fondo `#060708`; superficies `#0D0F13` (tarjeta) y `#08090B` (tile interno); borde hairline 1px `#1F2329` obligatorio en toda tarjeta y tile.
- Acento único cyan `#00ABC4`. Se retira el rosa como acento de estado; EN VIVO pasa a cyan. Texto: blanco `#FFFFFF`, secundario `#9BA1A9`, muted `#5C616A`. Jerarquía por peso/tamaño, nunca por color.
- Radios: tarjeta 16px, tile/botón 11–12px.
- Cero ornamento: se eliminan gradientes radiales decorativos, glows y texturas de los componentes de Match Zone.
- Números siempre `tabular-nums` vía utilidad `.num`.

Componentes reutilizables nuevos en `src/components/lcu/`:

`TopBar` (menú · escudo LCU · avatar, una sola fila) · `BottomNav` (iconos Lucide + label, activo cyan) · `Crest` (forma de escudo real, PNG del equipo) · `StatTile` · `CountdownTimer` · `MatchupRow` · `LeagueTabs` (subrayado 2px cyan) · `StandingsTable` · `PrimaryButton`.

`LcuTabs` (pills) queda solo para las páginas aún no migradas; Match Zone usa `LeagueTabs`.

## 2. Estructura de la página

```text
TopBar: menú · escudo · avatar
Match Zone  +  subtítulo corto
┌ HERO ADAPTATIVO ───────────────────┐
│ EN VIVO: video (con gate) +        │
│ escudos · marcador grande · badge  │
│ NO EN VIVO: "Próximo partido ·     │
│ Jornada X", matchup, 4 tiles       │
│ D/H/M/S, meta, botón primario      │
└────────────────────────────────────┘
TIMELINE (solo si en vivo o reciente)
TORNEO: nombre + selector
  Partidos | Posiciones | Goleo | Fase final   (subrayado)
  tabla densa: # · escudo · equipo · PJ · DIF · PTS
  fila LCU: fondo sutil + barra cyan izquierda + negritas
BOTTOM NAV
```

- El hero es uno solo y cambia de contenido según la fase manual del partido; la hora solo sugiere.
- El gate de login se aplica **solo al video**: sin sesión, overlay con "Inicia sesión o crea tu cuenta para ver el partido en vivo" y los botones existentes. No se toca el sistema de login ni los permisos.
- Botón primario del countdown: Boletos si es de local con `tickets_url`, si no "Recordarme" (.ics).

## 3. Lógica a corregir

- `useFeaturedMatch` filtra únicamente partidos donde `home_team.is_ours` o `away_team.is_ours`: en vivo nuestro > destacado nuestro > próximo nuestro > último nuestro finalizado (48 h).
- Timeline resalta en cyan los eventos de nuestro equipo.
- Sin cambios de esquema ni de backend.

## Detalles técnicos

- `index.html`: cargar Inter (400/500/600/700) y Space Grotesk (500/700), retirar Poppins. `tailwind.config.ts`: `sans: Inter`, `display: Space Grotesk`; tokens `bg`, `surface`, `hairline`, `accent`, `fg`, `fg-secondary`, `fg-muted`, radios.
- Archivos principales: `src/index.css`, `tailwind.config.ts`, `index.html`, `src/components/lcu/*` (nuevos), `src/components/layout/AppLayout.tsx` (+ BottomNav), `src/components/layout/Header.tsx` (TopBar de una fila), `src/pages/ZonaPartido.tsx`, `src/components/match-zone/*` (Scoreboard, StreamGate, NextMatchCard, MatchTimeline, StandingsTable, FixturesList, TopScorers, TeamsGrid, TournamentPanel, TeamCrest→Crest), `src/hooks/useMatchZone.ts`.
- Se retiran del hero los extras que no están en la referencia (reacciones, predicción, jugador del partido) para respetar la limpieza; los componentes quedan en el repo por si los reactivamos en otra sección. Confírmame si prefieres conservarlos visibles.
- Escudos: `Crest` usa el PNG de `teams.logo_url` con máscara de escudo; en desarrollo hay fallback de iniciales, en producción se espera el PNG real.
- Migración tipográfica: el resto de páginas hereda Inter/Space Grotesk automáticamente por las clases base; los ajustes finos página por página se hacen después.

## Orden de construcción

1. Tokens y fuentes (design system).
2. Componentes reutilizables `src/components/lcu/`.
3. TopBar + BottomNav globales.
4. Match Zone: hero adaptativo, gate de video, timeline.
5. Sección Torneo con tabs de subrayado y tabla densa.
6. Fix de `useFeaturedMatch` (filtro `is_ours`) y verificación en preview móvil/desktop.

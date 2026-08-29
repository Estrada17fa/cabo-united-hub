# Mi Club: homologación al look Match Zone + datos reales

## Diagnóstico (cómo está hoy)

- La página vive completa en `src/pages/Club.tsx` (1289 líneas) con **todos los datos inventados en código**: `SEASON_STATS`, `ROSTER` (18 jugadores ficticios), `PLAYER_OF_WEEK`, `ACADEMY_CATEGORIES`, `NOTES`, `FAN_POSTS`.
- El resumen de arriba (`PositionMiniCard`) es una píldora con "3° Lugar Actual" y una racha `W W D L W` **fija en código**, con glow y colores en hex/HSL en línea (fuera del sistema de tokens).
- El "Amo del Partido" es una tarjeta destacada dentro de `RosterCard` con Diego Hernández y "×4 veces".
- Academia: 5 niveles (`Semillero`, `Academia`, `Fuerzas Básicas`, `Curso de Verano`, `Campamento`) + botón "Inscribe a tu hijo".
- Noticias (`NotesCard`): 3 tarjetas con `href="#"`, sin imagen real (degradados de color), no abren nada.
- Afición (`FanTickerCard`): carrusel vertical automático de 5 posts falsos con iconos de Facebook/Instagram/X.
- Estilo: usa `border-border`, `bg-card`, hex en línea, glows y `shadow-primary/20` — no el hairline/superficies de Match Zone.

Datos reales disponibles hoy en el backend:
- `league_standings`: **18 filas** ya calculadas por el admin de Torneo (posición, puntos, PJ, DIF, columna `form`), con el equipo LCU marcado (`teams.is_ours`). Solo **1 partido finalizado**, así que el resumen debe verse bien casi vacío.
- `players`: **8 jugadores reales** capturados en el panel (foto, dorsal, posición, bio).
- `news`: tabla existente (título, extracto, contenido, imagen, autor, publicado, fecha) pero **0 registros** y **sin columna de categoría**.
- No existe tabla para posts de afición ni para el equipo juvenil.

## Cambios

### 1. Resumen de temporada (arriba)
Reemplazar la píldora por una fila de tiles estilo Match Zone (hairline `#1F2329`, fondo `#0D0F13`, números Space Grotesk tabulares, cyan solo en el dato principal):
- Posición en su grupo, Puntos, PJ, DIF y racha de últimos 5 (verde ganó / gris empató / rojo perdió).
- Fuente única: `league_standings` del torneo activo (los mismos hooks `useStandings`/`useActiveSeason` que ya usa Match Zone) más los últimos partidos finalizados de LCU para la racha (más fiable que la columna `form`).
- Sin partidos capturados → estado vacío sobrio: "La temporada arranca pronto", sin ceros.

### 2. Quitar "Amo del Partido"
Se elimina la tarjeta destacada; el plantel arranca directo con las tarjetas de jugadores.

### 3. Plantel conectado al panel
Las tarjetas leen los jugadores reales de `players` (foto, dorsal, nombre, posición, bio breve), con los filtros por posición derivados de los datos (Porteros / Defensas / Mediocampistas / Delanteros / Cuerpo técnico). Se conserva la mecánica actual (tabs + "ver todos") y el look se homologa. Estado vacío si aún no hay jugadores.

### 4. Academia → equipo juvenil (informativo, editable)
- Se quitan los 5 niveles de inscripción y el botón "Inscribe a tu hijo".
- Queda un bloque informativo: nombre del equipo, torneo en el que participa (Copa Telmex) y descripción breve, editable desde el panel.
- Estructura pensada para crecer a academias después sin rehacerla.

### 5. Noticias desplegables
- Leen de `news` (solo publicadas), ordenadas por fecha.
- Al tocar una noticia se abre una hoja inferior (bottom sheet en móvil / modal en desktop) con imagen, categoría, fecha y contenido completo; al cerrar sigues en la lista, sin cambiar de página.
- Se agrega **categoría** a noticias (con su campo en el editor del panel) para la etiqueta visual.

### 6. Afición curada manual
- Sin APIs de Instagram/Facebook/X.
- Nueva sección **"Afición"** en el panel de administración (junto a Noticias) para capturar posts: autor/usuario, red de origen (solo etiqueta visual), texto, imagen opcional, link opcional, publicado, orden.
- La sección de Afición del sitio deja de usar datos falsos y muestra estos posts en el carrusel actual, con look homologado.

## Notas técnicas

- Backend: 1 migración — columna `category` en `news`; tabla `fan_posts`; tabla `club_info` (o fila única de configuración) para el bloque del equipo juvenil. Todas con lectura pública de contenido publicado y escritura solo para administradores, más los permisos correspondientes.
- Panel: nueva sección `Afición` y un editor del bloque juvenil (dentro de la misma sección o en Noticias), siguiendo los patrones ya usados (`AdminSheet`, `ImageUploadField`, `AdminUI`).
- Frontend: `Club.tsx` se parte en componentes bajo `src/components/club/` (SeasonSummary, RosterSection, YouthTeamCard, NewsSection + NewsSheet, FanWall) reutilizando los primitivos de Match Zone; se eliminan los hex en línea a favor de tokens.
- No se toca Match Zone, el admin de Torneo, ni el shell/header/footer. Sin cambios de lógica de puntos ni de auth.

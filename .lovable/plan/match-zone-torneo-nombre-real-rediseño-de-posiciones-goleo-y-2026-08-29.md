# Match Zone → Torneo: nombre real + rediseño de Posiciones, Goleo y Fase final

## Diagnóstico (verificado)

- **Nombre del torneo**: "Apertura 2026" está escrito a mano en `TournamentPanel.tsx` (línea 26). Los datos de liga se filtran por una clave interna de temporada fija (`"2026"`). La tabla de temporadas de la base existe pero está **vacía**, y el panel de admin de Match Zone (En vivo · Partidos · Equipos · Posiciones · Goleo) **no tiene** hoy ninguna pantalla de torneo, así que "Primera Premier" no está guardado en ningún lado.
- **Grupos**: los equipos, partidos y posiciones sí tienen campo de grupo, pero hoy está vacío (hay 1 equipo registrado, Los Cabos United, sin grupo). O sea: el sistema soporta grupos, pero el torneo actual no los usa.
- **Posiciones**: tabla HTML plana sin tarjeta contenedora ni encabezado homologado; ya resalta LCU pero sin barra cyan de 2px consistente, y no muestra G/E/P ni zona de clasificación.
- **Goleo**: podio de 3 tarjetas que muestra el **escudo del equipo**, no la foto del jugador; el resto es una lista simple. El dato de goleo es **global del torneo** (no tiene campo de grupo). Los goleadores pueden estar ligados a un jugador del plantel, de donde saldría la foto.
- **Fase final**: no existe vista propia; reutiliza la lista de partidos y, si no hay partidos de fase final, muestra una caja de texto genérica. Los partidos de fase final no tienen campo de "ronda"; se pueden ordenar por jornada.

## A. Nombre real del torneo

- Usar la tabla de temporadas ya existente (campo de nombre) como fuente del nombre del torneo. Sin campos nuevos.
- Nueva pestaña **Torneo** en el admin de Match Zone: crear/editar torneo con nombre visible (ej. "Primera Premier"), clave de temporada (la que ya usan partidos/equipos), fechas y estado; marcar el torneo activo.
- `TournamentPanel` lee el torneo activo y muestra su nombre real. Con un solo torneo: texto plano sin flecha ni sufijos inventados. Con varios: selector desplegable que lista los reales y cambia los datos de todas las pestañas.
- Si aún no hay torneo capturado: se muestra la clave de temporada tal cual, sin inventar nombre.

## B. Orden de pestañas

**Posiciones · Partidos · Fase final · Goleo** (Posiciones como pestaña inicial).

## C. Posiciones (rediseño)

- Tarjeta contenedora: fondo #0D0F13, borde hairline #1F2329, radio 16px, filas separadas por hairline.
- Columnas: **# · escudo · equipo · PJ · DIF · PTS** en móvil; en desktop se agregan **G · E · P**.
- Encabezado de columnas en mayúsculas, tracking amplio, gris muted.
- Fila LCU: fondo cyan sutil + barra cyan de 2px a la izquierda + nombre en negrita + posición y puntos en cyan (idéntico a Partidos).
- Números en Space Grotesk tabular; escudos chicos con altura homologada.
- Zona de clasificación: línea divisoria cyan tenue debajo del último puesto que clasifica (configurable, por defecto los primeros 4 de cada tabla).
- Grupos: si el torneo trae grupos, se muestra por defecto el grupo de LCU con selector de grupo; si no, una sola tabla sin selector. Se mantiene el bloque de reglas de puntuación debajo.

## D. Goleo (rediseño)

- Lista densa en tarjeta hairline: **posición · foto del jugador · nombre · escudo del equipo · goles** (número grande tabular a la derecha), asistencias como dato secundario.
- Foto real del jugador cuando exista en el plantel; si no, iniciales sobre superficie elevada con borde hairline (nunca círculo gris vacío).
- Podio sutil: el #1 con fondo cyan tenue y número de goles en cyan; #2 y #3 solo con la posición marcada. Sin tarjetas grandes.
- Jugadores de LCU resaltados igual que en las otras pestañas (fondo sutil + barra cyan + negrita).
- Encabezado de columnas en mayúsculas tracking amplio gris muted. **El goleo es global del torneo** (el dato no está separado por grupo); si hay grupos, se etiqueta como "Goleo general del torneo".

## E. Fase final (bracket)

- Rondas derivadas de los partidos de fase final agrupados por jornada, etiquetadas automáticamente según cuántas llaves tenga la ronda (Cuartos, Semifinal, Final; "Fase final" como respaldo).
- Cada llave: tarjeta hairline con los dos equipos (escudo + nombre) y su marcador; si hay ida y vuelta entre los mismos equipos, se suma el global y se muestra el desglose. Penales cuando existan.
- Ganador en negrita/cyan, eliminado atenuado. Llaves de LCU con barra cyan + negrita.
- **Responsive recomendado: disposición vertical por ronda** (una sección por ronda, una llave debajo de otra). Es más legible en móvil que el scroll horizontal y no rompe el sistema actual; en desktop las rondas se acomodan en columnas.
- Estado vacío elegante: tarjeta hairline centrada con icono de trofeo tenue y el texto "La fase final se definirá al terminar la fase regular".

## Detalles técnicos

- Migración: solo lectura/escritura sobre la tabla de temporadas existente (políticas de acceso: lectura pública, escritura solo admin) — no se crean campos nuevos de torneo.
- `useLeague.ts`: nuevo hook de torneo activo; la clave de temporada deja de ser una constante fija y pasa por contexto para que todas las pestañas consulten el torneo seleccionado.
- `useScorers`: extender el select para traer la foto y datos del jugador del plantel.
- Componentes tocados: `TournamentPanel.tsx`, `StandingsTable.tsx`, `TopScorers.tsx`, nuevo `FinalsBracket.tsx`, nuevo `PlayerAvatar.tsx`, y pestaña Torneo en `MatchZoneAdmin.tsx`. `FixturesList.tsx` no se toca.

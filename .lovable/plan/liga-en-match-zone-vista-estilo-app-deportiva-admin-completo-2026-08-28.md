# Liga en Match Zone: vista estilo app deportiva + admin completo con puntos automáticos

## Reglamento que se va a automatizar

- Victoria de local: 3 pts
- Victoria de visita con diferencia de 2 o más goles: 4 pts (con diferencia de 1 gol: 3 pts)
- Empate con 2 o más goles por lado (2-2, 3-3, …): penales. 1 pt a cada equipo + 1 pt extra al ganador de penales (2 en total)
- Empate de 0-0 o 1-1: 1 pt a cada equipo, sin penales
- Derrota: 0 pts

La tabla se recalcula sola a partir de los partidos terminados, con posibilidad de ajuste manual por admin (sanciones, puntos restados).

## 1. Vista pública "Liga" (Match Zone)

Cuatro pestañas, mobile-first, oscuras, con acentos cian y escudos:

**Partidos** — subfiltros Próximos / Resultados, agrupados por jornada, con selector de grupo. Cada fila: escudos, nombres, fecha/hora, sede, marcador y, cuando hubo penales, el resultado de penales en un chip (`3-2 pen`). Los partidos de Los Cabos United se resaltan y los de local llevan enlace compacto a boletos.

**Posiciones** — selector Grupo A / Grupo B. Encabezado tipo app deportiva con la tarjeta resumen de nuestro equipo (posición, puntos, jugados, dif. de goles). Tabla con escudo, JJ, G, E, P, GF, GC, DIF, PTS; fila propia resaltada; racha de últimos 5 resultados en puntitos de color. Bandas de color al costado según zona de clasificación.

**Fase final** — bracket/lista de las llaves cuando existan (si no hay datos, un estado vacío elegante que anuncia la fase final).

**Goleo** — tabla actual mejorada: podio de los 3 primeros en tarjetas y el resto en lista, con escudo y resalte de jugadores nuestros.

Sobre las pestañas se añade una tira informativa desplegable **"Cómo se puntúa"** con las 4 reglas en chips (3 / 4 / penales / empate), para que el esquema de competencia quede explicado sin romper la limpieza visual.

Este look (chips de subnavegación, tarjetas oscuras redondeadas, tipografía Poppins, tablas densas legibles) queda como patrón reutilizable para las demás páginas.

## 2. Panel de admin: Match Zone completo

Nueva estructura por pestañas dentro de `/admin/match-zone`:

- **Equipos**: crear/editar/eliminar equipos, nombre corto, escudo (subida a storage), grupo (A/B), activo, y marcar cuál es "nuestro equipo" (uno solo).
- **Partidos**: alta y edición completa — temporada, jornada, grupo, local/visita, fecha, hora, sede, fase (programado → 1er tiempo → medio tiempo → 2do tiempo → finalizado), marcador, penales (marcador de penales cuando aplica), links de transmisión y resumen. Al marcar como finalizado, los puntos y la tabla se recalculan automáticamente.
- **Posiciones**: tabla calculada en vivo (solo lectura) más una columna de **ajuste manual** de puntos con nota, y botón "Recalcular tabla".
- **Goleo**: alta/edición de goleadores (o captura de goles por partido que alimenta el goleo).
- **Fase final**: definir llaves/enfrentamientos de la fase final.
- **En vivo**: control de fase, minuto agregado y eventos del partido (lo que ya existe).

## Detalles técnicos

Base de datos (migración):
- `teams`: agregar `short_name`, `group_name`, `active`, `is_ours`, `season`.
- `matches`: agregar `group_name`, `home_pens`, `away_pens`, `stage` (`regular` | `final`), `home_points`, `away_points` (calculados).
- Función `public.compute_match_points(home_score, away_score, home_pens, away_pens)` que devuelve los puntos de cada lado según el reglamento; trigger en `matches` que la aplica al guardar/finalizar.
- Función `public.recalculate_standings(_season, _group)` que reconstruye `league_standings` (JJ, JG, JE, JP, GF, GC, DG, PTS) desde los partidos finalizados y suma la columna nueva `manual_adjustment` (con `adjustment_note`); se dispara por trigger tras cambios en `matches` y también manualmente desde admin.
- `league_standings`: agregar `manual_adjustment`, `adjustment_note`, y campo de racha derivado en la consulta.
- RLS: lectura pública de `teams`, `matches`, `league_standings`, `top_scorers`; escritura solo admin. GRANTs correspondientes.

Frontend:
- `LeagueTables.tsx` pasa a 4 pestañas; nuevos componentes `LeagueScoringInfo`, `LeagueGroupSwitch`, `StandingsTable` (racha + zonas), `TopScorersBoard`, `FinalStageBracket`; `LeagueFixtures` gana grupo y penales.
- `MatchZoneAdmin.tsx` se divide en pestañas con formularios de equipos, partidos (incluye penales y grupo), posiciones con ajuste, goleo y fase final.
- Solo tokens semánticos del tema, Poppins, mobile-first.

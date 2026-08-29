# Grupos del torneo y su reflejo en Match Zone

## Estado actual verificado

- `seasons` guarda nombre, clave, reglas de puntos, clasificados y logo. **No hay ningún campo de grupos**: hoy el grupo se escribe a mano, equipo por equipo, en un input de texto libre ("A").
- `matches.group_name` existe y el alta individual ya tiene un input de texto libre para el grupo; el alta de jornada completa no lo pide.
- El cálculo de la tabla (`recalculate_standings`) toma el grupo **del equipo**, no del partido, y suma todos los partidos terminados de cada equipo. Es decir: **un partido entre grupos ya suma a la tabla del grupo de cada equipo**, sin cambios de lógica.
- `StandingsTable` en Match Zone ya sabe pintar pestañas por grupo cuando hay más de uno; toma los nombres de los grupos de la propia tabla y los ordena por como vienen de la base.
- `FixturesList` en Match Zone agrupa por jornada, muestra sede, hora, marcador y boletos, pero **no muestra el grupo ni el link de transmisión**.

## Qué se construye

### 1. Configuración del torneo: cuántos grupos y cómo se llaman
- En la hoja de Configuración, un bloque **Grupos** con el número de grupos y el nombre de cada uno (por defecto "A", "B", …), editables uno por uno.
- 0 o 1 grupo = torneo de tabla única (se sigue viendo "General" en Match Zone, sin pestañas).
- Los nombres definidos aquí son la única lista válida: el orden en que se capturan es el orden en que aparecen las pestañas en Match Zone.

### 2. Grupo del equipo: de texto libre a selector
- En Equipos, el campo Grupo pasa a ser un **selector** con los grupos del torneo activo (más "Sin grupo"). Es lo que decide en qué tabla de posiciones aparece el equipo. Nada más cambia en esa sección.

### 3. Grupo al crear partidos
- **Nuevo partido** y **Jornada completa** llevan un selector de grupo con los grupos del torneo, más la opción **"Interzonal (entre grupos)"**.
- El grupo se pre-llena solo cuando local y visitante son del mismo grupo; si son de grupos distintos, queda como Interzonal. Siempre se puede cambiar a mano.
- Este dato es una etiqueta de presentación: los puntos siguen sumando a la tabla del grupo de cada equipo, así que un interzonal alimenta las dos tablas.

### 4. Todo esto visible en Torneo (Match Zone)
- **Posiciones**: las pestañas de grupo usan los nombres y el orden definidos en la configuración; si el torneo tiene un solo grupo, se ve una sola tabla sin pestañas. La línea de clasificación usa los clasificados configurados del torneo activo (hoy está fija en 4).
- **Partidos**: cada partido muestra su etiqueta de grupo ("Grupo A" / "Interzonal") y, cuando es nuestro partido y tiene link de transmisión, un botón **"Ver transmisión"** junto al de boletos.
- **Goleo** y **Fase final** siguen igual.

## Detalles técnicos

- **Migración**: `seasons.groups text[] NOT NULL DEFAULT '{}'`. Sin cambios en `recalculate_standings`, `matches` ni `league_standings`.
- `useLeague.ts`: `groups` se agrega al select de temporadas y al tipo, para que Config, Equipos, los formularios de partidos y Match Zone lean la misma lista.
- Archivos: `admin/sections/Torneo/Config.tsx` (bloque Grupos), `Equipos.tsx` (Grupo como selector), `MatchSheet.tsx` y `MatchdayBuilder.tsx` (selector de grupo + autollenado por equipos), `match-zone/StandingsTable.tsx` (orden y nombres desde la configuración, clasificados reales), `match-zone/FixturesList.tsx` (etiqueta de grupo y botón de transmisión), `TournamentPanel.tsx` (pasa grupos y clasificados del torneo activo).
- Se mantiene el sistema de diseño: hairline, superficies oscuras, acento cyan, Inter / Space Grotesk tabular.

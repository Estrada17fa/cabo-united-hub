# Captura de partidos estilo Squad

## Diagnóstico (lo que hay hoy)

Revisé los tres archivos que forman la captura actual:

- **Lista (`Partidos.tsx`)**: ya tiene los dos botones ("Jornada completa" y "Nuevo partido") y **ya agrupa por jornada** con "Sin jornada" como cajón final. Falta: orden explícito ascendente por número de jornada (hoy el orden depende del calendario) y un selector para saltar a una jornada.
- **Edición (`MatchSheet.tsx`)**: **la edición ya existe** — al tocar un partido abre la hoja con todos los campos (jornada, equipos, fecha/hora propia, sede, estado, marcador, penales, links, destacado, eventos del timeline) y permite eliminar. La sede se autollena desde el local pero es editable a mano. El link de transmisión se ofrece en todos los partidos, no solo en los nuestros. El marcador y los penales aparecen desde el alta.
- **Jornada completa (`MatchdayBuilder.tsx`)**: existe, pero no es la mecánica de Squad: pide **una fecha compartida** para toda la jornada más una hora por fila (no `datetime-local` por partido), el número de jornada **no se pre-llena**, los selectores **no excluyen** al equipo ya elegido del otro lado y la sede es un campo de texto libre.

Es decir: los puntos 2 y 4 de tu lista ya están cubiertos en lo esencial; el trabajo real está en el builder de jornada, el auto-numerado, el filtro por jornada y las reglas nuevas de sede / transmisión / marcador.

## Qué se construye

### 1. Hoja "Jornada completa" (rehecha)
- Arriba, una sola vez: **número de jornada**, pre-llenado con (jornada máxima existente del torneo activo + 1); editable.
- Debajo, filas "Partido 1, Partido 2…" (arranca con 2) con: **local**, **visitante**, **fecha y hora** (`datetime-local`, propia de cada partido) y **sede** de solo lectura, tomada automáticamente del equipo local.
- Cada `select` excluye al equipo ya elegido del otro lado de la misma fila.
- Botón "Agregar partido" para sumar filas; ícono de basura para quitarlas.
- Validación: al menos un enfrentamiento; cada fila con local, visitante y fecha; ningún equipo contra sí mismo; sin equipos repetidos dentro de la jornada.
- Guardado en **una sola operación** (insert por lotes), todos con el mismo número de jornada, estado "Programado" y marcador 0-0 sin capturar.

### 2. Hoja individual "Nuevo partido" / "Editar partido"
- Al **crear**: jornada, local, visitante, fecha/hora, sede (automática del local, solo lectura), grupo, fase y — solo si el partido es nuestro — link de transmisión. **El marcador, los penales y el timeline no se piden al crear**, se capturan después.
- Al **editar** un partido existente: se abre todo, incluido marcador, penales, estado en vivo, links y eventos del timeline, con su fecha individual.
- **Link de transmisión solo en partidos nuestros**: el campo aparece únicamente cuando el local o el visitante es el equipo marcado "nuestro equipo". Es el link que Match Zone ya consume.
- La sede deja de ser texto libre: se refleja la del equipo local y se recalcula si se cambia el local.

### 3. Lista de partidos
- Grupos ordenados **ascendente por número de jornada**, "Sin jornada" al final.
- **Selector de jornada** arriba de la lista para saltar a una jornada específica (o "Todas").
- Cada renglón sigue abriendo la hoja de edición, igual que hoy.

## Fuera de alcance
Equipos, Configuración del torneo, Posiciones y Goleo no se tocan. Las posiciones siguen recalculándose solas desde los resultados. No hay cambios de base de datos: `matches` ya tiene `matchday`, `kickoff_at`, `venue`, `stream_url` y `teams.venue`.

## Detalles técnicos
- Archivos: `src/pages/admin/sections/Torneo/MatchdayBuilder.tsx` (rehecho), `MatchSheet.tsx` (modo alta reducido, sede derivada, transmisión condicionada a `is_ours`), `Partidos.tsx` (orden numérico + filtro de jornada).
- Todo lee y escribe la temporada activa vía `useSeasonKey()`; los equipos vía `useTeams()`, que ya trae `venue` e `is_ours`.
- Invalidación quirúrgica de `["lcu-matches"]` y `["lcu-standings"]` tras guardar, como ya se hace.
- Se mantiene el sistema de diseño del panel: `adminCard`, `adminInput`, `Field`, `AdminSheet`, hairline oscuro y acento cyan.

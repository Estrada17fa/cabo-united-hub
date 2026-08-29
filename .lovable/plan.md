# Nombres completos y logos PNG limpios

## Objetivo
1. En Match Zone se vea el **nombre completo** de los equipos (tabla de posiciones y partidos).
2. Los logos PNG se muestren **sin fondo, sin círculo, sin borde y sin recorte** — solo el PNG, en todos lados de la web. Las iniciales siguen como fallback solo cuando no hay logo.

## Cambios

### A. Logos sin contenedor (toda la web)
- **`src/components/match-zone/TeamCrest.tsx`**: cuando existe `logo_url`, renderizar solo el `<img>` (object-contain, tamaños iguales a los actuales: sm/md/lg/xl) sin `rounded-full`, sin `border`, sin fondo. Si no hay logo, se mantiene el círculo con iniciales como fallback.
- **`src/components/lcu/Crest.tsx`**: quitar el recorte de escudo (`clipPath`), el fondo y el color de relleno cuando hay logo; mostrar el PNG tal cual. Fallback de iniciales igual que ahora.
- Revisar usos de ambos componentes (Scoreboard, NextMatchCard, LiveRoom, TeamsGrid, bracket) para que ninguno agregue fondo/borde propio alrededor del logo; se ajustan los que lo hagan.

### B. Nombre completo del equipo
- **`StandingsTable.tsx`**: mostrar `team.name` en lugar de `short_name` en la tabla de posiciones (mantiene truncate para nombres largos).
- **`FixturesList.tsx` (TeamLine)**: mostrar `team.name` en las filas de partidos.
- Verificar otros puntos de Match Zone donde hoy sale el short name (Scoreboard / NextMatchCard / bracket) y unificarlos a nombre completo donde el espacio lo permita; en marcadores muy compactos se mantiene short name si el nombre completo rompe el layout (se confirmará visualmente).

## Verificación
- Build OK y revisión visual en `/zona-partido` (tabla, partidos, cabecera de partido) con screenshots.

# Partidos en Match Zone: selector de jornada con flechas

## Alcance
Solo `src/components/match-zone/FixturesList.tsx`. El estilo de las tarjetas y filas de partido NO cambia — solo se reemplaza la lista larga (con "Ver todas las jornadas") por un navegador de jornada, una jornada a la vez.

## Cambios

### 1. Header de jornada con flechas (como la referencia)
- Una sola tarjeta visible. Su header muestra:
  - Izquierda: "JORNADA N" + chip de estado ("Finalizada" gris si todos sus partidos terminaron; sin texto "Actual" repetitivo).
  - Derecha: `‹  J{N}  ›` — flechas ChevronLeft/ChevronRight con el número de jornada al centro.
- Flechas deshabilitadas (opacidad reducida) en la primera/última jornada.
- La "Fase final" queda como una posición más del selector al final (label "Fase final", sin número).

### 2. Jornada abierta automáticamente
- Al abrir la página se selecciona la **primera jornada que NO esté completamente finalizada** (la que tiene partidos en vivo o pendientes). Si todas terminaron, se abre la última jugada; si ninguna empezó, la jornada 1.
- Esto reemplaza la lógica actual de "current": ya no se marca una jornada con chip "Actual" salvo que esté en vivo (chip "En vivo" discreto opcional solo si hay partido live).

### 3. Se elimina
- El estado `expanded`, el botón "Ver todas las jornadas / Ver menos" y la animación de expansión.
- La vista de dos grupos (anterior + actual).

### 4. Se conserva intacto
- `MatchRow`, `TeamLine`, resaltado LCU con barra cyan, chips de grupo/sede, botón Boletos, formato de fecha/hora.

## Detalles técnicos
- Estado: `const [index, setIndex] = useState<number | null>(null)` inicializado por `useEffect`/valor derivado al índice auto-calculado; el usuario navega con las flechas sin límite de rango.
- Navegación con wrap desactivado: clamp entre 0 y groups.length - 1.
- Transición sutil de contenido al cambiar de jornada (Framer Motion fade/slide ligero, keyed por jornada).
- Chips: "Finalizada" (gris) cuando todos finished; "En vivo" (cyan) cuando hay live; futuras sin chip.

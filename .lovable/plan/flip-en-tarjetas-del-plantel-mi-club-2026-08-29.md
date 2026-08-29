# Flip en tarjetas del Plantel (Mi Club)

## Diagnóstico

- `src/components/club/RosterSection.tsx` hoy muestra una tarjeta plana (`PlayerCard`): foto (o iniciales), dorsal en esquina, nombre y posición. **No existe ningún flip ni reverso** — es una tarjeta estática.
- La tabla `players` solo tiene: `name`, `jersey_number`, `position`, `photo_url`, `short_bio`, `active`. **No existen columnas** de goles, partidos jugados, edad/fecha de nacimiento, nacionalidad ni lugar de nacimiento. Para cumplir "sin inventar datos" hay que crear esos campos y dejarlos editables en el panel.
- El frente actual tampoco muestra nacionalidad (no existe el dato aún); se agregará como dato opcional.

## Cambios

### 1. Backend: campos de stats en `players`
Una migración agrega columnas nullable (todo opcional, NULL = no se muestra):
- `goals int`, `matches_played int` (stats del torneo)
- `birth_date date`, `nationality text`, `birth_place text` (datos del jugador)

### 2. Panel: edición en Plantel
En `src/pages/admin/sections/Plantel.tsx` se agregan inputs para los campos nuevos (goles, PJ, fecha de nacimiento, nacionalidad, lugar de nacimiento) en el sheet de jugador existente. Si se dejan vacíos quedan NULL.

### 3. Flip 3D en `PlayerCard` (`RosterSection.tsx`)
- Estructura flip clásica: contenedor con `perspective`, cara frontal y trasera con `backface-hidden`, giro `rotateY(180deg)` con transición suave (~500ms, ease).
- **Desktop (hover-capable)**: `group-hover:` voltea. **Touch (hover: none)**: `onClick` alterna estado; al tocar otra tarjeta o fuera se cierra (estado único de tarjeta volteada en la sección + listener de click exterior). Se usa media query `hover: hover` para separar ambos comportamientos sin hacks de UA.
- **Frente**: idéntico al actual (foto/dorsal/nombre/posición). Si hay nacionalidad, una línea pequeña debajo de la posición.
- **Reverso** (mismo tamaño, hairline + `bg-surface-3`): nombre arriba pequeño, **GOLES** y **PJ** como números grandes Space Grotesk tabular (estilo StatTile), y debajo edad (calculada de `birth_date`), nacionalidad y lugar de nacimiento, solo los que existan. Si no hay ningún dato de reverso, la tarjeta no voltea (sin reverso vacío feo).

### 4. Hook
`useClubPlayers` en `src/hooks/useClub.ts` selecciona las columnas nuevas; tipos de `types.ts` se regeneran con la migración.

## Notas técnicas

- Sin cambios de look: mismos radios (rounded-xl), hairline `#1F2329` (token), cyan solo en dorsal/acentos ya existentes.
- Animación con utilidades CSS/inline styles de transform (sin librería nueva); `prefers-reduced-motion` desactiva la rotación (cambia a crossfade).
- No se toca SeasonSummary, YouthTeamCard, NewsSection, FanWall, Match Zone ni el shell.

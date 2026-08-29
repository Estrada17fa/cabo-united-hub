# Pestaña Partidos: vista anterior + actual con "Ver todas las jornadas"

## Diagnóstico actual

`src/components/match-zone/FixturesList.tsx` hoy:
- Filtra con tabs **Próximos / Resultados** + toggle "Solo LCU", y agrupa TODO lo filtrado por jornada (sin límite). No existe saltador de flechas ‹ › en el código actual (ya no está; la navegación es por tabs).
- Cada jornada es una tarjeta con header de texto plano ("Jornada N") sin chips de estado.
- Los partidos LCU ya se resaltan con fondo `bg-primary/[0.05]` y texto cyan (falta la barra cyan lateral).

## Cambios (solo `FixturesList.tsx`)

### 1. Vista por defecto: jornada anterior + actual
- Calcular la **jornada actual**: la que contiene partidos en vivo, o la primera con partidos `scheduled` futuros; si no hay, la última jugada.
- Mostrar solo dos grupos: la jornada inmediatamente anterior (con resultados) y la actual.
- Eliminar los tabs Próximos/Resultados como filtro principal de esta vista (la lista completa se ve con el botón de abajo). Mantener el toggle "Solo LCU".

### 2. Botón "Ver todas las jornadas"
- Debajo de los dos grupos, botón full-width estilo tarjeta (borde hairline, chevron) como en la referencia.
- Al pulsarlo despliega el resto del torneo: todas las jornadas (jugadas y futuras) ordenadas ascendentemente, con animación de expansión suave (Framer Motion height auto). El botón pasa a "Ver menos" para colapsar.

### 3. Header de jornada con chips de estado
- **Jugada** (todos los partidos finished): chip gris discreto `border-hairline text-muted-foreground` → "Finalizada".
- **Actual**: chip cyan (`bg-primary/10 text-primary border-primary/30`) → "Actual", y el texto "Jornada N" en cyan.
- **Futura**: sin etiqueta, solo "Jornada N" normal.
- "Fase final" se trata como grupo propio al final (sin chip salvo que esté en vivo).

### 4. Resaltado LCU reforzado
- Además del fondo sutil y negrita cyan actuales, añadir barra cyan de 2px en el borde izquierdo de la fila (como en la imagen de referencia).

## Archivos
- `src/components/match-zone/FixturesList.tsx` — único archivo modificado. `TournamentPanel` y demás quedan intactos.

## Detalles técnicos
- Clasificación de jornada por partidos: `played = todos finished`, `current = tiene live o el primer scheduled`, `future = todo scheduled y posterior a la actual`.
- Orden dentro de jornada: por `kickoff_at` ascendente; jornadas jugadas ordenadas ascendente (anterior arriba).
- Casos borde: sin jornada anterior (jornada 1) → solo actual; torneo no iniciado → jornada 1 como "Actual".
- Tokens existentes: `bg-surface-1`, `border-hairline`, `text-primary`, Space Grotesk para marcadores; radios 16px tarjetas.

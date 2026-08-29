# Ajuste visual: partidos finalizados en Match Zone

## Objetivo
En la pestaña "Partidos" de Match Zone, cuando un partido ya está finalizado y tiene marcador, ocultar la hora y el día del lateral derecho y mostrar en su lugar el texto "Finalizado" más pequeño, para evitar que la información se amontone.

## Cambios propuestos

### Frontend
1. **Modificar `src/components/match-zone/FixturesList.tsx`**
   - En el componente `MatchRow`, detectar cuando `match.phase === "finished"` (además del estado "En vivo" actual).
   - Para partidos `finished`:
     - Ocultar el bloque que muestra `<time>` y `<date>`.
     - Mostrar una etiqueta "Finalizado" con tamaño reducido (ej. `text-[10px]`) y color `text-muted-foreground`.
   - Preservar la lógica existente de "En vivo" y de partidos programados (que siguen mostrando hora y día).
   - Mantener intacto el estilo de las filas de partido, los escudos, los nombres de equipos y el marcador.

## Criterios de aceptación
- Un partido en fase `scheduled` o `first_half`/`halftime`/`second_half` sigue mostrando hora y día.
- Un partido en fase `finished` muestra "Finalizado" en lugar de hora/día.
- Un partido en vivo sigue mostrando "En vivo".
- No se elimina ni modifica la información de `kickoff_at` en la base de datos.
- El build sigue sin errores.

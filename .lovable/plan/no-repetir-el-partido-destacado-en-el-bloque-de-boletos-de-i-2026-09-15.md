# No repetir el partido destacado en el bloque de Boletos de Inicio

## Diagnóstico

- `TicketsBlock` en `src/pages/Index.tsx` (líneas 307-373) consulta `useMatches()` y muestra los próximos 3 partidos de local, empezando por el más cercano.
- El bloque de Match Zone (`MatchBlock`, más arriba en la misma página) usa `useFeaturedMatch()` para elegir el partido protagonista (en vivo > destacado > próximo > último jugado). Ese partido ya aparece arriba con su link de boletos en el countdown.
- Ambos comparten la misma consulta de partidos (React Query cachea `lcu-matches`), así que llamar `useFeaturedMatch()` dentro de `TicketsBlock` no duplica ninguna petición.

## Plan

1. En `TicketsBlock`, llamar también a `useFeaturedMatch()` y excluir su partido (`match?.id`) de la lista de `upcomingHomeMatches`. Todo lo demás del filtro queda igual: LCU de local, no finalizado/cancelado, kickoff futuro, orden por fecha, máximo 3.
2. Estados ya cubiertos sin cambios:
   - Si al excluir quedan 1 o 2 partidos, se muestran esos (grid/carrusel ya soporta menos de 3).
   - Si no queda ninguno, ya existe el estado vacío elegante con enlace a `/boletos`.
   - El bloque no se oculta: mantiene el estado vacío existente (consistente con el look).
3. Botón "Comprar boletos" con `tickets_url` en pestaña nueva y "Próximamente" sin link: sin cambios.

## Alcance técnico

- Modificar únicamente `src/pages/Index.tsx` (función `TicketsBlock`, ~5 líneas).
- No tocar `/boletos`, la navbar, el admin ni la base de datos.

## Verificación

- Confirmar en escritorio y móvil que el partido de Match Zone ya no aparece en Boletos, y que los siguientes partidos de local sí aparecen con su estado de compra.
- Revisar el build sin errores.

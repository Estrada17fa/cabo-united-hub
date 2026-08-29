# Carga del calendario completo (28 jornadas)

Sí, me sirve. Cargo los 227 partidos al torneo activo (Primera Premier, clave 2026), etapa regular, borrando primero lo capturado para que no haya duplicados.

## Cómo resuelvo los datos

- **Grupo**: ignoro la columna A/B que venía en la lista y lo derivo de los equipos ya registrados. Los grupos del torneo están nombrados **1** y **2** en la web. Si local y visitante son del mismo grupo, el partido queda en ese grupo; si son de grupos distintos, queda como **Interzonal**.
- **Sede**: siempre el estadio del equipo local ya registrado (ej. Los Cabos United → ESTADIO DON KOLL).
- **Hora**: la interpreto como hora local de Los Cabos (America/Mazatlan) y se guarda con zona horaria, así que se ve igual en la web.
- **Corrección de año**: en la jornada 15 hay dos partidos con fecha `2026-01-08` (Jaguares vs Chapulineros y Club Celaya vs Pioneros Cancún) que por secuencia corresponden a **2027-01-08**. Los cargo con 2027. Si no es así, dime y los ajusto.
- Todos entran como **Programado**, marcador 0-0, sin resultados.

## Pasos

1. Borrar los partidos existentes de la temporada 2026 (y sus eventos) para dejar el calendario limpio.
2. Insertar las 28 jornadas resolviendo cada equipo por nombre exacto, con grupo derivado y sede del local.
3. Recalcular la tabla de posiciones (queda en ceros, con los 18 equipos en sus dos grupos).
4. Verificar en Match Zone: Partidos agrupado por jornada con etiquetas de grupo/Interzonal, próximo partido de LCU con cuenta regresiva y Posiciones con las dos pestañas.

## Notas técnicas

- Un solo `INSERT ... SELECT` con la lista como `VALUES`, uniendo contra `teams` por `name` de la temporada 2026; `group_name` calculado con `CASE WHEN home.group_name = away.group_name THEN home.group_name ELSE 'Interzonal' END`, `venue = home.venue`.
- `kickoff_at` = `(fecha + hora) AT TIME ZONE 'America/Mazatlan'`; `phase='scheduled'`, `stage='regular'`, `manual_score=false`.
- Al final, `recalculate_standings('2026')`.
- Validación previa: confirmar que cada nombre de la lista existe en `teams` antes de insertar, para que no falte ningún partido en silencio.

# Carga masiva de partidos del torneo

Yo cargo todos los partidos de la temporada activa (Primera Premier, clave 2026, grupos 1 y 2), etapa regular, borrando primero lo que hay capturado para que no queden duplicados.

## Formato que necesito

Pídele a la otra app (Squad) el calendario completo en este formato, una línea por partido, sin encabezados:

```text
jornada | grupo | fecha (AAAA-MM-DD) | hora local (HH:MM, 24h, hora de Los Cabos) | equipo local | equipo visitante | sede
```

Ejemplo:

```text
1 | 1 | 2026-09-05 | 19:00 | Los Cabos United | Club Deportivo Irapuato | ESTADIO DON KOLL
1 | 2 | 2026-09-06 | 17:00 | Pioneros Cancún | Racing de Veracruz | CANCÚN 86
3 | Interzonal | 2026-09-20 | 18:00 | Zacatepec | Club Celaya | MARIANO MATAMOROS
```

Reglas:
- Grupo: `1`, `2` o `Interzonal` cuando local y visitante son de grupos distintos.
- La sede es opcional: si no viene, uso el estadio del equipo local que ya está registrado.
- Los nombres de equipo deben ser exactamente los que ya están en la web:

Grupo 1: Club Deportivo Irapuato, Cordobés F. C., Deportiva Venados, H20 Purépechas, Lobos ULMX, Los Cabos United, Reboceros de La Piedad, Tigres de Álica F. C., Tritones de Vallarta F. C., Zacatepec

Grupo 2: Chapulineros de Oaxaca, Club Celaya, Inter Playa del Carmen, Jaguares F. C., Montañeses F. C., Pioneros Cancún, Racing de Veracruz, Tapachula F. C.

Si la otra app usa nombres cortos (IRA, CEL, PIO…) también sirve, los mapeo yo.

## Qué haré con esos datos

1. Borrar los partidos existentes de la temporada 2026 (hoy hay 1 capturado) junto con sus eventos, para dejar el calendario limpio.
2. Insertar cada partido con: temporada 2026, jornada, grupo, etapa regular, equipos por nombre, fecha y hora convertidas a UTC desde la hora local de Los Cabos (UTC-7), sede, y estado "programado" con marcador 0-0.
3. Recalcular la tabla de posiciones para que quede en ceros y consistente.
4. Verificar en Match Zone: pestaña Partidos agrupada por jornada, etiqueta de grupo/Interzonal correcta y Posiciones con los dos grupos.

## Notas técnicas

- Inserción vía `INSERT` en `matches` resolviendo `home_team_id` / `away_team_id` por nombre (o `short_name`) contra `teams` de la temporada 2026.
- `kickoff_at` se guarda en timestamptz: la hora local se interpreta como `America/Mazatlan`.
- `phase = 'scheduled'`, `stage = 'regular'`, `manual_score = false`; los triggers de puntos y posiciones no suman nada mientras no haya resultados.
- Al final ejecuto `recalculate_standings('2026')`.

No hace falta que hagas nada en el panel: pégame la lista y yo la cargo.

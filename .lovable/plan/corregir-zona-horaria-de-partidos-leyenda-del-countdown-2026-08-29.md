# Corregir zona horaria de partidos + leyenda del countdown

## 1. Horarios: de hora del Centro a hora de Los Cabos

**Diagnóstico confirmado con la base:** los 234 partidos quedaron guardados con la hora del Centro (CDMX). Ejemplo real: un partido de jornada 1 está guardado a las 17:00 UTC = 11:00 CDMX, cuando en Los Cabos son las 10:00.

**Por qué el countdown también está mal:** la fecha guardada es un instante absoluto; al estar capturada una hora adelantada, tanto la hora mostrada como la cuenta regresiva apuntan una hora tarde. No es un problema de conversión en pantalla, es el dato.

**Fix (una migración de datos):**
- `UPDATE matches SET kickoff_at = kickoff_at - interval '1 hour'` en todos los partidos.
- El desfase es fijo de 1 hora todo el año: desde 2022 México eliminó el horario de verano, CDMX es UTC-6 y Baja California Sur UTC-7 permanentemente, así que no hay ajustes estacionales que considerar.
- La página ya muestra la hora en la zona del navegador del visitante, así que tras el ajuste un aficionado en Los Cabos verá "6:00 p.m." y el countdown caerá en el instante correcto.
- Nota para capturas futuras: en el admin, las horas deben capturarse en hora de Los Cabos.

## 2. Leyenda arriba del countdown

En `NextMatchCard.tsx`, agregar sobre el `CountdownTimer` una leyenda pequeña: **"La transmisión empieza en"**, con el estilo de las etiquetas del módulo (`text-[10px]`, mayúsculas, tracking amplio, `text-muted-foreground`).

Solo se toca una migración de datos y un componente.

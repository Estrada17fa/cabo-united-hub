# Match Zone: motor de fases, video con login y panel de admin

## 1. Motor de fases del partido (arregla el minuto pegado en 120')

Nuevas columnas en `matches` (no destructivo, `status` se mantiene):
- `phase` (texto, default `scheduled`): `scheduled` → `first_half` → `halftime` → `second_half` → `finished`
- `first_half_started_at`, `second_half_started_at` (timestamptz, nulos)
- `stoppage_minutes` (entero, default 0)

Reglas:
- El reloj lo calcula el front a partir de la fase y la marca de tiempo de inicio: primera parte = minutos desde `first_half_started_at` (con formato `45+N` si pasa de 45 y hay compensación); medio tiempo = texto "Medio Tiempo", sin número; segunda parte = 45 + minutos desde `second_half_started_at` (mismo trato cerca del 90); finalizado = marcador final fijo, sin reloj.
- Ningún partido avanza de fase solo por tiempo. Solo avanza desde el panel de admin.
- `status` se sincroniza automáticamente en la base de datos: `live` mientras la fase sea primera parte / medio tiempo / segunda parte, `finished` cuando la fase es finalizado, `scheduled` en otro caso.
- `useLiveMatch` deja de topar en 120 y de inferir "en vivo" por horario: usa `phase`.

Aviso interno: en el panel de admin, si un partido lleva más de 150 minutos reales en primera o segunda parte sin cambio de fase, se muestra un recordatorio para cerrarlo. Nunca se muestra al público.

## 2. Login solo para el video en vivo

- Calendario, posiciones y goleo siguen públicos.
- Sin sesión, en lugar del iframe se muestra un marco del mismo tamaño y proporción, borroso/oscurecido, con el botón "Inicia sesión para ver el partido en vivo" que abre el flujo de login/registro existente.
- Marcador, jornada y línea de tiempo de eventos se siguen viendo sin sesión.

## 3. Presentación: 2 chips grandes

Reemplazar las pestañas actuales de `/zona-partido` por dos chips grandes tipo pill:
- **En vivo**: el partido destacado (reproductor o cuenta regresiva), marcador y línea de tiempo de eventos.
- **Liga**: todo lo de la liga en pestañas internas — Nuestros Partidos (Próximos / Resultados / Todos, con el botón de boletos), Posiciones (general y grupos), Goleo, Partidos de la liga, Equipos.

El calendario de Los Cabos United se mueve dentro de "Liga" como pestaña, según lo elegido.

## 4. Panel de admin: sección "Match Zone"

Nueva entrada en `ADMIN_SECTIONS` → ruta `/admin/match-zone`, con las mismas dos pestañas que ve el público:

**En vivo (controles):**
- Selector del partido a destacar.
- Campo para el link del stream (YouTube/Facebook) con validación y vista previa del embed.
- Botones de fase: iniciar primera parte, medio tiempo, iniciar segunda parte, finalizar; captura de minutos de compensación.
- Marcador editable (local/visitante) con guardado inmediato.
- Alta y borrado de eventos del partido (minuto, tipo, jugador, equipo, descripción) que alimentan la línea de tiempo.
- Recordatorio si un partido quedó abierto más de 150 minutos.

**Liga (segunda etapa):** la pestaña se crea con los controles de partidos de la liga (crear/editar partido: equipos, fecha, hora, jornada, sede, marcador, estado). La edición de posiciones, goleo y equipos queda para la siguiente iteración, tal como se acordó.

## Notas técnicas

- Migración: agregar las columnas descritas, un trigger que mantenga `status` sincronizado con `phase`, y políticas de escritura para admins. Hoy `matches`, `match_events`, `league_standings`, `top_scorers` y `teams` solo tienen políticas de lectura pública, por lo que el panel no puede escribir: se agregan políticas de insertar/editar/borrar limitadas a `has_role(auth.uid(), 'admin')` y los GRANT correspondientes para `authenticated`.
- `useLiveMatch`: `isLive` pasa a derivarse de `phase`; el minuto se calcula desde las marcas de inicio de cada mitad; se conserva el realtime de `matches` y `match_events` para que el público vea cambios de fase, marcador y eventos al instante.
- Componentes nuevos: `MatchPhaseChips`/chips grandes en `ZonaPartido`, `LiveGate` para el bloqueo del video, `src/pages/admin/MatchZoneAdmin.tsx` con las pestañas de control.
- Se reutilizan `LiveMatchPlayer`, `MatchList`, `LeagueTables`, `ResponsiveMatchTimeline` y el flujo de auth existente; sin cambios en el diseño (Dark Bento, Poppins, cyan/rosa).

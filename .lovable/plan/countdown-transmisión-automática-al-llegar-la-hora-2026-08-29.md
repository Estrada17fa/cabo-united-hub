# Countdown → Transmisión automática al llegar la hora

## Estado actual (verificado en código)
- `ZonaPartido.tsx` muestra `NextMatchCard` (countdown) mientras `match.phase === "scheduled"`.
- Solo cambia a `LiveRoom` (video + marcador) cuando el admin cambia la fase en `/admin/match-zone`. El cambio llega en tiempo real por suscripción a la tabla `matches`.
- El video usa `match.stream_url` (link de YouTube/Facebook que capturas en el partido) y lo muestra solo a usuarios con sesión (`StreamGate`). Sin link configurado, la sala muestra "La transmisión se activa al arrancar el partido".

## Problema
Si nadie del club cambia la fase a la hora del partido, los aficionados se quedan viendo el countdown en 00:00 y nunca aparece la transmisión.

## Cambio propuesto
1. **Auto-activación por hora**: cuando el countdown llega a cero (`kickoff_at` alcanzado) y el partido sigue en fase `scheduled`, `ZonaPartido` trata el partido como "en vivo" y muestra `LiveRoom` automáticamente.
   - Si el partido tiene `stream_url` → se ve el video (con login).
   - Si no tiene link → se ve el estado "La transmisión se activa al arrancar el partido" con marcador.
2. **Fase visual "Por arrancar"**: dentro de `LiveRoom`, si la fase sigue en `scheduled` pero ya pasó la hora, el chip dice "Por arrancar" en lugar de "En vivo", y el reloj del marcador muestra 0' hasta que el admin inicie la fase real.
3. **El admin sigue mandando**: las fases (primer tiempo, medio tiempo, etc.) y el marcador se siguen controlando desde `/admin/match-zone` igual que hoy; esto solo quita la dependencia de que alguien presione "iniciar" a la hora exacta.
4. **Sin tocar**: estilos de tarjetas, navegación de jornadas, panel de admin, reglas de puntos.

## Detalles técnicos
- `src/pages/ZonaPartido.tsx`: condición `live || state === "post" || (phase === "scheduled" && now >= kickoff_at)` usando el ticker existente (`useTicker`) para re-evaluar cada segundo sin recargar.
- `src/components/match-zone/LiveRoom.tsx`: derivar `kickedOff = phase !== "scheduled"` para el texto del chip ("En vivo" vs "Por arrancar").
- `src/hooks/useMatchZone.ts`: en `useFeaturedMatch`, si llegó la hora del próximo partido, mantenerlo como protagonista aunque siga en `scheduled` (hoy se filtra por `kickoff_at > now`, así que desaparecería al llegar la hora — este es el punto clave).
- No requiere migración ni cambios en base de datos.

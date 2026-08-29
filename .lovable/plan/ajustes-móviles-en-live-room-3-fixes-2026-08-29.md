# Ajustes móviles en Live Room (3 fixes)

## 1. StreamGate amontonado/cortado en móvil
El marco del video bloqueado (`aspect-video`) tiene poco alto en pantallas chicas y el contenido (candado + 2 textos + botón + link) se corta.

**Cambio en `StreamGate.tsx`:**
- Quitar `aspect-video` del estado bloqueado: usar altura mínima flexible (`min-h-[300px] sm:aspect-video`) con padding vertical, para que el contenido respire en móvil.
- Reducir gaps y tamaños en móvil (icono `h-9 w-9`, título `text-[13px]`, párrafo `text-[11px]`, menos margen entre botones).
- El iframe con sesión se mantiene `aspect-video` igual.

## 2. Nombres largos cortados en el marcador en vivo
En `Scoreboard.tsx` (variant hero, la que se ve dentro del Live Room) `TeamSide` muestra `team.name` completo y en móvil se corta con "…".

**Cambio:**
- En el marcador usar `team.short_name ?? team.name` (igual que ya hace el compacto/barra pegajosa), con `truncate` como respaldo. El nombre completo sigue en tablas, partidos y el título del Live Room.

## 3. Minutos → fases del partido
Hoy el marcador muestra el reloj calculado ("47'", etc.) que puede ir mal si el admin no cambia fases a tiempo.

**Cambio en `Scoreboard.tsx`:**
- Reemplazar el reloj por la etiqueta de fase: **Primer tiempo / Medio tiempo / Segundo tiempo / Finalizado** (desde `PHASE_LABEL[match.phase]`).
- Se quita `getMatchClock`/`useTicker` del hero (se conservan si el compacto los usa; si aplica, el compacto también muestra la fase).
- Con esto el admin ya no tiene que estar pendiente del minuto exacto: solo cambia la fase y la etiqueta es siempre correcta.

## Verificación
- Build OK + screenshots en viewport móvil (393px) de `/zona-partido` en vivo: marco bloqueado sin cortes, abreviaturas visibles, etiqueta de fase en lugar de minutos.

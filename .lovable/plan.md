

## Plan: Mejorar Hero Card de Match Zone

### Cambios en `src/components/match-zone/MatchHeroCard.tsx`

1. **Imagen de fondo**: Agregar imagen placeholder con overlay oscuro y gradient para legibilidad. Usa `object-cover` con `absolute inset-0`.

2. **Botón rosa "Conoce Los Cabos"**: Segundo botón con fondo `#f199c1`, glow rosa, enlaza a `/conoce-los-cabos`.

3. **Layout de botones horizontal**: Los dos botones van en `flex flex-row gap-3 items-center justify-center` — "COMPRAR BOLETOS" (cian) a la izquierda y "CONOCE LOS CABOS" (rosa) a la derecha. En móvil, texto más pequeño y padding reducido para que quepan ambos en una fila.

### Archivo modificado
- `src/components/match-zone/MatchHeroCard.tsx`


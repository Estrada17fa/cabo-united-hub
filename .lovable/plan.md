# Ajustar centro inicial del mapa a Cabo San Lucas

## Contexto
La página **Visita Los Cabos** (`/conoce-los-cabos`) monta un mapa de Mapbox cuyo centro inicial está fijado en coordenadas cercanas a **San José del Cabo**. El usuario quiere que, al entrar, el mapa enfoque principalmente **Cabo San Lucas**, aunque luego se puedan tener negocios en San José.

## Cambio propuesto
Actualizar el centro y zoom por defecto del mapa en `src/components/visita-los-cabos/MapView.tsx`.

- **Nuevo centro:** coordenadas de Cabo San Lucas (`~22.8905, -109.9167`).
- **Zoom ajustado:** `11.5` para mantener contexto regional sin perder el foco en Cabo San Lucas.
- No se modifica la lógica de marcadores, selección ni fly-to; solo el punto de partida inicial.

## Archivo a modificar
- `src/components/visita-los-cabos/MapView.tsx`

## Criterio de aceptación
Al abrir `/conoce-los-cabos` el mapa debe cargar centrado sobre Cabo San Lucas en lugar de San José del Cabo.

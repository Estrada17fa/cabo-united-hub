
## Botones sólidos con relleno completo en card de partido

El estilo "tinte translúcido" no convence. Cambiar a **botones de relleno sólido al 100%** con el color del acento como fondo y texto oscuro de alto contraste, manteniendo la identidad cromática y reforzando el resalte con sombra/glow externo.

### Cambios en `src/components/match-zone/MatchHeroCard.tsx`

Para los 5 CTAs:

- **Fondo**: color sólido al 100% del acento (sin transparencia).
- **Texto**: color oscuro casi negro (`hsl(0 0% 8%)`) para máximo contraste sobre el relleno brillante.
- **Borde**: eliminar el borde de 2px (ya no es necesario porque el relleno define el botón) o dejar un borde sutil del mismo color para nitidez en bordes.
- **Glow externo**: `boxShadow` reforzado con halo del color del botón para que "flote" sobre la card y no se mimetice con el fondo oscuro.
- **Peso del texto**: subir a `font-extrabold` para que la tipografía oscura resalte sobre el fondo brillante.

Mapa de colores (relleno sólido):
- VER EN VIVO / RESUMEN → verde `hsl(142 76% 50%)` + texto `hsl(0 0% 8%)`
- COMPRAR BOLETOS / VOTA AMO DEL PARTIDO → cyan `hsl(189 100% 55%)` + texto `hsl(0 0% 8%)`
- VISITA LOS CABOS → rosa `hsl(336 80% 77%)` + texto `hsl(0 0% 10%)`

### Snippet de referencia

```tsx
style={{
  backgroundColor: "hsl(189 100% 55%)",
  color: "hsl(0 0% 8%)",
  boxShadow: "0 0 0 1px hsl(189 100% 65%), 0 6px 20px -4px hsl(189 100% 50% / 0.65)",
}}
className="... font-extrabold"
```

La animación de pulso/glow del botón "VER EN VIVO" se mantiene, ajustando los valores del `boxShadow` animado para que use el verde sólido como base.

Sin cambios en otros archivos.

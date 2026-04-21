
## Mejorar visibilidad de botones en card de partido

Los botones (VER EN VIVO, RESUMEN, COMPRAR BOLETOS, VISITA LOS CABOS, VOTA POR EL AMO DEL PARTIDO) actualmente usan fondo casi transparente (`rgba(0,0,0,0.3)`) con borde de color, lo que los hace confundirse con la línea divisoria del timeline y otros elementos outline de la card.

### Cambios en `src/components/match-zone/MatchHeroCard.tsx`

Reemplazar el estilo "outline translúcido" por un estilo **"pill sólido con tinte de color"** que mantenga la identidad cromática de cada CTA pero con mucho más contraste:

- **Fondo**: cambiar de `rgba(0,0,0,0.3)` a un fill sólido tintado del color propio del botón a ~18-22% de opacidad sobre una base oscura, para que el botón "exista" visualmente sin pelear con el contenido.
- **Borde**: mantener el borde de color pero subir a `2px` y aumentar levemente la saturación del color del texto para mejor legibilidad.
- **Sombra/glow**: reforzar el `boxShadow` exterior para despegar el botón del fondo de la card.
- **Texto**: subir el peso visual usando el color del acento al 100% en vez de tonos atenuados.

Aplicar a los 5 botones manteniendo sus colores actuales:
- VER EN VIVO / RESUMEN → verde `hsl(142 76% 45%)`
- COMPRAR BOLETOS / VOTA AMO DEL PARTIDO → cyan `hsl(189 100% 50%)`
- VISITA LOS CABOS → rosa `hsl(336 80% 77%)`

### Snippet de referencia

```tsx
style={{
  backgroundColor: "hsl(189 100% 50% / 0.18)",
  border: "2px solid hsl(189 100% 50%)",
  color: "hsl(189 100% 70%)",
  boxShadow: "0 4px 14px -2px hsl(189 100% 50% / 0.45)",
}}
```

Sin cambios en otros archivos. La animación de pulso del botón "VER EN VIVO" se mantiene.

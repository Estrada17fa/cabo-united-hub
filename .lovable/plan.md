Voy a ajustar la navegación móvil/tablet para que al cambiar de página no se vea el “salto” de abajo hacia arriba.

Plan:
1. Cambiar el reseteo de scroll para que ocurra antes del cambio visual de ruta, usando `useLayoutEffect` en lugar de `useEffect`, y con scroll instantáneo.
2. Evitar que la animación de Framer Motion en la barra móvil/tablet calcule posiciones desde el estado scrolleado anterior. Para esto, haré que el contenedor de la nav sea un root de layout estable y desactivaré la animación inicial que puede provocar el salto.
3. Ajustar el click de los tabs móviles/tablet para subir instantáneamente al inicio antes de navegar, de modo que el header nunca tenga que “reacomodarse” después del cambio de página.
4. Mantener intacto el estilo actual: el tab activo seguirá mostrando el nombre de la página y la animación horizontal de la píldora, solo sin salto vertical.

Archivos a tocar:
- `src/components/layout/Header.tsx`
- `src/components/layout/ScrollToTop.tsx`
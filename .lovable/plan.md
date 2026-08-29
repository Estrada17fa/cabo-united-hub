# Corrección: botón "Agregar al carrito" queda detrás de la banda de patrocinadores

## Diagnóstico (verificado)

- En `src/pages/TiendaProducto.tsx` el CTA móvil fijo usa `fixed inset-x-0 bottom-0 z-40`.
- En `src/components/layout/SponsorCarousel.tsx` la banda de patrocinadores también usa `fixed inset-x-0 bottom-0 z-40`.
- Como ambos tienen el mismo `z-index` y el patrocinador se renderiza después en el DOM (dentro de `AppLayout`), se pinta por encima del botón, tapándolo parcialmente.
- El `pb-28` del contenedor de la página solo reserva espacio para el CTA, no para el CTA + la banda de patrocinadores.

## Qué se corrige

1. Elevar el CTA móvil a `z-50` para que quede por encima de la banda de patrocinadores (`z-40`).
2. Aumentar el padding inferior de la página en móvil (`pb-28` → suficiente para CTA + banda patrocinadores, aproximadamente `pb-36` o `pb-[7.5rem]`), de modo que el contenido no quede oculto detrás de ambos elementos fijos.
3. Verificar que el CTA desktop (no fijo, oculto en móvil) no requiere cambios.
4. Revisar visualmente en el preview que el botón sea completamente clickable y no quede cubierto.

## Notas técnicas

- Archivo editado: `src/pages/TiendaProducto.tsx`.
- Sin cambios en `SponsorCarousel.tsx` ni en `AppLayout.tsx`.
- No se toca funcionalidad del carrito, solo z-index y espaciado del CTA fijo.

# Corrección: botón "Agregar al carrito" estático, sin tapar patrocinadores

## Diagnóstico (verificado)

- En `src/pages/TiendaProducto.tsx` hay dos CTAs:
  - Uno para desktop dentro de la columna de info (derecha), oculto en móvil (`hidden md:inline-flex`).
  - Uno fijo en la parte inferior de la pantalla en móvil (`fixed inset-x-0 bottom-0 ... md:hidden`), que queda a la misma altura que la banda de patrocinadores.
- El CTA fijo tapa o compite visualmente con la banda de patrocinadores, y el usuario pide que la banda siempre sea visible.

## Qué se corrige

1. Eliminar el CTA móvil fijo (bloque `fixed bottom-0 md:hidden`).
2. Convertir el CTA existente de la columna de info en un botón visible en todos los tamaños (`flex` en lugar de `hidden md:inline-flex`), ubicado en el flujo normal de la página, debajo del selector de talla y cantidad.
3. Reordenar ligeramente la columna de información en móvil para que el botón quede justo debajo de la foto / datos del producto, sin flotar.
4. Reducir el padding inferior de la página (`pb-36` → `pb-20`) porque ya no hay elementos fijos que requieran espacio adicional.
5. Verificar visualmente que la banda de patrocinadores se vea siempre al final de la página y que el botón sea clickable.

## Notas técnicas

- Archivo editado: `src/pages/TiendaProducto.tsx`.
- No se modifica `SponsorCarousel.tsx` ni `AppLayout.tsx`.
- No se toca funcionalidad del carrito; solo cambia la posición y visibilidad del CTA.

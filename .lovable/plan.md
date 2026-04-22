

# Fix: Carrusel de patrocinadores corta logos en móvil

## Problema
En móvil (390px) solo se ven 3 logos rotando en lugar de los 6. Causa: el carrusel duplica el array `[...sponsors, ...sponsors]` (12 items) y anima `x: [0, "-50%"]`, lo cual asume que la primera mitad cabe completa fuera de pantalla antes de reiniciar. Pero como el contenedor `flex` no tiene `width` explícito y los items son `flex-shrink-0`, la animación de `-50%` desplaza la mitad del ancho total — funciona en desktop pero en móvil el loop visual se corta porque los items siguientes aún no han entrado por la derecha cuando el reset ocurre.

El issue real: con solo 2 copias y `-50%`, el efecto seamless requiere que la primera copia ocupe ≥ 100% del viewport. En móvil con padding/gaps reducidos, los 6 logos miden menos que el ancho de pantalla, así que al hacer `-50%` se ve un salto y solo parecen pasar 3.

## Solución
En `src/components/layout/SponsorCarousel.tsx`:

1. **Triplicar el array** en lugar de duplicar: `[...sponsors, ...sponsors, ...sponsors]` (18 items) y animar a `-33.333%`. Esto garantiza que siempre haya contenido visible llenando el viewport en cualquier tamaño de pantalla.
2. **Reducir gaps en móvil** para que más logos sean visibles a la vez: `gap-4 sm:gap-8` (en lugar de `gap-6 sm:gap-8`).
3. **Reducir padding horizontal de cada item en móvil**: `px-3 sm:px-6` (en lugar de `px-5 sm:px-6`) para que no se sientan tan separados.
4. **Mantener** altura, opacidad, animación de 20s lineal infinita y `loading="lazy"`.

## Archivos modificados
- `src/components/layout/SponsorCarousel.tsx` — único cambio.

## Lo que NO se toca
- Imágenes de los logos (ya están bien).
- Posición fixed bottom, z-index, backdrop, border-top.
- Ningún otro componente, página o layout.


# Loading de cambio de página: pegado debajo del menú

## Cambio

Hoy el indicador de "Cargando" (escudo + barra cyan + texto) aparece centrado a media pantalla. El usuario lo quiere pegado debajo del menú superior, tanto en escritorio como en móvil.

## Implementación

Solo CSS, en `src/index.css` (clase `.lcu-route-loading`):

- Quitar `min-height: 100%` y `justify-content: center` (eso es lo que lo centra).
- Agregar un `padding-top` pequeño (≈ 1.5–2 rem) para que quede justo debajo del menú con un poco de aire, sin pegarse al borde.

El overlay en `AppLayout.tsx` no se toca (ya cubre el área entre el header y la banda de patrocinadores; solo cambia dónde se dibuja el contenido dentro de él).

## Verificación

- Cambiar de página en escritorio y en móvil (preview) y confirmar que el escudo/barra/"Cargando" aparece arriba, debajo de la línea de navegación.
- Confirmar que el build queda OK.

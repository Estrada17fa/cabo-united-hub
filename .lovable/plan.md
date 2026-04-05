
## Plan: hacer que la pleca azul se anime y empuje a los iconos, sin estirar ninguno

### Problema
El estiramiento sigue ocurriendo porque hoy el cambio visual depende del mismo `motion.button`: cuando una opción pasa de “solo icono” a “icono + nombre”, el botón cambia su ancho interno y framer termina interpolando parte de ese cambio sobre el contenido.

### Enfoque correcto
Separar la animación en 2 capas dentro de `MobileNav`:

1. **Los iconos** viven en botones de ancho estable, con un contenedor fijo para el icono.
2. **La pleca azul** se anima por separado como el elemento que crece/se desplaza para mostrar el nombre de la página activa.

Así el icono ya no “cambia de tamaño”; solamente:
- la pleca se mueve y se expande
- los demás botones se reposicionan
- el icono acompaña el movimiento de su botón, no el resize

### Cambios en `src/components/layout/Header.tsx`

#### 1) Reestructurar cada item del `MobileNav`
- Mantener cada botón como una pieza de layout estable
- Darle al icono un wrapper fijo, por ejemplo:
  - ancho fijo
  - alto fijo
  - `shrink-0`
- Evitar que el icono comparta la animación del ancho del label

#### 2) Sacar la “pleca azul” del flujo del icono
- En vez de hacer que el botón activo completo cambie de ancho visualmente, renderizar una **capa activa interna** o **shared element** solo para la pleca
- Usar `motion.div` con `layoutId` común para la pleca activa, para que framer anime ese fondo entre tabs
- El texto de la página activa vive dentro de esa pleca, no como parte del icono base

#### 3) Mantener solo animación de posición en los items
- Los botones del carrusel deben usar animación de posición, no de tamaño
- La expansión visible debe recaer en la pleca activa
- Esto hace que los iconos vecinos sean desplazados por layout, pero nunca deformados

#### 4) Ajustar el texto activo
- El nombre de la página debe aparecer dentro de la pleca con fade/slide suave
- El texto no debe empujar directamente al SVG; el espacio del icono queda reservado aparte

### Resultado esperado
- El icono ya no se estira al cambiar de página
- La pleca azul es la que crece y se mueve
- Los iconos laterales solo se desplazan acompañando el reposicionamiento
- La transición se verá más limpia, fluida y “premium” en móvil

### Detalle técnico
La clave no es seguir afinando `layout` vs `layout="position"` sobre el mismo botón, sino **desacoplar**:
- `icono = tamaño fijo`
- `pleca activa = elemento animado`
- `texto = contenido de la pleca`

Con esa separación, la interfaz hace exactamente lo que pides: la pleca desplaza a los iconos, pero los iconos no cambian de tamaño para volver a su lugar.

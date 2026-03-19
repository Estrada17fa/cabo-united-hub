
Objetivo: corregir la barra móvil para que la página activa quede realmente centrada, las flechas siempre cambien de página, y el carrusel táctil no se corte ni se sienta trabado.

Qué está fallando ahora
- El centrado depende de `offsetLeft`/`offsetWidth` de elementos que cambian de tamaño con `scale`, así que el cálculo visual no coincide con el centro real.
- La lógica de “adyacentes” usa `Math.abs(index - activeIndex)`, que no contempla bien los extremos del carrusel.
- Las flechas sí llaman `navigate`, pero la UI depende de un re-centrado posterior que no siempre coincide con el layout final.
- El padding actual del track (`calc(50% - 2.9rem)`) está “hardcodeado” al ancho activo y se desajusta cuando cambian tamaños visuales.

Plan de implementación
1. Rehacer la barra móvil como carrusel con “viewport” fijo
- Mantener un contenedor central visible y usar un track horizontal estable.
- Evitar que el tamaño visual dependa de `scale` para calcular posiciones; en su lugar usar anchos base claros por estado:
  - activa: ancho mayor
  - laterales inmediatas: ancho medio
  - resto: ancho menor
- Dejar el item activo centrado con padding lateral calculado para el viewport móvil, no con un valor rígido dependiente de prueba/error.

2. Cambiar la lógica de centrado
- Sustituir el centrado basado solo en `offsetLeft` por medición real con `getBoundingClientRect()` del contenedor y del item activo.
- Recentrar:
  - al montar
  - al cambiar de ruta
  - al redimensionar
  - al terminar una navegación por flecha
- Hacer un segundo re-cálculo corto tras el render para evitar desajustes por transición/tamaños dinámicos.

3. Corregir la navegación por flechas
- Hacer que las flechas siempre calculen la siguiente/anterior ruta en modo circular.
- Al pulsarlas:
  - navegar a la ruta correspondiente
  - disparar la animación del track para que el nuevo item activo quede al centro
- Ajustar también la jerarquía visual para que el nuevo activo se agrande y los laterales se encojan consistentemente.

4. Mejorar el swipe/carrusel táctil
- Mantener `overflow-x-auto` + scroll horizontal suave, pero reforzar:
  - `snap-x snap-mandatory`
  - items con `snap-center`
  - mejor separación/ancho para que no se recorten
  - ocultar scrollbars sin afectar el touch
- Evitar combinaciones de `scale` + anchuras muy agresivas que generan cortes y sensación de salto.
- Si hace falta, reducir ligeramente el ancho del tab activo para asegurar que siempre entren “activo + dos vecinos”.

5. Refinar la lógica visual de vecinos
- Calcular vecinos izquierdo/derecho de forma circular.
- Mostrar claramente:
  - centro = activo destacado
  - izquierda/derecha = tabs más pequeños pero legibles
  - resto = más compactos y atenuados
- Esto hará que “se vean 3 páginas” de forma consistente, incluso en extremos como Inicio o Conoce Los Cabos.

6. Ajustes de layout del header
- Revisar el reparto horizontal entre:
  - escudo
  - carrusel
  - botón “Más”
- Reducir un poco paddings laterales si hace falta para que el carrusel tenga más ancho útil en móvil.
- Mantener desktop intacto.

Archivos a tocar
- `src/components/layout/Header.tsx`
- Posiblemente un ajuste menor en `src/index.css` si hace falta una utilidad adicional para snap/touch, pero la mayor parte debe resolverse en el componente.

Resultado esperado
- En móvil, la página actual queda centrada de verdad.
- Siempre se ven correctamente la activa y sus vecinas, sin cortes raros.
- Las flechas funcionan desde cualquier página.
- Deslizar con el dedo se siente fluido y estable.
- La transición visual entre páginas se ve coherente y limpia.

Detalles técnicos
```text
Estrategia recomendada:
[Escudo] [<] [ viewport del carrusel centrado ] [>] [Más]

Dentro del viewport:
- track horizontal con snap-center
- item activo medido con getBoundingClientRect()
- recentrado con scrollLeft += deltaEntreCentroDelItemYCentroDelViewport
- navegación circular con previous/next index
```

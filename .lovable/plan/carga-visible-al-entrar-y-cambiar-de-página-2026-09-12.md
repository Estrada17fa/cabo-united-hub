# Carga visible al entrar y cambiar de página

## Diagnóstico confirmado

- El splash inicial ya está en el HTML y funciona antes de que arranque la app.
- Con una demora simulada de 2 segundos, el escudo y la barra permanecen visibles hasta que React pinta; después se retiran correctamente.
- En una conexión normal desaparece tan rápido que puede no percibirse.
- Al cambiar de sección, la app solo muestra un spinner pequeño dentro del área de contenido mientras descarga una página por primera vez; no hay una señal global de carga.

## Plan

1. **Hacer perceptible la carga inicial**
   - Mantener el splash actual desde el primer instante.
   - Aplicar una duración mínima breve para evitar el destello negro y permitir que se vea el escudo, sin retrasar perceptiblemente la entrada.
   - Conservar el apagado con fade y la salvaguarda que evita que quede bloqueado.

2. **Mostrar carga al abrir cualquier sección**
   - Reemplazar el spinner aislado por una barra cyan visible en la parte superior del contenido mientras termina de cargar la sección solicitada.
   - Mantener la cabecera y la navegación visibles para que el sitio no parezca congelado.
   - Usar el mismo lenguaje visual del splash: fondo oscuro, cyan de marca y movimiento discreto.

3. **Evitar parpadeos**
   - Mostrar el indicador solo cuando la carga realmente tarda, con una transición corta.
   - No bloquear páginas ya cargadas ni las visitas instantáneas desde caché.
   - Respetar la preferencia de movimiento reducido.

4. **Verificación**
   - Probar entrada directa a Inicio, Tu Club, Match Zone y Tienda con carga ralentizada.
   - Probar navegación interna en escritorio y móvil.
   - Confirmar que nunca quede una pantalla negra sin indicador, que no haya saltos de contenido y que la carga no se retrase artificialmente más de lo mínimo definido para el splash inicial.

## Alcance

- Solo cambia la señal visual de carga.
- No modifica datos, navegación, diseño de las páginas ni funciones del sitio.

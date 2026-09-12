# Corregir la pantalla negra entre páginas

## Diagnóstico confirmado

- El indicador agregado sí se monta, pero es una línea de solo 3 px dentro del contenedor principal.
- Además espera 120 ms antes de hacerse visible; si la descarga termina cerca de ese tiempo, prácticamente no llega a verse.
- Durante la descarga inicial de una sección, `Suspense` reemplaza todo el contenido por ese indicador mínimo. Por eso queda una gran zona negra que visualmente parece vacía, como muestra la captura.
- La cabecera y patrocinadores permanecen visibles; el vacío corresponde al área principal de la página.

## Plan

1. **Reemplazar la línea imperceptible por una carga central**
   - Mostrar el escudo de Los Cabos United centrado en el área disponible.
   - Añadir debajo una barra cyan animada y el texto breve “Cargando”.
   - Darle una altura mínima suficiente para ocupar visualmente el espacio negro sin cubrir la cabecera ni patrocinadores.

2. **Mostrarla inmediatamente**
   - Eliminar la espera de 120 ms del indicador entre páginas.
   - Mantener una transición suave de entrada y salida, sin dejar un frame vacío.

3. **Cubrir navegación y datos iniciales**
   - Usar esta vista al descargar por primera vez cualquier sección.
   - Conservar los skeletons propios de Tienda y otras secciones cuando la página ya cargó pero sus datos siguen llegando.

4. **Verificación visual real**
   - Forzar demora al abrir Inicio, Match Zone, Tu Club, Visita Los Cabos y Tienda.
   - Confirmar en escritorio y móvil que siempre aparezcan el escudo y la barra en lugar del espacio negro.
   - Confirmar que el indicador desaparezca al estar lista la página y que no quede bloqueado.

## Alcance

- Solo se corrige la presentación durante la carga.
- No se modifica contenido, datos, navegación ni funciones de las páginas.

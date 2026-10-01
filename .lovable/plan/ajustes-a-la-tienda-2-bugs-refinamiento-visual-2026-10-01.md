# Ajustes a la Tienda: 2 bugs + refinamiento visual

## Diagnóstico del bug 1 (Jerseys no aparece)
- Shopify hoy: el Jersey Local trae `equipacion:local` + `linea:oficial`. El parser lo clasifica bien: línea Jerseys, equipación Local.
- Consola: solo reporta los otros 4 jerseys (Visita, Portero Local, Portero Visita, Tercero) como "Otros". El Local ya no aparece ahí, así que no se pierde.
- Abrí la tienda en limpio a 380px: aparecen 3 tarjetas, **Jerseys · 1 pieza**, Streetwear · 3 piezas, Otros · 4 piezas. No hay ningún filtro que la oculte por falta de portada, ni claves distintas, ni orden que excluya "oficial".
- Causa probable: la tienda guarda el catálogo 5 minutos en memoria. Etiquetaste con la vista previa abierta, así que siguió mostrando la versión anterior. Pero el jersey salió de "Otros", y eso contradice esta explicación. No puedo confirmar la causa sin reproducirlo.
- Hay un segundo problema real: en celular, con 3 líneas, la tarjeta "Otros" baja a una segunda fila y empuja todo hacia abajo.
- Arreglo:
  - Volver a leer el catálogo al entrar a la tienda (bajar la caché de 5 min a 1 min y recargar al montar), para que los cambios de Shopify se vean sin recargar.
  - Mostrar las 3 tarjetas en una sola fila también en celular.

## Bug 2: nivel con una sola opción
- Hoy Streetwear muestra el nivel de secciones con una sola sección. Se cambia a: el nivel aparece solo si hay **2 o más** opciones reales (sin contar "Todo"). Lo mismo para equipaciones en Jerseys (hoy con 1 sola, Local, también se mostraría). Los tipos ya cumplen la regla.

## Visual
1. **Altura antes del producto** (meta: primer producto visible a 380x760):
   - Orden: hero → tarjetas de línea → buscador con iconos → filtros → productos.
   - Hero de Tienda al ~60% de su altura actual, mismo contenido.
   - Tarjetas de línea de 88px en celular (~104px en escritorio), nombre y conteo abajo a la izquierda, siempre en una sola fila.
2. **Segmentado más ligero:** la opción activa usa un fondo un tono más claro que la pista, texto blanco y una línea cyan fina debajo, que se desliza. Las inactivas van en gris. Sin relleno cyan, sin doble borde ni brillo. El anillo de foco solo aparece al navegar con teclado.
3. **Menos líneas:** se quitan las líneas divisorias de arriba y abajo de la barra fija de filtros. La separación es solo con espacio, y el fondo se mantiene sólido al hacer scroll.
4. **"Ver todos":** hoy borra todos los filtros y regresa a la vista inicial (primera línea, Todo). Se quita. Las migas se vuelven tocables: cada parte te lleva a ese nivel y limpia los niveles de abajo.
5. **Tarjetas de línea:** degradado inferior más fuerte, para que el nombre se lea sobre fotos claras como la playera blanca.

Verificación: capturas a 380x760 y 1280px con el primer producto visible en celular, sin errores en consola.

## Detalles técnicos
- `useProducts.ts`: `staleTime` 60s + `refetchOnMount: "always"`. Parser y URL sin cambios.
- `Tienda.tsx`: `showSections = lineSections.length > 1`, `showEquipaciones = lineEquipaciones.length > 1`. Mover `StoreLineTiles` arriba de `ShopHeader`. Quitar el botón "Ver todos". Migas como botones que llaman a `selectLine` o a `setParams` conservando los niveles superiores. Barra fija sin `border-y`.
- `StoreLineTiles.tsx`: `grid-cols-{n}` según la cantidad de líneas, `h-[88px] md:h-[104px]`, degradado `from-background via-background/70`.
- `ShopTabs.tsx` (segment): indicador = `bg-surface-2` + barra cyan de 2px abajo. `focus-visible:ring` solo con teclado.
- `HeroCarousel.tsx`: reducir la altura/aspect ratio solo en Tienda, al ~60%.

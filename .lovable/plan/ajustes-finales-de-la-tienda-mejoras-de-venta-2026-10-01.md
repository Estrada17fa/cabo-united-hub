# Ajustes finales de la Tienda + mejoras de venta

No se toca cómo se leen las etiquetas de Shopify, la URL ni las reglas de qué filtros aparecen.

## Hallazgo antes de construir
- **Inventario:** Shopify hoy NO comparte cuántas piezas quedan. Lo probé con la conexión de la tienda y respondió "acceso denegado" (le falta el permiso de leer inventario).
- Por eso "Últimas piezas" queda fuera, como pediste.
- Si después activas ese permiso en la app de Shopify que conecta la tienda, se puede agregar sin rehacer nada.

## 1. Encabezado de resultados
- Se quitan el título grande y la miga de una sola palabra.
- Queda una línea delgada sobre la cuadrícula:
  - **Izquierda:** migas tocables, solo cuando eliges 2 o más niveles ("Streetwear / Hombre / Playeras").
  - **Derecha:** "N productos" en gris chico.
- Al buscar, la línea dice "Resultados para …" con el conteo a la derecha.
- Menos espacio entre los filtros y los productos.

## 2. Tarjetas de línea
- Solo el nombre de la línea, sin conteo.

## 3. Etiqueta en tarjeta de producto
- Una sola etiqueta por tarjeta, arriba a la izquierda de la foto, con esta prioridad:
  1. **"Preventa"**, si el producto trae la etiqueta `estado:preventa`.
  2. **"Nuevo"**, si se publicó hace 21 días o menos.
- Estilo: fondo oscuro translúcido, texto blanco, Space Grotesk en mayúsculas chicas. Sin cyan.
- Si la tarjeta ya tiene la etiqueta de "Agotado", esa tiene prioridad y no se encima otra.

## 4. Segunda foto
- **Computadora:** al pasar el mouse, la foto cambia a la segunda con un desvanecido.
- **Celular:** la foto se puede deslizar entre las imágenes, con puntitos discretos abajo. Tocar la foto sigue abriendo el producto.
- Con una sola imagen no cambia nada.

## 5. Envío gratis en el carrito
- Barra de progreso arriba del total:
  - "Te faltan $X para envío gratis".
  - Al llegar: "Tienes envío gratis".
- El monto mínimo vive en una sola constante: 1,200 MXN por ahora.
- Es solo informativo. El cobro real lo hace Shopify con la regla que tú configures allá.
- Color de la barra: blanco/gris, sin cyan.

## 6. Guía de tallas
- En la página de producto, un enlace "Guía de tallas" junto a "Talla". Abre un panel inferior con la tabla de medidas.
- Las tablas viven en un archivo de datos fácil de editar, con una tabla por tipo de prenda y corte: Jersey, Playera oversize, Playera regular, Hoodie.
- Si no hay tabla para ese producto, el enlace no aparece.
- Las medidas son de ejemplo y se marcan como "Medidas pendientes de confirmar" hasta que pongas las reales.

## Verificación
- Capturas a 380x760 y a 1280px.
- El primer producto debe verse sin hacer scroll en celular.
- Revisar el cambio de foto, la etiqueta, la barra del carrito y el panel de tallas.
- Sin errores en consola.

## Detalles técnicos
- `ProductCard.tsx`:
  - Badge con prioridad: tag normalizado `estado:preventa` (leído de `product.tags`, sin cambiar el parser) > `createdAt` ≤ 21 días.
  - Hover con 2 `img` y `group-hover:opacity` en `md:`.
  - En móvil, carrusel scroll-snap horizontal (`overflow-x-auto snap-x`) con puntos según `scrollLeft`.
- `Tienda.tsx`:
  - Fila `flex justify-between` con migas solo si `breadcrumbs.length >= 2`.
  - Se elimina el `h1` visible y se deja un `h1` `sr-only` para accesibilidad.
  - Márgenes reducidos.
- `StoreLineTiles.tsx`: se elimina el span de conteo.
- `src/lib/shipping.ts`: `FREE_SHIPPING_MIN = 1200`. `CartDrawer.tsx` muestra la barra con el subtotal.
- `src/data/size-guides.ts`:
  - Mapa `{ garmentType, corte? } → { columnas, filas, pendiente: true }`.
  - Función `getSizeGuide(product)` que busca primero tipo + corte y después solo tipo.
- `TiendaProducto.tsx`: enlace + `Sheet side="bottom"` con la tabla (Space Grotesk tabular).

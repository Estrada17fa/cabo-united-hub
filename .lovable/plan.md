# Conectar tu tienda Shopify real a la Tienda Oficial

Hoy la Tienda funciona con productos de ejemplo (`useProducts` + mock) y el carrito es local. El diseño ya está preparado para enchufar Shopify sin rehacer nada: los productos salen de un solo hook y el botón "Pagar" es el único punto de checkout.

## Paso 1 — Conectar tu tienda existente

Abro el flujo de conexión de Shopify (tienda existente). Necesitarás el enlace de administración de tu tienda (`admin.shopify.com/store/tu-tienda`) y autorizar el acceso.

Importante: al conectar tu tienda de producción, los cambios de datos (productos, inventario, descuentos) que hagamos desde aquí afectan tu tienda real, siempre con confirmación previa.

## Paso 2 — Traer el catálogo real

- Reemplazar el mock por datos reales de Shopify dentro de `useProducts` (mismo tipo `StoreProduct`, así ninguna vista cambia).
- Mapear: título, descripción, imágenes, precio/moneda, variantes de talla, disponibilidad/agotado, colecciones → categorías de los filtros.
- La búsqueda y el "Ordenar por" pasan a operar sobre el catálogo real.
- Detalle de producto (`/tienda/producto/:handle`) usa el handle real de Shopify.

## Paso 3 — Checkout real

- El carrito sigue siendo local (rápido, sin recargas), pero el botón "Pagar" crea un carrito en Shopify con las variantes seleccionadas y redirige al checkout seguro de Shopify.
- Shopify se encarga del pago, envío, impuestos y confirmación del pedido.
- Los pedidos aparecen en tu panel de Shopify como cualquier venta.

## Paso 4 — Lo editorial se queda como está

Hero slides y banners promocionales se siguen editando desde el panel de admin (sección Tienda). Shopify solo aporta productos y checkout.

## Qué necesitas de tu lado

- Que los productos estén publicados en tu tienda Shopify con imágenes, precios y variantes de talla.
- Un plan de Shopify activo para poder cobrar de verdad.

## Notas técnicas

- Archivos que cambian: `src/hooks/useProducts.ts` (fuente real), `src/lib/store-types.ts` (si hace falta algún campo extra), `src/stores/cartStore.ts` (guardar variant id), `src/components/tienda/CartDrawer.tsx` (botón Pagar → checkout de Shopify).
- Se elimina `src/data/store-products-mock.ts` cuando el catálogo real esté funcionando.
- No se toca el shell, el header, la banda de patrocinadores ni otras secciones del sitio.

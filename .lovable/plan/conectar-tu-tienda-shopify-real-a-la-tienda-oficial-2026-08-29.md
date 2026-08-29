# Conectar tu tienda Shopify real a la Tienda Oficial

La conexión con tu tienda `los-cabos-united` ya fue autorizada. Ahora implemento el catálogo real y el checkout.

## Paso 1 — Verificar la conexión y leer el catálogo

- Confirmar que la conexión de Shopify está vinculada al proyecto.
- Leer productos publicados, imágenes, precios, variantes de talla y colecciones desde tu tienda.

## Paso 2 — Reemplazar el mock por datos reales

- Actualizar `src/hooks/useProducts.ts` para consultar Shopify en lugar de `MOCK_PRODUCTS`.
- Mapear colecciones de Shopify a las categorías del sitio: Jerseys, Playeras, Hoodies, Accesorios.
- Ajustar `src/lib/store-types.ts` si hace falta algún campo real (por ejemplo, `variantId` para checkout).

## Paso 3 — Checkout real con Shopify

- Guardar el `variantId` de cada línea del carrito en `cartStore.ts`.
- Al presionar "Pagar" en `CartDrawer.tsx`, crear un carrito de Shopify con las variantes seleccionadas y redirigir al checkout seguro de Shopify.
- Eliminar `src/data/store-products-mock.ts` una vez el catálogo real funcione.

## Paso 4 — Verificación

- Probar que `/tienda` muestra tus productos reales.
- Probar que `/tienda/producto/:handle` abre el detalle correcto.
- Probar que el carrito redirige al checkout de Shopify.

## Qué necesitas de tu lado

- Productos publicados en tu tienda Shopify con imágenes, precios y variantes de talla.
- Un plan de Shopify activo para cobrar de verdad.

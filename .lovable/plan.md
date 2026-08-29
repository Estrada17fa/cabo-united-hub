# Tienda Oficial — rediseño + contenido editorial administrable

## Diagnóstico (verificado)

- La página `/tienda` ya existe con hero carrusel, categorías, sub-filtros, orden y grilla; el look actual usa degradados y glows cyan que se salen del lenguaje del resto del sitio.
- Los productos vienen hoy en vivo de Shopify Storefront (`src/lib/shopify.ts`, dominio y token quemados en el código) a través de `useShopifyProducts` / `useShopifyProduct`.
- Esa conexión **no responde**: la API contesta `402 PAYMENT_REQUIRED / Unavailable Shop`. Es decir, hoy la tienda no puede mostrar ningún producto real; se ve vacía o con error.
- El carrito (`src/stores/cartStore.ts`) crea y sincroniza un carrito real en Shopify y arma la URL de checkout. Con la API caída, agregar al carrito falla.
- El contenido editorial está quemado en código: los 3 slides del hero viven como constante en `HeroCarousel.tsx` con imágenes importadas de `src/assets`. No hay banners promocionales ni forma de editarlos.
- El panel de admin tiene 6 secciones (`AdminShell.tsx`); no existe sección Tienda. Ya hay un componente reutilizable de subida de imágenes al bucket (`ImageUploadField`).

## Qué se construye

### 1. Capa de productos desacoplada (mock hoy, Shopify después)

Un solo hook nuevo `useProducts` / `useProduct(handle)` con un tipo propio del proyecto (`StoreProduct`: handle, nombre, precio, precio comparado, imágenes, tallas, categoría, tags, descripción). Hoy devuelve datos de ejemplo (jerseys local/visita/portero, playeras, hoodies, gorra, bufanda) desde un archivo de mock. Mañana se cambia solo el interior del hook por la consulta a Shopify y ninguna pantalla se toca.

El código actual de Shopify se deja en el repositorio sin uso (no se borra), para reconectarlo después.

### 2. Carrito local

El carrito pasa a ser local (persistido en el navegador): agregar, cambiar cantidad, quitar, subtotal. El botón **Pagar** queda como punto único de salida: hoy solo avisa "checkout disponible pronto"; mañana ahí se llama al checkout de Shopify.

### 3. Rediseño de la página (look homologado)

Fondo `#060708`, superficies `#0D0F13` con hairline `#1F2329`, títulos en Space Grotesk, precios con números tabulares, cero degradados decorativos. Cyan `#00ABC4` solo en chrome: pill de filtro activo, "ver todos", precio de oferta y botón de carrito. Nunca sobre las fotos.

Orden final:

```text
HERO EDITORIAL (1-3 slides, admin)   foto full-width + título + 1 CTA
BANNER PROMO (admin)                 franja horizontal, imagen o color
BUSCADOR + "Ver todos"
FILTROS (pills) + Ordenar por
GRILLA DE PRODUCTOS                  2 col móvil / 3-4 desktop, foto grande
```

- Tarjeta de producto: foto 4:5 sobre superficie neutra, nombre, precio, cinta discreta "Agotado" / "Oferta". Sin marcos cyan.
- Categorías: Jerseys, Playeras, Hoodies, Accesorios (pills con subrayado/relleno cyan solo el activo).
- Detalle `/tienda/producto/:handle`: galería con miniaturas, nombre, precio, selector de **talla** obligatorio, cantidad, "Agregar al carrito" (cyan), descripción y datos de envío en acordeón.
- Carrito: sheet lateral con líneas, cantidades, subtotal y botón Pagar.

### 4. Contenido editorial en la base + admin

Dos tablas nuevas de solo-lectura pública y escritura de admin:

- `shop_hero_slides`: imagen, eyebrow, título, subtítulo, texto y link del CTA, orden, publicado.
- `shop_banners`: imagen o color de fondo, título, texto, CTA + link, orden, publicado.

Nueva sección **Tienda** en el panel de admin con dos pestañas (Hero y Banners): alta, edición, orden, publicar/despublicar y subida de imagen al bucket con el componente que ya existe. Si no hay slides publicados, el hero cae a las imágenes actuales de ejemplo para que la página nunca se vea vacía.

## Notas técnicas

- Nuevos archivos: `src/hooks/useProducts.ts`, `src/data/store-products-mock.ts`, `src/hooks/useShopContent.ts`, `src/pages/admin/sections/Tienda/` (index + HeroSlides + Banners), `src/components/tienda/ProductCard.tsx` (rehecho), `PromoBanner.tsx`.
- Editados: `Tienda.tsx`, `TiendaProducto.tsx`, `TiendaBuscar.tsx`, `HeroCarousel.tsx`, `CartDrawer.tsx`, `cartStore.ts`, `ShopHeader.tsx`, `AdminShell.tsx`, `ImageUploadField.tsx` (agregar carpeta `tienda`).
- Migración: las dos tablas con `GRANT` para `anon`/`authenticated`/`service_role`, RLS de lectura pública de filas publicadas y escritura solo admin.
- No se toca el shell del sitio, Match Zone, Tu Club, Fan Zone ni Visita Los Cabos.
- Sin Shopify real ni checkout en este paso.

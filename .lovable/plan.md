
# Tienda Oficial: storefront Shopify con look Los Cabos United

## Qué se va a hacer

Conectar tu **tienda Shopify existente** a Lovable y reemplazar la página `/tienda` (que hoy solo dice "próximamente") por un storefront moderno, estilo **premium minimalista (tipo Apple)**, manteniendo la identidad del sitio: fondo casi negro `#050505`, primary `#00abc4`, secondary `#f298c0`, tipografía Poppins y cards Bento.

Shopify se encarga del catálogo, inventario, pagos y checkout reales. Lovable construye el frontend.

## Paso 1: Conectar Shopify (tienda existente)

Al aprobar este plan se abrirá el flujo de conexión de Shopify donde tendrás que:

1. Pegar el **link de admin de tu tienda** (ej. `https://tu-tienda.myshopify.com/admin`)
2. Autorizar a Lovable a leer productos, colecciones, clientes y pedidos

Importante:
- Los cambios de productos/inventario hechos desde Lovable **afectarán tu tienda real** (siempre con confirmación previa).
- El frontend que construimos en Lovable es independiente de tu storefront actual de Shopify; podrás desplegarlo en un subdominio o reemplazar el actual cuando quieras.

## Paso 2: Estructura del storefront

Rutas nuevas dentro de `/tienda`:

```text
/tienda                       → Home de la tienda (hero + colecciones destacadas + featured)
/tienda/coleccion/:handle     → Listado de productos de una colección con filtros
/tienda/producto/:handle      → Detalle de producto (galería + variantes + add to cart)
/tienda/buscar?q=...          → Resultados de búsqueda
/tienda/carrito               → Carrito + ir a checkout (checkout es de Shopify)
/tienda/cuenta                → Login / registro de cliente
/tienda/cuenta/pedidos        → Historial de pedidos
/tienda/cuenta/direcciones    → Direcciones guardadas
```

## Paso 3: Páginas y componentes

### Home `/tienda`
- **Hero a pantalla completa** con imagen/video de producto, título grande Poppins, CTA "Comprar ahora" (estilo Apple: mucho aire, tipografía dominante).
- **Colecciones destacadas** en grid Bento: cards grandes con imagen de portada, hover con `scale-105` sutil y fade del overlay.
- **Productos destacados** en carrusel horizontal con scroll snap.
- **Bloque "Tu equipo, tu estilo"** con beneficios (envío, oficial, soporte) en cards bento pequeñas.

### Listado de colección
- Header con nombre de colección + descripción.
- **Sidebar de filtros** (desktop) / **drawer de filtros** (móvil): talla, color, rango de precio, disponibilidad.
- Grid responsive 2/3/4 columnas con `ProductCard`.
- Ordenar por: relevancia, precio, novedad.
- Skeleton loaders durante fetch.

### Detalle de producto
- Galería con imagen principal grande + thumbnails laterales, swipe en móvil.
- Título, precio, descripción corta.
- Selector de **variantes** (talla, color) como pills.
- Selector de cantidad.
- Botón **"Agregar al carrito"** primary con animación de confirmación.
- Acordeón con descripción larga, materiales, envíos y devoluciones.
- Sección "También te puede gustar" con productos relacionados.

### Búsqueda
- Input en header de la tienda con icono lupa.
- Resultados con la misma `ProductCard` y filtros.
- Estado vacío bonito con sugerencia de colecciones.

### Carrito
- Drawer lateral (Sheet) accesible desde cualquier página de la tienda.
- Lista de items con imagen, variante, cantidad editable, eliminar.
- Subtotal, indicador "envío calculado en checkout".
- CTA grande **"Ir a pagar"** que abre el checkout oficial de Shopify (manejado por Shopify, no por nosotros).

### Cuenta de cliente
- Login y registro con Customer Account API de Shopify.
- Página de pedidos con estado, tracking, total y detalle.
- Direcciones guardadas (agregar, editar, eliminar, predeterminada).

## Paso 4: Estilo "premium minimalista (Apple)"

Aplicado de forma consistente:

- **Tipografía dominante**: títulos muy grandes (`text-5xl md:text-7xl`), tracking tight, peso extrabold para hero.
- **Mucho aire**: padding generoso, `gap-12` entre secciones, sin saturar.
- **Color**: fondo `#050505`, cards `#121212`, acentos primary/secondary muy puntuales.
- **Animaciones sutiles** con framer-motion:
  - `fade-in` + `translate-y` al entrar al viewport (intersection observer).
  - `hover:scale-[1.02]` en cards de producto, transición 300ms ease-out.
  - Galería de producto con cross-fade entre imágenes.
  - Drawer de carrito con slide suave desde la derecha.
  - Botones con micro-interacción (scale 0.97 al click).
- **Imágenes** con `object-cover`, aspect ratios consistentes (1:1 producto, 4:5 colección).
- **Botones primary** redondeados (`rounded-full`) en CTAs principales para sensación premium.

## Paso 5: Integración técnica (sección técnica)

Una vez Shopify conectado, se generan automáticamente las herramientas y SDKs para:

- **Storefront API** (público, lectura de productos/colecciones, carrito, checkout)
- **Customer Account API** (login y pedidos del cliente final)
- **Admin API** (gestión desde Lovable, no expuesta al cliente)

Componentes y archivos nuevos:

```text
src/pages/tienda/
  Home.tsx
  Collection.tsx
  Product.tsx
  Search.tsx
  Cart.tsx
  Account.tsx
  AccountOrders.tsx
  AccountAddresses.tsx

src/components/tienda/
  ShopHeader.tsx          (sub-nav: colecciones, búsqueda, carrito, cuenta)
  ProductCard.tsx
  ProductGallery.tsx
  VariantSelector.tsx
  QuantitySelector.tsx
  CollectionCard.tsx
  FilterSidebar.tsx
  FilterDrawer.tsx
  SortSelect.tsx
  CartDrawer.tsx
  CartLineItem.tsx
  EmptyState.tsx
  AnimatedSection.tsx     (wrapper fade-in al scroll)

src/hooks/tienda/
  useShopifyProduct.ts
  useShopifyCollection.ts
  useShopifySearch.ts
  useCart.ts              (carrito persistente con cartId en localStorage)
  useCustomer.ts

src/lib/shopify.ts        (cliente storefront + helpers)
```

Ruteo: añadir las nuevas rutas en `src/App.tsx` bajo `/tienda/*`.
Estado del carrito: contexto global para que el icono del carrito en `ShopHeader` se actualice en tiempo real.

## Lo que NO se toca

- Header global, footer, otras páginas (Match Zone, Fan Zone, etc.).
- Sistema de auth de Lovable (Supabase) — la cuenta de cliente Shopify es independiente y solo aplica dentro de `/tienda/cuenta`.
- Backend de Lovable Cloud (matches, perfiles, etc.).

## Resultado

- `/tienda` deja de ser "próximamente" y pasa a ser una tienda funcional conectada a tu Shopify real.
- Catálogo, búsqueda, filtros, carrito y checkout reales.
- Cuenta de cliente con pedidos y direcciones.
- Look premium minimalista consistente con el resto del sitio.

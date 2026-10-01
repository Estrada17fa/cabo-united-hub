# Tres mejoras a la Tienda

## Lo que ya existe hoy (diagnóstico)
- El hero **ya no es estático**: lee las diapositivas de la tabla `shop_hero_slides` y ya hay una sección "Tienda → Hero" en el panel (subir imagen, eyebrow, título, subtítulo, texto y destino del botón escrito a mano, orden con flechas, publicado/oculto).
- Ya tiene autoplay de 6 s, puntos y precarga de imágenes. **Falta:** pausa al tocar/hover, deslizar en móvil, respetar "reducir movimiento", imagen móvil, interruptor del botón, selector de destino, fechas de campaña, arrastrar para ordenar y vista previa.
- Las portadas de línea salen de archivos fijos que nunca se subieron (la carpeta no existe), así que hoy todas usan el respaldo del catálogo.
- Los nombres derivados de tags solo se formatean en algunos lugares; por eso aparece "tercero".

Decisión: **amplío la tabla actual** en vez de crear `store_hero_slides`. Así la diapositiva "Jersey Oficial / Ver Jerseys" se conserva sola, sin migrarla.

## 1. Carrusel del hero
- Tienda: pausa al pasar el mouse o tocar, deslizar con el dedo, sin autoplay si el equipo tiene "reducir movimiento", sin puntos ni autoplay con una sola diapositiva. Usa la imagen móvil en pantallas chicas si existe.
- Solo se muestran las diapositivas publicadas que estén dentro de sus fechas (si las tienen).
- Admin "Tienda → Carrusel" (renombra "Hero"):
  - Imagen escritorio (obligatoria, 16:9) + imagen móvil (opcional, 4:5), con las medidas indicadas al subir.
  - Eyebrow, título y subtítulo opcionales (hoy el título es obligatorio y pasará a opcional).
  - Interruptor "Mostrar botón" + texto + destino con 4 tipos:
    - Tienda: selectores de línea / sección / tipo llenados con el catálogo real; arma `/tienda?linea=…&seccion=…&tipo=…`.
    - Producto: buscador de productos de Shopify.
    - Página del sitio: Inicio, Boletos, Abonos, Match Zone, Tu Club, Fan Zone, Visita Los Cabos, Patrocinios, Contacto, Mi pase.
    - URL externa (se abre en otra pestaña).
  - Fechas opcionales de inicio y fin; activa/inactiva; ordenar arrastrando.
  - Vista previa en móvil y escritorio dentro del editor.
- Permisos: lectura pública y edición solo para administradores (se revisan las reglas actuales y se ajustan si hace falta).

## 2. Portadas de línea
- Admin "Tienda → Portadas de línea": lista las líneas que existen en el catálogo (Jerseys, Streetwear y cualquier nueva) y permite subir, cambiar o quitar la foto. Vista previa del tile en su tamaño real (88 px móvil / 104 px escritorio).
- Se guardan en la base de datos y en el almacenamiento de imágenes, y sustituyen al mapa de archivos fijos.
- El respaldo no cambia: si no hay portada, se usa la primera foto del primer producto de esa línea del catálogo completo.
- Mismos permisos que el carrusel.

## 3. Formato de etiquetas
- Una sola función central `formatTagLabel`: primera letra en mayúscula, guiones a espacios y diccionario de acentos (nino→Niño, edicion→Edición, pantalon→Pantalón, sueter→Suéter, camison→Camisón, accesorios, etc.). Los valores desconocidos solo llevan mayúscula inicial.
- Se usa en tiles, segmentado, tipos, migas, eyebrows y badges. Los valores internos y la URL siguen en minúsculas.

## Fuera de alcance
El lector de tags, la URL y las reglas de qué filtros se muestran no se tocan.

## Detalles técnicos
- Cambios en la base (solo se agregan columnas, sin borrar nada) en `shop_hero_slides`: `image_mobile_url`, `show_cta boolean default true`, `cta_type text` ('store'|'product'|'page'|'external'), `starts_at`, `ends_at`, y `title` deja de ser obligatorio. La consulta pública filtra por fechas.
- Tabla nueva `store_line_covers (line text pk, image_url, updated_at)` con permisos (GRANT), RLS, lectura pública y escritura con `is_admin(auth.uid())`. Las imágenes van al bucket `avatars`, carpeta `tienda`, que ya está permitida.
- `StoreLineTiles` recibe un mapa de portadas resuelto en `Tienda.tsx` (sin cambiar la lógica de navegación); se elimina `import.meta.glob` y se actualiza la regla en AGENTS.md.
- Arrastrar para ordenar con eventos nativos de arrastre o puntero, sin dependencias nuevas; los cambios de orden se guardan en lote.
- El buscador de productos usa la consulta de Shopify que ya existe.
- `formatTagLabel` en `src/lib/store-types.ts`; `storeTypeLabel` y las etiquetas de sección y equipación pasan por esa función.
- Verificación en 380 px y 1280 px: tienda, carrusel y panel.

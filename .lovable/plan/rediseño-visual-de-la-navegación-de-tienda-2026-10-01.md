# Rediseño visual de la navegación de Tienda

## Estado confirmado

- La tienda ya separa **línea → sección/equipación → tipo**, mantiene la selección en la URL y oculta niveles sin opciones; esa lógica no se modificará.
- Cada producto ya expone sus imágenes de Shopify, por lo que el tile de cada línea puede usar la primera imagen del primer producto visible en esa línea.
- El botón cyan actual con icono de bolsa abre el **carrito**. Se convertirá en una acción de icono discreta con badge cyan.
- El proyecto ya cuenta con panel inferior (`Sheet`) y animaciones, así que el orden puede moverse ahí sin cambiar cómo se ordenan los productos.
- Dirección elegida: **Editorial mobile boutique**, reinterpretada con el sistema oscuro de LCU, Space Grotesk e Inter.

## Cambios a construir

### 1. Líneas como departamentos fotográficos

- Sustituir las pestañas grandes por una cuadrícula bento de tiles: **Jerseys · Streetwear · Otros** cuando existan.
- En móvil, dos columnas estables sin scroll y altura aproximada de 120 px; si aparece un tercer tile, ocupará la siguiente celda sin deformar los anteriores.
- En escritorio, conservar tiles compactos lado a lado dentro del ancho de contenido.
- Preparar un mapa línea → portada fácil de cambiar para `src/assets/tienda/linea-jerseys.jpg` y `linea-streetwear.jpg`.
- Mientras esas portadas fijas no existan, y para cualquier línea sin imagen asignada como “Otros”, usar la primera imagen del primer producto de esa línea tomada del **catálogo completo**, nunca de resultados filtrados o buscados. Así la portada no cambia al navegar.
- Cada tile mostrará esa portada fija o de respaldo, degradado oscuro inferior, nombre en Space Grotesk y conteo de piezas.
- Activo: imagen completa y borde cyan fino. Inactivo: imagen atenuada y borde hairline neutro.
- Mantener exactamente el cambio de línea y limpieza de parámetros que ya funcionan.

### 2. Jerarquía de filtros

- **Nivel 2:** control segmentado sobre `surface-1`, borde hairline e indicador activo cyan que se desliza con una transición breve. Incluir únicamente las secciones/equipaciones existentes y “Todo”.
- **Nivel 3:** navegación tipográfica discreta con subrayado cyan fino en el activo; scroll horizontal en móvil.
- Crear componentes visuales separados para tiles, segmento y tipos, evitando que vuelvan a parecer una sola barra de filtros.
- En Jerseys, el control seguirá mostrando equipaciones y admitirá el filtro de secciones futuro sin alterar las reglas existentes.

### 3. Búsqueda, carrito y orden

- Hacer que el buscador ocupe todo el espacio disponible.
- Colocar a su derecha dos botones de icono neutros: carrito y ordenar, ambos con tooltip/etiqueta accesible.
- Mostrar cyan únicamente en el badge numérico del carrito.
- El botón de ordenar abrirá un panel inferior con las cuatro opciones actuales, selección visible y cierre al elegir; se elimina el dropdown junto a la navegación.

### 4. Encabezado editorial de resultados

- Sustituir la línea compacta actual por:
  - migas grises con solo los niveles elegidos, por ejemplo `Streetwear / Hombre / Playeras`;
  - título grande en Space Grotesk con el nivel más específico seleccionado;
  - conteo `N piezas` alineado junto al título.
- En “Todo”, el título retrocede al nivel más específico real: sección elegida o línea.
- Mantener sin cambios el conteo calculado por los filtros y el estado de búsqueda.

### 5. Barra sticky de filtros

- Después de que los tiles salgan de vista, mantener bajo el menú superior una barra compacta con nivel 2 y nivel 3 cuando aplique.
- La barra usará fondo oscuro opaco con hairline para legibilidad, sin duplicar los tiles ni las herramientas.
- Reservar altura y capas para que no tape contenido ni el encabezado global, tanto en móvil como en escritorio.

### 6. Alcance y verificación

- Modificar únicamente la presentación de `Tienda`, `ShopHeader` y los controles visuales de navegación.
- No tocar parser/mapeo de Shopify, consultas, parámetros URL, reglas condicionales, tarjetas de producto, hero, checkout, admin ni otras páginas.
- Respetar movimiento reducido y conservar foco visible y nombres accesibles en todos los controles.
- Verificar en navegador a ~380 px y 1280 px: cambio de línea, sección y tipo; URL; sticky; buscador; carrito; panel de orden; conteos; tiles con dos y tres líneas.
- Confirmar el build sin errores y revisar que el cyan aparezca solo en los cuatro roles indicados.

## Archivos previstos

- `src/pages/Tienda.tsx`
- `src/components/tienda/ShopHeader.tsx`
- `src/components/tienda/ShopTabs.tsx` (se dividirá o especializará por jerarquía)
- Nuevos componentes pequeños dentro de `src/components/tienda/` para tiles, navegación segmentada y panel de orden, si ayudan a mantener cada nivel aislado.

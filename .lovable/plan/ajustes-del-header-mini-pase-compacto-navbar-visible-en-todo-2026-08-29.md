# Ajustes del header: mini pase compacto + navbar visible en todos los formatos

## 1. Mini pase más compacto (`src/components/pass/MiniPassChip.tsx`)
- Quitar el escudo LCU dentro del chip.
- Logueado: solo el texto **"Ver mi pase"** con el acento de color de su tier y un chevron pequeño. Sin número de pase ni etiqueta de tier en dos líneas (eso es lo que lo hace largo y alto). Mantener el fondo/borde del tier para que siga reconociéndose.
- No logueado: texto **"Quiero Mi Pase"** (abre el flujo de crear cuenta / auth como hoy).
- Reducir padding (`px-2 py-1.5`) para que el chip quede angosto y bajo, dejando aire lateral al escudo centrado del header (espacio de seguridad mínimo entre chip/botón y el logo).

## 2. Navbar en la segunda línea, visible en TODOS los formatos (`src/components/layout/Header.tsx`)
Hoy la línea 2 del nav es `hidden lg:block`. Cambio: mostrarla en móvil, tablet y desktop.

- Items: **Inicio · Match Zone · Tu Club · Fan Zone · Visita Los Cabos · Tienda Oficial** (sin Boletos por ahora; se quita el botón CTA y el item de carrito de esta línea).
- **Móvil (el caso crítico):** no caben 6 items con texto + icono a 393px sin amontonar. Diseño:
  - Icono arriba + etiqueta debajo (tipo app tab-bar pero en la línea 2 del header), repartidos en grid de 6 columnas iguales, altura ~52px.
  - Etiquetas abreviadas en móvil para que no se corten: "Inicio", "Match", "Club", "Fans", "Visita", "Tienda" (texto completo desde `sm:`).
  - Activo: icono y texto en cyan con subrayado animado (`layoutId` de Framer Motion, como hoy) + el icono hace un micro "pop" (scale spring) al cambiar de página.
- **Tablet/Desktop:** mismo nav pero en fila centrada con icono + texto inline (estilo actual), subrayado animado compartido. Si el ancho aprieta, cae a etiquetas cortas.
- El badge del carrito se mantiene solo en el botón de hamburguesa (ya existe ahí); no se duplica en la navbar.

## 3. Ajustes derivados
- `AppLayout.tsx`: el padding-top del contenido sube un poco en móvil porque el header ahora siempre tiene dos líneas (~108px en móvil vs ~104 desktop). Verificar que nada quede tapado.
- `ZonaPartido.tsx` y demás páginas: sin cambios de contenido; solo se valida el offset.

## Detalles técnicos
- Reutilizar `navLinks` existente agregando `shortName` por item; Tienda pasa de `shopLink` suelto a parte del array principal de la navbar.
- Mantener tokens semánticos (sin colores hardcodeados), hairline entre líneas, radios 11px.
- El drawer de hamburguesa se queda igual (perfil, carrito, extras, idioma).
- Verificación: screenshot en 393px (móvil) y 1280px (desktop) comprobando que el escudo central no se tapa y que los 6 items caben sin scroll ni cortes.

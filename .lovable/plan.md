## Mejorar las cards de los abonos en `/boletos`

Las cards actuales se ven elegantes pero el contenido (label del tier, badge, escudo) es demasiado pequeño y la card se siente vacía. Voy a hacerlas más grandes, con tipografía más legible y mejor jerarquía visual, manteniendo el mismo estilo dark + acento `#00abc4`.

### Cambios en `MembershipCard` (`src/pages/Tickets.tsx`)

1. **Card más alta y con presencia**
   - `minHeight`: 200 → 280px
   - Top visual area: 100 → 160px
   - Padding interno bottom: `p-5` → `p-6`
   - Border-top más gruesa en tiers premium/gold/platino (3px en lugar de 2px) para que el acento de color sea visible.

2. **Escudo de fondo más grande**
   - Tamaño: 80×80 → 140×140 px
   - Mantener opacidades actuales (sutil watermark).

3. **Label del tier (encabezado)**
   - Font-size: 11 → 15 px en mobile, 17 px en desktop
   - Mantener letter-spacing y color por tier
   - Agregar un pequeño separador/línea bajo el label para reforzar jerarquía
   - Mostrar también el nombre completo "Amo del Paraíso" arriba en 11px, y debajo en grande "GOLD / PREMIUM / PLATINO / GRATIS" como título principal del tier (más legible y rápido de escanear).

4. **Pill "MÁS POPULAR" del Premium**
   - Font-size: 10 → 11 px
   - Padding ligeramente mayor (`px-3 py-1`)
   - Posicionar arriba-centro con un ligero offset hacia afuera de la card (efecto "destacado").

5. **Badge inferior (GRATIS / GOLD / PREMIUM / PLATINO)**
   - Reemplazarlo por un bloque de información más útil:
     - Tagline corto del tier (12–13px, blanco 70%) que resume el beneficio principal:
       - Free: "Acceso digital y comunidad"
       - Gold: "Entrada + kit oficial básico"
       - Premium: "VIP + foto con jugadores"
       - Platino: "Experiencia completa + jersey personalizado"
   - Esto da contenido real a la card y elimina la sensación de vacío.

6. **Card del tier Premium**
   - Glow más visible: `boxShadow: 0 0 40px rgba(0,171,196,0.2)` (antes 30px / 0.12)
   - Mantener pill "MÁS POPULAR".

### Cambios en `PriceAndCta`

1. **Precio más grande y dominante**
   - `text-2xl` (24px) → `text-3xl md:text-4xl` (30–36px)
   - "por temporada" en 13px (antes 12) y blanco 60%
   - Línea mensual del Platino en 13px también, color acento blanco 70%.

2. **Botón CTA**
   - Altura: 48 → 52px
   - Font-size: 14 → 15px
   - Mantener estilos por tier (transparente/borde para Free, acento para los demás, blanco para Platino).

### Layout

- Sin cambios en la grilla 4 columnas desktop ni en el snap-scroll mobile.
- En mobile, el ancho de la card mobile se mantiene en `80vw` pero la mayor altura mejora la legibilidad.
- Ajustar el `top: "55%"` del overlap del hero a `top: "50%"` para acomodar las cards más altas sin que se corten contra el hero.
- Ajustar el `mt-[-180px]` de mobile a `mt-[-220px]` por la misma razón.

### Lo que NO cambia

- Hero atmosférico, gradientes, colores de acento por tier.
- Tabla de comparación de beneficios.
- Sección Boletomovil ni puntos de venta físicos.
- Navbar, footer, sponsor carousel.
- Tokens globales de diseño / variables CSS.

### Archivo a editar

- `src/pages/Tickets.tsx` (único archivo afectado).

# Homologar Visita Los Cabos al look Match Zone (con código de color por categoría)

## Regla de color

| Uso | Color |
|---|---|
| Chrome/UI (filtro activo, links, CTA "Cómo llegar", acentos de interfaz, números) | **Cyan #00ABC4** (como todo el sitio) |
| Categorías (pin del mapa + chip/acento en tarjeta) | **Se conservan colores por tipo**, unificados pin↔tarjeta |
| Tier "Patrocinador" | Dorado `#F2B33D` (reemplaza el verde neón) |

## Cambios

1. **Código de color por categoría, consistente pin ↔ tarjeta** (`visita-los-cabos-data.ts`, `MapView.tsx`, `FeaturedStrip.tsx`, `PlaceDetail.tsx`)
   - Se conservan: restaurantes ámbar `#F59E0B`, bares coral `#FF6B6B`, tiendas morado `#8B5CF6`, hoteles azul `#3B82F6`.
   - **Tours cambia de `#00D4FF` a teal `#2DD4A7`** para no confundirse con el cyan de marca (único ajuste de color de categoría).
   - Pins del mapa: el pin de cada lugar usa el color de su categoría (hoy el "destacado" es un pin oscuro genérico y el "básico" un punto blanco). Pin destacado = forma pin con color de categoría; básico = punto con color de categoría; patrocinador = tile dorado con estrella.
   - Tarjetas/detalle: el chip de categoría y un acento (borde superior o icono) usan el mismo color, para que el código sea legible en ambos lados.
   - `photoGradient` se mantiene por lugar (placeholder de foto), solo se armoniza el chip/acento.

2. **Chrome a cyan disciplinado**
   - `FilterPills`: pill activo pasa de verde neón a cyan `#00ABC4` (texto oscuro encima).
   - `PlaceDetail`: CTA "Cómo llegar" pasa a cyan; links y acentos (`text-primary`) ya están bien.
   - `RoutesPanel`: CTA "Quiero aparecer en el mapa" y su acento pasan a cyan (hoy verde).
   - `ConoceLosCabos.tsx`: sin cambios funcionales; superficies ya usan tokens.

3. **Tier Patrocinador: verde neón → dorado**
   - Badge "★ Patrocinador Oficial", pin de patrocinador, pill "Patrocinadores" del filtro y "Visita verificada" pasan de `#00FF87` a dorado `#F2B33D` (mantiene la distinción de tier sin romper la paleta).
   - `SPONSOR_GREEN` se renombra conceptualmente a acento dorado de patrocinador en un solo lugar del data file.

4. **Iconos en lugar de emojis en UI** (memoria del sitio: iconos de librería, nunca emojis)
   - Categorías: Utensils (restaurantes), Beer (bares), Waves (tours), ShoppingBag (tiendas), BedDouble (hoteles) — en pins, pills de filtro y chips.
   - Rutas del Amo: los emojis grandes de rutas pasan a iconos lucide con tile hairline.

5. **Tipografía y superficies (fina)**
   - Números destacados (rating, "van hoy", paradas) en Space Grotesk tabular; textos en Inter.
   - Radios homologados: tarjetas 16px, botones/pills 11–12px; hairline `#1F2329` y fondo `#0D0F13` vía tokens (ya casi todo cumple).
   - Mapa: ya usa estilo oscuro Mapbox; solo se ajustan los pins.

## Fuera de alcance
- No se toca funcionalidad, layout, datos de lugares, ni el alta de lugares. No se tocan otras páginas.

## Verificación
- Recorrido Playwright (móvil 393px y desktop) en `/conoce-los-cabos`: filtros, pins por color de categoría, detalle de lugar patrocinador y destacado, panel de rutas.

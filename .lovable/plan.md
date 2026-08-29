# Ajustes de shell en Match Zone (header, mini pase, título, patrocinadores)

## Diagnóstico (verificado en código)

- **Nav abajo**: `src/components/lcu/BottomNav.tsx` (5 ítems, solo móvil) montado globalmente en `src/components/layout/AppLayout.tsx` junto con un spacer `h-16`.
- **Header**: `src/components/layout/Header.tsx` tiene hoy una fila en móvil (hamburguesa · escudo · **avatar**) y una fila de desktop con nav en pills + iconos de redes. El drawer (Sheet) ya trae perfil, `FanPassMini`, carrito, extras e idioma; la nav completa no está en el drawer.
- **De dónde sale el color/estilo del pase**: hay **tres** definiciones de tier duplicadas:
  - `src/lib/tiers.ts` → `TIER_ACCENT` (`fan #FFFFFF`, `gold #F59E0B`, `premium #00abc4`, `platino #E2E8F0`) + `tierLabel()`.
  - `src/components/pass/FanPassCard.tsx` → `TIER_STYLE` (accent + label + gradiente de fondo).
  - `src/components/pass/FanPassMini.tsx` → `TIER_ACCENT` propio (color + label + bg), o sea hoy el mini pase **sí hardcodea** su color aparte.
  El tier real viene de la tabla `fan_passes` (`tier`, `pass_code`, `status`) consultada en `FanPassMini`.
- **Título de página**: `src/pages/ZonaPartido.tsx` líneas 24-31 (`<h1>Match Zone</h1>` + subtítulo).
- **Patrocinadores**: `src/components/layout/SponsorCarousel.tsx` ya es marquee fijo abajo con 6 logos importados de `src/assets/sponsors/` (no hay tabla en base). Ya no muestra texto; usa alturas mixtas (`h-9 sm:h-8`) y `max-w-[88px]`, y convive con el BottomNav.
- **Ruta de "Accesos"**: `src/App.tsx:49` → `/accesos` (página `Accesos.tsx`). Solo se renombra la etiqueta visible a "Boletos"; la ruta se mantiene.

## Cambios a construir

### 1. Fuente única del estilo del pase
- Centralizar en `src/lib/tiers.ts`: `TIER_ACCENT`, `TIER_LABEL` y un nuevo `TIER_BG` (los gradientes que ya existen).
- `FanPassCard` y `FanPassMini` consumen esos tokens; se borran sus tablas locales. Cambiar el color en un solo lugar actualiza pase y mini pase.

### 2. Header de dos líneas + nav arriba (shell global)
- **Línea 1**: hamburguesa (izq) · logo LCU (centro) · **MiniPassChip** (der), reemplazando el avatar.
- **Línea 2** (desktop/tablet): nav con **subrayado activo animado** vía `motion.div` con `layoutId` (se desliza, no salta). Orden: Inicio · Match Zone · Tu Club · Fan Zone · Visita Los Cabos · **Tienda** (ícono carrito con badge de cantidad) · **Boletos** (botón cyan → `/accesos`).
- **Móvil**: solo la línea 1; la nav completa se apila dentro del drawer de la hamburguesa (activo resaltado con barra cyan, entrada deslizando en cascada). Boletos queda como botón cyan al final.
- Eliminar `BottomNav` de `AppLayout` (se borra el componente y su export en `src/components/lcu/index.ts`) y ajustar paddings: `pt` para header de 2 líneas, `pb` para la banda de patrocinadores.

### 3. MiniPassChip (nuevo, `src/components/pass/MiniPassChip.tsx`)
- Con sesión y pase: chip compacto con fondo/borde del tier (tokens del punto 1), etiqueta de tier, `pass_code` en mono y "Ver mi pase" resaltado → `/mi-pase`.
- Sin sesión (o sin pase): botón compacto "Iniciar sesión" que abre el flujo existente (`AuthModal` / `AuthFlow`), sin tocar la lógica de auth ni permisos.

### 4. Transición de página
- Wrapper en `AppLayout` con `AnimatePresence` por `location.pathname`: fade + `y: 8 → 0`, ~200ms.

### 5. Quitar título de Match Zone
- Borrar el `<header>` de `ZonaPartido.tsx`; el contenido arranca en el hero. Se mantiene `document.title`.

### 6. Banda de patrocinadores
- Mantener los 6 logos existentes; homologar: caja fija de altura única (`h-7`) con padding parejo, centrado H/V, sin `max-w` que rompa la homologación, franja lo más delgada posible (`py-2` + safe-area).
- Loop perfecto: se conserva la medición del set + gap con `ResizeObserver` (ya evita cortes) y se duplican los sets necesarios para full-width.
- Fija abajo en todo el sitio, sin texto. Sin cambios de base: los logos siguen siendo assets del repo (queda listo para conectar admin más adelante si lo pides).

## Notas técnicas
- Archivos tocados: `src/lib/tiers.ts`, `src/components/pass/FanPassCard.tsx`, `src/components/pass/FanPassMini.tsx`, nuevo `src/components/pass/MiniPassChip.tsx`, `src/components/layout/Header.tsx`, `src/components/layout/AppLayout.tsx`, `src/components/layout/SponsorCarousel.tsx`, `src/pages/ZonaPartido.tsx`, `src/components/lcu/index.ts`, borrar `src/components/lcu/BottomNav.tsx`.
- Sin migraciones ni cambios de backend. Sin tocar login/permisos.
- Se mantiene el sistema de diseño actual (fondo #060708, hairline #1F2329, cyan #00ABC4, Inter + Space Grotesk, tabs de subrayado).

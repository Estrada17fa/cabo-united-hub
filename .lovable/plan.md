

## Plan: Rediseñar la barra de navegación móvil con look moderno y minimalista

### Problema
Los iconos outline se pierden contra el fondo oscuro. No hay diferenciación visual clara entre la barra de navegación y el contenido de la página.

### Solución
Darle a la barra de navegación un fondo sutil diferenciado, iconos con fill/solid para que destaquen, y un estilo "glass/pill" moderno. Mantener todas las animaciones existentes (framer-motion layout, expand del nombre).

### Cambios en `src/components/layout/Header.tsx`

**Barra de nav móvil (MobileNav):**
- Agregar fondo con efecto glassmorphism sutil (`bg-card/60 backdrop-blur-sm`) al contenedor de la barra nav
- Iconos inactivos: más gruesos (`strokeWidth={2.5}`) y con color más visible (`text-foreground/50` en vez de `text-muted-foreground`)
- Icono activo: filled/bold, con sombra glow del color primario
- Botones inactivos: agregar un fondo sutil tipo pill (`bg-muted/40 rounded-full`) para que cada icono tenga su "burbuja" y se distinga del fondo
- Placa activa: mantener `bg-primary` con `rounded-full` (pill shape) en lugar de `rounded-xl` para un look más moderno

**Contenedor de la fila nav:**
- Agregar padding vertical y un fondo `bg-card/50` a la fila del nav para separarla visualmente del contenido
- Las líneas divisorias (`h-px bg-border`) se mantienen

**Desktop nav:**
- Aplicar el mismo estilo pill (`rounded-full`) a los botones de nav activos
- Iconos un poco más gruesos para consistencia

### Resultado esperado
La barra de navegación se sentirá como un componente independiente "floating pill bar", moderno y diferenciado del contenido, con iconos que se ven claramente contra el fondo oscuro.




## Plan: Corregir el estiramiento del icono al cambiar de página

### Problema
Con `layout` completo en `motion.button`, framer-motion anima el **tamaño** del botón (de expandido con texto a solo icono y viceversa), lo que causa que el icono se estire visualmente durante la transición.

### Solución
Cambiar `layout` a `layout="position"` en los `motion.button` para que solo se anime la **posición** (no el tamaño), y mover la coordinación de tamaño al contenedor flex. El truco es que el cambio de tamaño ocurra instantáneamente mientras la posición se anima suavemente.

Además, agregar `layout="preserve-aspect"` o simplemente envolver el icono en un div que no participe en la animación de layout para evitar la distorsión.

### Cambios en `src/components/layout/Header.tsx` — `MobileNav`

1. Cambiar `layout` a `layout="position"` en cada `motion.button` — esto anima solo la posición, el tamaño cambia instantáneamente sin estirar
2. Agregar `style={{ flexShrink: 0 }}` al icono para protegerlo de distorsiones
3. Mantener `<LayoutGroup>` y `layoutId` para la coordinación entre botones

Esto resuelve el estiramiento porque framer-motion ya no intentará interpolar el tamaño del botón entre estados.


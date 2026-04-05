

## Plan: Sincronizar animación de desplazamiento de iconos con apertura de placa activa

### Problema
Al cambiar de página en móvil, los iconos inactivos se desplazan pero se superponen entre sí porque la animación de reposicionamiento (`layout="position"`) no está sincronizada con la expansión de la placa azul activa. El `layout="position"` solo anima la posición, no considera el cambio de tamaño del elemento activo al expandirse.

### Solución
Cambiar `layout="position"` a `layout` completo en los botones de `MobileNav`. Esto hace que framer-motion anime tanto la posición como el tamaño de cada botón simultáneamente, evitando superposiciones. Además, envolver el contenedor en `<LayoutGroup>` para que todos los botones coordinen sus animaciones como un grupo.

### Cambios en `src/components/layout/Header.tsx`

1. **Importar `LayoutGroup`** de `framer-motion`
2. **En `MobileNav`:**
   - Envolver los botones en `<LayoutGroup>`
   - Cambiar `layout="position"` a `layout` en cada `motion.button`
   - Agregar `layoutId={link.path}` para que framer-motion rastree cada elemento correctamente
   - Ajustar la transición del layout para que la curva de ease y duración sean consistentes entre expansión y desplazamiento

Estos cambios hacen que cuando la placa azul se expande, los iconos vecinos se desplacen de forma fluida y sincronizada, sin cortarse ni superponerse.


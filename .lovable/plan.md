# Reacomodo de la navbar superior para priorizar Boletos y Tienda

## Diagnóstico actual
- El header ya está fijo arriba y conserva dos líneas: hamburguesa, escudo y mini pase en la primera; navegación en la segunda.
- La barra principal actual contiene 7 destinos: Inicio, Match Zone, Tu Club, Fan Zone, Visita Los Cabos, Tienda y Boletos.
- En escritorio se muestran los 7 elementos en una fila flexible. En móvil se usa una cuadrícula de 6 columnas y **Boletos está oculto** mediante una regla exclusiva de escritorio; por eso hoy no aparece en la navegación móvil.
- Tu Club aparece actualmente en la barra principal con el ícono de usuarios. El drawer de hamburguesa ya reutiliza la misma lista de navegación.
- El estado activo ya tiene subrayado animado y microanimación del ícono; ambos comportamientos se conservarán.

## Cambios propuestos

### 1. Escritorio: nueva prioridad y orden
Dejar la navegación superior con exactamente seis destinos, en este orden:

**Inicio · Boletos · Tienda · Match Zone · Visita Los Cabos · Fan Zone**

- Boletos y Tienda quedarán visibles junto a Inicio.
- Tu Club saldrá únicamente de esta fila principal y seguirá accesible desde la hamburguesa.
- Mantener iconos actuales, etiquetas completas, enlace activo y subrayado animado.

### 2. Móvil: cinco accesos en la segunda línea superior
Mantener el header arriba y mostrar una cuadrícula estable de cinco elementos:

**Inicio · Boletos · Tienda · Match · Más**

- “Más” abrirá el drawer existente, la interacción más consistente con el sitio.
- El drawer incluirá **Visita Los Cabos, Fan Zone y Tu Club**, además de los accesos y utilidades que ya contiene.
- Cuando la página activa sea Visita, Fan Zone o Tu Club, “Más” adoptará el estado activo y su subrayado para conservar orientación visual.
- No se añadirá ni moverá ninguna navegación a la parte inferior.

### 3. Tu Club en la hamburguesa
- Cambiar su ícono de usuarios por un **escudo**.
- Mantener su ruta y comportamiento actuales.
- Evitar duplicarlo en la barra principal de escritorio o móvil.

## Alcance técnico
- Ajustar solamente `src/components/layout/Header.tsx`.
- Separar claramente los destinos principales de escritorio, los cuatro accesos móviles y los destinos secundarios del drawer, sin duplicar rutas ni lógica de estado activo.
- Conservar el carrito, perfil, mini pase, extras, animaciones y cierre del drawer tal como funcionan hoy.
- Verificar en 393 px que Boletos y Tienda estén visibles, que los cinco elementos quepan sin cortes y que “Más” abra el menú.
- Verificar en escritorio que aparezcan los seis destinos en el orden solicitado y sin amontonarse.

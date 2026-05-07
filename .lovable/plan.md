# Mejoras a la página Accesos

## 1. Cambio rápido: "Gratis" → "Fan"
- En el tier `free`: `badge: "FAN"`, `name: "Amo del Paraíso Fan"`, `cta: "Únete como Fan"`.
- Actualizar la columna del tier en cualquier referencia visible.

## 2. Sección de Storytelling (antes de las cards)

Nueva sección emocional **entre el hero y las cards de abonos**, tono pertenencia:

```
        "No compras un boleto.
         Te vuelves parte del paraíso."
```

- Frase grande tipo manifesto (clamp 28-44px), centrada.
- Subtítulo corto: *"Cada gol, cada grito, cada victoria — los vives desde adentro."*
- Debajo, una tira de 3 mini-frases con íconos sutiles (sin cards pesadas):
  - 🏟️ **Tu lugar en la grada** — desde el primer minuto.
  - 👕 **Los colores puestos** — kit oficial que te identifica.
  - 🤝 **Una familia rojinegra** — eventos, sorteos y comunidad solo para socios.
- Fondo: gradiente sutil oscuro + textura ligera, sin romper el flujo visual.
- CTA suave al final: *"Elige tu nivel ↓"* que ancla a las cards.

## 3. Reemplazar la tabla larga por **Tabs por nivel + mockup del kit**

Eliminar la tabla scroll. Nueva sección `¿Qué incluye cada nivel?` con:

- **TabsList horizontal** (4 tabs: FAN / GOLD / PREMIUM / PLATINO) con color de acento por tier y el "Más popular" pill en Premium.
- Al seleccionar un tab, **TabsContent** muestra layout 2 columnas (1 col en móvil):

  **Columna izquierda — Mockup del kit (imagen)**
  - Imagen generada del kit del nivel (jersey + accesorios sobre fondo oscuro).
  - Generar 4 imágenes (`src/assets/kit-fan.jpg`, `kit-gold.jpg`, `kit-premium.jpg`, `kit-platino.jpg`) con `imagegen` modelo `standard`, fondo cohesivo con la web (#0a0a0a, acento del tier).
  - Etiqueta flotante con el nombre del kit ("Kit Digital", "Kit Básico"...).

  **Columna derecha — Beneficios visuales**
  - Lista vertical de 5-7 beneficios con ícono ✓ del color del tier.
  - Precio grande + CTA del tier (reutilizar `PriceAndCta`).
  - Un highlight box: "Lo más amado de este nivel" (1 frase clave).

- En móvil: tabs scrollables horizontales (snap), y la imagen va arriba del contenido.

Esto reemplaza por completo la tabla actual (`benefitRows` y el bloque scrollable).

## 4. Puntos de venta físicos con logos + Google Maps

Rediseño de cards POS:

- Agregar campo `logo` y `mapsUrl` a cada item de `POS`.
- Generar 3 logos placeholder genéricos con `imagegen` (transparentes, fondo blanco):
  - `src/assets/pos-oxxo.png` — logo estilo convenience store
  - `src/assets/pos-tienda.png` — logo estilo tienda deportiva
  - `src/assets/pos-estadio.png` — logo estilo taquilla estadio
- Card nueva: logo (64×64, fondo blanco redondeado) a la izquierda, info a la derecha.
- **Toda la card es clicable** → abre `https://www.google.com/maps/search/?api=1&query=<dirección urlencoded>` en nueva pestaña.
- Hover: borde cyan + leve elevación. Ícono `ExternalLink` en esquina.
- Mantener teléfono como link separado (no propaga el click).

## Archivos a editar/crear

- `src/pages/Accesos.tsx` — refactor (storytelling, tabs, POS).
- `src/assets/kit-fan.jpg`, `kit-gold.jpg`, `kit-premium.jpg`, `kit-platino.jpg` — nuevos.
- `src/assets/pos-oxxo.png`, `pos-tienda.png`, `pos-estadio.png` — nuevos.
- Reutilizar `@/components/ui/tabs` ya existente.

## Notas técnicas

- Mantener la paleta de acentos por tier (Fan blanco, Gold #F59E0B, Premium #00abc4, Platino #E2E8F0).
- Eliminar `benefitRows`, `KIT_TOOLTIPS`, `CellRenderer` (ya no se usan).
- Preservar animaciones framer-motion existentes del contenedor raíz.

# Etiqueta "Nuevo" solo con el tag estado:nuevo

## Cambio

La etiqueta "Nuevo" en las tarjetas de producto deja de depender de la fecha de creación del producto. Ahora sale únicamente si el producto tiene el tag `estado:nuevo`, exactamente el mismo patrón que ya usa `estado:preventa`.

Regla de etiqueta única (prioridad) queda igual:
- Agotado gana sobre todo lo demás.
- Preventa (`estado:preventa`) > Nuevo (`estado:nuevo`) > ninguna.

## Detalle técnico

- `src/components/tienda/ProductCard.tsx` — en `productBadge`, quitar la comparación con `createdAt` y el constant `NEW_DAYS`; agregar la misma detección de tag que Preventa pero con `estado:nuevo` (comparación normalizada, tolerante a mayúsculas y espacios). El resto de la tarjeta no cambia.
- El orden "Más nuevo" de la lista sigue usando la fecha de Shopify; el cambio afecta solo la etiqueta visible, no el ordenamiento ni el parser ni la URL.
- No hay cambios visuales: la etiqueta mantiene el mismo estilo (fondo oscuro translúcido, Space Grotesk mayúsculas chicas, sin cyan).

## Verificación

- Build OK y revisar las tarjetas en `/tienda` a 380px y 1280px: ningún producto debe marcarse "Nuevo" salvo que tenga el tag `estado:nuevo` en Shopify.

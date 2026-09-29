# Organización de la Tienda: Jerseys vs Streetwear

## Cómo está hoy

- El catálogo vive en Shopify; el sitio lo lee y **adivina la categoría por palabras clave** en el título/tipo/etiquetas (`mapShopifyCategory` en `src/lib/store-types.ts`).
- Hoy solo hay 4 filtros fijos: **Jerseys, Playeras, Hoodies, Accesorios** — todo en una sola lista plana.
- No existe concepto de colección, género ni línea (jersey vs streetwear).
- Catálogo actual conocido: 3 jerseys (Local, Visita, Portero 26/27, $800 MXN, preventa).

## Estructura propuesta

```text
Tienda
├── Jerseys
│   ├── Colecciones: Local / Visita / Portero / Tercero / Ediciones especiales
│   └── Género: Hombre / Mujer / Niño / Unisex
├── Streetwear
│   ├── Colecciones: Playeras / Hoodies / Gorras / (las que definas)
│   └── Género: Hombre / Mujer / Unisex
└── Accesorios
```

## Qué se mueve en Shopify (tu lado)

1. **Tipo de producto (productType):** usar valores limpios y consistentes: `Jersey`, `Playera`, `Hoodie`, `Gorra`, `Accesorio`. Esto define la línea (Jerseys vs Streetwear).
2. **Etiquetas (tags):** agregar a cada producto:
   - Género: `hombre`, `mujer`, `nino`, `unisex`
   - Colección: `local`, `visita`, `portero`, `tercero`, `edicion-especial`, etc.
   - (Las etiquetas `Local`/`Visita`/`Portero` ya se usan como "eyebrow" en la tarjeta.)
3. **Colecciones de Shopify (opcional):** puedes crear colecciones en Shopify para tu propia organización, pero el sitio se guiará por tipo + etiquetas, que es más flexible.

## Qué se mueve en el sitio (mi lado)

1. **`src/lib/store-types.ts`:** reemplazar la adivinanza por palabras clave por un mapeo directo:
   - `productType` → línea (Jerseys / Streetwear / Accesorios)
   - tags → género y colección (con valores por defecto si faltan)
2. **`src/pages/Tienda.tsx`:** nueva navegación de la tienda:
   - Nivel 1: pestañas **Todo / Jerseys / Streetwear / Accesorios**
   - Nivel 2 (dentro de cada línea): filtro de **colección** (Local, Visita, Portero…)
   - Nivel 3: filtro de **género** (Hombre / Mujer / Niño / Unisex)
   - Se conservan búsqueda, orden y conteo de piezas.
3. **Tarjeta de producto:** mostrar colección/género como eyebrow cuando aplique.
4. Los filtros solo muestran opciones que realmente tienen productos (nada de filtros vacíos).

## Notas

- Los 3 jerseys actuales ya caerían en Jerseys con colección Local/Visita/Portero sin tocar nada; solo faltaría etiquetarles el género en Shopify.
- Nada se borra: si un producto llega sin etiquetas, aparece en "Todo" y en su línea por tipo.
- Tu sesión de Shopify expiró; para verificar el catálogo en vivo o hacer cambios desde aquí, te pediré reconectar la cuenta cuando toque.

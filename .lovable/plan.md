# Tienda en niveles anidados (línea → sección → tipo)

## Diagnóstico

**1. La consulta a Shopify ya trae `productType` y `tags`** (`src/lib/shopify-storefront.ts`, `PRODUCTS_QUERY`). No hay que tocarla.

**2. Catálogo actual (7 productos) y dónde cae cada uno con el mapeo nuevo:**

| Producto | Type | Tags | Clasificación nueva |
|---|---|---|---|
| Jersey Local 26/27 | `Jerseys` | `Local` | **Otros** (falta `linea:oficial`) |
| Jersey Visita 26/27 | `Jerseys` | `Visita` | **Otros** (falta `linea:oficial`) |
| Jersey Portero Local 26/27 | `Jerseys` | `Portero` | **Otros** (falta `linea:oficial`) |
| Jersey Portero Visita 26/27 | `Jerseys` | `Portero` | **Otros** (falta `linea:oficial`) |
| Jersey Tercero 26/27 | `Jerseys` | `Tercero` | **Otros** (falta `linea:oficial`) |
| Playera Oversize UNITED WE PLAY | `Playeras` | `corte:oversize`, `linea:streetwear`, `seccion:hombre` | Streetwear → Hombre → Playeras |
| Playera Oversize CABO UNITED LOVER CLUB | `Playeras` | `corte:oversize`, `linea:streetwear`, `seccion:hombre` | Streetwear → Hombre → Playeras |

**Hallazgos clave:**
- Los 5 jerseys **aún no tienen `linea:oficial`** → caerían en la pestaña "Otros" hasta que los etiquetes (se reportan en consola con su nombre).
- Los jerseys usan tags `Local`/`Visita`/`Portero`/`Tercero` **sin prefijo** `equipacion:`. Se aceptan ambas formas: la oficial es `equipacion:` y el tag suelto queda solo como respaldo.
- El Type viene **en plural** (`Jerseys`, `Playeras`): la normalización ignora plural, mayúsculas, acentos y espacios.

**Ajustes aprobados por el usuario:**
1. **Vista inicial:** `/tienda` sin parámetros abre en Jerseys. En Streetwear, el nivel de secciones incluye "Todo" como primera opción (Todo · Hombre · Mujer · Niño · Accesorios) y es la selección por defecto. La regla de "omitir nivel con una sola opción" se evalúa sin contar "Todo".
2. **Usos de `STORE_CATEGORIES`:** barrido completo del repo hecho — solo lo usan `src/pages/Tienda.tsx` y `src/hooks/useProducts.ts` (ni Home, ni navegación, ni links con `?categoria=`). `TiendaBuscar.tsx` y `TiendaProducto.tsx` no lo usan. Aun así, cualquier link viejo con parámetros anteriores (`?categoria=jerseys`, etc.) redirige a una vista válida, nunca a una tienda vacía.
3. **Tags sueltos:** `Local`/`Visita`/`Portero`/`Tercero` sin prefijo se aceptan solo como respaldo; la forma oficial es `equipacion:` y `equipacion:tercero` es válido.

## Qué se construye

### 1. Mapeo nuevo en `src/lib/store-types.ts`

Se elimina `mapShopifyCategory` (adivinanza por palabras clave) y se reemplaza por un parser directo:

- **Normalización:** minúsculas, sin acentos, sin espacios extra, singular/plural indistinto.
- **Línea:** tag `linea:oficial` → Jerseys; `linea:streetwear` → Streetwear; sin tag → `otros`.
- **Secciones:** todos los tags `seccion:*` (un producto puede tener varias y aparece en cada una).
- **Equipación:** `equipacion:local|visita|portero|tercero` (forma oficial); tags sueltos `Local`/`Visita`/`Portero`/`Tercero` solo como respaldo.
- **Tipo de prenda:** el `productType` tal cual, normalizado; nombre en pantalla en plural con acentos (`Playera`→`Playeras`, `Pantalon`→`Pantalones`, `Short`→`Shorts`, `Gorra`→`Gorras`, `Bolsa`→`Bolsas`; los desconocidos se pluralizan con regla simple).
- **Corte:** se guarda en el modelo (`corte:oversize`, etc.) sin usarlo en navegación.
- Tags sin prefijo conocido se ignoran.

### 2. Navegación en niveles en `src/pages/Tienda.tsx`

```text
Nivel 1 (pestañas grandes):  Jerseys · Streetwear · Otros*
Nivel 2 (secciones):         Jerseys → Todo · Local · Visita · Portero · Tercero
                             Streetwear → Todo · Hombre · Mujer · Niño · Accesorios
Nivel 3 (tipos de prenda):   Todo · Playeras · Hoodies · ...  (de ESA sección)
```

- **Vista inicial:** `/tienda` sin parámetros abre en Jerseys. En Streetwear, "Todo" es la primera opción del nivel de secciones y la selección por defecto.
- Cada nivel aparece solo al elegir el anterior; nivel 3 siempre empieza en "Todo".
- **Condicional:** una pestaña/sección/tipo solo aparece si tiene ≥1 producto; si un nivel tendría una sola opción real (sin contar "Todo"), se omite.
- Si un jersey trae `seccion:` en el futuro, el filtro de sección aparece también dentro de Jerseys con la misma lógica.
- Todo se deriva de los datos: un Type o sección nueva aparece sin tocar código.
- **URL compartible:** `?linea=streetwear&seccion=hombre&tipo=hoodie` (useSearchParams); al volver de un producto se conserva el filtro. Links viejos (`?categoria=jerseys`, etc.) redirigen a una vista válida, nunca vacía.
- **Look:** segmentos/pestañas limpias (no chips sueltos), cyan solo en la opción activa, hairline, Inter + Space Grotesk; niveles 2 y 3 con scroll horizontal en móvil.

### 3. Conservado

- Búsqueda, orden y conteo de piezas (el conteo refleja el filtro activo).
- Tarjetas y checkout sin cambios; eyebrow de la tarjeta = equipación (jerseys) o sección (streetwear).
- Sin tocar otras páginas ni el admin.

## Detalles técnicos

- Archivos: `src/lib/store-types.ts` (parser + tipos `StoreLine`, `StoreSection`), `src/hooks/useProducts.ts` (usar parser, reportar en consola los sin `linea:`), `src/pages/Tienda.tsx` (navegación en niveles + URL). Componente nuevo pequeño `src/components/tienda/ShopTabs.tsx` para los segmentos.
- Se elimina `STORE_CATEGORIES`/`StoreCategoryId`; se revisan usos en `TiendaBuscar.tsx` y `TiendaProducto.tsx` para que compilen con el modelo nuevo (sin cambiar su diseño).

## Lo único que te toca en Shopify

- Etiquetar los 5 jerseys con `linea:oficial` (y si quieres, cambiar `Local`→`equipacion:local`, aunque no es necesario: acepto ambas).

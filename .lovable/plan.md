## Problema

En móvil, el `SectionHeader` mete en una misma fila horizontal:
- Eyebrow + Título grande (izq)
- Link "Ir a Match Zone / Ir al Club / Ir a Fan Zone / Explorar mapa / Ver tienda" (der)

Con títulos largos como "Prepárate para el próximo partido" o "Juega y Gana Premios", el título se rompe a 2-3 líneas y el link queda apretado/encimado.

## Solución

Rediseñar el `SectionHeader` con un layout responsivo:

**Móvil (< 640px):**
- Apilar verticalmente: eyebrow → título (full width, sin link a la derecha) → link debajo como chip pequeño alineado a la izquierda
- Título reduce tamaño base a ~22px (clamp 22-28px)
- Eyebrow más compacto
- El link "Ver todo" reemplaza los labels largos en móvil para evitar texto excesivo

**Desktop (≥ 640px):**
- Mantener el layout actual (título izq, link der en una fila)
- Mismos tamaños y labels largos actuales

### Cambios concretos

```text
SectionHeader
├─ Mobile: flex-col, gap-3
│  ├─ eyebrow (10px, accent)
│  ├─ h2 título (clamp 22-28px, line-height tight)
│  └─ link "Ver todo →" (chip 12px)
└─ Desktop (sm:): flex-row, items-end, justify-between
   ├─ div { eyebrow + h2 (28-44px) }
   └─ link con label largo ("Ir a Match Zone", etc.)
```

### Detalles técnicos

Archivo único: `src/pages/Index.tsx` — solo se edita la función `SectionHeader` (líneas 97-145).

- Cambiar contenedor a `flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-4 mb-4 px-1`
- Título: `fontSize: "clamp(22px, 6vw, 44px)"` (escala mejor en móvil)
- Link: usar dos labels — `<span className="sm:hidden">Ver todo</span><span className="hidden sm:inline">{hrefLabel}</span>`
- Margen del link en móvil: alineado a la izquierda con `self-start`
- Eyebrow: agregar `flex-wrap` para que la línea + texto no rompa

No se cambia ninguna otra sección, ni los títulos/labels que ya definimos (Match Zone, Tu Club, Fan Zone, Tienda Oficial, Visita los Cabos).

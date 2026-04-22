

# Fan Zone header — fix amontonamiento en móvil

En 390px de ancho, las 2 cards superiores (Card 1 perfil+nivel y Card 2 ranking+puntos dividida en 2 mitades) quedan demasiado apretadas: el avatar de 48px + textos en Card 1 y los dos números de 22px en mitades de ~85px en Card 2 se sienten ahogados.

## Cambios — solo `src/components/fan-zone/FanStatsHero.tsx`

### Layout móvil reorganizado

Cambio el grid superior `grid-cols-2` por **stack vertical en móvil** y mantengo 2 columnas solo desde `sm:` (≥640px):

```text
MÓVIL (<640px)              DESKTOP (≥640px)
┌─────────────────────┐     ┌──────────┬──────────┐
│  Card 1 — Perfil    │     │ Card 1   │ Card 2   │
├─────────────────────┤     ├──────────┴──────────┤
│  Card 2 — Stats     │     │ Card 3 — Progress   │
├─────────────────────┤     └─────────────────────┘
│  Card 3 — Progress  │
└─────────────────────┘
```

Grid: `grid-cols-1 sm:grid-cols-2 gap-3` para las 2 primeras cards; Card 3 sigue full-width con `sm:col-span-2`.

### Card 1 — Perfil + Nivel (full width en móvil)

- Avatar 44px (antes 48px), sigue a la izquierda.
- Textos respirando: nombre del nivel "Amo" en 20px (antes 18px) ya que hay espacio horizontal completo.
- Layout horizontal: avatar | (Nivel name + "Nivel 3" + nombre usuario en línea inferior con · separador).
- Padding `p-4`.

### Card 2 — Ranking + Puntos (full width en móvil)

Sigue dividida en 2 mitades horizontales pero ahora con todo el ancho disponible:
- Cada mitad con padding `p-4` (antes `p-3`).
- Números en 24px (antes 22px) — más impacto.
- Labels y sublabels con más aire (margin-top 2px extra).
- Mantiene divisor vertical y los acentos `border-t` cyan/verde.

### Card 3 — Barra de progreso

Sin cambios estructurales, solo:
- En móvil, la fila inferior ("Próximo: Nivel 4" + "Pase del Amo · 20%") pasa a **stack vertical** (`flex-col sm:flex-row`) para evitar que el texto del premio se trunque o quede pegado.
- Gap `gap-1 sm:gap-2` entre filas.

### Detalles

- Sin nuevas dependencias.
- Sin tocar `FanZone.tsx` ni el grid de minijuegos.
- Sin cambios en data mock ni en `useAuth`.
- Mantiene animación framer-motion y CTA de login.


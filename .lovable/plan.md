

# Forzar layout 50/50 + barra full width en tablet/PC

El código ya tiene `grid-cols-1 sm:grid-cols-2`, pero en el screenshot de 1446px las cards siguen apiladas. Voy a hacerlo a prueba de cualquier conflicto de estilos.

## Cambio único — `src/components/fan-zone/FanStatsHero.tsx`

Reemplazar el contenedor del top row para usar **flex con anchos explícitos** en vez de grid, garantizando comportamiento predecible:

```tsx
{/* Top row — apilado en móvil, 50/50 desde md (≥768px) */}
<div className="flex flex-col md:flex-row gap-3">
  {/* CARD 1 — Perfil + Nivel */}
  <div className="md:w-1/2 rounded-2xl border border-border bg-card p-4 flex items-center gap-3 min-w-0">
    ...
  </div>

  {/* CARD 2 — Ranking + Puntos */}
  <div className="md:w-1/2 rounded-2xl border border-border bg-card overflow-hidden">
    ...
  </div>
</div>

{/* CARD 3 — Barra de progreso (siempre full width) */}
<div className="rounded-2xl border border-border bg-card p-4">
  ...
</div>
```

### Comportamiento resultante

```text
MÓVIL (<768px)              TABLET / PC (≥768px)
┌─────────────────────┐     ┌──────────┬──────────┐
│  Card 1 — Perfil    │     │ Card 1   │ Card 2   │
├─────────────────────┤     │  50%     │  50%     │
│  Card 2 — Stats     │     ├──────────┴──────────┤
├─────────────────────┤     │ Card 3 — Progress   │
│  Card 3 — Progress  │     │      100%           │
└─────────────────────┘     └─────────────────────┘
```

### Por qué `md:` (768px) en vez de `sm:` (640px)

- Más seguro para tablets en portrait y evita conflictos con cualquier breakpoint heredado.
- A 1446px (PC actual del usuario) entrará sin duda en el layout 50/50.

### Detalles

- Solo cambio el contenedor del top row y agrego `md:w-1/2` a cada card.
- Card 3 (barra de progreso) queda fuera del flex, siempre 100%.
- Sin tocar contenido interno, colores, tipografía, ni la animación framer-motion.
- Sin cambios en `FanZone.tsx` ni nada más.


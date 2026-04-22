

# Fan Zone — Header rediseñado en 3 mini cards

Voy a reemplazar el header actual de Fan Zone (`FanStatsHero.tsx`) por una composición de **3 mini cards** independientes, manteniendo el lenguaje minimal premium ya aprobado (fondo `bg-card`, bordes sutiles, sin glows excesivos, tipografía Poppins).

## Layout

```text
┌──────────────────────┬──────────────────────┐
│  CARD 1 — Perfil     │  CARD 2 — Stats      │
│  + Nivel             │  Ranking + Puntos    │
│  (50% width)         │  (50% width)         │
└──────────────────────┴──────────────────────┘
┌─────────────────────────────────────────────┐
│  CARD 3 — Barra de progreso (100% width)    │
└─────────────────────────────────────────────┘
```

Grid `grid-cols-2 gap-3` arriba, card full-width debajo. En mobile se mantiene 50/50 arriba (las cards son compactas, caben bien).

---

## Card 1 — Perfil + Nivel (izquierda, 50%)

- Avatar circular 48px a la izquierda con `ring-1 ring-border`.
- A la derecha del avatar, jerarquía vertical:
  - **Arriba grande**: nombre del nivel — `"Amo"` — Poppins extrabold, 18px, color **ámbar** (`hsl(42 95% 58%)`) con un mini ícono `Crown` al lado.
  - **Abajo pequeño**: `"Nivel 3"` en 11px uppercase tracking-wider muted.
- Debajo del bloque (o como tercera línea pequeña): nombre del usuario en 11px muted (secundario, ya no es protagonista del header — lo importante ahora es el nivel).
- Padding `p-4`, `rounded-2xl`, `border border-border bg-card`.

## Card 2 — Ranking + Puntos (derecha, 50%)

Dividida internamente en 2 mitades verticales con un divisor sutil (1px border en el medio):

- **Mitad izquierda — Ranking**:
  - Label arriba: `"RANKING"` 10px uppercase muted.
  - Número grande: `#42` Poppins extrabold 22px en **verde** (`hsl(152 76% 50%)`) con mini ícono `Trophy`.
  - Sublabel: `"de 1,250"` 10px muted.
- **Mitad derecha — Puntos**:
  - Label arriba: `"PUNTOS"` 10px uppercase en **cyan** (`hsl(189 100% 45%)`).
  - Número grande: `12,450` Poppins extrabold 22px en blanco con `tabular-nums tracking-tight`.
  - Sublabel: `"acumulados"` 10px muted.
- Para "resaltar" los dos números: pequeño `inset` con `bg-black/40` + `border-t` del color correspondiente (verde / cyan) en cada mitad — un acento sutil arriba de cada bloque, como un mini "indicator".

## Card 3 — Barra de progreso (full width, abajo)

- `rounded-2xl border border-border bg-card p-4`.
- **Fila superior** (flex justify-between):
  - Izquierda: `"Nivel 3 · Amo"` con ícono `Crown` ámbar pequeño — bold 12px.
  - Derecha: `"1,550 / 2,000 pts"` tabular-nums 12px muted.
- **Barra de progreso moderna**:
  - Altura **10px** (más prominente que la actual de 8px).
  - Fondo: `bg-white/8` rounded-full.
  - Fill: gradiente **cyan → verde** (`linear-gradient(90deg, cyan, green)`) con glow sutil (`box-shadow: 0 0 10px hsl(160 100% 50% / 0.45)`).
  - Pequeño "tick" o marca al final del fill (un punto blanco brillante de 4px) que indica la posición actual — toque "moderno" tipo XP bar.
  - Border-radius full pill.
- **Fila inferior** (flex justify-between, 11px muted):
  - Izquierda: `"Próximo: Nivel 4 · Amo Élite"`.
  - Derecha: `"🎁 Pase del Amo · 20% descuento"` con ícono `Gift`.

---

## CTA login (sin cambios)

Si `!user`, debajo de las 3 cards mantengo el botón cyan `"Inicia sesión para competir"` igual que ahora.

---

## Detalles técnicos

- **Archivo único modificado**: `src/components/fan-zone/FanStatsHero.tsx` — reescritura completa del JSX manteniendo el mismo export, props (`onLoginClick`) y data mock (`MOCK_STATS`, `LEVEL_NAME`, etc.). No toco `FanZone.tsx`, `MiniGameCard.tsx`, `games.ts` ni nada del grid de juegos.
- Conservo `useAuth()` para avatar/nombre y la animación de entrada con `framer-motion`.
- Colores reutilizados de las constantes ya definidas (`CYAN`, `GREEN`, `AMBER`).
- Sin cambios de dependencias, sin cambios de backend.


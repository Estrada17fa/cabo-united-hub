

# Fan Zone — Casino-Sport Hub

Reemplazaré el placeholder actual de `/fan-zone` por una página completa estilo "casino crypto app" mezclada con app deportiva, manteniendo el lenguaje visual del proyecto (Poppins, fondo #050505, cards #121212, primary cyan #00abc4, secondary pink #f298c0).

## Estructura de la página

```text
┌─────────────────────────────────────────┐
│  HERO STATS CARD (estilo "Tu Club")     │
│  - Avatar + nombre del usuario          │
│  - Ranking actual (#42 de 1,250)        │
│  - Puntos totales con icono brillante   │
│  - Barra de progreso al siguiente nivel │
│  - Glow cyan/pink + chip "Fan Zone"     │
└─────────────────────────────────────────┘
┌──────────── STRIP DE STATS ─────────────┐
│ Racha 🔥 5  ·  Nivel ⭐ 3  ·  Posición ▲ │
└─────────────────────────────────────────┘
┌─────────── MINIJUEGOS (grid) ───────────┐
│ ┌────────────┐  ┌────────────┐          │
│ │ Quiniela   │  │ Arma tu 11 │          │
│ │ del        │  │            │          │
│ │ Paraíso 🎯 │  │     ⚽     │          │
│ └────────────┘  └────────────┘          │
│ ┌────────────┐  ┌────────────┐          │
│ │ Marcador   │  │ Visitas al │          │
│ │ Exacto 🎰  │  │ Paraíso 🏟 │          │
│ └────────────┘  └────────────┘          │
│ ┌────────────┐  ┌────────────┐          │
│ │ Trivia 🧠  │  │ Amo del    │          │
│ │            │  │ Partido 👑 │          │
│ └────────────┘  └────────────┘          │
└─────────────────────────────────────────┘
```

## Hero Stats Card
- Mismo lenguaje que la card de "Tu Club" / "ADN Cabeño": rounded-2xl, borde sutil, fondo `#121212` con degradado radial cyan→pink en esquinas.
- Chip "FAN ZONE" arriba (negro 50% + borde cyan, igual que ADN Cabeño).
- Avatar del usuario (de `useAuth().profile`) + nombre.
- 2 métricas grandes lado a lado:
  - **Ranking actual** — `#42` con label "de 1,250 fans"
  - **Puntos** — `12,450 PTS` con icono Sparkles cyan + glow
- Barra de progreso al siguiente nivel (Progress component) con gradiente cyan→pink.
- Si el usuario no está autenticado → CTA "Inicia sesión para competir" abriendo el `AuthModal`.

## Cards de minijuegos (estilo casino crypto)
Grid `grid-cols-2` en mobile, `grid-cols-3` en desktop. Cada card:
- Fondo `#121212` con un **gradiente vibrante único por juego** en la esquina (radial blur, baja opacidad ~0.25).
- Icono grande Lucide flotando con glow del color del juego.
- Patrón decorativo sutil (puntos/grilla SVG) tipo casino.
- Título grande Poppins bold + subtítulo corto.
- Badge inferior con estado: "Jugar ahora", "Disponible", "Próximamente", o "+150 pts".
- Hover: scale 1.02, borde se ilumina del color del juego, glow más intenso.
- Animación de entrada escalonada con framer-motion.

Mapeo de juegos → icono + color:

| Juego | Icono Lucide | Color acento | Estado |
|---|---|---|---|
| Quiniela del Paraíso | `Ticket` | cyan #00abc4 | Jugar ahora |
| Arma tu 11 | `Users` | pink #f298c0 | Disponible |
| Marcador Exacto | `Target` | amber #f59e0b | Jugar ahora |
| Visitas al Paraíso | `MapPin` | green #22c55e | Disponible |
| Trivia | `Brain` | violet #a855f7 | Próximamente |
| Amo del Partido | `Crown` | gold #eab308 | Próximamente |

Al hacer click en una card → por ahora muestra un `toast` "Próximamente" (no creamos rutas individuales todavía, podemos hacerlo en un siguiente paso).

## Detalles visuales casino-crypto
- Glow rings (`shadow-[0_0_30px_-5px_<color>]`) en iconos.
- Pequeño "shine" diagonal en cards (gradiente blanco 5% animado opcional).
- Chips de estado tipo pill con punto pulsante cuando está "Jugar ahora".
- Tipografía Poppins extrabold para números grandes (ranking/puntos), tracking-tight.

## Archivos a crear/modificar

- `src/pages/FanZone.tsx` — reemplazo completo del placeholder.
- `src/components/fan-zone/FanStatsHero.tsx` — card de ranking + puntos.
- `src/components/fan-zone/MiniGameCard.tsx` — card reutilizable de minijuego.
- `src/components/fan-zone/games.ts` — config (id, nombre, icono, color, estado, descripción) de los 6 juegos.

## Datos
- Por ahora valores **mock** para ranking, puntos, racha y nivel (siguiente iteración: tabla `fan_stats` en backend con triggers de juegos).
- Avatar/nombre desde `useAuth()` real.

## Fuera de alcance (siguiente iteración)
- Lógica real de cada minijuego.
- Persistencia de puntos/ranking en Supabase.
- Leaderboard global.


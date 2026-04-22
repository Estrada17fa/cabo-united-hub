

## Fan Zone — Hub de juegos estilo casino premium

Rediseño de `/fan-zone` inspirado en la referencia de casino enviada (Itichy): grid denso de "tarjetas-juego" tipo portada vertical con arte propio, badges flotantes, header con saldo de puntos del usuario y filtros. Manteniendo paleta cyan/rosa sobre negro y tipografía Poppins — sin neones excesivos.

### Concepto visual

- **Header del hub**: barra superior tipo dashboard de casino:
  - Izquierda: título "Fan Zone" + chip "Temporada activa".
  - Centro/derecha: pill con saldo de puntos (`🏆 1,240 pts`), racha (`🔥 4 sem`) y ranking (`#18`). Estilo glass-pill como el resto del sitio.
- **Banner promocional doble** (réplica del bloque "Casino / Sport" de la referencia):
  - Card grande izquierda (cyan): "Esta semana se juega doble" — destaca Quiniela activa con CTA "Jugar ahora".
  - Card grande derecha (rosa): "Vota al Amo del Partido" — se activa al minuto 70.
  - Ambas con halo radial muy sutil del color de acento + ilustración/ícono grande a la derecha.
- **Filtros tipo casino**: tabs pill "Todos · Predicciones · Conocimiento · Comunidad" + buscador deshabilitado (placeholder "Próximamente").
- **Sección "Juegos destacados"** con grid de **portadas verticales** (aspect-ratio 3/4), tipo poster de slot:
  - Fondo: gradiente diagonal por juego (cyan→azul, rosa→magenta, verde→cyan, etc.) con halo radial central.
  - Ícono grande Lucide centrado arriba, con resplandor del color del juego.
  - Nombre del juego en `font-extrabold` abajo, subtítulo en una línea.
  - Badge esquina superior izquierda: "🔥 Activo", "Nuevo", "Min. 70", "Semanal".
  - Mini chip inferior con estado: "Cierra dom 18:00" / "5 preguntas" / "+50 pts".
  - Hover: scale 1.03, borde cyan, glow sutil.
- **Sección "Tu progreso"** debajo: 3 stats en bento (Puntos totales / Racha / Posición) + barra de progreso al siguiente nivel.

### Los 6 juegos (copy natural)

| Juego | Acento | Badge | Copy corto |
|---|---|---|---|
| Quiniela del Paraíso | Cyan | 🔥 Activo | "Tres partidos, una corazonada." |
| Arma tu 11 | Rosa | Semanal | "Tú pones la alineación." |
| Marcador Exacto | Verde | Semanal | "Atrévete con el resultado clavado." |
| Trivia del Paraíso | Violeta | Nueva | "Cinco preguntas, pura gloria." |
| Visitas al Paraíso | Ámbar | Explora | "Recorre, fotografía, suma." |
| Amo del Partido | Magenta | Min. 70 | "Tú decides quién brilló." |

### Layout

```text
┌────────────────────────────────────────────────┐
│ Fan Zone        [🏆 1240][🔥 4][#18]           │
├────────────────────────────────────────────────┤
│ ┌─ Quiniela activa ──┐ ┌─ Vota al Amo ──┐     │
│ │ cyan + CTA         │ │ rosa + CTA      │     │
│ └────────────────────┘ └─────────────────┘     │
│                                                │
│ [Todos][Predicciones][Conocimiento][Comunidad] │
│                                                │
│ Juegos destacados                              │
│ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐                  │
│ │QP│ │A11│ │ME│ │TP│ │VP│ │AP│   (móvil 2col)  │
│ └──┘ └──┘ └──┘ └──┘ └──┘ └──┘   (desktop 3-4)  │
│                                                │
│ Tu progreso  [puntos][racha][rank][barra]      │
└────────────────────────────────────────────────┘
```

- **Móvil (390)**: 2 columnas de portadas, banners apilados, header compacto.
- **Desktop**: 3–4 columnas de portadas, banners lado a lado.

### Cambios técnicos

- **Reescribir** `src/pages/FanZone.tsx`:
  - Array `GAMES` con `{ id, title, tagline, status, badge, icon, gradient, accentColor }`.
  - Componentes locales: `HeroPromo` (banner cyan/rosa), `FilterTabs`, `GamePoster` (card vertical 3/4), `ProgressStrip`.
  - Grid: `grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4`.
  - Cada `GamePoster` con gradiente inline + halo radial (sin imágenes externas, todo CSS + Lucide).
  - `framer-motion` para stagger inicial y `whileHover`/`whileTap`.
  - Tap en cualquier juego → toast `sonner` "Pronto disponible — estamos afinando las reglas".
- **Sin nuevas dependencias**, sin tocar tema, sin tocar otras páginas.
- **Sin backend** todavía. Cuando definas reglas de puntos, cada juego tendrá su ruta `/fan-zone/<id>` con persistencia en Lovable Cloud.

### Fuera de alcance

- Mecánicas reales de cada juego, sistema de puntos, ranking real, verificación de visitas, integración con minuto en vivo, autenticación obligatoria para jugar.


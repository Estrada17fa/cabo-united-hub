

# Fan Zone — Hub de Juegos (Mockups Jugables)

Convertimos `/fan-zone` en un hub estilo "app de casino" con 6 mini-juegos, manteniendo el look Dark Bento Modular (cards #121212, cyan #00FFFF, glass-pill, Poppins). Todo con datos mock — sin backend todavía. UI completa y jugable para validar el flujo antes de conectar persistencia.

## Estructura de la página `/fan-zone`

```text
┌─────────────────────────────────────────┐
│ HERO: "Fan Zone"                        │
│ Sub: "Juega, predice y gana puntos"     │
│ Chip de puntos del usuario: ⭐ 240 pts  │
├─────────────────────────────────────────┤
│ STRIP HORIZONTAL: "Esta semana"         │
│ → Próximo partido LCU + countdown       │
├─────────────────────────────────────────┤
│ GRID DE JUEGOS (Bento 2 cols móvil)     │
│ [Quiniela]   [Arma tu 11]               │
│ [Marcador]   [Trivia]                   │
│ [Visitas]    [Amo del Partido]          │
├─────────────────────────────────────────┤
│ MINI-LEADERBOARD (top 5 mock)           │
└─────────────────────────────────────────┘
```

## Las 6 cards del grid

Cada card sigue el patrón visual de Match Zone: fondo oscuro, borde sutil, icono en contenedor 16x16, título bold, descripción corta, chip de puntos (`+10 pts`), badge de estado (Disponible / Bloqueado / Activo / Próximamente al min 70).

| Juego | Icono | Estado mock | Puntos placeholder |
|---|---|---|---|
| Quiniela del Paraíso | Trophy | Disponible | +10 por acierto |
| Arma tu 11 | Users | Disponible | +5 gol / +3 asist / +5 portería 0 |
| Marcador Exacto | Target | Disponible | +25 por acierto exacto |
| Trivia del Paraíso | Brain | Disponible | +5 por respuesta correcta |
| Visitas al Paraíso | MapPin | Escanear QR | +15 por lugar |
| Amo del Partido | Star | "Se activa al min 70" (bloqueado) | +5 por participar |

Tap en una card → abre vista completa del juego (modal full-screen tipo Sheet en móvil, dialog en desktop).

## Vistas de cada juego (mockups jugables)

1. **Quiniela del Paraíso** — 3 partidos de la jornada (1 fijo LCU + 2 elegibles de una lista). Por cada partido: tres botones glass-pill (Local / Empate / Visita). Botón final "Guardar predicción" → toast de confirmación.

2. **Arma tu 11** — Cancha vertical con 11 slots por formación (4-3-3 default). Tap en slot abre lista de jugadores (uso del ROSTER de `Club.tsx`). Resumen abajo con contador "11/11 seleccionados" + botón guardar.

3. **Marcador Exacto** — Card grande con escudos LCU vs rival, dos steppers numéricos (0-9) con botones +/−. Botón "Enviar marcador".

4. **Trivia del Paraíso** — 5 preguntas mock una por una, 4 opciones tipo radio-pill, barra de progreso arriba, pantalla final con "Acertaste X/5 → +Y pts".

5. **Visitas al Paraíso** — Lista de lugares (reutilizamos los de `ConoceLosCabos`), cada uno con estado (Visitado ✓ / No visitado), botón grande "Escanear QR" que abre un modal con placeholder de cámara y mensaje "Acércate al QR del lugar".

6. **Amo del Partido** — Estado bloqueado por defecto con countdown "Disponible al minuto 70". Mock toggle (solo dev) para mostrar la versión activa: grid de los 11 titulares con foto/número, tap = voto, barra de % de votos en vivo (mock).

## Detalles técnicos

- **Archivos nuevos** (todo en `src/components/fan-zone/`):
  - `GameCard.tsx` — card genérica del grid (icono, título, descripción, badge estado, chip puntos)
  - `GameModal.tsx` — wrapper Sheet/Dialog responsive
  - `games/QuinielaGame.tsx`
  - `games/ArmaTu11Game.tsx`
  - `games/MarcadorExactoGame.tsx`
  - `games/TriviaGame.tsx`
  - `games/VisitasGame.tsx`
  - `games/AmoDelPartidoGame.tsx`
  - `UserPointsChip.tsx` — chip ⭐ con puntos mock (240)
  - `WeeklyMatchStrip.tsx` — strip con próximo partido LCU + countdown
  - `MiniLeaderboard.tsx` — top 5 hardcoded
- **Archivo editado**: `src/pages/FanZone.tsx` — reemplazo completo del placeholder.
- **Sin cambios en backend**: cero migraciones, cero edge functions. Todos los datos viven en constantes locales `MOCK_*` dentro de cada componente, claramente marcadas para reemplazar después.
- **Animaciones**: Framer Motion — fade/slide al abrir cada juego, layoutId en chips activos, AnimatePresence para preguntas de trivia.
- **Responsive**: grid 2 cols en móvil (`grid-cols-2`), 3 cols desde `md`. Modales = `Sheet` side="bottom" en móvil, `Dialog` en desktop.
- **Auth-gating**: si el usuario no está logueado, tap en card abre el `AuthModal` existente en lugar del juego.
- **Reutilizamos**: `Sheet`, `Dialog`, `Button`, `Badge`, `Progress`, `RadioGroup`, `Card` de shadcn; `useAuth` para el gate; `lcuCrest`, `ROSTER` y assets de Club.tsx.

## Lo que NO se hace en esta fase

- Sin tablas Supabase, sin RLS, sin guardar predicciones reales.
- Sin lógica real de puntos (números visibles son placeholder).
- Sin escáner QR funcional (solo UI con placeholder de cámara).
- Sin admin para configurar la jornada activa (postponed).
- Sin leaderboard real (top 5 hardcoded).

Próxima fase (cuando apruebes esta): definir esquema de puntos, crear tablas (`weekly_quinielas`, `quiniela_picks`, `fantasy_lineups`, `exact_score_picks`, `trivia_questions`, `trivia_answers`, `venue_visits`, `motm_votes`), edge function para activar "Amo del Partido" al minuto 70, y QR scanner real con `@zxing/browser`.


# Fan Zone como página teaser "Próximamente"

## Diagnóstico (estado actual)

`src/pages/FanZone.tsx` hoy arma la página con cuatro bloques:

- **Panel de usuario**: `FanCard` (`src/components/fan-zone/FanCard.tsx`) — avatar, nivel, XP, Cabo Coins y barra de progreso; lee datos reales vía `useAuth` + `useFanProfile` + `progressToNext`. Sin actividad, todo aparece en ceros. (Existe además `FanStatsHero.tsx`, un panel con datos mock que la página ya no usa.)
- **CTA "Inicia sesión para competir"** duplicado: uno en desktop y otro sticky en móvil; ambos abren un `Dialog` con `AuthModal` (solo login, no el registro completo).
- **Minijuegos**: se leen de la tabla `games` y se pintan con `MiniGameCard`, forzados a estado "soon".
- **Ranking + Premios**: `RankingCard` y `PrizesCarouselCard`.

El flujo de registro real del sitio es el que usa `StreamGate` en Match Zone: `AuthFlow` (crear cuenta, 3 pasos) y `AuthModal` (ya tengo cuenta). Ese mismo par se reutiliza aquí.

## Qué se construye

Reescribir solo `src/pages/FanZone.tsx` como teaser, con el look Match Zone (hairline, `bg-card`, cyan disciplinado, Space Grotesk en títulos y números):

1. **Panel de usuario oculto** — se deja de renderizar `FanCard` en esta página. El componente no se borra (sirve para el lanzamiento); tampoco se toca `MiPerfil`.
2. **Hero teaser** — badge "Próximamente", título Space Grotesk ("La Fan Zone viene en camino") y subtítulo que explica el concepto: juega minijuegos, gana Cabo Coins, sube de Visitante a Local, canjea premios.
3. **Qué va a haber** — las 4 tarjetas de minijuegos (Quiniela del Paraíso, Arma tu 11, Marcador Exacto, Visitas al Paraíso) con ícono y descripción, cada una con sello discreto "Próximamente" y sin acción al tocarlas.
4. **Premios / beneficios** — tira corta de 3 ítems: Cabo Coins canjeables (mercancía, boletos, experiencias), niveles (Visitante → Local), sorteos entre miembros. Texto breve, sin ornamento.
5. **CTA de cuenta** —
   - Sin sesión: bloque destacado "Crea tu cuenta y sé de los primeros — te avisamos cuando abra la Fan Zone", botón cyan que abre `AuthFlow` y link secundario "Ya tengo cuenta" que abre `AuthModal`.
   - Con sesión: mismo bloque, pero con el mensaje "Ya estás dentro — te avisaremos en cuanto abra la Fan Zone" y sin panel de puntos.

Se quitan de esta página el ranking y el carrusel de premios en su forma actual (dependen del sistema que aún no existe); el incentivo se comunica en el bloque 4.

## Detalles técnicos

- Solo cambia `src/pages/FanZone.tsx`; se reutilizan `MiniGameCard` (estado "soon" ya soportado), `SectionHeader`, `LcuButton`, `AuthFlow`, `AuthModal`, `useAuth`.
- Las 4 tarjetas se toman de la lista estática `src/components/fan-zone/games.ts` para no depender de la tabla `games` ni de su orden actual.
- Nada de backend: sin migraciones, sin tablas de lista de espera, sin cambios de auth. No se toca Match Zone, Mi Club, admin ni el shell.
- Colores solo con tokens (`--brand-primary`, `border-border`, `bg-card`); tipografía Inter + Space Grotesk como en Match Zone.

# Borrado total de Match Zone (reset a cero)

Objetivo: dejar Match Zone completamente vacía —interfaz, admin y base de datos— para reconstruir el look desde cero en un siguiente paso.

## Qué se borra

**Interfaz pública**
- Toda la carpeta `src/components/match-zone/` (24 componentes: hero en vivo, timeline, tablas, bracket, goleo, fixtures, chips, etc.).
- Los componentes del kit visual usados solo por Match Zone: `MatchCard`, `HeroCard`, `BentoTile`, `LiveBadge`, `Crest` (se conservan `SectionHeader`, `LcuTabs`, `LcuButton` porque los usan otras páginas).
- `src/pages/ZonaPartido.tsx` queda como una página mínima en blanco (solo un placeholder "Match Zone"), manteniendo la ruta `/zona-partido` y el enlace del menú para no romper la navegación.
- Hooks de datos: `useLeague.tsx`, `useLiveMatch.tsx`, `useTeamLogos.tsx`.

**Panel de admin**
- `src/pages/admin/MatchZoneAdmin.tsx` y su entrada en el menú de `/admin`. El resto del admin (lista de espera de abonos) queda intacto.

**Base de datos**
- Se eliminan las tablas `matches`, `match_events`, `teams`, `league_standings`, `top_scorers`, junto con sus triggers y funciones asociadas: `matches_apply_points`, `matches_refresh_standings`, `recalculate_standings`, `compute_match_points`, `set_standings_adjustment`, `sync_match_status_from_phase`, y los tipos `match_status`, `match_event_type`, `match_source`.
- Esto borra de forma permanente los partidos, equipos, posiciones y goleo capturados. No hay vuelta atrás.

## Efectos colaterales que hay que resolver en el mismo paso

1. **Página de inicio (`/`)**: hoy consulta `matches` y `league_standings` para el bloque de partido destacado, los 3 próximos partidos y la mini tabla de posiciones. Esos tres bloques se retiran del home junto con Match Zone (se reconstruirán con el nuevo diseño).
2. **QR de partido (`issue-match-qr`)**: la función valida el partido contra la tabla `matches`. Se desactiva esa validación temporalmente: la función deja de emitir QR de partido y responde "no disponible" hasta que exista el nuevo modelo de partidos. El QR de membresía/comercios sigue funcionando igual.
3. **Pases**: `fan_passes` y el sistema de niveles no se tocan.

## Después del borrado

Match Zone queda como una página vacía y la base de datos limpia. En el siguiente turno definimos juntos el nuevo look (referencias, jerarquía, secciones) y reconstruimos tanto el modelo de datos como la interfaz desde cero.

/**
 * Política de frescura de datos.
 * Lo que casi no cambia se cachea fuerte; el partido en vivo se refresca rápido.
 */

/** Plantel, noticias, lugares, afición, juvenil, equipos, torneo. */
export const STATIC_STALE = 30 * 60 * 1000; // 30 min

/** Contenido editable desde el panel (tienda, patrocinadores). */
export const CONTENT_STALE = 10 * 60 * 1000; // 10 min

/** Partidos, posiciones y goleo: cambian en día de juego. */
export const LIVE_STALE = 30 * 1000; // 30 s

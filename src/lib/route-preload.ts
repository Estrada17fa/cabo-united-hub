/**
 * Precarga de chunks de ruta.
 *
 * `App.tsx` usa estos mismos loaders con `React.lazy`, así que precargarlos
 * calienta exactamente el módulo que la navegación va a necesitar: al hacer
 * clic el código ya está en memoria y la página aparece de inmediato.
 */
export const routeLoaders: Record<string, () => Promise<unknown>> = {
  "/zona-partido": () => import("@/pages/ZonaPartido"),
  "/club": () => import("@/pages/Club"),
  "/fan-zone": () => import("@/pages/FanZone"),
  "/accesos": () => import("@/pages/Accesos"),
  "/mi-pase": () => import("@/pages/MiPase"),
  "/comercios": () => import("@/pages/Comercios"),
  "/tienda": () => import("@/pages/Tienda"),
  "/tienda/buscar": () => import("@/pages/TiendaBuscar"),
  "/conoce-los-cabos": () => import("@/pages/ConoceLosCabos"),
  "/patrocinios": () => import("@/pages/Patrocinios"),
  "/contacto": () => import("@/pages/Contacto"),
  "/mi-perfil": () => import("@/pages/MiPerfil"),
  "/abonos": () => import("@/pages/Abonos"),
};

const started = new Set<string>();

/** Dispara la descarga del chunk de una ruta (idempotente, nunca lanza). */
export function preloadRoute(path: string) {
  const key = Object.keys(routeLoaders).find(
    (p) => path === p || path.startsWith(`${p}/`),
  );
  if (!key || started.has(key)) return;
  started.add(key);
  void routeLoaders[key]().catch(() => started.delete(key));
}

/** Rutas principales que vale la pena tener listas siempre. */
const PRIMARY_ROUTES = [
  "/zona-partido",
  "/club",
  "/tienda",
  "/conoce-los-cabos",
  "/fan-zone",
  "/mi-pase",
];

const idle = (fn: () => void) => {
  const ric = (window as unknown as { requestIdleCallback?: (cb: () => void) => void })
    .requestIdleCallback;
  if (ric) ric(fn);
  else window.setTimeout(fn, 800);
};

/** Precarga en segundo plano, escalonada para no competir con la vista actual. */
export function preloadPrimaryRoutes() {
  idle(() => {
    PRIMARY_ROUTES.forEach((path, i) => {
      window.setTimeout(() => preloadRoute(path), i * 150);
    });
  });
}

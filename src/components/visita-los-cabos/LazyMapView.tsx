import { Suspense, lazy, type ComponentProps } from "react";
import type { MapView as MapViewType } from "./MapView";

/** Mapbox (~200 KB) sale del paquete inicial y se descarga sólo con el mapa. */
const MapView = lazy(() =>
  import("./MapView").then((m) => ({ default: m.MapView })),
);

const MapPlaceholder = () => (
  <div className="h-full w-full animate-pulse rounded-2xl border border-hairline bg-surface-2/60" />
);

export function LazyMapView(props: ComponentProps<typeof MapViewType>) {
  return (
    <Suspense fallback={<MapPlaceholder />}>
      <MapView {...props} />
    </Suspense>
  );
}

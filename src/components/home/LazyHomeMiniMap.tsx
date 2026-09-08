import { Suspense, lazy, useEffect, useRef, useState, type ComponentProps } from "react";
import type { HomeMiniMap as HomeMiniMapType } from "./HomeMiniMap";

const HomeMiniMap = lazy(() =>
  import("./HomeMiniMap").then((m) => ({ default: m.HomeMiniMap })),
);

/**
 * Mini mapa del inicio: mapbox se descarga sólo cuando el bloque entra en
 * pantalla, así el primer render del inicio no carga la librería del mapa.
 */
export function LazyHomeMiniMap(props: ComponentProps<typeof HomeMiniMapType>) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || visible) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) setVisible(true);
      },
      { rootMargin: "300px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [visible]);

  return (
    <div ref={ref} className="h-full w-full">
      {visible && (
        <Suspense fallback={null}>
          <HomeMiniMap {...props} />
        </Suspense>
      )}
    </div>
  );
}

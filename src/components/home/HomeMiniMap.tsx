import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { MAPBOX_TOKEN, SPONSOR_GOLD, type Place } from "@/lib/visita-los-cabos-data";
import { useCategoryMeta } from "@/hooks/usePlaceCategories";
import { categoryIconSvg } from "@/components/visita-los-cabos/CategoryIcon";

mapboxgl.accessToken = MAPBOX_TOKEN;

/** Pin simplificado para el adelanto del mapa (sin selección ni patrocinios grandes). */
function buildPin(place: Place, color: string, icon: string): HTMLElement {
  const el = document.createElement("div");
  el.style.transform = "translate(-50%, -50%)";
  el.style.pointerEvents = "none";
  const isSponsor = place.tier === "patrocinador";
  const ring = isSponsor ? SPONSOR_GOLD : color;
  const size = isSponsor ? 26 : place.tier === "destacado" ? 22 : 12;

  if (place.logoUrl) {
    el.innerHTML = `
      <div style="width:${size}px;height:${size}px;border-radius:50%;background:hsl(0 0% 8%);
        border:1.5px solid ${ring};display:flex;align-items:center;justify-content:center;overflow:hidden;">
        <img src="${place.logoUrl}" alt="" style="width:${size - 6}px;height:${size - 6}px;object-fit:contain;border-radius:50%;" />
      </div>`;
    return el;
  }

  if (size > 12) {
    el.innerHTML = `
      <div style="width:${size}px;height:${size}px;border-radius:50%;background:hsl(0 0% 8%);
        border:1.5px solid ${ring};color:${ring};display:flex;align-items:center;justify-content:center;">
        ${categoryIconSvg(icon, size - 12)}
      </div>`;
    return el;
  }

  el.innerHTML = `<div style="width:10px;height:10px;border-radius:50%;background:${color};
    border:1px solid hsl(0 0% 100% / 0.35);"></div>`;
  return el;
}

interface Props {
  places: Place[];
  className?: string;
}

/** Adelanto real del mapa de Visita Los Cabos: pines reales, sin interacción. */
export function HomeMiniMap({ places, className = "" }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const { metaFor } = useCategoryMeta();

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [-109.9167, 22.8905],
      zoom: 11,
      attributionControl: false,
      interactive: false,
    });
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
      markersRef.current = [];
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = places.slice(0, 40).map((place) => {
      const meta = metaFor(place.category);
      return new mapboxgl.Marker({ element: buildPin(place, meta.color, meta.icon) })
        .setLngLat(place.coords)
        .addTo(map);
    });
  }, [places, metaFor]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={`h-full w-full overflow-hidden [&_.mapboxgl-control-container]:hidden ${className}`}
    />
  );
}

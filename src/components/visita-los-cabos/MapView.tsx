import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import {
  CATEGORY_META,
  MAPBOX_TOKEN,
  PLACES,
  Place,
  SPONSOR_GOLD,
} from "@/lib/visita-los-cabos-data";
import { categoryIconSvg } from "./CategoryIcon";

mapboxgl.accessToken = MAPBOX_TOKEN;

interface MapViewProps {
  filteredPlaces: Place[];
  selectedId: string | null;
  onSelect: (place: Place) => void;
}

function buildPinElement(place: Place, isSelected: boolean): HTMLElement {
  const wrapper = document.createElement("div");
  wrapper.style.cursor = "pointer";
  wrapper.style.transform = "translate(-50%, -100%)";

  const meta = CATEGORY_META[place.category];
  const ringStyle = isSelected
    ? "box-shadow: 0 0 0 3px hsl(0 0% 100%), 0 0 0 4px hsl(0 0% 0% / 0.6);"
    : "";

  if (place.tier === "patrocinador") {
    wrapper.innerHTML = `
      <div style="
        position: relative;
        width: 36px; height: 36px;
        border-radius: 10px;
        background: ${SPONSOR_GOLD};
        display: flex; align-items: center; justify-content: center;
        color: hsl(0 0% 8%);
        box-shadow: 0 0 12px ${SPONSOR_GOLD}66, 0 4px 10px hsl(0 0% 0% / 0.5);
        ${ringStyle}
      ">
        ${categoryIconSvg(meta.icon, 18)}
        <span style="
          position: absolute; top: -6px; right: -6px;
          width: 16px; height: 16px; border-radius: 50%;
          background: hsl(0 0% 8%);
          color: ${SPONSOR_GOLD};
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 2px 6px hsl(0 0% 0% / 0.6);
        ">
          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/></svg>
        </span>
      </div>
    `;
  } else if (place.tier === "destacado") {
    wrapper.innerHTML = `
      <div style="
        position: relative;
        width: 28px; height: 34px;
        ${ringStyle}
      ">
        <div style="
          width: 28px; height: 28px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          background: hsl(0 0% 8%);
          border: 1.5px solid ${meta.color};
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 8px hsl(0 0% 0% / 0.5);
        ">
          <span style="
            transform: rotate(45deg);
            color: ${meta.color};
            display: flex; align-items: center; justify-content: center;
          ">${categoryIconSvg(meta.icon, 13)}</span>
        </div>
      </div>
    `;
  } else {
    wrapper.innerHTML = `
      <div style="
        width: 12px; height: 12px;
        border-radius: 50%;
        background: ${meta.color};
        border: 1px solid hsl(0 0% 100% / 0.4);
        ${isSelected ? "box-shadow: 0 0 0 3px hsl(0 0% 100% / 0.8);" : ""}
      "></div>
    `;
  }

  return wrapper;
}

export function MapView({ filteredPlaces, selectedId, onSelect }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<Map<string, mapboxgl.Marker>>(new Map());
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  // Init map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [-109.6917, 23.0545],
      zoom: 11,
      attributionControl: false,
    });

    map.addControl(
      new mapboxgl.NavigationControl({ showCompass: false }),
      "top-left"
    );
    map.addControl(
      new mapboxgl.AttributionControl({ compact: true }),
      "bottom-right"
    );

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markersRef.current.clear();
    };
  }, []);

  // Sync markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const visibleIds = new Set(filteredPlaces.map((p) => p.id));

    // Remove markers no longer visible
    markersRef.current.forEach((marker, id) => {
      if (!visibleIds.has(id)) {
        marker.remove();
        markersRef.current.delete(id);
      }
    });

    // Add / refresh markers
    PLACES.forEach((place) => {
      if (!visibleIds.has(place.id)) return;

      const existing = markersRef.current.get(place.id);
      if (existing) {
        // Re-render element to reflect selection state
        const newEl = buildPinElement(place, place.id === selectedId);
        newEl.addEventListener("click", (e) => {
          e.stopPropagation();
          onSelectRef.current(place);
        });
        const oldEl = existing.getElement();
        oldEl.replaceWith(newEl);
        // Re-bind marker element
        existing.remove();
        const m = new mapboxgl.Marker({ element: newEl })
          .setLngLat(place.coords)
          .addTo(map);
        markersRef.current.set(place.id, m);
        return;
      }

      const el = buildPinElement(place, place.id === selectedId);
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        onSelectRef.current(place);
      });
      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat(place.coords)
        .addTo(map);
      markersRef.current.set(place.id, marker);
    });
  }, [filteredPlaces, selectedId]);

  // Fly to selected
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedId) return;
    const place = PLACES.find((p) => p.id === selectedId);
    if (!place) return;
    map.flyTo({
      center: place.coords,
      zoom: 14,
      duration: 1200,
      essential: true,
    });
  }, [selectedId]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full rounded-2xl overflow-hidden border border-border"
      style={{ minHeight: 360 }}
    />
  );
}

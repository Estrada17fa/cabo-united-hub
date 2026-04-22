import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import {
  CATEGORY_META,
  MAPBOX_TOKEN,
  PLACES,
  Place,
  SPONSOR_GREEN,
} from "@/lib/visita-los-cabos-data";

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
        background: ${SPONSOR_GREEN};
        display: flex; align-items: center; justify-content: center;
        box-shadow: 0 0 12px ${SPONSOR_GREEN}99, 0 4px 10px hsl(0 0% 0% / 0.5);
        ${ringStyle}
      ">
        <span style="font-size: 18px; line-height: 1;">${meta.emoji}</span>
        <span style="
          position: absolute; top: -6px; right: -6px;
          width: 16px; height: 16px; border-radius: 50%;
          background: hsl(42 100% 55%);
          color: hsl(0 0% 8%);
          font-size: 10px; font-weight: 800;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 2px 6px hsl(0 0% 0% / 0.6);
        ">★</span>
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
          background: hsl(0 0% 12%);
          border: 1.5px solid hsl(0 0% 100% / 0.3);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 8px hsl(0 0% 0% / 0.5);
        ">
          <span style="
            transform: rotate(45deg);
            color: ${meta.color};
            font-size: 14px;
          ">${meta.emoji}</span>
        </div>
      </div>
    `;
  } else {
    wrapper.innerHTML = `
      <div style="
        width: 12px; height: 12px;
        border-radius: 50%;
        background: hsl(0 0% 100% / 0.35);
        border: 1px solid hsl(0 0% 100% / 0.5);
        ${isSelected ? 'box-shadow: 0 0 0 3px hsl(0 0% 100% / 0.8);' : ''}
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
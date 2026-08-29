import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Loader2, Search } from "lucide-react";
import { MAPBOX_TOKEN } from "@/lib/visita-los-cabos-data";
import { adminInput, adminLabel } from "./AdminUI";

mapboxgl.accessToken = MAPBOX_TOKEN;

const DEFAULT_CENTER: [number, number] = [-109.6917, 23.0545]; // Los Cabos

interface Props {
  lat: number | null;
  lng: number | null;
  onChange: (lat: number, lng: number, area?: string) => void;
}

interface Suggestion {
  name: string;
  place: string;
  lat: number;
  lng: number;
}

/** Mini-mapa para fijar coordenadas: busca dirección o arrastra el pin. */
export function PlacePickerMap({ lat, lng, onChange }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState<Suggestion[]>([]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const start: [number, number] =
      lat != null && lng != null ? [lng, lat] : DEFAULT_CENTER;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: start,
      zoom: lat != null ? 14 : 10.5,
      attributionControl: false,
    });
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");

    const marker = new mapboxgl.Marker({ color: "#00ABC4", draggable: true }).setLngLat(start);
    if (lat != null && lng != null) marker.addTo(map);
    marker.on("dragend", () => {
      const p = marker.getLngLat();
      onChangeRef.current(Number(p.lat.toFixed(6)), Number(p.lng.toFixed(6)));
    });

    map.on("click", (e) => {
      marker.setLngLat(e.lngLat).addTo(map);
      onChangeRef.current(
        Number(e.lngLat.lat.toFixed(6)),
        Number(e.lngLat.lng.toFixed(6))
      );
    });

    mapRef.current = map;
    markerRef.current = marker;

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep marker in sync with external value
  useEffect(() => {
    const map = mapRef.current;
    const marker = markerRef.current;
    if (!map || !marker || lat == null || lng == null) return;
    marker.setLngLat([lng, lat]).addTo(map);
  }, [lat, lng]);

  const search = async () => {
    const q = query.trim();
    if (!q) return;
    setBusy(true);
    try {
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        q
      )}.json?access_token=${MAPBOX_TOKEN}&limit=5&proximity=-109.6917,23.0545&country=mx&language=es`;
      const res = await fetch(url);
      const json = await res.json();
      setResults(
        (json.features ?? []).map((f: any) => ({
          name: f.text as string,
          place: f.place_name as string,
          lng: f.center[0] as number,
          lat: f.center[1] as number,
        }))
      );
    } catch {
      setResults([]);
    }
    setBusy(false);
  };

  const pick = (s: Suggestion) => {
    setResults([]);
    setQuery(s.place);
    mapRef.current?.flyTo({ center: [s.lng, s.lat], zoom: 15 });
    onChangeRef.current(Number(s.lat.toFixed(6)), Number(s.lng.toFixed(6)));
  };

  return (
    <div>
      <span className={adminLabel}>Ubicación en el mapa</span>

      <div className="relative mb-2 flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              search();
            }
          }}
          placeholder="Buscar dirección o lugar…"
          className={adminInput}
        />
        <button
          type="button"
          onClick={search}
          disabled={busy}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-hairline bg-surface-2 px-3 text-xs font-semibold text-foreground hover:border-primary/50 disabled:opacity-60"
        >
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Search className="h-3.5 w-3.5" />}
        </button>

        {results.length > 0 && (
          <ul className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-xl border border-hairline bg-surface-1 shadow-xl">
            {results.map((r, i) => (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => pick(r)}
                  className="block w-full px-3 py-2 text-left text-[11px] text-foreground hover:bg-white/5"
                >
                  {r.place}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div
        ref={containerRef}
        className="h-52 w-full overflow-hidden rounded-xl border border-hairline"
      />

      <div className="mt-2 grid grid-cols-2 gap-2">
        <div>
          <span className={adminLabel}>Latitud</span>
          <input
            value={lat ?? ""}
            onChange={(e) =>
              onChangeRef.current(Number(e.target.value), lng ?? DEFAULT_CENTER[0])
            }
            inputMode="decimal"
            className={adminInput}
          />
        </div>
        <div>
          <span className={adminLabel}>Longitud</span>
          <input
            value={lng ?? ""}
            onChange={(e) =>
              onChangeRef.current(lat ?? DEFAULT_CENTER[1], Number(e.target.value))
            }
            inputMode="decimal"
            className={adminInput}
          />
        </div>
      </div>
      <p className="mt-1 text-[10px] text-muted-foreground">
        Da clic en el mapa o arrastra el pin para fijar el punto exacto.
      </p>
    </div>
  );
}

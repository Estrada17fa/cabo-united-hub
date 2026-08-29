import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type {
  FanRoute,
  Place,
  PlaceCategory,
  PlaceTier,
} from "@/lib/visita-los-cabos-data";

interface PlaceRow {
  id: string;
  name: string;
  category: string;
  tier: string;
  description: string | null;
  area: string | null;
  hours: string | null;
  lat: number | null;
  lng: number | null;
  photo_url: string | null;
  logo_url: string | null;
  photo_gradient: string | null;
  whatsapp: string | null;
  visited_by: number | null;
  going_today: number | null;
  rating: number | null;
  featured: boolean;
  sort_order: number;
  published: boolean;
}

export function normalizePlace(row: PlaceRow): Place {
  return {
    id: row.id,
    name: row.name,
    category: row.category as PlaceCategory,
    tier: row.tier as PlaceTier,
    coords: [Number(row.lng ?? 0), Number(row.lat ?? 0)],
    area: row.area,
    description: row.description,
    hours: row.hours,
    visitedBy: row.visited_by,
    rating: row.rating != null ? Number(row.rating) : null,
    goingToday: row.going_today,
    whatsapp: row.whatsapp,
    photoUrl: row.photo_url,
    photoGradient: row.photo_gradient,
    featured: row.featured,
  };
}

/** Lugares publicados con coordenadas válidas, listos para el mapa. */
export function usePlaces() {
  return useQuery({
    queryKey: ["places", "public"],
    queryFn: async (): Promise<Place[]> => {
      const { data, error } = await supabase
        .from("places")
        .select("*")
        .eq("published", true)
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true });
      if (error) throw error;
      return (data as PlaceRow[])
        .filter((r) => r.lat != null && r.lng != null)
        .map(normalizePlace);
    },
  });
}

/** Rutas publicadas con sus paradas ordenadas. */
export function useFanRoutes() {
  return useQuery({
    queryKey: ["fan_routes", "public"],
    queryFn: async (): Promise<FanRoute[]> => {
      const { data, error } = await supabase
        .from("fan_routes")
        .select(
          "id, name, description, icon, color, duration, sort_order, fan_route_stops(position, places(id, name, category, area))"
        )
        .eq("published", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;

      return (data ?? []).map((r: any) => ({
        id: r.id,
        name: r.name,
        description: r.description,
        icon: r.icon || "flag",
        color: r.color,
        duration: r.duration,
        stops: (r.fan_route_stops ?? [])
          .filter((s: any) => s.places)
          .sort((a: any, b: any) => a.position - b.position)
          .map((s: any) => ({
            placeId: s.places.id,
            name: s.places.name,
            category: s.places.category as PlaceCategory,
            area: s.places.area,
          })),
      }));
    },
  });
}

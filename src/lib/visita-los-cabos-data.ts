export const MAPBOX_TOKEN =
  "pk.eyJ1IjoiZW1pbGlvZXMxNyIsImEiOiJjbW85bXFmbHowYWVuMnNwdHZqbjNvaHBiIn0.FkXp1K9sD08aY2yXyLToyg";

export type PlaceTier = "patrocinador" | "destacado" | "basico";

/** Slug de la categoría; el catálogo vive en la tabla `place_categories`. */
export type PlaceCategory = string;

/** Metadata de un tipo de lugar administrable. */
export interface PlaceCategoryMeta {
  slug: string;
  label: string;
  icon: string;
  color: string;
  gradient: string | null;
  sortOrder: number;
  active: boolean;
}


/** Lugar tal como lo consume el sitio (normalizado desde la tabla `places`). */
export interface Place {
  id: string;
  name: string;
  category: PlaceCategory;
  tier: PlaceTier;
  coords: [number, number]; // [lng, lat] for Mapbox
  area: string | null;
  description: string | null;
  hours: string | null;
  visitedBy: number | null;
  rating: number | null;
  goingToday: number | null;
  whatsapp: string | null;
  photoUrl: string | null;
  logoUrl: string | null;
  photoGradient: string | null;
  featured: boolean;
}

export interface FanRouteStop {
  placeId: string;
  name: string;
  category: PlaceCategory;
  area: string | null;
}

export interface FanRoute {
  id: string;
  icon: string;
  name: string;
  description: string | null;
  color: string | null;
  duration: string | null;
  stops: FanRouteStop[];
}

export const CATEGORY_META: Record<
  PlaceCategory,
  { label: string; icon: string; color: string }
> = {
  restaurantes: { label: "Restaurantes", icon: "utensils", color: "#F59E0B" },
  bares: { label: "Bares", icon: "beer", color: "#FF6B6B" },
  tours: { label: "Tours", icon: "waves", color: "#2DD4A7" },
  tiendas: { label: "Tiendas", icon: "shopping-bag", color: "#8B5CF6" },
  hoteles: { label: "Hoteles", icon: "bed-double", color: "#3B82F6" },
};

/** Degradado de respaldo por categoría cuando el lugar no tiene foto ni color propio. */
export const CATEGORY_GRADIENT: Record<PlaceCategory, string> = {
  restaurantes: "linear-gradient(135deg, hsl(20 80% 40%) 0%, hsl(340 60% 30%) 100%)",
  bares: "linear-gradient(135deg, hsl(350 70% 38%) 0%, hsl(300 50% 24%) 100%)",
  tours: "linear-gradient(135deg, hsl(190 70% 32%) 0%, hsl(210 60% 22%) 100%)",
  tiendas: "linear-gradient(135deg, hsl(265 55% 38%) 0%, hsl(230 50% 24%) 100%)",
  hoteles: "linear-gradient(135deg, hsl(220 50% 30%) 0%, hsl(180 40% 20%) 100%)",
};

export const GRADIENT_PRESETS: { label: string; value: string }[] = [
  { label: "Atardecer", value: CATEGORY_GRADIENT.restaurantes },
  { label: "Noche", value: CATEGORY_GRADIENT.bares },
  { label: "Océano", value: CATEGORY_GRADIENT.tours },
  { label: "Violeta", value: CATEGORY_GRADIENT.tiendas },
  { label: "Costa", value: CATEGORY_GRADIENT.hoteles },
  {
    label: "Desierto",
    value: "linear-gradient(135deg, hsl(35 60% 34%) 0%, hsl(15 45% 20%) 100%)",
  },
];

export function placeBackground(place: Place): string {
  return (
    place.photoGradient ||
    CATEGORY_GRADIENT[place.category] ||
    CATEGORY_GRADIENT.restaurantes
  );
}

export const ROUTE_ICONS = ["flag", "users", "wine", "star", "waves", "utensils"];

// Gold accent for sponsor-tier places (pins, badges, verified)
export const SPONSOR_GOLD = "#F2B33D";

// Brand cyan for chrome/UI accents on this page
export const LCU_CYAN = "#00ABC4";

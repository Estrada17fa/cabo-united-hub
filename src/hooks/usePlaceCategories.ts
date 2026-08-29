import { useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  CATEGORY_GRADIENT,
  CATEGORY_META,
  FALLBACK_CATEGORY,
  type PlaceCategoryMeta,
} from "@/lib/visita-los-cabos-data";

interface CategoryRow {
  slug: string;
  label: string;
  icon: string;
  color: string;
  gradient: string | null;
  sort_order: number;
  active: boolean;
}

function normalize(row: CategoryRow): PlaceCategoryMeta {
  return {
    slug: row.slug,
    label: row.label,
    icon: row.icon || "map-pin",
    color: row.color || FALLBACK_CATEGORY.color,
    gradient: row.gradient,
    sortOrder: row.sort_order ?? 0,
    active: !!row.active,
  };
}

/** Catálogo completo de tipos de lugar (incluye inactivos), ordenado. */
export function usePlaceCategoriesAll() {
  return useQuery({
    queryKey: ["place_categories", "all"],
    queryFn: async (): Promise<PlaceCategoryMeta[]> => {
      const { data, error } = await supabase
        .from("place_categories")
        .select("slug, label, icon, color, gradient, sort_order, active")
        .order("sort_order", { ascending: true })
        .order("label", { ascending: true });
      if (error) throw error;
      return ((data ?? []) as CategoryRow[]).map(normalize);
    },
    staleTime: 5 * 60 * 1000,
  });
}

/** Solo las categorías activas, para el sitio público. */
export function usePlaceCategories() {
  const query = usePlaceCategoriesAll();
  const categories = useMemo(
    () => (query.data ?? []).filter((c) => c.active),
    [query.data]
  );
  return { ...query, categories };
}

/**
 * Resolutor de metadata por slug. Si el catálogo aún no cargó, usa el respaldo
 * en código para no dejar la UI sin ícono ni color.
 */
export function useCategoryMeta() {
  const { categories, isLoading } = usePlaceCategories();

  const map = useMemo(() => {
    const m = new Map<string, PlaceCategoryMeta>();
    categories.forEach((c) => m.set(c.slug, c));
    return m;
  }, [categories]);

  const metaFor = useCallback(
    (slug: string | null | undefined): PlaceCategoryMeta => {
      if (slug) {
        const found = map.get(slug);
        if (found) return found;
        const legacy = CATEGORY_META[slug];
        if (legacy) {
          return {
            slug,
            label: legacy.label,
            icon: legacy.icon,
            color: legacy.color,
            gradient: CATEGORY_GRADIENT[slug] ?? null,
            sortOrder: 0,
            active: true,
          };
        }
      }
      return FALLBACK_CATEGORY;
    },
    [map]
  );

  return { categories, metaFor, isLoading };
}

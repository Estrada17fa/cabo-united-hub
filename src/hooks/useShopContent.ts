import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type CtaType = "store" | "product" | "page" | "external";

export interface ShopHeroSlide {
  id: string;
  image_url: string | null;
  image_mobile_url: string | null;
  eyebrow: string | null;
  title: string;
  subtitle: string | null;
  show_cta: boolean;
  cta_type: CtaType;
  cta_ref: string | null;
  cta_label: string | null;
  cta_url: string | null;
  starts_at: string | null;
  ends_at: string | null;
  sort_order: number;
  published: boolean;
}

export interface ShopBanner {
  id: string;
  image_url: string | null;
  bg_color: string | null;
  title: string;
  body: string | null;
  cta_label: string | null;
  cta_url: string | null;
  sort_order: number;
  published: boolean;
}

const HERO_COLS =
  "id, image_url, image_mobile_url, eyebrow, title, subtitle, show_cta, cta_type, cta_ref, cta_label, cta_url, starts_at, ends_at, sort_order, published";

const BANNER_COLS =
  "id, image_url, bg_color, title, body, cta_label, cta_url, sort_order, published";

/** Diapositivas publicadas y vigentes (fechas comparadas contra ahora, en UTC). */
export function useShopHeroSlides() {
  return useQuery({
    queryKey: ["shop_hero_slides", "public"],
    staleTime: 60 * 1000,
    queryFn: async (): Promise<ShopHeroSlide[]> => {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from("shop_hero_slides")
        .select(HERO_COLS)
        .eq("published", true)
        .or(`starts_at.is.null,starts_at.lte.${now}`)
        .or(`ends_at.is.null,ends_at.gt.${now}`)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as ShopHeroSlide[];
    },
  });
}

/** Banners promocionales (los captura el admin). */
export function useShopBanners() {
  return useQuery({
    queryKey: ["shop_banners", "public"],
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<ShopBanner[]> => {
      const { data, error } = await supabase
        .from("shop_banners")
        .select(BANNER_COLS)
        .eq("published", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as ShopBanner[];
    },
  });
}

/** Portadas de línea capturadas en el admin: { oficial: url, ... }. */
export function useStoreLineCovers() {
  return useQuery({
    queryKey: ["store_line_covers"],
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<Record<string, string>> => {
      const { data, error } = await supabase.from("store_line_covers").select("line, image_url");
      if (error) throw error;
      const map: Record<string, string> = {};
      for (const r of data ?? []) if (r.image_url) map[r.line] = r.image_url;
      return map;
    },
  });
}

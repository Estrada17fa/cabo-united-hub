import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ShopHeroSlide {
  id: string;
  image_url: string | null;
  eyebrow: string | null;
  title: string;
  subtitle: string | null;
  cta_label: string | null;
  cta_url: string | null;
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
  "id, image_url, eyebrow, title, subtitle, cta_label, cta_url, sort_order, published";

const BANNER_COLS =
  "id, image_url, bg_color, title, body, cta_label, cta_url, sort_order, published";

/** Slides del hero editorial (los captura el admin). */
export function useShopHeroSlides() {
  return useQuery({
    queryKey: ["shop_hero_slides", "public"],
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<ShopHeroSlide[]> => {
      const { data, error } = await supabase
        .from("shop_hero_slides")
        .select(HERO_COLS)
        .eq("published", true)
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

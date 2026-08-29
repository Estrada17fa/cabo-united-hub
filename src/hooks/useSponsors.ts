import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Sponsor {
  id: string;
  name: string;
  logo_url: string;
  link_url: string | null;
  sort_order: number;
  is_active: boolean;
}

/** Patrocinadores activos, ordenados. Editables desde el panel de admin. */
export function useSponsors() {
  return useQuery({
    queryKey: ["lcu-sponsors"],
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<Sponsor[]> => {
      const { data, error } = await supabase
        .from("sponsors")
        .select("id, name, logo_url, link_url, sort_order, is_active")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Sponsor[];
    },
  });
}

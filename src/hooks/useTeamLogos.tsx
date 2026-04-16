import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useTeamLogos() {
  const { data: logoMap = {} } = useQuery({
    queryKey: ["team-logos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("teams")
        .select("name, logo_url");
      if (error) throw error;
      const map: Record<string, string> = {};
      data?.forEach((t) => {
        if (t.logo_url) map[t.name] = t.logo_url;
      });
      return map;
    },
    staleTime: 1000 * 60 * 10,
  });

  return logoMap;
}

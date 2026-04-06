import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { MatchList } from "./MatchList";

const GROUPS = [
  { id: "grupo1", label: "Grupo 1" },
  { id: "grupo2", label: "Grupo 2" },
  { id: "grupo3", label: "Grupo 3" },
];

export function LeagueMatchesByGroup() {
  const { data: matches = [], isLoading } = useQuery({
    queryKey: ["matches", "league-all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("matches")
        .select("*")
        .order("match_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // For now, distribute matches across groups as placeholder
  // In production, matches would have a group field
  const third = Math.ceil(matches.length / 3);
  const groups = [
    matches.slice(0, third),
    matches.slice(third, third * 2),
    matches.slice(third * 2),
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {GROUPS.map((group, idx) => (
        <div key={group.id} className="space-y-2">
          <h3 className="text-sm font-bold text-foreground">{group.label}</h3>
          <MatchList
            matches={groups[idx] || []}
            isLoading={isLoading}
            showScore
            emptyMessage={`No hay partidos en ${group.label}`}
          />
        </div>
      ))}
    </motion.div>
  );
}

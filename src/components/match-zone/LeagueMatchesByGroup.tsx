import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { MatchList } from "./MatchList";

const GROUPS = [
  { id: "grupo1", label: "Grupo 1" },
  { id: "grupo2", label: "Grupo 2" },
  { id: "grupo3", label: "Grupo 3" },
];

export function LeagueMatchesByGroup() {
  const [activeGroup, setActiveGroup] = useState("grupo1");

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

  const third = Math.ceil(matches.length / 3);
  const groupMatches: Record<string, typeof matches> = {
    grupo1: matches.slice(0, third),
    grupo2: matches.slice(third, third * 2),
    grupo3: matches.slice(third * 2),
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1 -mx-1 px-1">
        {GROUPS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveGroup(tab.id)}
            className="relative whitespace-nowrap pb-2 text-[11px] font-medium transition-colors shrink-0"
            style={{ color: activeGroup === tab.id ? "hsl(var(--primary))" : "hsl(0 0% 40%)" }}
          >
            {tab.label}
            {activeGroup === tab.id && (
              <motion.div
                layoutId="liga-partidos-group"
                className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary/60 rounded-full"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeGroup}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.15 }}
        >
          <MatchList
            matches={groupMatches[activeGroup] || []}
            isLoading={isLoading}
            showScore
            emptyMessage={`No hay partidos en ${GROUPS.find(g => g.id === activeGroup)?.label}`}
          />
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
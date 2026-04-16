import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MatchList } from "./MatchList";

const SUB_TABS = [
  { id: "proximos", label: "Próximos" },
  { id: "resultados", label: "Resultados" },
  { id: "todos", label: "Todos" },
];

export function PartidosSection() {
  const [subTab, setSubTab] = useState("proximos");

  const { data: allMatches = [], isLoading } = useQuery({
    queryKey: ["matches", "lcu-all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("matches")
        .select("*")
        .order("match_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const now = new Date();
  const upcoming = allMatches
    .filter((m) => new Date(`${m.match_date}T${m.match_time || "23:59:59"}`) >= now)
    .sort((a, b) => b.match_date.localeCompare(a.match_date));

  const results = allMatches
    .filter((m) => m.status === "finished" || new Date(`${m.match_date}T${m.match_time || "23:59:59"}`) < now)
    .sort((a, b) => b.match_date.localeCompare(a.match_date));

  const displayed =
    subTab === "proximos" ? upcoming : subTab === "resultados" ? results : allMatches;

  return (
    <div className="space-y-4">
      {/* Sub tabs */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex gap-3 overflow-x-auto scrollbar-hide pb-1 -mx-1 px-1"
      >
        {SUB_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSubTab(tab.id)}
            className="relative whitespace-nowrap pb-2 text-xs font-semibold transition-colors shrink-0"
            style={{ color: subTab === tab.id ? "hsl(0 0% 100%)" : "hsl(0 0% 45%)" }}
          >
            {tab.label}
            {subTab === tab.id && (
              <motion.div
                layoutId="partidos-subtab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
          </button>
        ))}
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div
          key={subTab}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.2 }}
        >
          <MatchList
            matches={displayed}
            isLoading={isLoading}
            showScore={subTab === "resultados"}
            emptyMessage={
              subTab === "proximos"
                ? "No hay próximos partidos programados"
                : subTab === "resultados"
                  ? "No hay resultados disponibles"
                  : "No hay partidos registrados"
            }
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

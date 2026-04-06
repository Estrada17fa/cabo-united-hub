import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StandingsTable, type StandingRow } from "./StandingsTable";
import { LeagueMatchesByGroup } from "./LeagueMatchesByGroup";

const SUB_TABS = [
  { id: "general", label: "Tabla General" },
  { id: "grupo1", label: "Grupo 1" },
  { id: "grupo2", label: "Grupo 2" },
  { id: "grupo3", label: "Grupo 3" },
  { id: "goleo", label: "Tabla de Goleo" },
  { id: "partidos", label: "Partidos" },
];

const LCU = "Los Cabos United";

export function LeagueTables() {
  const [subTab, setSubTab] = useState("general");

  const { data: standings = [] } = useQuery({
    queryKey: ["league_standings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("league_standings")
        .select("*")
        .order("pos", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const { data: scorers = [] } = useQuery({
    queryKey: ["top_scorers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("top_scorers")
        .select("*")
        .order("goals", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const general: StandingRow[] = standings
    .filter((s) => !s.group_name || s.group_name === "general")
    .map((s) => ({
      pos: s.pos, team: s.team, jj: s.jj, jg: s.jg, je: s.je, jp: s.jp,
      gf: s.gf, gc: s.gc, dg: s.dg, pts: s.pts,
    }));

  const getGroup = (name: string): StandingRow[] =>
    standings
      .filter((s) => s.group_name === name)
      .map((s) => ({
        pos: s.pos, team: s.team, jj: s.jj, jg: s.jg, je: s.je, jp: s.jp,
        gf: s.gf, gc: s.gc, dg: s.dg, pts: s.pts,
      }));

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
                layoutId="liga-subtab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
          </button>
        ))}
      </motion.div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={subTab}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.2 }}
        >
          {subTab === "general" && <StandingsTable rows={general} />}
          {subTab === "grupo1" && <StandingsTable rows={getGroup("grupo1")} title="Grupo 1" />}
          {subTab === "grupo2" && <StandingsTable rows={getGroup("grupo2")} title="Grupo 2" />}
          {subTab === "grupo3" && <StandingsTable rows={getGroup("grupo3")} title="Grupo 3" />}
          {subTab === "goleo" && <TopScorersTable scorers={scorers} />}
          {subTab === "partidos" && <LeagueMatchesByGroup />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

interface TopScorerData {
  player_name: string;
  team: string;
  goals: number;
}

function TopScorersTable({ scorers }: { scorers: TopScorerData[] }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      {scorers.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground text-sm">
          No hay datos de goleadores disponibles
        </div>
      ) : (
        <table className="w-full text-xs">
          <thead>
            <tr className="text-muted-foreground">
              <th className="text-left py-2 px-1.5 font-semibold w-6">#</th>
              <th className="text-left py-2 px-1.5 font-semibold">Jugador</th>
              <th className="text-left py-2 px-1.5 font-semibold">Equipo</th>
              <th className="text-center py-2 px-1.5 font-bold">Goles</th>
            </tr>
          </thead>
          <tbody>
            {scorers.map((s, i) => {
              const isLCU = s.team === "Los Cabos United";
              return (
                <tr key={`${s.player_name}-${i}`} className={`border-t border-border/50 ${isLCU ? "bg-primary/10" : ""}`}>
                  <td className="py-2.5 px-1.5 font-semibold text-muted-foreground">{i + 1}</td>
                  <td className="py-2.5 px-1.5">
                    <div className="flex items-center gap-1.5">
                      {isLCU && <div className="w-0.5 h-4 rounded-full bg-primary shrink-0" />}
                      <span className={`font-semibold ${isLCU ? "text-primary" : "text-foreground"}`}>{s.player_name}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-1.5 text-muted-foreground truncate max-w-[100px]">{s.team}</td>
                  <td className={`text-center py-2.5 px-1.5 font-bold ${isLCU ? "text-primary" : "text-foreground"}`}>{s.goals}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </motion.div>
  );
}

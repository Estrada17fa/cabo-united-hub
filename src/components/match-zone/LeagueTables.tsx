import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StandingsTable, type StandingRow } from "./StandingsTable";
import { Loader2, RefreshCw } from "lucide-react";

const SUB_TABS = [
  { id: "general", label: "Tabla General" },
  { id: "goleo", label: "Líderes de Goleo" },
];

interface TopScorer {
  name: string;
  team: string;
  goals: number;
}

export function LeagueTables() {
  const [subTab, setSubTab] = useState("general");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: standings = [], isLoading: loadingStandings } = useQuery({
    queryKey: ["league-standings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("league_standings")
        .select("*")
        .order("pos", { ascending: true });
      if (error) throw error;
      return (data || []).map((r) => ({
        pos: r.pos,
        team: r.team,
        jj: r.jj,
        jg: r.jg,
        je: r.je,
        jp: r.jp,
        gf: r.gf,
        gc: r.gc,
        dg: r.dg,
        pts: r.pts,
      })) as StandingRow[];
    },
  });

  const { data: topScorers = [], isLoading: loadingScorers } = useQuery({
    queryKey: ["top-scorers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("top_scorers")
        .select("*")
        .order("goals", { ascending: false });
      if (error) throw error;
      return (data || []).map((r) => ({
        name: r.player_name,
        team: r.team,
        goals: r.goals,
      })) as TopScorer[];
    },
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const { data, error } = await supabase.functions.invoke("scrape-league-data");
      if (error) throw error;
      console.log("Scrape result:", data);
      // Refetch queries
      window.location.reload();
    } catch (e) {
      console.error("Refresh error:", e);
    } finally {
      setIsRefreshing(false);
    }
  };

  const isLoading = loadingStandings || loadingScorers;
  const hasData = standings.length > 0 || topScorers.length > 0;

  return (
    <div className="space-y-4">
      {/* Sub tabs + refresh */}
      <div className="flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-3 overflow-x-auto scrollbar-hide pb-1"
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
                  layoutId="subtab-underline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          ))}
        </motion.div>

        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="text-muted-foreground hover:text-primary transition-colors p-1"
          title="Actualizar datos de la liga"
        >
          {isRefreshing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={subTab}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.2 }}
        >
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : !hasData ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              <p>No hay datos disponibles.</p>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="mt-3 text-primary hover:underline text-xs font-semibold"
              >
                {isRefreshing ? "Actualizando..." : "Cargar datos de la liga"}
              </button>
            </div>
          ) : (
            <>
              {subTab === "general" && <StandingsTable rows={standings} />}
              {subTab === "goleo" && <TopScorersTable scorers={topScorers} />}
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function TopScorersTable({ scorers }: { scorers: TopScorer[] }) {
  const LCU = "Los Cabos United";
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
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
            const isLCU = s.team === LCU;
            return (
              <tr key={s.name + i} className={`border-t border-border/50 ${isLCU ? "bg-primary/10" : ""}`}>
                <td className="py-2.5 px-1.5 font-semibold text-muted-foreground">{i + 1}</td>
                <td className="py-2.5 px-1.5">
                  <div className="flex items-center gap-1.5">
                    {isLCU && <div className="w-0.5 h-4 rounded-full bg-primary shrink-0" />}
                    <span className={`font-semibold ${isLCU ? "text-primary" : "text-foreground"}`}>{s.name}</span>
                  </div>
                </td>
                <td className="py-2.5 px-1.5 text-muted-foreground truncate max-w-[100px]">{s.team}</td>
                <td className={`text-center py-2.5 px-1.5 font-bold ${isLCU ? "text-primary" : "text-foreground"}`}>{s.goals}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </motion.div>
  );
}

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TeamCrest } from "./TeamCrest";

interface Standing {
  team: string;
  group_name: string | null;
}

const GROUPS = [
  { id: "grupo1", label: "Grupo 1" },
  { id: "grupo2", label: "Grupo 2" },
  { id: "grupo3", label: "Grupo 3" },
];

const LCU = "Los Cabos United";

export function LeagueTeamsByGroup({ standings, logoMap = {} }: { standings: Standing[]; logoMap?: Record<string, string> }) {
  const [activeGroup, setActiveGroup] = useState("grupo1");

  const getTeams = (group: string) =>
    standings
      .filter((s) => s.group_name === group)
      .map((s) => s.team)
      .sort((a, b) => a.localeCompare(b));

  const teams = getTeams(activeGroup);

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
                layoutId="liga-equipos-group"
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
          {teams.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4 text-center">
              No hay equipos registrados
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-1.5">
              {teams.map((team) => {
                const isLCU = team === LCU;
                return (
                  <div
                    key={team}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border transition-colors ${
                      isLCU
                        ? "border-primary/30 bg-primary/10"
                        : "border-border/50 bg-card/50"
                    }`}
                  >
                    <TeamCrest teamName={team} logoUrl={logoMap[team]} size={20} />
                    <span className={`text-xs font-semibold ${isLCU ? "text-primary" : "text-foreground"}`}>
                      {team}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
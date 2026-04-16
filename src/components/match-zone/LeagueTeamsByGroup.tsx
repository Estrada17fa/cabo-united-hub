import { motion } from "framer-motion";
import { Users } from "lucide-react";

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

export function LeagueTeamsByGroup({ standings }: { standings: Standing[] }) {
  const getTeams = (group: string) =>
    standings
      .filter((s) => s.group_name === group)
      .map((s) => s.team)
      .sort((a, b) => a.localeCompare(b));

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {GROUPS.map((group) => {
        const teams = getTeams(group.id);
        return (
          <div key={group.id} className="space-y-2">
            <h3 className="text-sm font-bold text-foreground">{group.label}</h3>
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
                      <Users className={`w-4 h-4 shrink-0 ${isLCU ? "text-primary" : "text-muted-foreground"}`} />
                      <span className={`text-xs font-semibold ${isLCU ? "text-primary" : "text-foreground"}`}>
                        {team}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </motion.div>
  );
}

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StandingsTable, type StandingRow } from "./StandingsTable";

const SUB_TABS = [
  { id: "general", label: "Tabla General" },
  { id: "grupo1", label: "Grupo 1" },
  { id: "grupo2", label: "Grupo 2" },
  { id: "grupo3", label: "Grupo 3" },
  { id: "goleo", label: "Líderes de Goleo" },
];

// Placeholder data
const GENERAL: StandingRow[] = [
  { pos: 1, team: "Coyotes de Tlaxcala", jj: 10, jg: 8, je: 1, jp: 1, gf: 22, gc: 8, dg: 14, pts: 25 },
  { pos: 2, team: "Inter Playa", jj: 10, jg: 7, je: 2, jp: 1, gf: 19, gc: 9, dg: 10, pts: 23 },
  { pos: 3, team: "Los Cabos United", jj: 10, jg: 6, je: 3, jp: 1, gf: 18, gc: 7, dg: 11, pts: 21 },
  { pos: 4, team: "Halcones de Zapopan", jj: 10, jg: 6, je: 2, jp: 2, gf: 16, gc: 10, dg: 6, pts: 20 },
  { pos: 5, team: "Lobos BUAP", jj: 10, jg: 5, je: 3, jp: 2, gf: 14, gc: 10, dg: 4, pts: 18 },
  { pos: 6, team: "Alacranes de Durango", jj: 10, jg: 5, je: 2, jp: 3, gf: 15, gc: 13, dg: 2, pts: 17 },
  { pos: 7, team: "Atlético Ensenada", jj: 10, jg: 4, je: 3, jp: 3, gf: 12, gc: 11, dg: 1, pts: 15 },
  { pos: 8, team: "Mineros de Cananea", jj: 10, jg: 4, je: 2, jp: 4, gf: 11, gc: 13, dg: -2, pts: 14 },
  { pos: 9, team: "Murciélagos FC", jj: 10, jg: 3, je: 3, jp: 4, gf: 10, gc: 12, dg: -2, pts: 12 },
  { pos: 10, team: "Ciervos FC", jj: 10, jg: 2, je: 2, jp: 6, gf: 8, gc: 16, dg: -8, pts: 8 },
];

const GROUP1 = GENERAL.slice(0, 5);
const GROUP2 = GENERAL.slice(2, 7).map((r, i) => ({ ...r, pos: i + 1 }));
const GROUP3 = GENERAL.slice(5, 10).map((r, i) => ({ ...r, pos: i + 1 }));

interface TopScorer {
  name: string;
  team: string;
  goals: number;
}

const TOP_SCORERS: TopScorer[] = [
  { name: "Carlos Méndez", team: "Coyotes de Tlaxcala", goals: 9 },
  { name: "Diego Ramírez", team: "Los Cabos United", goals: 7 },
  { name: "Andrés Solís", team: "Inter Playa", goals: 7 },
  { name: "Luis Torres", team: "Halcones de Zapopan", goals: 6 },
  { name: "Marco Ruiz", team: "Los Cabos United", goals: 5 },
  { name: "Pablo Herrera", team: "Lobos BUAP", goals: 5 },
];

export function LeagueTables() {
  const [subTab, setSubTab] = useState("general");

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
                layoutId="subtab-underline"
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
          {subTab === "general" && <StandingsTable rows={GENERAL} />}
          {subTab === "grupo1" && <StandingsTable rows={GROUP1} title="Grupo 1" />}
          {subTab === "grupo2" && <StandingsTable rows={GROUP2} title="Grupo 2" />}
          {subTab === "grupo3" && <StandingsTable rows={GROUP3} title="Grupo 3" />}
          {subTab === "goleo" && <TopScorersTable scorers={TOP_SCORERS} />}
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
              <tr key={s.name} className={`border-t border-border/50 ${isLCU ? "bg-primary/10" : ""}`}>
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

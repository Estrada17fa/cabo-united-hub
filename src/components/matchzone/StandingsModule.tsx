import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { STANDINGS, TOP_SCORERS, type StandingRow } from "./mockData";

type TabKey = "general" | "group1" | "group2" | "group3" | "goleo";

const TABS: { key: TabKey; label: string }[] = [
  { key: "general", label: "General" },
  { key: "group1", label: "Grupo 1" },
  { key: "group2", label: "Grupo 2" },
  { key: "group3", label: "Grupo 3" },
  { key: "goleo", label: "Goleo" },
];

function StandingsTable({ rows }: { rows: StandingRow[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="text-muted-foreground border-b border-border">
            <th className="text-left py-2 w-6">#</th>
            <th className="text-left py-2">Equipo</th>
            <th className="text-center py-2 w-6">PJ</th>
            <th className="text-center py-2 w-6">G</th>
            <th className="text-center py-2 w-6">E</th>
            <th className="text-center py-2 w-6">P</th>
            <th className="text-center py-2 w-6">DG</th>
            <th className="text-center py-2 w-8 font-bold">Pts</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr
              key={r.pos}
              className={`border-b border-border/50 ${r.isLCU ? "bg-primary/10" : ""}`}
            >
              <td className={`py-2 font-semibold ${r.isLCU ? "text-primary" : ""}`}>{r.pos}</td>
              <td className={`py-2 font-medium ${r.isLCU ? "text-primary" : ""}`}>{r.initials}</td>
              <td className="text-center py-2 text-muted-foreground">{r.played}</td>
              <td className="text-center py-2">{r.won}</td>
              <td className="text-center py-2">{r.drawn}</td>
              <td className="text-center py-2">{r.lost}</td>
              <td className="text-center py-2 text-muted-foreground">{r.gd > 0 ? `+${r.gd}` : r.gd}</td>
              <td className={`text-center py-2 font-bold ${r.isLCU ? "text-primary" : ""}`}>{r.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TopScorersTable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="text-muted-foreground border-b border-border">
            <th className="text-left py-2 w-6">#</th>
            <th className="text-left py-2">Jugador</th>
            <th className="text-center py-2">Equipo</th>
            <th className="text-center py-2 w-8 font-bold">Goles</th>
          </tr>
        </thead>
        <tbody>
          {TOP_SCORERS.map((s, i) => {
            const isLCU = s.team === "LCU";
            return (
              <tr key={i} className={`border-b border-border/50 ${isLCU ? "bg-primary/10" : ""}`}>
                <td className="py-2 font-semibold">{i + 1}</td>
                <td className={`py-2 font-medium ${isLCU ? "text-primary" : ""}`}>{s.name}</td>
                <td className="text-center py-2 text-muted-foreground">{s.team}</td>
                <td className={`text-center py-2 font-bold ${isLCU ? "text-primary" : ""}`}>{s.goals}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function StandingsModule() {
  const [active, setActive] = useState<TabKey>("general");

  const getContent = () => {
    if (active === "goleo") return <TopScorersTable />;
    const data = STANDINGS[active === "general" ? "general" : active];
    return <StandingsTable rows={data} />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="bento-card"
    >
      <h2 className="text-title mb-3">Torneo</h2>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto scrollbar-hide mb-4 -mx-1 px-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setActive(t.key)}
            className={`text-[11px] font-semibold px-3 py-1.5 rounded-full whitespace-nowrap transition-colors ${
              active === t.key
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {getContent()}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

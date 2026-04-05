import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { LINEUP, type Player } from "./mockData";

function PlayerCard({ player, onSelect }: { player: Player; onSelect: (p: Player) => void }) {
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={() => onSelect(player)}
      className="absolute flex flex-col items-center gap-0.5 -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${player.x}%`, top: `${player.y}%` }}
    >
      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold border-2 border-primary-foreground/30 shadow-lg">
        {player.number}
      </div>
      <span className="text-[9px] font-semibold bg-background/80 px-1 rounded whitespace-nowrap">
        {player.name.split(" ").pop()}
      </span>
    </motion.button>
  );
}

function PlayerStats({ player, onClose }: { player: Player; onClose: () => void }) {
  const stats = [
    { label: "Goles", value: player.goals },
    { label: "Asistencias", value: player.assists },
    { label: "Minutos", value: player.minutes },
    { label: "T. Amarillas", value: player.yellowCards },
    { label: "T. Rojas", value: player.redCards },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="absolute bottom-2 left-2 right-2 bg-card border border-border rounded-xl p-3 z-20 shadow-xl"
    >
      <button onClick={onClose} className="absolute top-2 right-2 text-muted-foreground">
        <X className="w-4 h-4" />
      </button>

      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
          {player.number}
        </div>
        <div>
          <div className="text-sm font-bold">{player.name}</div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{player.position}</div>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-1">
        {stats.map((s) => (
          <div key={s.label} className="text-center">
            <div className="text-sm font-bold">{s.value}</div>
            <div className="text-[8px] text-muted-foreground leading-tight">{s.label}</div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default function InteractiveLineup() {
  const [selected, setSelected] = useState<Player | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bento-card p-0 overflow-hidden"
    >
      <div className="p-4 pb-2">
        <h2 className="text-title">Alineación</h2>
        <p className="text-xs text-muted-foreground">4-3-3 · Toca un jugador</p>
      </div>

      {/* Pitch */}
      <div className="relative w-full aspect-[3/4] bg-gradient-to-b from-emerald-900/40 via-emerald-800/30 to-emerald-900/40 mx-auto">
        {/* Field lines */}
        <div className="absolute inset-3 border border-white/15 rounded" />
        <div className="absolute left-3 right-3 top-1/2 h-px bg-white/15" />
        {/* Center circle */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full border border-white/15" />
        {/* Goal areas */}
        <div className="absolute left-1/2 -translate-x-1/2 top-3 w-24 h-8 border-b border-x border-white/15" />
        <div className="absolute left-1/2 -translate-x-1/2 bottom-3 w-24 h-8 border-t border-x border-white/15" />

        {/* Players */}
        {LINEUP.map((p) => (
          <PlayerCard key={p.id} player={p} onSelect={setSelected} />
        ))}

        {/* Player stats overlay */}
        <AnimatePresence>
          {selected && <PlayerStats player={selected} onClose={() => setSelected(null)} />}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

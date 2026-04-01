import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Shirt } from "lucide-react";
import type { Player } from "./mockData";
import { players, formationPositions } from "./mockData";

export function InteractiveLineup() {
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bento-card relative"
    >
      <h3 className="text-sm font-bold mb-4">Alineación – Los Cabos United</h3>

      {/* Pitch */}
      <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden bg-green-900/30 border border-green-800/30">
        {/* Pitch markings */}
        <div className="absolute inset-0">
          {/* Center line */}
          <div className="absolute top-1/2 left-0 right-0 h-px bg-green-600/30" />
          {/* Center circle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full border border-green-600/30" />
          {/* Penalty areas */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-16 border-b border-l border-r border-green-600/30" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-16 border-t border-l border-r border-green-600/30" />
          {/* Goal areas */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-6 border-b border-l border-r border-green-600/30" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-6 border-t border-l border-r border-green-600/30" />
        </div>

        {/* Players */}
        {players.map((player) => {
          const pos = formationPositions[player.id];
          if (!pos) return null;
          return (
            <motion.button
              key={player.id}
              className="absolute z-10 flex flex-col items-center gap-0.5 -translate-x-1/2 -translate-y-1/2 group"
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              onClick={() => setSelectedPlayer(player)}
              whileTap={{ scale: 0.9 }}
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-primary/90 border-2 border-primary-foreground flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <span className="text-[10px] sm:text-xs font-bold text-primary-foreground">
                  {player.number}
                </span>
              </div>
              <span className="text-[8px] sm:text-[9px] font-semibold text-foreground bg-background/60 rounded px-1 backdrop-blur-sm truncate max-w-[60px]">
                {player.name.split(" ").pop()}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Player card overlay */}
      <AnimatePresence>
        {selectedPlayer && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute inset-x-4 bottom-4 bento-card-sm bg-card/95 backdrop-blur-xl border-primary/30 z-20"
          >
            <button
              onClick={() => setSelectedPlayer(null)}
              className="absolute top-2 right-2 p-1 rounded-full hover:bg-muted"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                <Shirt className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-bold text-primary">#{selectedPlayer.number}</span>
                  <h4 className="text-sm font-bold truncate">{selectedPlayer.name}</h4>
                </div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">
                  {selectedPlayer.position === "GK" ? "Portero" :
                   selectedPlayer.position === "DEF" ? "Defensa" :
                   selectedPlayer.position === "MID" ? "Mediocampista" : "Delantero"}
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: "Goles", value: selectedPlayer.goals },
                    { label: "Asist.", value: selectedPlayer.assists },
                    { label: "🟨", value: selectedPlayer.yellowCards },
                    { label: "Min", value: selectedPlayer.minutesPlayed },
                  ].map((stat) => (
                    <div key={stat.label} className="text-center">
                      <p className="text-sm font-bold">{stat.value}</p>
                      <p className="text-[9px] text-muted-foreground">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

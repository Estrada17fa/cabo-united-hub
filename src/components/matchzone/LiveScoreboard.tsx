import { motion } from "framer-motion";
import { LCU, RIVAL, LIVE_SCORE } from "./mockData";

export default function LiveScoreboard() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="bento-card relative overflow-hidden"
    >
      <div className="absolute inset-0 gradient-primary opacity-[0.06] pointer-events-none" />

      <div className="relative z-10">
        {/* LIVE badge */}
        <div className="flex justify-center mb-4">
          <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-red-400 bg-red-500/10 px-3 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            EN VIVO · {LIVE_SCORE.half} {LIVE_SCORE.minute}'
          </span>
        </div>

        {/* Score */}
        <div className="flex items-center justify-center gap-6 md:gap-10">
          <div className="flex flex-col items-center gap-2">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center text-lg font-extrabold border border-border"
              style={{ backgroundColor: `${LCU.color}20`, color: LCU.color }}
            >
              {LCU.initials}
            </div>
            <span className="text-xs font-semibold">{LCU.shortName}</span>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-5xl font-extrabold">{LIVE_SCORE.home}</span>
            <span className="text-2xl text-muted-foreground font-bold">-</span>
            <span className="text-5xl font-extrabold">{LIVE_SCORE.away}</span>
          </div>

          <div className="flex flex-col items-center gap-2">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center text-lg font-extrabold border border-border"
              style={{ backgroundColor: `${RIVAL.color}20`, color: RIVAL.color }}
            >
              {RIVAL.initials}
            </div>
            <span className="text-xs font-semibold">{RIVAL.shortName}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

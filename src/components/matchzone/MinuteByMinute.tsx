import { motion } from "framer-motion";
import { LIVE_EVENTS } from "./mockData";

export default function MinuteByMinute() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="bento-card"
    >
      <h2 className="text-title mb-4">Minuto a Minuto</h2>

      <div className="relative pl-6">
        {/* Timeline line */}
        <div className="absolute left-2 top-0 bottom-0 w-px bg-border" />

        <div className="flex flex-col gap-4">
          {LIVE_EVENTS.map((ev, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="relative flex items-start gap-3"
            >
              {/* Dot */}
              <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-[10px]">⚽</span>
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-primary">{ev.minute}'</span>
                  <span className="text-xs font-semibold">
                    {ev.team === "home" ? "LCU" : "DOR"}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {ev.player}
                  {ev.assist && <span> · Asist. {ev.assist}</span>}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

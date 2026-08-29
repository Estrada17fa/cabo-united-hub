import { AnimatePresence, motion } from "framer-motion";
import type { Match } from "./types";
import { Scoreboard } from "./Scoreboard";

/** Marcador comprimido cuando el reproductor sale de vista. */
export function StickyScore({ match, visible }: { match: Match; visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 60, opacity: 0 }}
          className="fixed inset-x-3 bottom-[76px] z-30 rounded-full border border-white/[0.08] bg-surface-2/95 px-4 py-2 backdrop-blur-xl"
        >
          <Scoreboard match={match} variant="compact" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

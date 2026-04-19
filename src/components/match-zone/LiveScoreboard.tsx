import { motion } from "framer-motion";
import type { Tables } from "@/integrations/supabase/types";

interface LiveScoreboardProps {
  match: Tables<"matches">;
  currentMinute: number;
}

export function LiveScoreboard({ match, currentMinute }: LiveScoreboardProps) {
  const home = match.home_score ?? 0;
  const away = match.away_score ?? 0;

  return (
    <div className="flex flex-col items-center gap-3">
      {/* EN VIVO badge */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex items-center gap-2 px-3 py-1 rounded-full"
        style={{
          backgroundColor: "hsl(142 76% 45% / 0.15)",
          border: "1px solid hsl(142 76% 45% / 0.4)",
        }}
      >
        <span className="relative flex h-2 w-2">
          <span
            className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
            style={{ backgroundColor: "hsl(142 76% 45%)" }}
          />
          <span
            className="relative inline-flex rounded-full h-2 w-2"
            style={{ backgroundColor: "hsl(142 76% 45%)" }}
          />
        </span>
        <span
          className="text-[10px] font-extrabold tracking-widest"
          style={{ color: "hsl(142 76% 55%)" }}
        >
          EN VIVO
        </span>
      </motion.div>

      {/* Score */}
      <div className="flex items-center gap-4 sm:gap-6">
        <ScoreDigit value={home} key={`h-${home}`} />
        <span className="text-3xl sm:text-4xl font-extrabold text-muted-foreground">—</span>
        <ScoreDigit value={away} key={`a-${away}`} />
      </div>

      {/* Minute */}
      <motion.div
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="text-sm font-bold tracking-widest text-primary"
      >
        {currentMinute}'
      </motion.div>
    </div>
  );
}

function ScoreDigit({ value }: { value: number }) {
  return (
    <motion.span
      initial={{ scale: 1.4, color: "hsl(189 100% 60%)" }}
      animate={{ scale: 1, color: "hsl(var(--foreground))" }}
      transition={{ duration: 0.6 }}
      className="text-6xl sm:text-7xl font-extrabold tabular-nums"
      style={{ textShadow: "0 0 24px hsl(189 100% 50% / 0.4)" }}
    >
      {value}
    </motion.span>
  );
}

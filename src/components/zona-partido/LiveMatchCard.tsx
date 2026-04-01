import { motion } from "framer-motion";
import { Circle, ArrowRightLeft } from "lucide-react";
import type { Match, MatchEvent } from "./mockData";

interface LiveMatchCardProps {
  match: Match;
}

function EventIcon({ type }: { type: MatchEvent["type"] }) {
  switch (type) {
    case "goal":
      return <span className="text-sm">⚽</span>;
    case "yellow":
      return <div className="w-3 h-4 rounded-[1px] bg-yellow-400" />;
    case "red":
      return <div className="w-3 h-4 rounded-[1px] bg-red-500" />;
    case "substitution":
      return <ArrowRightLeft className="w-3.5 h-3.5 text-primary" />;
    case "half":
      return <div className="w-3.5 h-3.5 rounded-full border-2 border-muted-foreground" />;
    default:
      return null;
  }
}

export function LiveMatchCard({ match }: LiveMatchCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bento-card relative overflow-hidden border-primary/30"
    >
      {/* Live glow */}
      <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-60 h-40 bg-primary/15 rounded-full blur-3xl" />

      {/* Live badge */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <motion.div
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <Circle className="w-2.5 h-2.5 fill-red-500 text-red-500" />
        </motion.div>
        <span className="text-label text-red-500">EN VIVO</span>
        <span className="text-xs text-muted-foreground font-medium">{match.minute}'</span>
      </div>

      {/* Score */}
      <div className="flex items-center justify-center gap-4 sm:gap-8 mb-6">
        <div className="text-center flex-1">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-muted border border-border mx-auto mb-2 flex items-center justify-center">
            <span className="text-xs font-bold text-muted-foreground">LCU</span>
          </div>
          <p className="text-xs sm:text-sm font-semibold truncate">{match.homeTeam}</p>
        </div>
        <div className="text-center">
          <p className="text-4xl sm:text-5xl font-extrabold tabular-nums">
            {match.homeScore} <span className="text-muted-foreground mx-1">-</span> {match.awayScore}
          </p>
        </div>
        <div className="text-center flex-1">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-muted border border-border mx-auto mb-2 flex items-center justify-center">
            <span className="text-xs font-bold text-muted-foreground">
              {match.awayTeam.substring(0, 3).toUpperCase()}
            </span>
          </div>
          <p className="text-xs sm:text-sm font-semibold truncate">{match.awayTeam}</p>
        </div>
      </div>

      {/* Stats bars */}
      <div className="grid grid-cols-3 gap-2 mb-6 text-center">
        {[
          { label: "Posesión", home: "58%", away: "42%" },
          { label: "Tiros", home: "8", away: "5" },
          { label: "Corners", home: "4", away: "2" },
        ].map((stat) => (
          <div key={stat.label} className="bento-card-sm !p-2">
            <p className="text-[10px] text-muted-foreground mb-1">{stat.label}</p>
            <div className="flex justify-between text-xs font-bold">
              <span className="text-primary">{stat.home}</span>
              <span>{stat.away}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Timeline */}
      <div className="space-y-0">
        <p className="text-label text-muted-foreground mb-3">Minuto a Minuto</p>
        <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-hide">
          {[...(match.events || [])].reverse().map((event, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: event.team === "home" ? -10 : 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`flex items-center gap-2 text-xs ${
                event.type === "half" ? "justify-center py-1 border-y border-border" : ""
              }`}
            >
              {event.type === "half" ? (
                <span className="text-muted-foreground font-medium">Medio Tiempo</span>
              ) : (
                <>
                  <span className="w-7 text-muted-foreground font-mono text-right shrink-0">
                    {event.minute}'
                  </span>
                  <EventIcon type={event.type} />
                  <span className={`font-medium ${event.team === "home" ? "text-primary" : ""}`}>
                    {event.player}
                  </span>
                  {event.detail && (
                    <span className="text-muted-foreground hidden sm:inline">· {event.detail}</span>
                  )}
                </>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

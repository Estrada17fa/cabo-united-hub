import { motion } from "framer-motion";
import { Calendar, MapPin } from "lucide-react";
import type { Match } from "./mockData";

interface MatchCardProps {
  match: Match;
  compact?: boolean;
}

export function MatchCard({ match, compact }: MatchCardProps) {
  const matchDate = new Date(`${match.date}T${match.time}:00`);
  const isLCU = match.homeTeam === "Los Cabos United" || match.awayTeam === "Los Cabos United";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bento-card-sm ${isLCU ? "border-primary/20" : ""}`}
    >
      <div className="flex items-center justify-between gap-2">
        {/* Home */}
        <div className="flex-1 text-right">
          <p className={`text-xs sm:text-sm font-semibold truncate ${
            match.homeTeam === "Los Cabos United" ? "text-primary" : ""
          }`}>
            {match.homeTeam}
          </p>
        </div>

        {/* Score / Time */}
        <div className="shrink-0 text-center min-w-[60px]">
          {match.status === "finished" ? (
            <p className="text-lg font-bold tabular-nums">
              {match.homeScore} - {match.awayScore}
            </p>
          ) : (
            <p className="text-xs font-medium text-primary">{match.time}</p>
          )}
        </div>

        {/* Away */}
        <div className="flex-1 text-left">
          <p className={`text-xs sm:text-sm font-semibold truncate ${
            match.awayTeam === "Los Cabos United" ? "text-primary" : ""
          }`}>
            {match.awayTeam}
          </p>
        </div>
      </div>

      {!compact && (
        <div className="flex justify-center gap-3 mt-2 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {matchDate.toLocaleDateString("es-MX", { day: "numeric", month: "short" })}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {match.venue}
          </span>
        </div>
      )}
    </motion.div>
  );
}

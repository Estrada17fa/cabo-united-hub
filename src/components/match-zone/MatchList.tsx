import { motion } from "framer-motion";
import { Shield, Calendar } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { Tables } from "@/integrations/supabase/types";

interface MatchListProps {
  matches: Tables<"matches">[];
  isLoading: boolean;
  showScore?: boolean;
  emptyMessage?: string;
}

export function MatchList({
  matches,
  isLoading,
  showScore = false,
  emptyMessage = "No hay partidos",
}: MatchListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 rounded-xl bg-muted/20 animate-pulse" />
        ))}
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground text-sm">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {matches.map((match, i) => {
        const matchDate = new Date(`${match.match_date}T${match.match_time || "19:00:00"}`);
        const isFinished = match.status === "finished";

        return (
          <motion.div
            key={match.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="flex items-center gap-3 p-4 rounded-xl border border-border"
            style={{ background: "#161616" }}
          >
            {/* Jornada */}
            <div className="flex flex-col items-center justify-center w-10 shrink-0">
              <span className="text-[10px] font-semibold text-muted-foreground tracking-wider">
                J{match.jornada || "—"}
              </span>
            </div>

            {/* Teams */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <Shield className="w-3.5 h-3.5 text-primary shrink-0" />
                <span className="text-sm font-semibold text-foreground truncate">
                  {match.home_team}
                </span>
                {showScore && isFinished && (
                  <span className="text-sm font-bold text-foreground ml-auto">{match.home_score ?? 0}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <span className="text-sm font-normal text-muted-foreground truncate">
                  {match.away_team}
                </span>
                {showScore && isFinished && (
                  <span className="text-sm font-bold text-muted-foreground ml-auto">{match.away_score ?? 0}</span>
                )}
              </div>
            </div>

            {/* Date / Status */}
            <div className="text-right shrink-0">
              {isFinished ? (
                <span className="text-[10px] font-bold text-muted-foreground bg-muted/30 px-2 py-0.5 rounded-full">
                  FINAL
                </span>
              ) : (
                <>
                  <div className="text-xs font-semibold text-foreground capitalize">
                    {format(matchDate, "dd MMM", { locale: es })}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {format(matchDate, "h:mm a")}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

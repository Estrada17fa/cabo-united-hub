import { motion } from "framer-motion";
import { Shield, Radio } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { Tables } from "@/integrations/supabase/types";
import { useLiveMatch } from "@/hooks/useLiveMatch";

interface UpcomingMatchesProps {
  matches: Tables<"matches">[];
  isLoading: boolean;
}

export function UpcomingMatches({ matches, isLoading }: UpcomingMatchesProps) {
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
        No hay próximos partidos programados
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {matches.map((match, i) => (
        <UpcomingMatchRow key={match.id} match={match} index={i} />
      ))}
    </div>
  );
}

function UpcomingMatchRow({ match, index }: { match: Tables<"matches">; index: number }) {
  const { isLive, clock } = useLiveMatch(match);
  const matchDate = new Date(`${match.match_date}T${match.match_time || "19:00:00"}`);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-center gap-3 p-4 rounded-xl border"
      style={{
        background: "#161616",
        borderColor: isLive ? "hsl(142 76% 45% / 0.5)" : "hsl(var(--border))",
      }}
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
        </div>
        <div className="flex items-center gap-2">
          <Shield className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <span className="text-sm font-normal text-muted-foreground truncate">
            {match.away_team}
          </span>
        </div>
      </div>

      {/* Right: live indicator + CTA, or date */}
      {isLive ? (
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <div className="flex items-center gap-1.5">
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
              className="text-[11px] font-semibold tabular-nums tracking-wider"
              style={{ color: "hsl(142 76% 55%)" }}
            >
              {clock ?? ""}
            </span>
          </div>
          <motion.a
            href={match.live_stream_url || "#"}
            target={match.live_stream_url ? "_blank" : undefined}
            rel="noopener noreferrer"
            whileTap={{ scale: match.live_stream_url ? 0.96 : 1 }}
            onClick={(e) => {
              if (!match.live_stream_url) e.preventDefault();
            }}
            title={
              match.live_stream_url ? "Abrir transmisión" : "Transmisión no disponible"
            }
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full font-bold text-[9px] tracking-wide whitespace-nowrap ${
              !match.live_stream_url ? "opacity-50 cursor-not-allowed" : ""
            }`}
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.3)",
              border: "1.5px solid hsl(142 76% 45%)",
              color: "hsl(142 76% 60%)",
            }}
          >
            <Radio className="w-3 h-3" />
            VER EN VIVO
          </motion.a>
        </div>
      ) : (
        <div className="text-right shrink-0">
          <div className="text-xs font-semibold text-foreground capitalize">
            {format(matchDate, "dd MMM", { locale: es })}
          </div>
          <div className="text-[11px] text-muted-foreground">
            {format(matchDate, "h:mm a")}
          </div>
        </div>
      )}
    </motion.div>
  );
}

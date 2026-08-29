import { motion } from "framer-motion";
import { formatKickoff } from "@/lib/matchClock";
import { isLivePhase, PHASE_LABEL, type Match } from "./types";
import { TeamCrest } from "./TeamCrest";
import { cn } from "@/lib/utils";

interface Props {
  match: Match;
  /** compact = barra pegajosa; hero = tarjeta principal */
  variant?: "hero" | "compact";
}

export function Scoreboard({ match, variant = "hero" }: Props) {
  const live = isLivePhase(match.phase);
  // Llegó la hora pero el admin aún no cambia la fase: mostrar 0-0 "Por arrancar".
  const kickoffDue =
    match.phase === "scheduled" && Date.now() >= +new Date(match.kickoff_at);
  const played = live || match.phase === "finished" || kickoffDue;
  const { date, time } = formatKickoff(match.kickoff_at);

  // En lugar de minutos (reloj calculado) mostramos la fase del partido:
  // el admin solo cambia la fase y la etiqueta siempre es correcta.
  const phaseLabel = kickoffDue ? "Por arrancar" : PHASE_LABEL[match.phase];

  if (variant === "compact") {
    return (
      <div className="flex items-center justify-center gap-3">
        <TeamCrest team={match.home_team} size="sm" />
        <span className="font-bold tabular-nums">
          {played ? `${match.home_score} - ${match.away_score}` : time}
        </span>
        <TeamCrest team={match.away_team} size="sm" />
        <span className={cn("text-xs font-semibold", live ? "text-pop" : "text-muted-foreground")}>
          {phaseLabel}
        </span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
      <TeamSide team={match.home_team} label="Local" />

      <div className="flex flex-col items-center gap-1">
        {played ? (
          <motion.div
            key={`${match.home_score}-${match.away_score}`}
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 380, damping: 24 }}
            className="text-4xl font-bold tabular-nums leading-none text-foreground"
          >
            {match.home_score}
            <span className="mx-1.5 text-muted-foreground">-</span>
            {match.away_score}
          </motion.div>
        ) : (
          <div className="text-center">
            <div className="text-2xl font-bold leading-none text-foreground">{time}</div>
            <div className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {date}
            </div>
          </div>
        )}

        {match.home_pens != null && match.away_pens != null && (
          <span className="rounded-full bg-surface-3 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
            {match.home_pens}-{match.away_pens} pen
          </span>
        )}

        <span
          className={cn(
            "text-[11px] font-semibold uppercase tracking-wider",
            live ? "text-pop" : "text-muted-foreground"
          )}
        >
          {phaseLabel}
        </span>
      </div>

      <TeamSide team={match.away_team} label="Visita" align="right" />
    </div>
  );
}

function TeamSide({
  team,
  label,
  align = "left",
}: {
  team?: Match["home_team"];
  label: string;
  align?: "left" | "right";
}) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-col items-center gap-2",
        align === "right" ? "sm:items-end" : "sm:items-start"
      )}
    >
      <TeamCrest team={team} size="lg" />
      <div className="min-w-0 text-center sm:text-left">
        <p
          className={cn(
            "truncate text-sm font-semibold",
            team?.is_ours ? "text-primary" : "text-foreground"
          )}
        >
          {team?.short_name || team?.name || "—"}
        </p>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
      </div>
    </div>
  );
}

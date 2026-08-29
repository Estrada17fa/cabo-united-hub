import { motion } from "framer-motion";
import { MapPin, Ticket } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Crest } from "./Crest";
import { LiveBadge } from "./LiveBadge";

export interface MatchCardData {
  id: string;
  home_team: string;
  away_team: string;
  home_score: number | null;
  away_score: number | null;
  home_pens?: number | null;
  away_pens?: number | null;
  match_date: string;
  match_time: string | null;
  venue: string | null;
  jornada: number | null;
  is_home_game?: boolean;
}

interface MatchCardProps {
  match: MatchCardData;
  logoMap: Record<string, string>;
  ourTeam: string;
  state: "upcoming" | "live" | "finished";
  /** Resalta el próximo partido de la lista */
  next?: boolean;
  index?: number;
  clock?: string | null;
}

export function MatchCard({
  match,
  logoMap,
  ourTeam,
  state,
  next,
  index = 0,
  clock,
}: MatchCardProps) {
  const isOurs = match.home_team === ourTeam || match.away_team === ourTeam;
  const showScore = state !== "upcoming";
  const date = new Date(`${match.match_date}T${match.match_time || "19:00:00"}`);
  const hasPens =
    match.home_pens != null && match.away_pens != null && state === "finished";
  const ticketing = isOurs && match.home_team === ourTeam && state === "upcoming";

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index, 8) * 0.04, duration: 0.28 }}
      className={`rounded-2xl border p-3.5 ${
        next || state === "live"
          ? "border-primary/35 bg-primary/[0.06]"
          : isOurs
            ? "border-white/[0.12] bg-surface-2"
            : "border-white/[0.06] bg-surface-1"
      }`}
    >
      <div className="mb-2.5 flex items-center justify-between gap-2">
        <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-label-fg">
          {match.jornada != null ? `Jornada ${match.jornada}` : "Partido"}
          {" · "}
          <span className="capitalize">{format(date, "dd MMM", { locale: es })}</span>
          {match.match_time ? ` · ${format(date, "h:mm a", { locale: es })}` : ""}
        </span>
        {state === "live" ? (
          <LiveBadge clock={clock} />
        ) : next ? (
          <span className="rounded-full border border-primary/35 bg-primary/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-primary">
            Próximo
          </span>
        ) : null}
      </div>

      <div className="flex items-center gap-3">
        <TeamSide
          name={match.home_team}
          logo={logoMap[match.home_team]}
          ours={match.home_team === ourTeam}
        />
        <div className="shrink-0 text-center">
          {showScore ? (
            <p className="num-hero text-2xl text-foreground">
              {match.home_score ?? 0}
              <span className="mx-1.5 text-label-fg">-</span>
              {match.away_score ?? 0}
            </p>
          ) : (
            <p className="font-display text-sm font-bold text-label-fg">VS</p>
          )}
          {hasPens && (
            <p className="mt-1 rounded-full border border-pop/30 bg-pop/10 px-2 py-0.5 text-[9px] font-bold text-pop">
              {match.home_pens}-{match.away_pens} pen
            </p>
          )}
        </div>
        <TeamSide
          name={match.away_team}
          logo={logoMap[match.away_team]}
          ours={match.away_team === ourTeam}
          align="right"
        />
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 border-t border-white/[0.06] pt-2.5">
        <span className="flex min-w-0 items-center gap-1.5 text-[11px] text-label-fg">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="truncate">{match.venue || "Por confirmar"}</span>
        </span>
        {ticketing && (
          <Link
            to="/abonos"
            className="flex shrink-0 items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-primary-foreground"
          >
            <Ticket className="h-3 w-3" />
            Boletos
          </Link>
        )}
      </div>
    </motion.article>
  );
}

function TeamSide({
  name,
  logo,
  ours,
  align = "left",
}: {
  name: string;
  logo?: string;
  ours: boolean;
  align?: "left" | "right";
}) {
  return (
    <div
      className={`flex min-w-0 flex-1 items-center gap-2 ${
        align === "right" ? "flex-row-reverse text-right" : ""
      }`}
    >
      <Crest teamName={name} logoUrl={logo} size={30} highlight={ours} />
      <span
        className={`truncate text-xs font-bold ${ours ? "text-primary" : "text-foreground"}`}
      >
        {name}
      </span>
    </div>
  );
}

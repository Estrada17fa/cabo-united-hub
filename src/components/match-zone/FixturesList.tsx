import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, MapPin, Ticket } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatKickoff } from "@/lib/matchClock";
import { cn } from "@/lib/utils";
import type { Match } from "./types";
import { isLivePhase } from "./types";
import { TeamCrest } from "./TeamCrest";
import { EmptyState } from "./StandingsTable";

interface Props {
  matches: Match[];
}

type Group = {
  key: string;
  matchday: number | null;
  label: string;
  shortLabel: string;
  matches: Match[];
  state: "played" | "live" | "future" | "final";
};

export function FixturesList({ matches }: Props) {
  const groups = useMemo<Group[]>(() => {
    const regular = matches.filter((m) => m.stage !== "final");
    const finals = matches.filter((m) => m.stage === "final");

    const byMatchday = new Map<number, Match[]>();
    regular.forEach((m) => {
      const md = m.matchday ?? 0;
      byMatchday.set(md, [...(byMatchday.get(md) ?? []), m]);
    });

    const sorted = Array.from(byMatchday.entries()).sort(([a], [b]) => a - b);

    const build = (md: number, list: Match[]): Group => {
      const hasLive = list.some((m) => isLivePhase(m.phase));
      const allFinished = list.length > 0 && list.every((m) => m.phase === "finished");

      let state: Group["state"] = "future";
      if (hasLive) state = "live";
      else if (allFinished) state = "played";

      return {
        key: `jornada-${md}`,
        matchday: md,
        label: md === 0 ? "Por definir" : `Jornada ${md}`,
        shortLabel: md === 0 ? "—" : `J${md}`,
        matches: list.sort((a, b) => +new Date(a.kickoff_at) - +new Date(b.kickoff_at)),
        state,
      };
    };

    const out: Group[] = sorted.map(([md, list]) => build(md, list));

    if (finals.length) {
      out.push({
        key: "fase-final",
        matchday: null,
        label: "Fase final",
        shortLabel: "FF",
        matches: finals.sort((a, b) => +new Date(a.kickoff_at) - +new Date(b.kickoff_at)),
        state: finals.some((m) => isLivePhase(m.phase)) ? "live" : "final",
      });
    }

    return out;
  }, [matches]);

  // Índice seleccionado: null = aún no toca el usuario, se usa el automático.
  const [selected, setSelected] = useState<number | null>(null);

  const autoIndex = useMemo(() => {
    if (!groups.length) return 0;
    // Primera jornada no completamente finalizada (en vivo o con pendientes).
    const pending = groups.findIndex((g) => g.state !== "played");
    if (pending !== -1) return pending;
    return groups.length - 1;
  }, [groups]);

  const index = Math.min(selected ?? autoIndex, Math.max(groups.length - 1, 0));
  const group = groups[index];

  if (!groups.length || !group) {
    return <EmptyState text="Aún no hay partidos programados." />;
  }

  const canPrev = index > 0;
  const canNext = index < groups.length - 1;

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-2xl border border-hairline bg-surface-1">
        {/* Header con navegación de jornada */}
        <div className="flex items-center justify-between gap-2 px-4 py-2.5">
          <div className="flex min-w-0 items-center gap-2">
            <span
              className={cn(
                "text-[13px] font-semibold uppercase tracking-wide",
                group.state === "live" && "text-primary",
                group.state === "future" || group.state === "final"
                  ? "text-muted-foreground"
                  : group.state === "live"
                    ? ""
                    : "text-foreground"
              )}
            >
              {group.label}
            </span>
            {group.state === "live" && (
              <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                En vivo
              </span>
            )}
            {group.state === "played" && (
              <span className="rounded-full border border-hairline bg-surface-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Finalizada
              </span>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              aria-label="Jornada anterior"
              disabled={!canPrev}
              onClick={() => canPrev && setSelected(index - 1)}
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-lg border border-hairline transition-colors",
                canPrev
                  ? "text-foreground hover:bg-surface-2"
                  : "text-muted-foreground/40"
              )}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="min-w-8 text-center font-display text-xs font-bold tabular-nums text-secondary-fg">
              {group.shortLabel}
            </span>
            <button
              type="button"
              aria-label="Jornada siguiente"
              disabled={!canNext}
              onClick={() => canNext && setSelected(index + 1)}
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-lg border border-hairline transition-colors",
                canNext
                  ? "text-foreground hover:bg-surface-2"
                  : "text-muted-foreground/40"
              )}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Partidos de la jornada seleccionada */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={group.key}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="divide-y divide-hairline"
          >
            {group.matches.map((m) => (
              <MatchRow key={m.id} match={m} />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function MatchRow({ match }: { match: Match }) {
  const ours = match.home_team?.is_ours || match.away_team?.is_ours;
  const live = isLivePhase(match.phase);
  const played = live || match.phase === "finished";
  const { date, time } = formatKickoff(match.kickoff_at);
  const showTickets = match.home_team?.is_ours && match.tickets_url && match.phase === "scheduled";

  return (
    <div
      className={cn(
        "relative px-4 py-3",
        ours && "bg-primary/[0.05] before:absolute before:top-0 before:left-0 before:h-full before:w-[2px] before:bg-primary"
      )}
    >
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1 space-y-1.5">
          <TeamLine team={match.home_team} score={played ? match.home_score : null} />
          <TeamLine team={match.away_team} score={played ? match.away_score : null} />
        </div>
        <div className="shrink-0 border-l border-hairline pl-3 text-right">
          {live ? (
            <span className="text-[10px] font-bold uppercase tracking-wider text-pop">En vivo</span>
          ) : (
            <>
              <p className="text-xs font-semibold text-foreground">{time}</p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{date}</p>
            </>
          )}
          {match.home_pens != null && match.away_pens != null && (
            <p className="mt-0.5 text-[10px] text-muted-foreground">
              {match.home_pens}-{match.away_pens} pen
            </p>
          )}
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between gap-2">
        <span className="flex min-w-0 items-center gap-1.5 text-[11px] text-muted-foreground">
          {match.group_name && (
            <span className="shrink-0 rounded-full border border-hairline bg-surface-2 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {match.group_name.toLowerCase() === "interzonal"
                ? "Interzonal"
                : `Grupo ${match.group_name}`}
            </span>
          )}
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="truncate">{match.venue || "Sede por confirmar"}</span>
        </span>
        {showTickets && (
          <a
            href={match.tickets_url!}
            target="_blank"
            rel="noreferrer"
            className="flex shrink-0 items-center gap-1 rounded-full bg-primary/15 px-2.5 py-1 text-[11px] font-semibold text-primary"
          >
            <Ticket className="h-3 w-3" />
            Boletos
          </a>
        )}
      </div>
    </div>
  );
}

function TeamLine({ team, score }: { team?: Match["home_team"]; score: number | null }) {
  return (
    <div className="flex items-center gap-2">
      <TeamCrest team={team} size="sm" />
      <span
        className={cn(
          "min-w-0 flex-1 truncate text-sm font-semibold",
          team?.is_ours ? "text-primary" : "text-foreground"
        )}
      >
        {team?.name || team?.short_name || "—"}
      </span>
      {score != null && (
        <span className="text-sm font-bold tabular-nums text-foreground">{score}</span>
      )}
    </div>
  );
}

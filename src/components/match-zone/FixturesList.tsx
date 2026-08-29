import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp, MapPin, Ticket } from "lucide-react";
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
  matches: Match[];
  state: "played" | "current" | "future" | "final";
};

export function FixturesList({ matches }: Props) {
  const [expanded, setExpanded] = useState(false);

  const groups = useMemo<Group[]>(() => {
    const regular = matches.filter((m) => m.stage !== "final");
    const finals = matches.filter((m) => m.stage === "final");

    const byMatchday = new Map<number, Match[]>();
    regular.forEach((m) => {
      const md = m.matchday ?? 0;
      byMatchday.set(md, [...(byMatchday.get(md) ?? []), m]);
    });

    const sorted = Array.from(byMatchday.entries()).sort(([a], [b]) => a - b);

    const now = Date.now();

    const build = (md: number, list: Match[]): Group => {
      const hasLive = list.some((m) => isLivePhase(m.phase));
      const allFinished = list.length > 0 && list.every((m) => m.phase === "finished");
      const hasFuture = list.some((m) => m.phase === "scheduled" && new Date(m.kickoff_at).getTime() > now);

      let state: Group["state"] = "future";
      if (hasLive) state = "current";
      else if (allFinished) state = "played";
      else if (hasFuture) state = "current";

      return {
        key: `jornada-${md}`,
        matchday: md,
        label: md === 0 ? "Por definir" : `Jornada ${md}`,
        matches: list.sort((a, b) => +new Date(a.kickoff_at) - +new Date(b.kickoff_at)),
        state,
      };
    };

    const out: Group[] = sorted.map(([md, list]) => build(md, list));

    if (finals.length) {
      const hasLiveFinal = finals.some((m) => isLivePhase(m.phase));
      out.push({
        key: "fase-final",
        matchday: null,
        label: "Fase final",
        matches: finals.sort((a, b) => +new Date(a.kickoff_at) - +new Date(b.kickoff_at)),
        state: hasLiveFinal ? "current" : "final",
      });
    }

    return out;
  }, [matches]);

  const currentIndex = useMemo(() => {
    const idx = groups.findIndex((g) => g.state === "current");
    if (idx !== -1) return idx;
    // Si no hay actual, la última jugada es la actual.
    const lastPlayed = groups.reduce<number>((acc, g, i) => (g.state === "played" ? i : acc), -1);
    if (lastPlayed !== -1) return lastPlayed;
    return 0;
  }, [groups]);

  const visibleGroups = useMemo(() => {
    if (expanded) return groups;
    const prev = currentIndex > 0 ? groups[currentIndex - 1] : null;
    const curr = groups[currentIndex];
    const out: Group[] = [];
    if (prev) out.push(prev);
    if (curr) out.push(curr);
    return out;
  }, [groups, currentIndex, expanded]);

  const hasMore = groups.length > visibleGroups.length;

  return (
    <div className="space-y-3">
      {!groups.length && <EmptyState text="Aún no hay partidos programados." />}

      {visibleGroups.map((group) => (
        <MatchdayGroup key={group.key} group={group} />
      ))}

      {(hasMore || expanded) && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex w-full items-center justify-center gap-1.5 rounded-2xl border border-hairline bg-surface-1 py-3 text-xs font-semibold text-foreground transition-colors hover:bg-surface-2"
        >
          {expanded ? (
            <>
              Ver menos <ChevronUp className="h-3.5 w-3.5" />
            </>
          ) : (
            <>
              Ver todas las jornadas <ChevronDown className="h-3.5 w-3.5" />
            </>
          )}
        </button>
      )}

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="all-matchdays"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="space-y-3 overflow-hidden"
          >
            {groups
              .filter((g) => !visibleGroups.some((v) => v.key === g.key))
              .map((group) => (
                <MatchdayGroup key={group.key} group={group} />
              ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MatchdayGroup({ group }: { group: Group }) {
  const isCurrent = group.state === "current";
  const isPlayed = group.state === "played";
  const isFuture = group.state === "future" || group.state === "final";

  return (
    <div className="overflow-hidden rounded-2xl border border-hairline bg-surface-1">
      <div className="flex items-center gap-2 px-4 py-2.5">
        <span
          className={cn(
            "text-[13px] font-semibold",
            isCurrent && "text-primary",
            isFuture && "text-muted-foreground",
            isPlayed && "text-foreground"
          )}
        >
          {group.label}
        </span>
        {isCurrent && (
          <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
            Actual
          </span>
        )}
        {isPlayed && (
          <span className="rounded-full border border-hairline bg-surface-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Finalizada
          </span>
        )}
      </div>
      <div className="divide-y divide-hairline">
        {group.matches.map((m) => (
          <MatchRow key={m.id} match={m} />
        ))}
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
        <span className="flex min-w-0 items-center gap-1 text-[11px] text-muted-foreground">
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
        {team?.short_name || team?.name || "—"}
      </span>
      {score != null && (
        <span className="text-sm font-bold tabular-nums text-foreground">{score}</span>
      )}
    </div>
  );
}

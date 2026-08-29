import { useMemo, useState } from "react";
import { MapPin, Ticket } from "lucide-react";
import { LcuTabs } from "@/components/ui-lcu";
import { formatKickoff } from "@/lib/matchClock";
import { cn } from "@/lib/utils";
import type { Match } from "./types";
import { isLivePhase } from "./types";
import { TeamCrest } from "./TeamCrest";
import { EmptyState } from "./StandingsTable";

interface Props {
  matches: Match[];
}

export function FixturesList({ matches }: Props) {
  const [filter, setFilter] = useState("upcoming");
  const [oursOnly, setOursOnly] = useState(false);

  const list = useMemo(() => {
    const now = Date.now();
    let out = matches.filter((m) =>
      filter === "upcoming"
        ? m.phase === "scheduled" || isLivePhase(m.phase)
        : m.phase === "finished" || new Date(m.kickoff_at).getTime() < now - 3 * 3600 * 1000
    );
    if (oursOnly) out = out.filter((m) => m.home_team?.is_ours || m.away_team?.is_ours);
    return out.sort((a, b) =>
      filter === "upcoming"
        ? +new Date(a.kickoff_at) - +new Date(b.kickoff_at)
        : +new Date(b.kickoff_at) - +new Date(a.kickoff_at)
    );
  }, [matches, filter, oursOnly]);

  const byMatchday = useMemo(() => {
    const map = new Map<string, Match[]>();
    list.forEach((m) => {
      const key = m.stage === "final" ? "Fase final" : m.matchday ? `Jornada ${m.matchday}` : "Por definir";
      map.set(key, [...(map.get(key) ?? []), m]);
    });
    return Array.from(map.entries());
  }, [list]);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <LcuTabs
          className="flex-1"
          layoutId="fixtures-filter"
          value={filter}
          onChange={setFilter}
          items={[
            { id: "upcoming", label: "Próximos" },
            { id: "results", label: "Resultados" },
          ]}
        />
        <button
          onClick={() => setOursOnly((v) => !v)}
          className={cn(
            "h-9 shrink-0 rounded-full border px-3 text-[11px] font-semibold uppercase tracking-wider transition-colors",
            oursOnly
              ? "border-primary/50 bg-primary/10 text-primary"
              : "border-white/[0.08] bg-surface-2 text-muted-foreground"
          )}
        >
          Solo LCU
        </button>
      </div>

      {!byMatchday.length && (
        <EmptyState
          text={filter === "upcoming" ? "Aún no hay partidos programados." : "Todavía no hay resultados."}
        />
      )}

      {byMatchday.map(([label, group]) => (
        <div key={label} className="overflow-hidden rounded-3xl border border-white/[0.06] bg-surface-2">
          <p className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <div className="divide-y divide-white/[0.04]">
            {group.map((m) => (
              <MatchRow key={m.id} match={m} />
            ))}
          </div>
        </div>
      ))}
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
    <div className={cn("px-4 py-3", ours && "bg-primary/[0.05]")}>
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1 space-y-1.5">
          <TeamLine team={match.home_team} score={played ? match.home_score : null} />
          <TeamLine team={match.away_team} score={played ? match.away_score : null} />
        </div>
        <div className="shrink-0 border-l border-white/[0.06] pl-3 text-right">
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

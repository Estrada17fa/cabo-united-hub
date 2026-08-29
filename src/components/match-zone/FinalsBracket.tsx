import { useMemo } from "react";
import { Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { Crest } from "@/components/lcu";
import { formatKickoff } from "@/lib/matchClock";
import type { Match, Team } from "./types";
import { isLivePhase } from "./types";

interface Props {
  matches: Match[];
}

type Tie = {
  key: string;
  home?: Team | null;
  away?: Team | null;
  legs: Match[];
  homeAgg: number;
  awayAgg: number;
  played: boolean;
  live: boolean;
  ours: boolean;
  homePens: number | null;
  awayPens: number | null;
};

type Round = { key: string; label: string; ties: Tie[] };

const ROUND_LABEL = (ties: number) => {
  if (ties >= 8) return "Octavos de final";
  if (ties >= 3) return "Cuartos de final";
  if (ties === 2) return "Semifinal";
  if (ties === 1) return "Final";
  return "Fase final";
};

export function FinalsBracket({ matches }: Props) {
  const rounds = useMemo<Round[]>(() => {
    if (!matches.length) return [];

    const byMatchday = new Map<number, Match[]>();
    matches.forEach((m) => {
      const md = m.matchday ?? 0;
      byMatchday.set(md, [...(byMatchday.get(md) ?? []), m]);
    });

    return Array.from(byMatchday.entries())
      .sort(([a], [b]) => a - b)
      .map(([md, list]) => {
        const tieMap = new Map<string, Match[]>();
        list.forEach((m) => {
          const pair = [m.home_team_id, m.away_team_id].sort().join("|");
          tieMap.set(pair, [...(tieMap.get(pair) ?? []), m]);
        });

        const ties: Tie[] = Array.from(tieMap.entries()).map(([pair, legs]) => {
          const sorted = legs.sort((a, b) => +new Date(a.kickoff_at) - +new Date(b.kickoff_at));
          const first = sorted[0];
          const home = first.home_team;
          const away = first.away_team;
          let homeAgg = 0;
          let awayAgg = 0;
          sorted.forEach((leg) => {
            const isSameOrder = leg.home_team_id === first.home_team_id;
            homeAgg += isSameOrder ? leg.home_score : leg.away_score;
            awayAgg += isSameOrder ? leg.away_score : leg.home_score;
          });
          const last = sorted[sorted.length - 1];
          return {
            key: `${md}-${pair}`,
            home,
            away,
            legs: sorted,
            homeAgg,
            awayAgg,
            played: sorted.every((l) => l.phase === "finished"),
            live: sorted.some((l) => isLivePhase(l.phase)),
            ours: !!(home?.is_ours || away?.is_ours),
            homePens: last.home_pens,
            awayPens: last.away_pens,
          };
        });

        return { key: `round-${md}`, label: ROUND_LABEL(ties.length), ties };
      });
  }, [matches]);

  if (!rounds.length) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-hairline bg-surface-1 px-6 py-10 text-center">
        <span className="flex h-11 w-11 items-center justify-center rounded-full border border-hairline bg-surface-2">
          <Trophy className="h-5 w-5 text-muted-foreground" />
        </span>
        <p className="text-sm text-muted-foreground">
          La fase final se definirá al terminar la fase regular.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
      {rounds.map((round) => (
        <section key={round.key} className="space-y-2">
          <h3 className="px-1 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {round.label}
          </h3>
          <div className="space-y-2">
            {round.ties.map((tie) => (
              <TieCard key={tie.key} tie={tie} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function TieCard({ tie }: { tie: Tie }) {
  const decided = tie.played;
  const homeWins =
    decided &&
    (tie.homeAgg > tie.awayAgg ||
      (tie.homeAgg === tie.awayAgg && (tie.homePens ?? 0) > (tie.awayPens ?? 0)));
  const awayWins =
    decided &&
    (tie.awayAgg > tie.homeAgg ||
      (tie.homeAgg === tie.awayAgg && (tie.awayPens ?? 0) > (tie.homePens ?? 0)));
  const twoLegs = tie.legs.length > 1;
  const { date, time } = formatKickoff(tie.legs[0].kickoff_at);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-hairline bg-surface-1 px-4 py-3",
        tie.ours && "bg-primary/[0.05]"
      )}
    >
      {tie.ours && <span className="absolute left-0 top-0 h-full w-[2px] bg-primary" aria-hidden />}

      <div className="space-y-1.5">
        <BracketTeam team={tie.home} score={decided || tie.live ? tie.homeAgg : null} winner={homeWins} loser={decided && !homeWins} />
        <BracketTeam team={tie.away} score={decided || tie.live ? tie.awayAgg : null} winner={awayWins} loser={decided && !awayWins} />
      </div>

      <div className="mt-2 flex items-center gap-2 border-t border-hairline pt-2 text-[10px] uppercase tracking-wider text-muted-foreground">
        {tie.live ? (
          <span className="font-bold text-pop">En vivo</span>
        ) : decided ? (
          <span>{twoLegs ? "Global" : "Finalizado"}</span>
        ) : (
          <span className="num">
            {date} · {time}
          </span>
        )}
        {tie.homePens != null && tie.awayPens != null && (
          <span className="num">
            {tie.homePens}-{tie.awayPens} pen
          </span>
        )}
      </div>
    </div>
  );
}

function BracketTeam({
  team,
  score,
  winner,
  loser,
}: {
  team?: Team | null;
  score: number | null;
  winner?: boolean;
  loser?: boolean;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <Crest team={team} size="sm" className={cn(loser && "opacity-50")} />
      <span
        className={cn(
          "min-w-0 flex-1 truncate text-sm",
          winner ? "font-bold text-foreground" : loser ? "text-muted-foreground" : "font-medium text-secondary-fg"
        )}
      >
        {team?.short_name || team?.name || "Por definir"}
      </span>
      <span
        className={cn(
          "num-display text-base",
          winner ? "text-primary" : loser ? "text-muted-foreground" : "text-foreground"
        )}
      >
        {score ?? "–"}
      </span>
    </div>
  );
}

import { StreamGate } from "./StreamGate";
import { Scoreboard } from "./Scoreboard";
import { LiveReactions } from "./LiveReactions";
import type { Match } from "./types";
import { isLivePhase } from "./types";

interface Props {
  match: Match;
}

export function LiveRoom({ match }: Props) {
  const live = isLivePhase(match.phase);
  const title = `${match.home_team?.name ?? "Local"} vs ${match.away_team?.name ?? "Visita"}`;

  return (
    <div className="overflow-hidden rounded-2xl border border-hairline bg-surface-1">
      <div className="p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 rounded-md border border-primary/40 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
              </span>
              {live ? "En vivo" : "Final"}
            </span>
            {match.matchday && (
              <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                Jornada {match.matchday}
              </span>
            )}
          </div>

          <StreamGate streamUrl={match.stream_url} title={title} />
          <Scoreboard match={match} />
          {live && <LiveReactions matchId={match.id} />}
        </div>
      </div>
    </div>
  );
}

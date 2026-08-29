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
    <div className="overflow-hidden rounded-3xl border border-white/[0.07] bg-surface-2">
      <div className="relative p-3">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,hsl(var(--pop)/0.12),transparent_60%)]"
          aria-hidden
        />
        <div className="relative space-y-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 rounded-full bg-pop/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-pop">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-pop opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-pop" />
              </span>
              {live ? "En vivo" : "Final"}
            </span>
            {match.matchday && (
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
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

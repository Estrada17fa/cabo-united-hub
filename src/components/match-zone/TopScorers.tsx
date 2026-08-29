import { cn } from "@/lib/utils";
import type { Scorer } from "./types";
import { Crest } from "@/components/lcu";
import { PlayerAvatar } from "./PlayerAvatar";
import { EmptyState } from "./StandingsTable";

interface Props {
  scorers: Scorer[];
  /** El goleo no se separa por grupo: es general del torneo. */
  hasGroups?: boolean;
}

export function TopScorers({ scorers, hasGroups }: Props) {
  if (!scorers.length) {
    return <EmptyState text="El goleo se abre con el primer gol del torneo." />;
  }

  return (
    <div className="space-y-2">
      {hasGroups && (
        <p className="px-1 text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
          Goleo general del torneo
        </p>
      )}

      <div className="overflow-hidden rounded-2xl border border-hairline bg-surface-1">
        <div className="flex items-center gap-3 border-b border-hairline px-3 py-2 text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
          <span className="w-5">#</span>
          <span className="w-8" aria-hidden />
          <span className="flex-1">Jugador</span>
          <span className="w-12 text-right">Asist</span>
          <span className="w-9 text-right">Goles</span>
        </div>

        <div>
          {scorers.map((s, i) => {
            const ours = !!s.team?.is_ours;
            const leader = i === 0;
            const podium = i < 3;
            return (
              <div
                key={s.id}
                className={cn(
                  "relative flex items-center gap-3 px-3 py-2.5",
                  i > 0 && "border-t border-hairline",
                  (ours || leader) && "bg-primary/[0.06]"
                )}
              >
                {ours && (
                  <span className="absolute left-0 top-0 h-full w-[2px] bg-primary" aria-hidden />
                )}
                <span
                  className={cn(
                    "num w-5 text-xs",
                    podium ? "font-semibold text-primary" : "text-muted-foreground"
                  )}
                >
                  {i + 1}
                </span>
                <PlayerAvatar
                  name={s.player?.name || s.player_name}
                  photoUrl={s.player?.photo_url}
                  highlight={leader || ours}
                />
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <span
                    className={cn(
                      "truncate text-sm",
                      ours || leader ? "font-bold text-foreground" : "font-medium text-secondary-fg"
                    )}
                  >
                    {s.player?.name || s.player_name}
                  </span>
                  <Crest team={s.team} size="xs" />
                </div>
                <span className="num w-12 text-right text-xs text-muted-foreground">
                  {s.assists}
                </span>
                <span
                  className={cn(
                    "num-display w-9 text-right text-base",
                    leader || ours ? "text-primary" : "text-foreground"
                  )}
                >
                  {s.goals}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

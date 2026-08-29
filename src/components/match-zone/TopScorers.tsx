import { cn } from "@/lib/utils";
import type { Scorer } from "./types";
import { TeamCrest } from "./TeamCrest";
import { EmptyState } from "./StandingsTable";

export function TopScorers({ scorers }: { scorers: Scorer[] }) {
  if (!scorers.length) {
    return <EmptyState text="El goleo se abre con el primer gol del torneo." />;
  }

  const podium = scorers.slice(0, 3);
  const rest = scorers.slice(3);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        {podium.map((s, i) => (
          <div
            key={s.id}
            className={cn(
              "rounded-3xl border p-3 text-center",
              i === 0 ? "border-brand-accent/40 bg-brand-accent/[0.07]" : "border-white/[0.06] bg-surface-2"
            )}
          >
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {i + 1}º
            </p>
            <div className="my-2 flex justify-center">
              <TeamCrest team={s.team} size="md" />
            </div>
            <p className="truncate text-xs font-semibold text-foreground">{s.player_name}</p>
            <p className="mt-1 text-xl font-bold tabular-nums text-primary">{s.goals}</p>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">goles</p>
          </div>
        ))}
      </div>

      {!!rest.length && (
        <div className="overflow-hidden rounded-3xl border border-white/[0.06] bg-surface-2 divide-y divide-white/[0.04]">
          {rest.map((s, i) => (
            <div
              key={s.id}
              className={cn("flex items-center gap-3 px-4 py-2.5", s.team?.is_ours && "bg-primary/[0.05]")}
            >
              <span className="w-4 text-xs font-bold tabular-nums text-muted-foreground">{i + 4}</span>
              <TeamCrest team={s.team} size="sm" />
              <span className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground">
                {s.player_name}
              </span>
              <span className="text-xs text-muted-foreground">{s.assists} asist.</span>
              <span className="w-6 text-right text-sm font-bold tabular-nums text-foreground">
                {s.goals}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

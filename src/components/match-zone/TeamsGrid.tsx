import { cn } from "@/lib/utils";
import type { Team } from "./types";
import { TeamCrest } from "./TeamCrest";
import { EmptyState } from "./StandingsTable";

export function TeamsGrid({ teams }: { teams: Team[] }) {
  if (!teams.length) return <EmptyState text="Los equipos del torneo se publicarán muy pronto." />;

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {teams.map((t) => (
        <div
          key={t.id}
          className={cn(
            "flex items-center gap-2.5 rounded-2xl border p-3",
            t.is_ours ? "border-primary/40 bg-primary/[0.07]" : "border-hairline bg-surface-1"
          )}
        >
          <TeamCrest team={t} size="md" />
          <div className="min-w-0">
            <p
              className={cn(
                "truncate text-sm font-semibold",
                t.is_ours ? "text-primary" : "text-foreground"
              )}
            >
              {t.name || t.short_name}
            </p>
            <p className="truncate text-[11px] text-muted-foreground">
              {[t.city, t.group_name ? `Grupo ${t.group_name}` : null].filter(Boolean).join(" · ") || "—"}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

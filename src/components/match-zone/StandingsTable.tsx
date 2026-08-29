import { cn } from "@/lib/utils";
import type { Standing } from "./types";
import { Crest } from "@/components/lcu";

interface Props {
  standings: Standing[];
}

export function StandingsTable({ standings }: Props) {
  if (!standings.length) {
    return <EmptyState text="La tabla se llenará en cuanto se jueguen los primeros partidos." />;
  }

  const groups = Array.from(new Set(standings.map((s) => s.group_name ?? "General")));

  return (
    <div className="space-y-6">
      {groups.map((g) => {
        const rows = standings.filter((s) => (s.group_name ?? "General") === g);
        return (
          <div key={g}>
            {groups.length > 1 && (
              <h3 className="mb-2 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Grupo {g}
              </h3>
            )}
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                  <th className="w-8 py-2 pl-3 text-left font-medium">#</th>
                  <th className="py-2 text-left font-medium">Equipo</th>
                  <th className="w-10 py-2 text-right font-medium">PJ</th>
                  <th className="w-12 py-2 text-right font-medium">Dif</th>
                  <th className="w-12 py-2 pr-3 text-right font-medium">Pts</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((s, i) => {
                  const ours = !!s.team?.is_ours;
                  return (
                    <tr
                      key={s.id}
                      className={cn(
                        "border-t border-hairline",
                        ours && "bg-primary/[0.06]"
                      )}
                    >
                      <td className="relative py-3 pl-3">
                        {ours && (
                          <span
                            className="absolute left-0 top-0 h-full w-0.5 bg-primary"
                            aria-hidden
                          />
                        )}
                        <span
                          className={cn(
                            "num text-xs",
                            ours ? "font-semibold text-primary" : "text-muted-foreground"
                          )}
                        >
                          {i + 1}
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2.5">
                          <Crest team={s.team} size="sm" />
                          <span
                            className={cn(
                              "truncate text-sm",
                              ours ? "font-bold text-foreground" : "font-medium text-secondary-fg"
                            )}
                          >
                            {s.team?.short_name || s.team?.name}
                          </span>
                        </div>
                      </td>
                      <td className="num py-3 text-right text-sm text-muted-foreground">
                        {s.played}
                      </td>
                      <td className="num py-3 text-right text-sm text-secondary-fg">
                        {s.goal_diff > 0 ? `+${s.goal_diff}` : s.goal_diff}
                      </td>
                      <td
                        className={cn(
                          "num-display py-3 pr-3 text-right text-base",
                          ours ? "text-primary" : "text-foreground"
                        )}
                      >
                        {s.points}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}

export function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-hairline bg-surface-1 p-8 text-center">
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}

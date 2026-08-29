import { cn } from "@/lib/utils";
import type { Standing } from "./types";
import { TeamCrest } from "./TeamCrest";

interface Props {
  standings: Standing[];
}

const FORM_COLOR: Record<string, string> = {
  W: "bg-primary",
  D: "bg-muted-foreground/60",
  L: "bg-destructive",
};

export function StandingsTable({ standings }: Props) {
  if (!standings.length) {
    return <EmptyState text="La tabla se llenará en cuanto se jueguen los primeros partidos." />;
  }

  const groups = Array.from(new Set(standings.map((s) => s.group_name ?? "General")));

  return (
    <div className="space-y-5">
      {groups.map((g) => {
        const rows = standings.filter((s) => (s.group_name ?? "General") === g);
        return (
          <div key={g} className="overflow-hidden rounded-3xl border border-white/[0.06] bg-surface-2">
            <div className="flex items-center justify-between px-4 py-3">
              <h3 className="text-sm font-bold text-foreground">
                {g === "General" ? "Tabla general" : `Grupo ${g}`}
              </h3>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {rows.length} equipos
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[440px] text-sm">
                <thead>
                  <tr className="border-y border-white/[0.06] text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    <th className="py-2 pl-4 text-left">#</th>
                    <th className="py-2 text-left">Equipo</th>
                    <th className="py-2 text-center">JJ</th>
                    <th className="py-2 text-center">G</th>
                    <th className="py-2 text-center">E</th>
                    <th className="py-2 text-center">P</th>
                    <th className="py-2 text-center">DIF</th>
                    <th className="py-2 text-center">Racha</th>
                    <th className="py-2 pr-4 text-center">PTS</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((s, i) => (
                    <tr
                      key={s.id}
                      className={cn(
                        "border-b border-white/[0.04] last:border-0",
                        s.team?.is_ours && "bg-primary/[0.07]"
                      )}
                    >
                      <td className="relative py-2.5 pl-4">
                        <span
                          className={cn(
                            "absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full",
                            i < 4 ? "bg-primary" : i < 6 ? "bg-brand-accent" : "bg-transparent"
                          )}
                          aria-hidden
                        />
                        <span className="text-xs font-bold tabular-nums text-muted-foreground">{i + 1}</span>
                      </td>
                      <td className="py-2.5">
                        <div className="flex items-center gap-2">
                          <TeamCrest team={s.team} size="sm" />
                          <span
                            className={cn(
                              "truncate text-sm font-semibold",
                              s.team?.is_ours ? "text-primary" : "text-foreground"
                            )}
                          >
                            {s.team?.short_name || s.team?.name}
                          </span>
                        </div>
                      </td>
                      <Num v={s.played} />
                      <Num v={s.won} />
                      <Num v={s.drawn} />
                      <Num v={s.lost} />
                      <Num v={s.goal_diff} signed />
                      <td className="py-2.5">
                        <div className="flex justify-center gap-0.5">
                          {(s.form ?? "").split("").map((r, k) => (
                            <span
                              key={k}
                              title={r}
                              className={cn("h-1.5 w-1.5 rounded-full", FORM_COLOR[r] ?? "bg-surface-3")}
                            />
                          ))}
                        </div>
                      </td>
                      <td className="py-2.5 pr-4 text-center text-sm font-bold tabular-nums text-foreground">
                        {s.points}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex flex-wrap gap-3 px-4 py-2.5 text-[10px] text-muted-foreground">
              <Legend color="bg-primary" label="Clasificación directa" />
              <Legend color="bg-brand-accent" label="Repechaje" />
            </div>
          </div>
        );
      })}
    </div>
  );
}

const Num = ({ v, signed }: { v: number; signed?: boolean }) => (
  <td className="py-2.5 text-center text-xs tabular-nums text-muted-foreground">
    {signed && v > 0 ? `+${v}` : v}
  </td>
);

const Legend = ({ color, label }: { color: string; label: string }) => (
  <span className="flex items-center gap-1.5">
    <span className={cn("h-1.5 w-3 rounded-full", color)} />
    {label}
  </span>
);

export function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-3xl border border-white/[0.06] bg-surface-2 p-8 text-center">
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}

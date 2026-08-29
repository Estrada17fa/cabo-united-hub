import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import type { Standing } from "./types";
import { Crest } from "@/components/lcu";
import { useQualifiersCount, useSeasonGroups } from "@/hooks/useLeague";

interface Props {
  standings: Standing[];
  /** Cuántos puestos clasifican (línea sutil de zona de clasificación). */
  qualifySlots?: number;
}

const GENERAL = "General";

export function StandingsTable({ standings, qualifySlots }: Props) {
  const configured = useSeasonGroups();
  const configuredQualifiers = useQualifiersCount();
  const slots = qualifySlots ?? configuredQualifiers;

  /** Orden de pestañas: el configurado en el torneo; lo demás se agrega al final. */
  const groups = useMemo(() => {
    const present = Array.from(new Set(standings.map((s) => s.group_name ?? GENERAL)));
    const ordered = configured.filter((g) => present.includes(g));
    const extras = present.filter((g) => !ordered.includes(g));
    return [...ordered, ...extras];
  }, [standings, configured]);

  const ourGroup = useMemo(
    () => standings.find((s) => s.team?.is_ours)?.group_name ?? groups[0] ?? GENERAL,
    [standings, groups]
  );

  const [group, setGroup] = useState<string | null>(null);
  const active = group && groups.includes(group) ? group : ourGroup;

  if (!standings.length) {
    return <EmptyState text="La tabla se llenará en cuanto se jueguen los primeros partidos." />;
  }

  const rows = standings.filter((s) => (s.group_name ?? GENERAL) === active);
  const hasGroups = groups.length > 1;

  return (
    <div className="space-y-3">
      {hasGroups && (
        <div className="flex gap-1.5 overflow-x-auto pb-0.5">
          {groups.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGroup(g)}
              className={cn(
                "shrink-0 rounded-xl border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider transition-colors",
                g === active
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-hairline bg-surface-1 text-muted-foreground"
              )}
            >
              {g === GENERAL ? "General" : `Grupo ${g}`}
            </button>
          ))}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-hairline bg-surface-1">
        <div className="flex items-center gap-3 border-b border-hairline px-3 py-2 text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
          <span className="w-5 text-left">#</span>
          <span className="flex-1">Equipo</span>
          <span className="w-8 text-right">PJ</span>
          <span className="hidden w-8 text-right sm:inline">G</span>
          <span className="hidden w-8 text-right sm:inline">E</span>
          <span className="hidden w-8 text-right sm:inline">P</span>
          <span className="w-10 text-right">Dif</span>
          <span className="w-9 text-right">Pts</span>
        </div>

        <div>
          {rows.map((s, i) => {
            const ours = !!s.team?.is_ours;
            const qualifyEdge = qualifySlots > 0 && i === qualifySlots - 1 && rows.length > qualifySlots;
            return (
              <div
                key={s.id}
                className={cn(
                  "relative flex items-center gap-3 px-3 py-2.5",
                  i > 0 && "border-t border-hairline",
                  ours && "bg-primary/[0.06]",
                  qualifyEdge && "border-b-2 border-b-primary/30"
                )}
              >
                {ours && (
                  <span className="absolute left-0 top-0 h-full w-[2px] bg-primary" aria-hidden />
                )}
                <span
                  className={cn(
                    "num w-5 text-left text-xs",
                    ours ? "font-semibold text-primary" : "text-muted-foreground"
                  )}
                >
                  {i + 1}
                </span>
                <div className="flex min-w-0 flex-1 items-center gap-2.5">
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
                <span className="num w-8 text-right text-sm text-muted-foreground">{s.played}</span>
                <span className="num hidden w-8 text-right text-sm text-muted-foreground sm:inline">
                  {s.won}
                </span>
                <span className="num hidden w-8 text-right text-sm text-muted-foreground sm:inline">
                  {s.drawn}
                </span>
                <span className="num hidden w-8 text-right text-sm text-muted-foreground sm:inline">
                  {s.lost}
                </span>
                <span className="num w-10 text-right text-sm text-secondary-fg">
                  {s.goal_diff > 0 ? `+${s.goal_diff}` : s.goal_diff}
                </span>
                <span
                  className={cn(
                    "num-display w-9 text-right text-base",
                    ours ? "text-primary" : "text-foreground"
                  )}
                >
                  {s.points}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {qualifySlots > 0 && rows.length > qualifySlots && (
        <p className="px-1 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          Línea de clasificación · primeros {qualifySlots}
        </p>
      )}
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

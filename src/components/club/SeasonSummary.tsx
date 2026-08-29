import { cn } from "@/lib/utils";
import { useSeasonSummary, type FormResult } from "@/hooks/useClub";

const FORM_META: Record<FormResult, { label: string; className: string; title: string }> = {
  W: { label: "G", className: "bg-emerald-500/15 text-emerald-400", title: "Ganado" },
  D: { label: "E", className: "bg-white/[0.06] text-secondary-fg", title: "Empate" },
  L: { label: "P", className: "bg-red-500/15 text-red-400", title: "Perdido" },
};

function Tile({
  value,
  label,
  accent,
}: {
  value: string;
  label: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-xl border border-hairline bg-surface-3 px-2 py-2.5 text-center">
      <div
        className={cn(
          "num-display text-[22px] leading-none",
          accent ? "text-primary" : "text-foreground"
        )}
      >
        {value}
      </div>
      <div className="mt-1.5 text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </div>
    </div>
  );
}

/** Resumen de temporada: lee la tabla de posiciones real del torneo activo. */
export function SeasonSummary() {
  const { summary, loading } = useSeasonSummary();

  if (loading) {
    return <div className="h-[104px] rounded-2xl border border-hairline bg-surface-1" />;
  }

  const empty = !summary || summary.played === 0;

  if (empty) {
    return (
      <div className="rounded-2xl border border-hairline bg-surface-1 p-5 text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
          Temporada
        </p>
        <p className="mt-1.5 text-sm text-secondary-fg">La temporada arranca pronto.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-hairline bg-surface-1 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
          Resumen de temporada
        </p>
        {summary.groupName && (
          <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            Grupo {summary.groupName}
          </span>
        )}
      </div>

      <div className="grid grid-cols-4 gap-2">
        <Tile value={summary.position ? `${summary.position}°` : "—"} label="Pos" accent />
        <Tile value={String(summary.points)} label="Pts" />
        <Tile value={String(summary.played)} label="PJ" />
        <Tile
          value={summary.goalDiff > 0 ? `+${summary.goalDiff}` : String(summary.goalDiff)}
          label="Dif"
        />
      </div>

      {summary.form.length > 0 && (
        <div className="mt-3 flex items-center gap-2.5 border-t border-hairline pt-3">
          <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Últimos {summary.form.length}
          </span>
          <div className="flex items-center gap-1.5">
            {summary.form.map((r, i) => (
              <span
                key={i}
                title={FORM_META[r].title}
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-lg text-[11px] font-bold",
                  FORM_META[r].className
                )}
              >
                {FORM_META[r].label}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

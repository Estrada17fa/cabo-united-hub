import { motion } from "framer-motion";
import { Crest as TeamCrest } from "@/components/ui-lcu";

export interface StandingRow {
  pos: number;
  team: string;
  jj: number;
  jg: number;
  je: number;
  jp: number;
  gf: number;
  gc: number;
  dg: number;
  pts: number;
  group_name?: string | null;
  manual_adjustment?: number | null;
}

interface StandingsTableProps {
  rows: StandingRow[];
  title?: string;
  logoMap?: Record<string, string>;
  ourTeam?: string;
  streaks?: Record<string, ("W" | "D" | "L")[]>;
  /** Cantidad de plazas de clasificación a resaltar */
  qualifySlots?: number;
}

const STREAK_COLOR: Record<"W" | "D" | "L", string> = {
  W: "bg-primary",
  D: "bg-muted-foreground/60",
  L: "bg-destructive/70",
};

export function StandingsTable({
  rows,
  title,
  logoMap = {},
  ourTeam = "Los Cabos United",
  streaks = {},
  qualifySlots = 8,
}: StandingsTableProps) {
  if (rows.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-muted-foreground">
        Aún no hay tabla de posiciones publicada
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      {title && <h3 className="text-sm font-bold text-foreground mb-3">{title}</h3>}

      <div className="rounded-card border border-white/[0.07] bg-surface-1 overflow-hidden">
        <div className="grid grid-cols-[22px_1fr_repeat(4,20px)_28px_30px] gap-1 px-2.5 py-2 text-[9px] font-semibold uppercase tracking-[0.1em] text-muted-foreground border-b border-border/60">
          <span>#</span>
          <span>Equipo</span>
          <span className="text-center">JJ</span>
          <span className="text-center">G</span>
          <span className="text-center">E</span>
          <span className="text-center">P</span>
          <span className="text-center">DIF</span>
          <span className="text-center text-primary">PTS</span>
        </div>

        {rows.map((row) => {
          const isOurs = row.team === ourTeam;
          const streak = streaks[row.team] ?? [];
          return (
            <div
              key={`${row.group_name ?? "g"}-${row.team}`}
              className={`relative grid grid-cols-[22px_1fr_repeat(4,20px)_28px_30px] items-center gap-1 px-2.5 py-2.5 text-[11px] border-b border-border/40 last:border-b-0 ${
                isOurs ? "bg-primary/10" : ""
              }`}
            >
              <span
                className="absolute left-0 top-0 bottom-0 w-[3px]"
                style={{
                  background: isOurs
                    ? "hsl(var(--primary))"
                    : row.pos <= qualifySlots
                      ? "hsl(var(--primary) / 0.35)"
                      : "transparent",
                }}
              />
              <span className="font-bold tabular-nums text-muted-foreground">{row.pos}</span>
              <span className="flex items-center gap-1.5 min-w-0">
                <TeamCrest teamName={row.team} logoUrl={logoMap[row.team]} size={16} />
                <span className="min-w-0">
                  <span
                    className={`block truncate font-semibold ${isOurs ? "text-primary" : "text-foreground"}`}
                  >
                    {row.team}
                  </span>
                  {streak.length > 0 && (
                    <span className="flex gap-0.5 mt-1">
                      {streak.map((s, i) => (
                        <span key={i} className={`w-1.5 h-1.5 rounded-full ${STREAK_COLOR[s]}`} />
                      ))}
                    </span>
                  )}
                </span>
              </span>
              <span className="text-center tabular-nums text-muted-foreground">{row.jj}</span>
              <span className="text-center tabular-nums text-muted-foreground">{row.jg}</span>
              <span className="text-center tabular-nums text-muted-foreground">{row.je}</span>
              <span className="text-center tabular-nums text-muted-foreground">{row.jp}</span>
              <span className="text-center tabular-nums text-muted-foreground">
                {row.dg > 0 ? `+${row.dg}` : row.dg}
              </span>
              <span
                className={`text-center text-[13px] font-semibold tabular-nums ${isOurs ? "text-primary" : "text-foreground"}`}
              >
                {row.pts}
              </span>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-3 pt-2.5 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-primary" /> Ganado
        </span>
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60" /> Empate
        </span>
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-destructive/70" /> Perdido
        </span>
      </div>
    </motion.div>
  );
}

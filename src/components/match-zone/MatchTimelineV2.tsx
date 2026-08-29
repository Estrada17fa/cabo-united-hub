import { motion } from "framer-motion";
import {
  Flag,
  Goal,
  PauseCircle,
  RefreshCw,
  Square,
  Timer,
} from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";
import { SectionHeader } from "@/components/ui-lcu";

type Ev = Tables<"match_events">;

const CONFIG: Record<
  string,
  { icon: typeof Goal; label: string; tone: "primary" | "pop" | "warn" | "danger" | "muted" }
> = {
  goal: { icon: Goal, label: "Gol", tone: "primary" },
  penalty: { icon: Goal, label: "Penal", tone: "primary" },
  own_goal: { icon: Goal, label: "Autogol", tone: "pop" },
  yellow_card: { icon: Square, label: "Amarilla", tone: "warn" },
  red_card: { icon: Square, label: "Roja", tone: "danger" },
  substitution: { icon: RefreshCw, label: "Cambio", tone: "muted" },
};

const TONE: Record<string, string> = {
  primary: "text-primary border-primary/40 bg-primary/10",
  pop: "text-pop border-pop/40 bg-pop/10",
  warn: "text-[hsl(48_96%_56%)] border-[hsl(48_96%_56%/0.4)] bg-[hsl(48_96%_56%/0.1)]",
  danger: "text-destructive border-destructive/40 bg-destructive/10",
  muted: "text-secondary-fg border-white/15 bg-white/[0.05]",
};

interface MatchTimelineV2Props {
  events: Ev[];
  homeTeam: string;
  ourTeam: string;
  /** "Partido en vivo" vs "Último partido" */
  title?: string;
  subtitle?: string;
}

export function MatchTimelineV2({
  events,
  homeTeam,
  ourTeam,
  title = "Minuto a minuto",
  subtitle,
}: MatchTimelineV2Props) {
  return (
    <section className="space-y-3.5">
      <SectionHeader eyebrow="Timeline" title={title} subtitle={subtitle} />

      {events.length === 0 ? (
        <div className="lcu-card flex items-center gap-2.5 p-4 text-xs text-label-fg">
          <Timer className="h-4 w-4" />
          Aún no hay eventos registrados de este partido.
        </div>
      ) : (
        <div className="lcu-card relative overflow-hidden p-4">
          <div className="absolute bottom-4 left-[27px] top-4 w-px bg-gradient-to-b from-transparent via-primary/30 to-transparent" />
          <ol className="relative space-y-3.5">
            {events.map((ev, i) => {
              const cfg = CONFIG[ev.event_type] ?? CONFIG.substitution;
              const Icon = cfg.icon;
              const ours = ev.team === ourTeam;
              return (
                <motion.li
                  key={ev.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: Math.min(i, 10) * 0.04, duration: 0.25 }}
                  className="flex items-start gap-3"
                >
                  <span
                    className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border ${TONE[cfg.tone]}`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <div
                    className={`min-w-0 flex-1 rounded-xl px-3 py-2 ${
                      ours ? "bg-primary/[0.07] ring-1 ring-primary/25" : "bg-surface-2"
                    }`}
                  >
                    <p className="flex items-center gap-2">
                      <span className="num-hero text-sm text-foreground">{ev.minute}'</span>
                      <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-label-fg">
                        {cfg.label}
                      </span>
                    </p>
                    {ev.player_name && (
                      <p className="truncate text-sm font-semibold text-foreground">
                        {ev.player_name}
                      </p>
                    )}
                    <p className="truncate text-[11px] text-label-fg">
                      {ev.team || (ev.team === homeTeam ? homeTeam : "")}
                      {ev.description ? ` · ${ev.description}` : ""}
                    </p>
                  </div>
                </motion.li>
              );
            })}
          </ol>
        </div>
      )}
    </section>
  );
}

export { Flag, PauseCircle };

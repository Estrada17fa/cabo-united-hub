import { motion } from "framer-motion";
import { Goal, Square, RefreshCw, AlertTriangle } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

interface HorizontalMatchTimelineProps {
  events: Tables<"match_events">[];
  homeTeam: string;
  /** Total minutes shown on the bar. Defaults to 90. */
  totalMinutes?: number;
}

const eventConfig: Record<
  string,
  { icon: typeof Goal; color: string; label: string }
> = {
  goal: { icon: Goal, color: "hsl(189 100% 50%)", label: "Gol" },
  own_goal: { icon: Goal, color: "hsl(336 80% 70%)", label: "Autogol" },
  penalty: { icon: Goal, color: "hsl(189 100% 50%)", label: "Penal" },
  yellow_card: { icon: Square, color: "hsl(48 96% 56%)", label: "Amarilla" },
  red_card: { icon: Square, color: "hsl(0 84% 60%)", label: "Roja" },
  substitution: { icon: RefreshCw, color: "hsl(220 10% 70%)", label: "Cambio" },
};

export function HorizontalMatchTimeline({
  events,
  homeTeam,
  totalMinutes = 90,
}: HorizontalMatchTimelineProps) {
  if (events.length === 0) {
    return (
      <div className="flex items-center justify-center gap-2 py-3 text-xs text-muted-foreground">
        <AlertTriangle className="w-3.5 h-3.5" />
        Esperando eventos del partido...
      </div>
    );
  }

  return (
    <div className="relative w-full py-2">
      {/* Top labels */}
      <div className="flex justify-between text-[9px] font-bold tracking-widest text-muted-foreground/70 mb-2 uppercase">
        <span>Local</span>
        <span>{totalMinutes}'</span>
        <span>Visitante</span>
      </div>

      {/* Track with home (top) / away (bottom) lanes */}
      <div className="relative h-14">
        {/* Center horizontal line */}
        <div
          className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2"
          style={{
            background:
              "linear-gradient(to right, transparent 0%, hsl(189 100% 38% / 0.4) 8%, hsl(189 100% 38% / 0.4) 92%, transparent 100%)",
          }}
        />
        {/* Minute ticks */}
        {[0.25, 0.5, 0.75].map((p) => (
          <div
            key={p}
            className="absolute top-1/2 w-px h-2 -translate-y-1/2 bg-border/50"
            style={{ left: `${p * 100}%` }}
          />
        ))}

        {/* Events */}
        {events.map((event, idx) => {
          const config = eventConfig[event.event_type] ?? eventConfig.substitution;
          const Icon = config.icon;
          const isHome = event.team === homeTeam;
          const minute = Math.max(0, Math.min(totalMinutes, event.minute));
          const leftPct = (minute / totalMinutes) * 100;

          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.04, duration: 0.25 }}
              className="absolute -translate-x-1/2 flex flex-col items-center"
              style={{
                left: `${leftPct}%`,
                top: isHome ? "0" : "auto",
                bottom: isHome ? "auto" : "0",
              }}
              title={`${event.minute}' · ${config.label}${event.player_name ? ` · ${event.player_name}` : ""}`}
            >
              {/* Stem from center to node */}
              <div
                className="absolute left-1/2 w-px -translate-x-1/2"
                style={{
                  height: "12px",
                  top: isHome ? "100%" : "auto",
                  bottom: isHome ? "auto" : "100%",
                  backgroundColor: `${config.color}80`,
                }}
              />
              <div
                className="relative z-10 w-6 h-6 rounded-full flex items-center justify-center border"
                style={{
                  backgroundColor: "hsl(0 0% 7%)",
                  borderColor: config.color,
                  boxShadow: `0 0 10px ${config.color}66`,
                }}
              >
                <Icon className="w-3 h-3" style={{ color: config.color }} />
              </div>
              <span
                className="absolute text-[9px] font-bold tabular-nums"
                style={{
                  color: config.color,
                  top: isHome ? "-12px" : "auto",
                  bottom: isHome ? "auto" : "-12px",
                }}
              >
                {event.minute}'
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
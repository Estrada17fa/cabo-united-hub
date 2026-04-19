import { motion, AnimatePresence } from "framer-motion";
import { Goal, Square, RefreshCw, AlertTriangle } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

interface MatchTimelineProps {
  events: Tables<"match_events">[];
  homeTeam: string;
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

export function MatchTimeline({ events, homeTeam }: MatchTimelineProps) {
  if (events.length === 0) {
    return (
      <div className="flex items-center justify-center gap-2 py-4 text-xs text-muted-foreground">
        <AlertTriangle className="w-3.5 h-3.5" />
        Esperando eventos del partido...
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-md mx-auto py-2">
      {/* Central vertical line */}
      <div
        className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2"
        style={{
          background:
            "linear-gradient(to bottom, transparent 0%, hsl(189 100% 38% / 0.4) 10%, hsl(189 100% 38% / 0.4) 90%, transparent 100%)",
        }}
      />

      <div className="flex flex-col gap-3">
        <AnimatePresence initial={false}>
          {events.map((event, idx) => {
            const config = eventConfig[event.event_type] ?? eventConfig.substitution;
            const Icon = config.icon;
            const isHome = event.team === homeTeam;

            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: isHome ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: idx * 0.05, duration: 0.3 }}
                className="relative grid grid-cols-[1fr_auto_1fr] items-center gap-3"
              >
                {/* Left (home) */}
                <div className="flex justify-end">
                  {isHome && <EventCard event={event} config={config} align="right" />}
                </div>

                {/* Node */}
                <div
                  className="relative z-10 w-8 h-8 rounded-full flex items-center justify-center border"
                  style={{
                    backgroundColor: "hsl(0 0% 7%)",
                    borderColor: config.color,
                    boxShadow: `0 0 12px ${config.color}66`,
                  }}
                >
                  <Icon className="w-3.5 h-3.5" style={{ color: config.color }} />
                </div>

                {/* Right (away) */}
                <div className="flex justify-start">
                  {!isHome && <EventCard event={event} config={config} align="left" />}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}

function EventCard({
  event,
  config,
  align,
}: {
  event: Tables<"match_events">;
  config: { color: string; label: string };
  align: "left" | "right";
}) {
  return (
    <div
      className={`flex flex-col ${align === "right" ? "items-end text-right" : "items-start text-left"}`}
    >
      <span className="text-[10px] font-bold tracking-wider" style={{ color: config.color }}>
        {event.minute}' · {config.label.toUpperCase()}
      </span>
      {event.player_name && (
        <span className="text-xs font-semibold text-foreground leading-tight">
          {event.player_name}
        </span>
      )}
    </div>
  );
}

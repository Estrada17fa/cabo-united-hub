import { motion } from "framer-motion";
import {
  ArrowLeftRight,
  Ban,
  CircleDot,
  Goal,
  Info,
  ScanEye,
  Square,
} from "lucide-react";
import { EVENT_LABEL, GOAL_EVENTS, type Match, type MatchEvent } from "./types";
import { cn } from "@/lib/utils";

const ICONS = {
  goal: Goal,
  own_goal: Goal,
  penalty_goal: CircleDot,
  penalty_miss: Ban,
  yellow: Square,
  red: Square,
  substitution: ArrowLeftRight,
  note: Info,
  var: ScanEye,
} as const;

interface Props {
  match: Match;
  events: MatchEvent[];
}

export function MatchTimeline({ match, events }: Props) {
  if (!events.length) {
    return (
      <div className="rounded-3xl border border-white/[0.06] bg-surface-2 p-6 text-center">
        <p className="text-sm text-muted-foreground">
          Los momentos del partido aparecerán aquí en cuanto ruede la pelota.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-white/[0.06] bg-surface-2 p-4">
      <h3 className="mb-3 text-sm font-bold text-foreground">Momentos del partido</h3>
      <ol className="relative space-y-3 pl-6">
        <span className="absolute left-[9px] top-1 bottom-1 w-px bg-white/[0.08]" aria-hidden />
        {events.map((e, i) => {
          const Icon = ICONS[e.type] ?? Info;
          const isGoal = GOAL_EVENTS.includes(e.type);
          const ours =
            (e.team_id === match.home_team_id && match.home_team?.is_ours) ||
            (e.team_id === match.away_team_id && match.away_team?.is_ours);
          const teamName =
            e.team_id === match.home_team_id
              ? match.home_team?.short_name || match.home_team?.name
              : e.team_id === match.away_team_id
                ? match.away_team?.short_name || match.away_team?.name
                : null;

          return (
            <motion.li
              key={e.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: Math.min(i * 0.03, 0.3) }}
              className="relative"
            >
              <span
                className={cn(
                  "absolute -left-6 top-0.5 flex h-[19px] w-[19px] items-center justify-center rounded-full border",
                  isGoal
                    ? "border-pop/50 bg-pop/15 text-pop"
                    : e.type === "red"
                      ? "border-destructive/50 bg-destructive/15 text-destructive"
                      : e.type === "yellow"
                        ? "border-brand-accent/50 bg-brand-accent/15 text-brand-accent"
                        : "border-white/10 bg-surface-3 text-muted-foreground"
                )}
              >
                <Icon className="h-3 w-3" />
              </span>
              <div className="flex items-baseline gap-2">
                <span className="w-9 shrink-0 text-xs font-bold tabular-nums text-muted-foreground">
                  {e.minute}
                  {e.minute_extra ? `+${e.minute_extra}` : ""}'
                </span>
                <div className="min-w-0">
                  <p
                    className={cn(
                      "truncate text-sm font-semibold",
                      ours && isGoal ? "text-primary" : "text-foreground"
                    )}
                  >
                    {e.player_name || EVENT_LABEL[e.type]}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {[EVENT_LABEL[e.type], teamName, e.description].filter(Boolean).join(" · ")}
                  </p>
                </div>
              </div>
            </motion.li>
          );
        })}
      </ol>
    </div>
  );
}

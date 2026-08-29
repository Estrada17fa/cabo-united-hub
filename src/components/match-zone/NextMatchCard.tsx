import { Bell, MapPin, Ticket } from "lucide-react";
import { motion } from "framer-motion";
import { buildIcs, downloadIcs, formatKickoff, getCountdown } from "@/lib/matchClock";
import { useTicker } from "@/hooks/useMatchZone";
import { LcuButton } from "@/components/ui-lcu";
import type { Match } from "./types";
import { Scoreboard } from "./Scoreboard";
import { toast } from "sonner";

interface Props {
  match: Match;
}

export function NextMatchCard({ match }: Props) {
  const now = useTicker(true, 1000);
  const c = getCountdown(match.kickoff_at, now);
  const { date, time } = formatKickoff(match.kickoff_at);
  const isHome = !!match.home_team?.is_ours;

  const remind = () => {
    const title = `${match.home_team?.name ?? "Local"} vs ${match.away_team?.name ?? "Visita"}`;
    downloadIcs(
      "los-cabos-united.ics",
      buildIcs({ title, start: match.kickoff_at, venue: match.venue, url: window.location.href })
    );
    toast.success("Recordatorio listo: ábrelo para agregarlo a tu calendario");
  };

  return (
    <div className="overflow-hidden rounded-3xl border border-white/[0.07] bg-surface-2">
      <div className="relative px-4 pb-4 pt-5">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_-10%,hsl(var(--primary)/0.16),transparent_65%)]"
          aria-hidden
        />
        <div className="relative">
          <p className="mb-4 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
            Próximo partido{match.matchday ? ` · Jornada ${match.matchday}` : ""}
          </p>

          <Scoreboard match={match} />

          <div className="mt-5 grid grid-cols-4 gap-2">
            {[
              { v: c.days, l: "Días" },
              { v: c.hours, l: "Hrs" },
              { v: c.minutes, l: "Min" },
              { v: c.seconds, l: "Seg" },
            ].map((u) => (
              <div
                key={u.l}
                className="rounded-2xl border border-white/[0.06] bg-surface-3 py-2.5 text-center"
              >
                <motion.div
                  key={u.v}
                  initial={{ opacity: 0.4, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xl font-bold tabular-nums text-foreground"
                >
                  {String(u.v).padStart(2, "0")}
                </motion.div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {u.l}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            <span className="truncate">
              {match.venue || "Sede por confirmar"} · {date} {time}
            </span>
          </div>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            {isHome && match.tickets_url && (
              <LcuButton className="flex-1" onClick={() => window.open(match.tickets_url!, "_blank")}>
                <Ticket className="mr-1.5 h-4 w-4" />
                Comprar boletos
              </LcuButton>
            )}
            <button
              onClick={remind}
              className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-full border border-white/[0.08] bg-surface-3 text-sm font-semibold text-foreground transition-colors hover:border-primary/40"
            >
              <Bell className="h-4 w-4" />
              Avísame
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import { Bell, CalendarDays, MapPin, Ticket } from "lucide-react";
import { toast } from "sonner";
import { buildIcs, downloadIcs, formatKickoff } from "@/lib/matchClock";
import { CountdownTimer, MatchupRow, PrimaryButton } from "@/components/lcu";
import type { Match } from "./types";

export function NextMatchCard({ match }: { match: Match }) {
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
    <article className="rounded-2xl border border-hairline bg-surface-1 p-4">
      <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
        Próximo partido{match.matchday ? ` · Jornada ${match.matchday}` : ""}
      </p>

      <div className="mt-4">
        <MatchupRow match={match} />
      </div>

      <div className="mt-4">
        <CountdownTimer kickoffAt={match.kickoff_at} />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-secondary-fg">
        <span className="flex items-center gap-1.5">
          <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
          {date} · {time}
        </span>
        <span className="flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
          {match.venue || "Sede por confirmar"}
        </span>
      </div>

      <div className="mt-3">
        <span className="inline-flex items-center rounded-md border border-primary/40 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
          {isHome ? "Local" : "Visita"}
        </span>
      </div>

      {isHome && match.tickets_url ? (
        <PrimaryButton
          className="mt-4 w-full"
          onClick={() => window.open(match.tickets_url!, "_blank")}
        >
          <Ticket className="h-4 w-4" />
          Comprar boletos
        </PrimaryButton>
      ) : (
        <PrimaryButton className="mt-4 w-full" onClick={remind}>
          <Bell className="h-4 w-4" />
          Recordarme
        </PrimaryButton>
      )}
    </article>
  );
}

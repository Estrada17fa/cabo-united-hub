import { useMemo } from "react";
import { motion } from "framer-motion";
import { Calendar, ExternalLink, MapPin, Store, Ticket } from "lucide-react";
import { Crest } from "@/components/lcu";
import { SectionHeader } from "@/components/ui-lcu";
import { formatKickoff } from "@/lib/matchClock";
import { useMatches } from "@/hooks/useLeague";
import type { Match } from "@/components/match-zone/types";
import { cn } from "@/lib/utils";

/** Solo se venden boletos de los partidos donde LCU es local. */
const isHomeMatch = (m: Match) => Boolean(m.home_team?.is_ours);

function MatchRow({ match, past }: { match: Match; past?: boolean }) {
  const { date, time } = formatKickoff(match.kickoff_at);
  const rival = match.away_team;
  const link = match.tickets_url?.trim();

  return (
    <div
      className={cn(
        "rounded-2xl border border-hairline bg-surface-1 p-4 transition-colors sm:p-5",
        past ? "opacity-60" : "hover:border-primary/40",
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            {match.matchday != null && (
              <span className="rounded-md bg-surface-3 px-2 py-0.5 font-display text-[10px] font-semibold uppercase tracking-wider text-secondary-fg tabular-nums">
                Jornada {match.matchday}
              </span>
            )}
            {past && (
              <span className="rounded-md bg-surface-3 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Finalizado
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <Crest team={match.home_team} size="md" />
            <span className="text-sm font-semibold text-foreground">
              {match.home_team?.name ?? "Los Cabos United"}
            </span>
            <span className="px-1 font-display text-[11px] font-semibold text-muted-foreground">
              VS
            </span>
            <Crest team={rival} size="md" />
            <span className="truncate text-sm font-semibold text-foreground">
              {rival?.name ?? "Rival"}
            </span>
          </div>

          <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-secondary-fg">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="font-display tabular-nums first-letter:uppercase">
                {date} · {time}
              </span>
            </span>
            {match.venue && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="capitalize">{match.venue.toLowerCase()}</span>
              </span>
            )}
          </div>
        </div>

        <div className="shrink-0">
          {link && !past ? (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Ticket className="h-4 w-4" />
              Comprar boletos
              <ExternalLink className="h-3.5 w-3.5 opacity-70" />
            </a>
          ) : (
            <span className="inline-flex h-11 items-center justify-center rounded-full border border-hairline bg-surface-2 px-5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {past ? "Partido jugado" : "Próximamente"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function RowSkeleton() {
  return <div className="h-[132px] animate-pulse rounded-2xl border border-hairline bg-surface-1" />;
}

export default function Boletos() {
  const { data: matches = [], isLoading } = useMatches();

  const { upcoming, past } = useMemo(() => {
    const home = matches.filter(isHomeMatch);
    const byDate = (a: Match, b: Match) => +new Date(a.kickoff_at) - +new Date(b.kickoff_at);
    return {
      upcoming: home.filter((m) => m.phase !== "finished").sort(byDate),
      past: home.filter((m) => m.phase === "finished").sort(byDate).reverse(),
    };
  }, [matches]);

  return (
    <div className="mx-auto max-w-4xl px-4 pb-10 pt-5">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <SectionHeader
          eyebrow="Boletos"
          title="Partidos de local"
          subtitle="Compra tu entrada para los partidos de Los Cabos United en casa."
        />
      </motion.div>

      <section className="mt-5 space-y-3">
        {isLoading ? (
          <>
            <RowSkeleton />
            <RowSkeleton />
            <RowSkeleton />
          </>
        ) : upcoming.length ? (
          upcoming.map((m) => <MatchRow key={m.id} match={m} />)
        ) : (
          <div className="flex h-[132px] flex-col items-center justify-center gap-2 rounded-2xl border border-hairline bg-surface-1 text-center">
            <Ticket className="h-5 w-5 text-muted-foreground" />
            <p className="text-[13px] text-secondary-fg">
              Aún no hay partidos de local programados.
            </p>
          </div>
        )}
      </section>

      {past.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Partidos anteriores
          </h2>
          <div className="space-y-3">
            {past.map((m) => (
              <MatchRow key={m.id} match={m} past />
            ))}
          </div>
        </section>
      )}

      {/* Puntos de venta físicos */}
      <section className="mt-10">
        <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Puntos de venta físicos
        </h2>
        <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-hairline bg-surface-1 px-6 py-10 text-center">
          <Store className="h-5 w-5 text-primary" />
          <p className="text-sm font-semibold text-foreground">Próximamente</p>
          <p className="max-w-sm text-[13px] text-secondary-fg">
            Estamos definiendo los puntos donde podrás pagar en efectivo. Aquí los verás en cuanto
            estén confirmados.
          </p>
        </div>
      </section>
    </div>
  );
}

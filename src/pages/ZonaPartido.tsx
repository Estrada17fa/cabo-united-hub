import { useEffect, useRef, useState } from "react";
import { Loader2, Radio, Ticket } from "lucide-react";
import { motion } from "framer-motion";
import { useFeaturedMatch, useMatchEvents } from "@/hooks/useMatchZone";
import { useLeagueRealtime } from "@/hooks/useLeague";
import { LiveRoom } from "@/components/match-zone/LiveRoom";
import { NextMatchCard } from "@/components/match-zone/NextMatchCard";
import { MatchTimeline } from "@/components/match-zone/MatchTimeline";
import { PredictionCard } from "@/components/match-zone/PredictionCard";
import { MotmVote } from "@/components/match-zone/MotmVote";
import { TournamentPanel } from "@/components/match-zone/TournamentPanel";
import { StickyScore } from "@/components/match-zone/StickyScore";
import { isLivePhase } from "@/components/match-zone/types";
import { LcuButton } from "@/components/ui-lcu";

const ZonaPartido = () => {
  const { match, state, isLoading, matches } = useFeaturedMatch();
  const { data: events = [] } = useMatchEvents(match?.id);
  const [heroOut, setHeroOut] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  useLeagueRealtime();

  useEffect(() => {
    document.title = "Match Zone | Los Cabos United";
  }, []);

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => setHeroOut(!entry.isIntersecting), {
      threshold: 0.15,
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, [match?.id]);

  const live = !!match && isLivePhase(match.phase);
  const nextHome = matches.find(
    (m) => m.phase === "scheduled" && m.home_team?.is_ours && m.tickets_url
  );

  return (
    <div className="space-y-6 pb-24">
      <header className="space-y-1">
        <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
          <Radio className="h-3.5 w-3.5" />
          Match Zone
        </p>
        <h1 className="text-2xl font-bold leading-tight text-foreground">
          {live ? "Estamos en vivo" : state === "post" ? "Así terminó" : "El próximo es nuestro"}
        </h1>
        <p className="text-sm text-muted-foreground">
          Transmisión, marcador minuto a minuto y todo el torneo en un solo lugar.
        </p>
      </header>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : match ? (
        <motion.div
          ref={heroRef}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          {live || state === "post" ? <LiveRoom match={match} /> : <NextMatchCard match={match} />}
        </motion.div>
      ) : (
        <div className="rounded-3xl border border-white/[0.06] bg-surface-2 p-8 text-center">
          <p className="text-sm font-semibold text-foreground">Calendario en construcción</p>
          <p className="mt-1 text-xs text-muted-foreground">
            En cuanto se confirme el siguiente partido lo verás aquí con cuenta regresiva.
          </p>
        </div>
      )}

      {match && (live || state === "post") && <MatchTimeline match={match} events={events} />}

      {match && (
        <div className="grid gap-3 sm:grid-cols-2">
          <PredictionCard match={match} />
          {nextHome && nextHome.id !== match.id && (
            <div className="flex flex-col justify-between rounded-3xl border border-white/[0.06] bg-surface-2 p-4">
              <div>
                <h3 className="text-sm font-bold text-foreground">Nos toca en casa</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {nextHome.away_team?.name} nos visita en {nextHome.venue || "casa"}. Aparta tu lugar en la
                  tribuna.
                </p>
              </div>
              <LcuButton
                className="mt-3 w-full"
                onClick={() => window.open(nextHome.tickets_url!, "_blank")}
              >
                <Ticket className="mr-1.5 h-4 w-4" />
                Comprar boletos
              </LcuButton>
            </div>
          )}
        </div>
      )}

      {match && <MotmVote match={match} />}

      <TournamentPanel matches={matches} />

      {match && live && <StickyScore match={match} visible={heroOut} />}
    </div>
  );
};

export default ZonaPartido;

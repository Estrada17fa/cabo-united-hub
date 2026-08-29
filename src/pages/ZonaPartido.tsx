import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useFeaturedMatch, useMatchEvents } from "@/hooks/useMatchZone";
import { useLeagueRealtime } from "@/hooks/useLeague";
import { LiveRoom } from "@/components/match-zone/LiveRoom";
import { NextMatchCard } from "@/components/match-zone/NextMatchCard";
import { MatchTimeline } from "@/components/match-zone/MatchTimeline";
import { TournamentPanel } from "@/components/match-zone/TournamentPanel";
import { isLivePhase } from "@/components/match-zone/types";

const ZonaPartido = () => {
  const { match, state, isLoading, matches } = useFeaturedMatch();
  const { data: events = [] } = useMatchEvents(match?.id);
  useLeagueRealtime();

  useEffect(() => {
    document.title = "Match Zone | Los Cabos United";
  }, []);

  const live = !!match && isLivePhase(match.phase);

  return (
    <div className="mx-auto max-w-2xl space-y-6 pt-4 pb-10">


      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      ) : match ? (
        live || state === "post" ? (
          <LiveRoom match={match} />
        ) : (
          <NextMatchCard match={match} />
        )
      ) : (
        <div className="rounded-2xl border border-hairline bg-surface-1 p-8 text-center">
          <p className="text-sm font-semibold text-foreground">Calendario en construcción</p>
          <p className="mt-1 text-xs text-muted-foreground">
            En cuanto se confirme nuestro siguiente partido lo verás aquí con cuenta regresiva.
          </p>
        </div>
      )}

      {match && (live || state === "post") && <MatchTimeline match={match} events={events} />}

      <TournamentPanel matches={matches} />
    </div>
  );
};

export default ZonaPartido;

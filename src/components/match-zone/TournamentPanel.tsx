import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { LeagueTabs } from "@/components/lcu";
import { useScorers, useStandings } from "@/hooks/useLeague";
import type { Match } from "./types";
import { StandingsTable, EmptyState } from "./StandingsTable";
import { FixturesList } from "./FixturesList";
import { TopScorers } from "./TopScorers";
import { ScoringRules } from "./ScoringRules";

export function TournamentPanel({ matches }: { matches: Match[] }) {
  const [tab, setTab] = useState("standings");
  const { data: standings = [] } = useStandings();
  const { data: scorers = [] } = useScorers();

  const finals = matches.filter((m) => m.stage === "final");

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">Torneo</h2>
        <button
          type="button"
          className="flex items-center gap-1 text-xs font-medium text-secondary-fg"
        >
          Apertura 2026
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </div>

      <LeagueTabs
        value={tab}
        onChange={setTab}
        items={[
          { id: "fixtures", label: "Partidos" },
          { id: "standings", label: "Posiciones" },
          { id: "scorers", label: "Goleo" },
          { id: "finals", label: "Fase final" },
        ]}
      />

      {tab === "fixtures" && <FixturesList matches={matches} />}
      {tab === "standings" && (
        <div className="space-y-4">
          <StandingsTable standings={standings} />
          <ScoringRules />
        </div>
      )}
      {tab === "scorers" && <TopScorers scorers={scorers} />}
      {tab === "finals" &&
        (finals.length ? (
          <FixturesList matches={finals} />
        ) : (
          <EmptyState text="La fase final se publicará al cerrar la temporada regular." />
        ))}
    </section>
  );
}

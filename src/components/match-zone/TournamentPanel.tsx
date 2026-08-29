import { useState } from "react";
import { BarChart3, CalendarDays, Goal, Shield } from "lucide-react";
import { LcuTabs } from "@/components/ui-lcu";
import { useScorers, useStandings, useTeams } from "@/hooks/useLeague";
import type { Match } from "./types";
import { StandingsTable } from "./StandingsTable";
import { FixturesList } from "./FixturesList";
import { TopScorers } from "./TopScorers";
import { TeamsGrid } from "./TeamsGrid";
import { ScoringRules } from "./ScoringRules";

export function TournamentPanel({ matches }: { matches: Match[] }) {
  const [tab, setTab] = useState("fixtures");
  const { data: standings = [] } = useStandings();
  const { data: scorers = [] } = useScorers();
  const { data: teams = [] } = useTeams();

  return (
    <section className="space-y-4">
      <div className="flex items-baseline justify-between">
        <h2 className="text-lg font-bold text-foreground">El torneo</h2>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Temporada 2026
        </span>
      </div>

      <LcuTabs
        layoutId="tournament-tabs"
        value={tab}
        onChange={setTab}
        items={[
          { id: "fixtures", label: "Partidos", icon: CalendarDays },
          { id: "standings", label: "Posiciones", icon: BarChart3 },
          { id: "scorers", label: "Goleo", icon: Goal },
          { id: "teams", label: "Equipos", icon: Shield },
        ]}
      />

      {tab === "fixtures" && <FixturesList matches={matches} />}
      {tab === "standings" && (
        <div className="space-y-3">
          <ScoringRules />
          <StandingsTable standings={standings} />
        </div>
      )}
      {tab === "scorers" && <TopScorers scorers={scorers} />}
      {tab === "teams" && <TeamsGrid teams={teams} />}
    </section>
  );
}

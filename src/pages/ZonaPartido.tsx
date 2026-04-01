import { useState } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CountdownCard } from "@/components/zona-partido/CountdownCard";
import { LiveMatchCard } from "@/components/zona-partido/LiveMatchCard";
import { LCUMatchHistory } from "@/components/zona-partido/LCUMatchHistory";
import { InteractiveLineup } from "@/components/zona-partido/InteractiveLineup";
import { StandingsTable, TopScorersTable } from "@/components/zona-partido/StandingsTable";
import { LeagueMatches } from "@/components/zona-partido/LeagueMatches";
import { lcuMatches, liveMatch, standings, topScorers } from "@/components/zona-partido/mockData";

const ZonaPartido = () => {
  const [section, setSection] = useState("lcu");
  const [standingsTab, setStandingsTab] = useState("general");

  // Toggle: set to true to preview live mode
  const isMatchDay = false;

  const nextMatch = lcuMatches.find(m => m.status === "upcoming");
  const allStandings = standings;
  const grupo1 = standings.filter(s => s.grupo === 1);
  const grupo2 = standings.filter(s => s.grupo === 2);
  const grupo3 = standings.filter(s => s.grupo === 3);

  return (
    <div className="pb-8 space-y-4">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-headline mb-1">Zona de Partido</h1>
        <p className="text-caption">Liga Premier Serie A</p>
      </motion.div>

      {/* Section toggle */}
      <Tabs value={section} onValueChange={setSection}>
        <TabsList className="w-full">
          <TabsTrigger value="lcu" className="flex-1 text-xs">Los Cabos United</TabsTrigger>
          <TabsTrigger value="torneo" className="flex-1 text-xs">Torneo</TabsTrigger>
        </TabsList>

        {/* ═══ LOS CABOS UNITED ═══ */}
        <TabsContent value="lcu" className="space-y-4 mt-4">
          {/* Countdown or Live */}
          {isMatchDay ? (
            <LiveMatchCard match={liveMatch} />
          ) : (
            nextMatch && <CountdownCard match={nextMatch} />
          )}

          {/* Lineup */}
          {isMatchDay && <InteractiveLineup />}

          {/* Match history */}
          <LCUMatchHistory />

          {/* Lineup in normal mode too */}
          {!isMatchDay && <InteractiveLineup />}
        </TabsContent>

        {/* ═══ TORNEO ═══ */}
        <TabsContent value="torneo" className="space-y-4 mt-4">
          {/* Standings tabs */}
          <Tabs value={standingsTab} onValueChange={setStandingsTab}>
            <TabsList className="w-full flex-wrap h-auto gap-1 p-1">
              <TabsTrigger value="general" className="flex-1 text-[10px] sm:text-xs">General</TabsTrigger>
              <TabsTrigger value="g1" className="flex-1 text-[10px] sm:text-xs">Grupo 1</TabsTrigger>
              <TabsTrigger value="g2" className="flex-1 text-[10px] sm:text-xs">Grupo 2</TabsTrigger>
              <TabsTrigger value="g3" className="flex-1 text-[10px] sm:text-xs">Grupo 3</TabsTrigger>
              <TabsTrigger value="goleo" className="flex-1 text-[10px] sm:text-xs">Goleo</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="mt-4">
              <StandingsTable standings={allStandings} title="📊 Tabla General" />
            </TabsContent>
            <TabsContent value="g1" className="mt-4">
              <StandingsTable standings={grupo1} title="Grupo 1" />
            </TabsContent>
            <TabsContent value="g2" className="mt-4">
              <StandingsTable standings={grupo2} title="Grupo 2" />
            </TabsContent>
            <TabsContent value="g3" className="mt-4">
              <StandingsTable standings={grupo3} title="Grupo 3" />
            </TabsContent>
            <TabsContent value="goleo" className="mt-4">
              <TopScorersTable scorers={topScorers} />
            </TabsContent>
          </Tabs>

          {/* League matches */}
          <LeagueMatches />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ZonaPartido;

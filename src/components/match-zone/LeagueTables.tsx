import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StandingsTable, type StandingRow } from "./StandingsTable";
import { LeagueFixtures } from "./LeagueFixtures";
import { FinalStageBracket } from "./FinalStageBracket";
import { TopScorersBoard } from "./TopScorersBoard";
import { LeagueScoringInfo } from "./LeagueScoringInfo";
import { LeagueGroupSwitch } from "./LeagueGroupSwitch";
import { BentoTile, Crest, LcuTabs, SectionHeader } from "@/components/ui-lcu";

import {
  useLeagueGroups,
  useLeagueMatches,
  useLeagueScorers,
  useLeagueStandings,
  useOurTeamName,
  useTeamLogoMap,
  useTeamStreaks,
} from "@/hooks/useLeague";

const MAIN_TABS = [
  { id: "partidos", label: "Partidos" },
  { id: "posiciones", label: "Posiciones" },
  { id: "final", label: "Fase final" },
  { id: "goleo", label: "Goleo" },
];

export function LeagueTables() {
  const [mainTab, setMainTab] = useState("partidos");
  const [standingsGroup, setStandingsGroup] = useState("all");

  const logoMap = useTeamLogoMap();
  const ourTeam = useOurTeamName();
  const groups = useLeagueGroups();
  const streaks = useTeamStreaks();
  const { data: matches = [], isLoading: matchesLoading } = useLeagueMatches();
  const { data: standings = [] } = useLeagueStandings();
  const { data: scorers = [] } = useLeagueScorers();

  const standingRows: StandingRow[] = useMemo(
    () =>
      standings
        .filter((s) =>
          standingsGroup === "all"
            ? !s.group_name || s.group_name === "general"
            : s.group_name === standingsGroup,
        )
        .sort((a, b) => a.pos - b.pos)
        .map((s) => ({
          pos: s.pos,
          team: s.team,
          jj: s.jj,
          jg: s.jg,
          je: s.je,
          jp: s.jp,
          gf: s.gf,
          gc: s.gc,
          dg: s.dg,
          pts: s.pts,
          group_name: s.group_name,
          manual_adjustment: s.manual_adjustment,
        })),
    [standings, standingsGroup],
  );

  const ourRow = useMemo(
    () => standings.find((s) => s.team === ourTeam && (!s.group_name || s.group_name === "general")) ?? standings.find((s) => s.team === ourTeam),
    [standings, ourTeam],
  );

  return (
    <div className="space-y-5">
      {/* Hero del club en mosaico bento */}
      {ourRow && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="wave-motif relative overflow-hidden rounded-card border border-primary/30 bg-surface-1 p-4 md:p-5"
        >
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(120% 80% at 0% 0%, hsl(var(--primary) / 0.18), transparent 60%)",
            }}
          />
          <div className="relative">
            <div className="flex items-center gap-3">
              <Crest teamName={ourTeam} logoUrl={logoMap[ourTeam]} size={56} highlight />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
                  Nuestro equipo
                </p>
                <h2 className="truncate text-display-md text-foreground">{ourTeam}</h2>
                {ourRow.group_name && ourRow.group_name !== "general" && (
                  <p className="mt-0.5 text-xs text-secondary-fg">Grupo {ourRow.group_name}</p>
                )}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              <BentoTile value={ourRow.pts} label="Puntos" emphasis index={0} />
              <BentoTile value={`#${ourRow.pos}`} label="Posición" index={1} />
              <BentoTile value={ourRow.jj} label="Jugados" index={2} />
              <BentoTile
                value={ourRow.dg > 0 ? `+${ourRow.dg}` : ourRow.dg}
                label="Dif. goles"
                index={3}
              />
              <BentoTile
                value={`${ourRow.jg}-${ourRow.je}-${ourRow.jp}`}
                label="G · E · P"
                index={4}
              />
              <BentoTile value={`${ourRow.gf}:${ourRow.gc}`} label="GF : GC" index={5} />
            </div>
          </div>
        </motion.div>
      )}

      <SectionHeader eyebrow="Liga Premier" title="La competencia" />

      <LcuTabs
        variant="underline"
        layoutId="liga-maintab"
        items={MAIN_TABS}
        value={mainTab}
        onChange={setMainTab}
      />


      <AnimatePresence mode="wait">
        <motion.div
          key={mainTab}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.2 }}
          className="space-y-4"
        >
          {mainTab === "partidos" && (
            <LeagueFixtures
              matches={matches}
              isLoading={matchesLoading}
              logoMap={logoMap}
              ourTeam={ourTeam}
              groups={groups}
            />
          )}

          {mainTab === "posiciones" && (
            <div className="space-y-3">
              <LeagueGroupSwitch
                groups={groups}
                value={standingsGroup}
                onChange={setStandingsGroup}
                allLabel="General"
                layoutId="standings-group"
              />
              <StandingsTable
                rows={standingRows}
                logoMap={logoMap}
                ourTeam={ourTeam}
                streaks={streaks}
              />
              <LeagueScoringInfo />
            </div>
          )}

          {mainTab === "final" && (
            <FinalStageBracket matches={matches} logoMap={logoMap} ourTeam={ourTeam} />
          )}

          {mainTab === "goleo" && (
            <TopScorersBoard scorers={scorers} logoMap={logoMap} ourTeam={ourTeam} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

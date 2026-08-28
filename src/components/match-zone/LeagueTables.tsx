import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StandingsTable, type StandingRow } from "./StandingsTable";
import { LeagueFixtures } from "./LeagueFixtures";
import { FinalStageBracket } from "./FinalStageBracket";
import { TopScorersBoard } from "./TopScorersBoard";
import { LeagueScoringInfo } from "./LeagueScoringInfo";
import { LeagueGroupSwitch } from "./LeagueGroupSwitch";
import { TeamCrest } from "./TeamCrest";
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
    <div className="space-y-4">
      {/* Tarjeta resumen del club */}
      {ourRow && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-primary/40 p-3.5"
          style={{ background: "linear-gradient(135deg, hsl(var(--primary) / 0.16), transparent 70%), #121212" }}
        >
          <div className="flex items-center gap-3">
            <TeamCrest teamName={ourTeam} logoUrl={logoMap[ourTeam]} size={38} />
            <div className="min-w-0 flex-1">
              <p className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-primary">Nuestro equipo</p>
              <p className="truncate text-sm font-extrabold text-foreground">{ourTeam}</p>
            </div>
            <div className="text-right">
              <p className="text-[22px] font-extrabold leading-none text-primary tabular-nums">{ourRow.pts}</p>
              <p className="text-[9px] uppercase tracking-wider text-muted-foreground">puntos</p>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-4 gap-2">
            {[
              { k: "Pos", v: `${ourRow.pos}°` },
              { k: "JJ", v: ourRow.jj },
              { k: "G-E-P", v: `${ourRow.jg}-${ourRow.je}-${ourRow.jp}` },
              { k: "Dif", v: ourRow.dg > 0 ? `+${ourRow.dg}` : ourRow.dg },
            ].map((s) => (
              <div key={s.k} className="rounded-xl border border-border/60 bg-background/40 px-1.5 py-1.5 text-center">
                <p className="text-[11px] font-extrabold text-foreground tabular-nums">{s.v}</p>
                <p className="text-[9px] uppercase tracking-wider text-muted-foreground">{s.k}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex gap-3 overflow-x-auto scrollbar-hide pb-1 -mx-1 px-1"
      >
        {MAIN_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setMainTab(tab.id)}
            className="relative whitespace-nowrap pb-2 text-xs font-semibold transition-colors shrink-0"
            style={{ color: mainTab === tab.id ? "hsl(0 0% 100%)" : "hsl(0 0% 45%)" }}
          >
            {tab.label}
            {mainTab === tab.id && (
              <motion.div
                layoutId="liga-maintab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
          </button>
        ))}
      </motion.div>

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

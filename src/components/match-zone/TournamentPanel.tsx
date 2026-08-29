import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { LeagueTabs } from "@/components/lcu";
import { SEASON, useMatches, useScorers, useSeasons, useStandings } from "@/hooks/useLeague";
import type { Match } from "./types";
import { StandingsTable } from "./StandingsTable";
import { FixturesList } from "./FixturesList";
import { TopScorers } from "./TopScorers";
import { FinalsBracket } from "./FinalsBracket";
import { ScoringRules } from "./ScoringRules";
import { cn } from "@/lib/utils";

export function TournamentPanel({ matches: fallbackMatches }: { matches: Match[] }) {
  const [tab, setTab] = useState("standings");
  const { data: seasons = [] } = useSeasons();

  const tournaments = useMemo(() => seasons.filter((s) => !!s.season_key), [seasons]);
  const [seasonKey, setSeasonKey] = useState<string | null>(null);

  const activeTournament =
    tournaments.find((t) => t.season_key === seasonKey) ??
    tournaments.find((t) => t.status === "active") ??
    tournaments[0] ??
    null;

  const currentKey = activeTournament?.season_key ?? SEASON;
  const title = activeTournament?.name ?? currentKey;

  const { data: seasonMatches } = useMatches(currentKey);
  const matches = currentKey === SEASON ? seasonMatches ?? fallbackMatches : seasonMatches ?? [];

  const { data: standings = [] } = useStandings(currentKey);
  const { data: scorers = [] } = useScorers(currentKey);

  const finals = matches.filter((m) => m.stage === "final");
  const hasGroups = new Set(standings.map((s) => s.group_name ?? "General")).size > 1;

  const [pickerOpen, setPickerOpen] = useState(false);
  const multiple = tournaments.length > 1;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-foreground">Torneo</h2>

        <div className="relative">
          <button
            type="button"
            onClick={() => multiple && setPickerOpen((v) => !v)}
            aria-expanded={multiple ? pickerOpen : undefined}
            className={cn(
              "flex items-center gap-1 text-xs font-medium text-secondary-fg",
              !multiple && "cursor-default"
            )}
          >
            {title}
            {multiple && <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
          </button>

          <AnimatePresence>
            {multiple && pickerOpen && (
              <motion.ul
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="absolute right-0 z-20 mt-2 w-48 overflow-hidden rounded-xl border border-hairline bg-surface-2 shadow-xl"
              >
                {tournaments.map((t) => (
                  <li key={t.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setSeasonKey(t.season_key);
                        setPickerOpen(false);
                      }}
                      className={cn(
                        "block w-full px-3 py-2 text-left text-xs",
                        t.season_key === currentKey
                          ? "bg-primary/10 font-semibold text-primary"
                          : "text-secondary-fg"
                      )}
                    >
                      {t.name}
                    </button>
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>
      </div>

      <LeagueTabs
        value={tab}
        onChange={setTab}
        items={[
          { id: "standings", label: "Posiciones" },
          { id: "fixtures", label: "Partidos" },
          { id: "finals", label: "Fase final" },
          { id: "scorers", label: "Goleo" },
        ]}
      />

      {tab === "standings" && (
        <div className="space-y-4">
          <StandingsTable standings={standings} />
          <ScoringRules />
        </div>
      )}
      {tab === "fixtures" && <FixturesList matches={matches} />}
      {tab === "finals" && <FinalsBracket matches={finals} />}
      {tab === "scorers" && <TopScorers scorers={scorers} hasGroups={hasGroups} />}
    </section>
  );
}

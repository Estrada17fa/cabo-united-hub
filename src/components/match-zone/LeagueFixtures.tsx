import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { MapPin, Ticket } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Crest as TeamCrest } from "@/components/ui-lcu";
import { LeagueGroupSwitch } from "./LeagueGroupSwitch";
import { isFinished, matchDateTime, type LeagueMatch } from "@/hooks/useLeague";

const SUB_TABS = [
  { id: "proximos", label: "Próximos" },
  { id: "resultados", label: "Resultados" },
];

interface Props {
  matches: LeagueMatch[];
  isLoading?: boolean;
  logoMap?: Record<string, string>;
  ourTeam?: string;
  groups?: string[];
}

export function LeagueFixtures({
  matches,
  isLoading = false,
  logoMap = {},
  ourTeam = "Los Cabos United",
  groups = [],
}: Props) {
  const [subTab, setSubTab] = useState("proximos");
  const [group, setGroup] = useState("all");
  const [onlyOurs, setOnlyOurs] = useState(false);

  const list = useMemo(() => {
    const filtered = matches
      .filter((m) => m.stage !== "final")
      .filter((m) => (subTab === "resultados" ? isFinished(m) : !isFinished(m)))
      .filter((m) => group === "all" || m.group_name === group)
      .filter((m) => !onlyOurs || m.home_team === ourTeam || m.away_team === ourTeam);
    return subTab === "resultados"
      ? [...filtered].sort((a, b) => b.match_date.localeCompare(a.match_date))
      : [...filtered].sort((a, b) => a.match_date.localeCompare(b.match_date));
  }, [matches, subTab, group, onlyOurs, ourTeam]);

  const grouped = useMemo(() => {
    const map = new Map<string, LeagueMatch[]>();
    list.forEach((m) => {
      const key = m.jornada != null ? `Jornada ${m.jornada}` : "Sin jornada";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(m);
    });
    return Array.from(map.entries());
  }, [list]);

  return (
    <div className="space-y-3.5">
      <div className="flex items-center gap-3">
        {SUB_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSubTab(tab.id)}
            className="relative whitespace-nowrap pb-2 text-xs font-semibold transition-colors shrink-0"
            style={{ color: subTab === tab.id ? "hsl(0 0% 100%)" : "hsl(0 0% 45%)" }}
          >
            {tab.label}
            {subTab === tab.id && (
              <motion.div
                layoutId="league-fixtures-tab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
          </button>
        ))}
        <button
          onClick={() => setOnlyOurs((v) => !v)}
          className={`ml-auto rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition-colors ${
            onlyOurs ? "border-primary/60 bg-primary/15 text-primary" : "border-border text-muted-foreground"
          }`}
        >
          Solo LCU
        </button>
      </div>

      <LeagueGroupSwitch
        groups={groups}
        value={group}
        onChange={setGroup}
        allLabel="Toda la liga"
        layoutId="fixtures-group"
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={`${subTab}-${group}-${onlyOurs}`}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.2 }}
          className="space-y-5"
        >
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 rounded-2xl bg-muted/20 animate-pulse" />
              ))}
            </div>
          ) : grouped.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              {subTab === "resultados" ? "Aún no hay resultados" : "No hay próximos partidos programados"}
            </div>
          ) : (
            grouped.map(([jornada, group]) => (
              <div key={jornada} className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    {jornada}
                  </span>
                  <div className="flex-1 h-px bg-border/60" />
                </div>
                {group.map((m, i) => (
                  <FixtureRow
                    key={m.id}
                    match={m}
                    logoMap={logoMap}
                    index={i}
                    ourTeam={ourTeam}
                    showScore={subTab === "resultados"}
                  />
                ))}
              </div>
            ))
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function FixtureRow({
  match,
  logoMap,
  index,
  showScore,
  ourTeam,
}: {
  match: LeagueMatch;
  logoMap: Record<string, string>;
  index: number;
  showScore: boolean;
  ourTeam: string;
}) {
  const isOurs = match.home_team === ourTeam || match.away_team === ourTeam;
  const isHomeOurs = match.home_team === ourTeam;
  const date = matchDateTime(match);
  const hasPens =
    showScore && match.home_pens != null && match.away_pens != null && (match.home_pens || match.away_pens);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.2) }}
      className={`rounded-card border p-3.5 ${isOurs ? "border-primary/50 bg-primary/[0.07]" : "border-white/[0.07] bg-surface-1"}`}
      
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground capitalize">
          {format(date, "EEE d MMM", { locale: es })}
          {match.match_time && ` · ${format(date, "h:mm a")}`}
          {match.group_name && (
            <span className="rounded-full border border-border px-1.5 py-px normal-case tracking-normal">
              {match.group_name}
            </span>
          )}
        </span>
        {isOurs && (
          <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-primary">
            {isHomeOurs ? "Local" : "Visita"}
          </span>
        )}
      </div>

      <div className="space-y-1.5">
        <TeamRow
          name={match.home_team}
          logo={logoMap[match.home_team]}
          score={showScore ? match.home_score : null}
          pens={hasPens ? match.home_pens : null}
          points={showScore ? match.home_points : null}
          highlight={match.home_team === ourTeam}
        />
        <TeamRow
          name={match.away_team}
          logo={logoMap[match.away_team]}
          score={showScore ? match.away_score : null}
          pens={hasPens ? match.away_pens : null}
          points={showScore ? match.away_points : null}
          highlight={match.away_team === ourTeam}
        />
      </div>

      {(match.venue || hasPens || (isOurs && isHomeOurs && !showScore)) && (
        <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-border/50">
          <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground truncate">
            {match.venue && (
              <>
                <MapPin className="w-3 h-3 shrink-0" />
                <span className="truncate">{match.venue}</span>
              </>
            )}
            {hasPens && (
              <span className="shrink-0 rounded-full bg-primary/15 px-2 py-px text-[10px] font-bold text-primary">
                {match.home_pens}-{match.away_pens} pen
              </span>
            )}
          </span>
          {isOurs && isHomeOurs && !showScore && (
            <Link
              to="/abonos"
              className="flex items-center gap-1.5 shrink-0 rounded-full border border-primary/40 bg-primary/15 px-3 py-1 text-[11px] font-semibold text-primary"
            >
              <Ticket className="w-3 h-3" />
              Comprar boletos
            </Link>
          )}
        </div>
      )}
    </motion.div>
  );
}

function TeamRow({
  name,
  logo,
  score,
  pens,
  points,
  highlight,
}: {
  name: string;
  logo?: string;
  score: number | null;
  pens?: number | null;
  points?: number | null;
  highlight: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <TeamCrest teamName={name} logoUrl={logo} size={20} />
      <span className={`flex-1 truncate text-sm ${highlight ? "font-bold text-primary" : "font-normal text-foreground"}`}>
        {name}
      </span>
      {points != null && points > 0 && (
        <span className="rounded-full bg-muted/30 px-1.5 text-[9px] font-bold text-muted-foreground tabular-nums">
          +{points}
        </span>
      )}
      {pens != null && <span className="text-[10px] text-muted-foreground tabular-nums">({pens})</span>}
      {score != null && (
        <span className={`text-sm font-bold tabular-nums ${highlight ? "text-primary" : "text-foreground"}`}>
          {score}
        </span>
      )}
    </div>
  );
}

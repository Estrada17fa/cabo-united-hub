import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { MapPin, Ticket } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { TeamCrest } from "./TeamCrest";
import { useTeamLogos } from "@/hooks/useTeamLogos";
import type { Tables } from "@/integrations/supabase/types";

const LCU = "Los Cabos United";

const SUB_TABS = [
  { id: "proximos", label: "Próximos" },
  { id: "resultados", label: "Resultados" },
];

type Match = Tables<"matches">;

function matchDateTime(m: Match) {
  return new Date(`${m.match_date}T${m.match_time || "23:59:59"}`);
}

export function LeagueFixtures() {
  const [subTab, setSubTab] = useState("proximos");
  const logoMap = useTeamLogos();

  const { data: matches = [], isLoading } = useQuery({
    queryKey: ["matches", "league-fixtures"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("matches")
        .select("*")
        .order("match_date", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const now = new Date();

  const list = useMemo(() => {
    const finished = (m: Match) => m.phase === "finished" || m.status === "finished" || matchDateTime(m) < now;
    const filtered = matches.filter((m) => (subTab === "resultados" ? finished(m) : !finished(m)));
    return subTab === "resultados"
      ? [...filtered].sort((a, b) => b.match_date.localeCompare(a.match_date))
      : [...filtered].sort((a, b) => a.match_date.localeCompare(b.match_date));
  }, [matches, subTab]);

  const grouped = useMemo(() => {
    const map = new Map<string, Match[]>();
    list.forEach((m) => {
      const key = m.jornada != null ? `Jornada ${m.jornada}` : "Sin jornada";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(m);
    });
    return Array.from(map.entries());
  }, [list]);

  return (
    <div className="space-y-4">
      <div className="flex gap-3 -mx-1 px-1">
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
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={subTab}
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
                  <span className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-muted-foreground">
                    {jornada}
                  </span>
                  <div className="flex-1 h-px bg-border/60" />
                </div>
                {group.map((m, i) => (
                  <FixtureRow key={m.id} match={m} logoMap={logoMap} index={i} showScore={subTab === "resultados"} />
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
}: {
  match: Match;
  logoMap: Record<string, string>;
  index: number;
  showScore: boolean;
}) {
  const isLCU = match.home_team === LCU || match.away_team === LCU;
  const isHomeLCU = match.home_team === LCU;
  const date = matchDateTime(match);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.2) }}
      className={`rounded-2xl border p-3.5 ${isLCU ? "border-primary/50 bg-primary/[0.07]" : "border-border"}`}
      style={!isLCU ? { background: "#121212" } : undefined}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground capitalize">
          {format(date, "EEE d MMM", { locale: es })}
          {match.match_time && ` · ${format(date, "h:mm a")}`}
        </span>
        {isLCU && (
          <span className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-primary">
            {isHomeLCU ? "Local" : "Visita"}
          </span>
        )}
      </div>

      <div className="space-y-1.5">
        <TeamRow
          name={match.home_team}
          logo={logoMap[match.home_team]}
          score={showScore ? match.home_score : null}
          highlight={match.home_team === LCU}
        />
        <TeamRow
          name={match.away_team}
          logo={logoMap[match.away_team]}
          score={showScore ? match.away_score : null}
          highlight={match.away_team === LCU}
        />
      </div>

      {(match.venue || (isLCU && isHomeLCU && !showScore)) && (
        <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-border/50">
          <span className="flex items-center gap-1 text-[11px] text-muted-foreground truncate">
            {match.venue && (
              <>
                <MapPin className="w-3 h-3 shrink-0" />
                <span className="truncate">{match.venue}</span>
              </>
            )}
          </span>
          {isLCU && isHomeLCU && !showScore && (
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
  highlight,
}: {
  name: string;
  logo?: string;
  score: number | null;
  highlight: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <TeamCrest teamName={name} logoUrl={logo} size={20} />
      <span
        className={`flex-1 truncate text-sm ${highlight ? "font-bold text-primary" : "font-medium text-foreground"}`}
      >
        {name}
      </span>
      {score != null && (
        <span className={`text-sm font-extrabold tabular-nums ${highlight ? "text-primary" : "text-foreground"}`}>
          {score}
        </span>
      )}
    </div>
  );
}

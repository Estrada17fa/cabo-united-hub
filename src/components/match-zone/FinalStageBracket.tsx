import { useMemo } from "react";
import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { TeamCrest } from "./TeamCrest";
import { isFinished, matchDateTime, type LeagueMatch } from "@/hooks/useLeague";

interface Props {
  matches: LeagueMatch[];
  logoMap?: Record<string, string>;
  ourTeam?: string;
}

export function FinalStageBracket({ matches, logoMap = {}, ourTeam = "Los Cabos United" }: Props) {
  const rounds = useMemo(() => {
    const map = new Map<string, LeagueMatch[]>();
    matches
      .filter((m) => m.stage === "final")
      .sort((a, b) => a.match_date.localeCompare(b.match_date))
      .forEach((m) => {
        const key = m.round_name?.trim() || "Fase final";
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(m);
      });
    return Array.from(map.entries());
  }, [matches]);

  if (rounds.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-border p-8 text-center"
      >
        <span className="mx-auto grid place-items-center w-12 h-12 rounded-full bg-primary/12 text-primary mb-3">
          <Trophy className="w-5 h-5" />
        </span>
        <p className="text-sm font-bold text-foreground">La fase final aún no arranca</p>
        <p className="text-xs text-muted-foreground mt-1 max-w-[280px] mx-auto">
          Cuando termine la temporada regular aquí verás las llaves, horarios y resultados de la liguilla.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-5">
      {rounds.map(([round, group]) => (
        <div key={round} className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-primary">{round}</span>
            <div className="flex-1 h-px bg-border/60" />
          </div>
          {group.map((m) => {
            const done = isFinished(m);
            const ours = m.home_team === ourTeam || m.away_team === ourTeam;
            return (
              <div
                key={m.id}
                className={`rounded-2xl border p-3.5 ${ours ? "border-primary/50 bg-primary/[0.07]" : "border-border"}`}
                style={!ours ? { background: "#121212" } : undefined}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground capitalize">
                    {format(matchDateTime(m), "EEE d MMM", { locale: es })}
                  </span>
                  {done && (
                    <span className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-primary">Final</span>
                  )}
                </div>
                {[
                  { name: m.home_team, score: m.home_score, pens: m.home_pens },
                  { name: m.away_team, score: m.away_score, pens: m.away_pens },
                ].map((side) => (
                  <div key={side.name} className="flex items-center gap-2 py-0.5">
                    <TeamCrest teamName={side.name} logoUrl={logoMap[side.name]} size={20} />
                    <span
                      className={`flex-1 truncate text-sm ${
                        side.name === ourTeam ? "font-bold text-primary" : "font-medium text-foreground"
                      }`}
                    >
                      {side.name}
                    </span>
                    {done && side.pens != null && (
                      <span className="text-[10px] text-muted-foreground tabular-nums">({side.pens})</span>
                    )}
                    {done && (
                      <span className="text-sm font-extrabold tabular-nums text-foreground">{side.score ?? 0}</span>
                    )}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

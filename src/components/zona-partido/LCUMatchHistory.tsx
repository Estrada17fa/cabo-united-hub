import { motion } from "framer-motion";
import { lcuMatches } from "./mockData";
import { MatchCard } from "./MatchCard";

export function LCUMatchHistory() {
  const past = lcuMatches.filter(m => m.status === "finished").reverse();
  const upcoming = lcuMatches.filter(m => m.status === "upcoming");

  return (
    <div className="space-y-4">
      {upcoming.length > 0 && (
        <div>
          <p className="text-label text-muted-foreground mb-2">Próximos Partidos</p>
          <div className="space-y-2">
            {upcoming.map((m) => (
              <MatchCard key={m.id} match={m} />
            ))}
          </div>
        </div>
      )}
      {past.length > 0 && (
        <div>
          <p className="text-label text-muted-foreground mb-2">Resultados</p>
          <div className="space-y-2">
            {past.map((m) => (
              <MatchCard key={m.id} match={m} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

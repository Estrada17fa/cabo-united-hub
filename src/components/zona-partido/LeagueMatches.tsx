import { useState } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { leagueMatches } from "./mockData";
import { MatchCard } from "./MatchCard";

export function LeagueMatches() {
  const [selectedGroup, setSelectedGroup] = useState("1");

  const groups = [1, 2, 3];
  const filtered = leagueMatches.filter(m => m.grupo === Number(selectedGroup));

  // Group by jornada
  const byJornada = filtered.reduce<Record<number, typeof filtered>>((acc, m) => {
    if (!acc[m.jornada]) acc[m.jornada] = [];
    acc[m.jornada].push(m);
    return acc;
  }, {});

  const jornadas = Object.keys(byJornada).map(Number).sort((a, b) => a - b);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bento-card"
    >
      <h3 className="text-sm font-bold mb-3">Partidos por Grupo</h3>

      <Tabs value={selectedGroup} onValueChange={setSelectedGroup}>
        <TabsList className="w-full">
          {groups.map(g => (
            <TabsTrigger key={g} value={String(g)} className="flex-1 text-xs">
              Grupo {g}
            </TabsTrigger>
          ))}
        </TabsList>

        {groups.map(g => (
          <TabsContent key={g} value={String(g)} className="space-y-4 mt-4">
            {jornadas.map(j => (
              <div key={j}>
                <p className="text-label text-muted-foreground mb-2">Jornada {j}</p>
                <div className="space-y-2">
                  {(byJornada[j] || []).map(m => (
                    <MatchCard key={m.id} match={m} compact />
                  ))}
                </div>
              </div>
            ))}
          </TabsContent>
        ))}
      </Tabs>
    </motion.div>
  );
}

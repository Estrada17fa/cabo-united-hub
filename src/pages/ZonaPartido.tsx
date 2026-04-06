import { motion } from "framer-motion";
import { Icon } from "lucide-react";
import { soccerBall } from "@lucide/lab";
import { NextMatchCard } from "@/components/match-zone/NextMatchCard";
import { RecentResults } from "@/components/match-zone/RecentResults";
import { MatchCalendar } from "@/components/match-zone/MatchCalendar";
import { AdminMatchForm } from "@/components/match-zone/AdminMatchForm";
import { useMatches } from "@/hooks/useMatches";
import { useAuth } from "@/hooks/useAuth";

const ZonaPartido = () => {
  const { user } = useAuth();
  const { data: matches } = useMatches();

  return (
    <div className="min-h-[calc(100vh-12rem)] py-6 px-4 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Icon iconNode={soccerBall} className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Match Zone</h1>
            <p className="text-xs text-muted-foreground">Partidos y resultados</p>
          </div>
        </div>

        {/* Admin panel - only for logged in users */}
        {user && <div className="mb-6"><AdminMatchForm matches={matches || []} /></div>}

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-4">
            <NextMatchCard />
            <RecentResults />
          </div>
          <div>
            <MatchCalendar />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ZonaPartido;

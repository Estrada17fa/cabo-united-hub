import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MatchHeroCard } from "@/components/match-zone/MatchHeroCard";
import { LiveMatchPlayer } from "@/components/match-zone/LiveMatchPlayer";
import { MatchTabs } from "@/components/match-zone/MatchTabs";
import { LeagueTables } from "@/components/match-zone/LeagueTables";
import { AuthFlow } from "@/components/auth/AuthFlow";
import { AuthModal } from "@/components/auth/AuthModal";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useLiveMatch } from "@/hooks/useLiveMatch";

const ZonaPartido = () => {
  const [activeTab, setActiveTab] = useState("envivo");
  const [loginOpen, setLoginOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);


  const { data: featuredMatch = null } = useQuery({
    queryKey: ["matches", "featured"],
    queryFn: async () => {
      // 1) Partido en curso (fase activa)
      const { data: liveData, error: liveError } = await supabase
        .from("matches")
        .select("*")
        .in("phase", ["first_half", "halftime", "second_half"])
        .order("match_date", { ascending: false })
        .limit(1);
      if (liveError) throw liveError;
      if (liveData && liveData.length > 0) return liveData[0];

      // 2) Partido recién finalizado (últimas 24h)
      const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split("T")[0];
      const { data: finishedData, error: finishedError } = await supabase
        .from("matches")
        .select("*")
        .eq("phase", "finished")
        .gte("match_date", cutoff)
        .order("match_date", { ascending: false })
        .limit(1);
      if (finishedError) throw finishedError;
      if (finishedData && finishedData.length > 0) return finishedData[0];

      // 3) Siguiente partido programado
      const { data, error } = await supabase
        .from("matches")
        .select("*")
        .eq("phase", "scheduled")
        .order("match_date", { ascending: true })
        .limit(1);
      if (error) throw error;
      return data?.[0] ?? null;
    },
  });

  const nextMatch = featuredMatch;
  const { isLive } = useLiveMatch(nextMatch);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6 pb-8"
    >
      <MatchTabs activeTab={activeTab} onTabChange={setActiveTab} />

      <AnimatePresence mode="wait">
        {activeTab === "envivo" && (
          <motion.div
            key="envivo"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
          >
            {isLive && nextMatch ? (
              <LiveMatchPlayer match={nextMatch} onRequestLogin={() => setAuthOpen(true)} />
            ) : (
              <MatchHeroCard match={nextMatch} />
            )}
          </motion.div>
        )}
        {activeTab === "liga" && (
          <motion.div
            key="liga"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
          >
            <LeagueTables />
          </motion.div>
        )}
      </AnimatePresence>

      <AuthFlow open={authOpen} onClose={() => setAuthOpen(false)} initialTierId="fan" />
    </motion.div>
  );
};

export default ZonaPartido;

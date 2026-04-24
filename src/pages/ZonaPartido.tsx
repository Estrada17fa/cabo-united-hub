import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MatchHeroCard } from "@/components/match-zone/MatchHeroCard";
import { LiveMatchPlayer } from "@/components/match-zone/LiveMatchPlayer";
import { MatchTabs } from "@/components/match-zone/MatchTabs";
import { PartidosSection } from "@/components/match-zone/PartidosSection";
import { LeagueTables } from "@/components/match-zone/LeagueTables";
import { useLiveMatch } from "@/hooks/useLiveMatch";

const ZonaPartido = () => {
  const [activeTab, setActiveTab] = useState("partidos");

  const { data: featuredMatch = null } = useQuery({
    queryKey: ["matches", "featured"],
    queryFn: async () => {
      // 1) Live match takes priority
      const { data: liveData, error: liveError } = await supabase
        .from("matches")
        .select("*")
        .eq("status", "live")
        .order("match_date", { ascending: false })
        .limit(1);
      if (liveError) throw liveError;
      if (liveData && liveData.length > 0) return liveData[0];

      // 2) Recently finished match (within last 24h)
      const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split("T")[0];
      const { data: finishedData, error: finishedError } = await supabase
        .from("matches")
        .select("*")
        .eq("status", "finished")
        .gte("match_date", cutoff)
        .order("match_date", { ascending: false })
        .limit(1);
      if (finishedError) throw finishedError;
      if (finishedData && finishedData.length > 0) return finishedData[0];

      // 3) Otherwise next scheduled match
      const { data, error } = await supabase
        .from("matches")
        .select("*")
        .eq("status", "scheduled")
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
      {isLive && nextMatch ? (
        <LiveMatchPlayer match={nextMatch} />
      ) : (
        <MatchHeroCard match={nextMatch} />
      )}
      <MatchTabs activeTab={activeTab} onTabChange={setActiveTab} />

      <AnimatePresence mode="wait">
        {activeTab === "partidos" && (
          <motion.div
            key="partidos"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
          >
            <PartidosSection />
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
    </motion.div>
  );
};

export default ZonaPartido;

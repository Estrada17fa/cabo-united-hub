import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MatchHeroCard } from "@/components/match-zone/MatchHeroCard";
import { MatchTabs } from "@/components/match-zone/MatchTabs";
import { PartidosSection } from "@/components/match-zone/PartidosSection";
import { LeagueTables } from "@/components/match-zone/LeagueTables";

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

      // 2) Otherwise next scheduled match
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

  return (
    <div className="space-y-6 pb-8">
      <MatchHeroCard match={nextMatch} />
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
    </div>
  );
};

export default ZonaPartido;

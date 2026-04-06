import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MatchHeroCard } from "@/components/match-zone/MatchHeroCard";
import { MatchTabs } from "@/components/match-zone/MatchTabs";
import { UpcomingMatches } from "@/components/match-zone/UpcomingMatches";
import { LeagueTables } from "@/components/match-zone/LeagueTables";

const ZonaPartido = () => {
  const [activeTab, setActiveTab] = useState("upcoming");

  const { data: scheduledMatches = [], isLoading } = useQuery({
    queryKey: ["matches", "scheduled"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("matches")
        .select("*")
        .eq("status", "scheduled")
        .order("match_date", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const nextMatch = scheduledMatches[0] || null;

  return (
    <div className="space-y-6 pb-8">
      {/* Hero */}
      <MatchHeroCard match={nextMatch} />

      {/* Tabs */}
      <MatchTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Dynamic content */}
      <AnimatePresence mode="wait">
        {activeTab === "upcoming" && (
          <motion.div
            key="upcoming"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
          >
            <UpcomingMatches matches={scheduledMatches} isLoading={isLoading} />
          </motion.div>
        )}
        {activeTab === "tables" && (
          <motion.div
            key="tables"
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

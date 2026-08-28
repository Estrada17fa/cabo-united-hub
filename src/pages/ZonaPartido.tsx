import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LiveHero } from "@/components/match-zone/LiveHero";
import { MatchTimelineV2 } from "@/components/match-zone/MatchTimelineV2";
import { MatchTabs } from "@/components/match-zone/MatchTabs";
import { LeagueTables } from "@/components/match-zone/LeagueTables";
import { LeagueScoringInfo } from "@/components/match-zone/LeagueScoringInfo";
import { AuthFlow } from "@/components/auth/AuthFlow";
import { AuthModal } from "@/components/auth/AuthModal";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useLiveMatch } from "@/hooks/useLiveMatch";
import { useOurTeamName, useTeamLogoMap } from "@/hooks/useLeague";

const ZonaPartido = () => {
  const [activeTab, setActiveTab] = useState("envivo");
  const [loginOpen, setLoginOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);

  const ourTeam = useOurTeamName();
  const logoMap = useTeamLogoMap();

  const { data: featuredMatch = null } = useQuery({
    queryKey: ["matches", "featured", ourTeam],
    queryFn: async () => {
      const ourFilter = `home_team.eq.${ourTeam},away_team.eq.${ourTeam}`;

      // 1) Partido nuestro en curso (la fase manual manda)
      const { data: liveData, error: liveError } = await supabase
        .from("matches")
        .select("*")
        .or(ourFilter)
        .in("phase", ["first_half", "halftime", "second_half"])
        .order("match_date", { ascending: false })
        .limit(1);
      if (liveError) throw liveError;
      if (liveData?.length) return liveData[0];

      // 2) Siguiente partido nuestro programado
      const today = new Date().toISOString().split("T")[0];
      const { data: nextData, error: nextError } = await supabase
        .from("matches")
        .select("*")
        .or(ourFilter)
        .eq("phase", "scheduled")
        .gte("match_date", today)
        .order("match_date", { ascending: true })
        .limit(1);
      if (nextError) throw nextError;
      if (nextData?.length) return nextData[0];

      // 3) Último partido nuestro jugado
      const { data, error } = await supabase
        .from("matches")
        .select("*")
        .or(ourFilter)
        .eq("phase", "finished")
        .order("match_date", { ascending: false })
        .limit(1);
      if (error) throw error;
      return data?.[0] ?? null;
    },
  });

  const { isLive, isFinished, events } = useLiveMatch(featuredMatch);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 pb-10"
    >
      <MatchTabs activeTab={activeTab} onTabChange={setActiveTab} liveNow={isLive} />

      <AnimatePresence mode="wait">
        {activeTab === "envivo" && (
          <motion.div
            key="envivo"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="space-y-7"
          >
            <LiveHero
              match={featuredMatch}
              ourTeam={ourTeam}
              logoMap={logoMap}
              onRequestLogin={() => setLoginOpen(true)}
              onRequestSignup={() => setSignupOpen(true)}
            />

            {featuredMatch && (isLive || isFinished) && (
              <MatchTimelineV2
                events={events}
                homeTeam={featuredMatch.home_team}
                ourTeam={ourTeam}
                title={isLive ? "Partido en vivo" : "Último partido"}
                subtitle={`${featuredMatch.home_team} vs ${featuredMatch.away_team}`}
              />
            )}

            <LeagueScoringInfo />
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

      <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
        <DialogContent className="max-w-sm border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-base">Entra para ver el partido</DialogTitle>
          </DialogHeader>
          <AuthModal
            onSuccess={() => setLoginOpen(false)}
            onSignupClick={() => {
              setLoginOpen(false);
              setSignupOpen(true);
            }}
          />
        </DialogContent>
      </Dialog>

      <AuthFlow open={signupOpen} onClose={() => setSignupOpen(false)} initialTierId="fan" />
    </motion.div>
  );
};

export default ZonaPartido;

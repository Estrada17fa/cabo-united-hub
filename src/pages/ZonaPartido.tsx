import { useState } from "react";
import { motion } from "framer-motion";
import { Swords } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MatchHero from "@/components/matchzone/MatchHero";
import HeadToHead from "@/components/matchzone/HeadToHead";
import RecentAndUpcoming from "@/components/matchzone/RecentAndUpcoming";
import StandingsModule from "@/components/matchzone/StandingsModule";
import LiveScoreboard from "@/components/matchzone/LiveScoreboard";
import MinuteByMinute from "@/components/matchzone/MinuteByMinute";
import InteractiveLineup from "@/components/matchzone/InteractiveLineup";
import LiveStreamButton from "@/components/matchzone/LiveStreamButton";

const ZonaPartido = () => {
  const [isLive, setIsLive] = useState(false);

  return (
    <div className="pb-4 space-y-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <Swords className="w-5 h-5 text-primary" />
          <h1 className="text-headline">Match Zone</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            {isLive ? "En vivo" : "Previo"}
          </span>
          <Switch checked={isLive} onCheckedChange={setIsLive} />
        </div>
      </motion.div>

      {!isLive ? (
        /* ═══ MODO PREVIO ═══ */
        <motion.div
          key="previo"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          <MatchHero />
          <HeadToHead />
          <RecentAndUpcoming />
          <StandingsModule />
        </motion.div>
      ) : (
        /* ═══ MODO DÍA DE PARTIDO ═══ */
        <motion.div
          key="live"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          <LiveScoreboard />

          <Tabs defaultValue="timeline" className="w-full">
            <TabsList className="w-full bg-muted">
              <TabsTrigger value="timeline" className="flex-1 text-xs">Minuto a Minuto</TabsTrigger>
              <TabsTrigger value="lineup" className="flex-1 text-xs">Alineación</TabsTrigger>
              <TabsTrigger value="standings" className="flex-1 text-xs">Torneo</TabsTrigger>
            </TabsList>
            <TabsContent value="timeline">
              <MinuteByMinute />
            </TabsContent>
            <TabsContent value="lineup">
              <InteractiveLineup />
            </TabsContent>
            <TabsContent value="standings">
              <StandingsModule />
            </TabsContent>
          </Tabs>

          <LiveStreamButton />
        </motion.div>
      )}
    </div>
  );
};

export default ZonaPartido;

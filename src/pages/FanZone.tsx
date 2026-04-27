import { useState } from "react";
import { motion } from "framer-motion";
import { Gamepad2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FanStatsHero } from "@/components/fan-zone/FanStatsHero";
import { MiniGameCard } from "@/components/fan-zone/MiniGameCard";
import { GAMES, type MiniGame } from "@/components/fan-zone/games";
import { AuthModal } from "@/components/auth/AuthModal";
import { RankingCard } from "@/components/fan-zone/RankingCard";
import { PrizesCarouselCard } from "@/components/fan-zone/PrizesCarouselCard";
import { useAuth } from "@/hooks/useAuth";

const FanZone = () => {
  const [authOpen, setAuthOpen] = useState(false);
  const { user } = useAuth();

  const handleGameClick = (game: MiniGame) => {
    if (game.status === "soon") {
      toast(`${game.name}`, {
        description: "Próximamente. ¡Mantente atento!",
      });
      return;
    }
    toast(`${game.name}`, {
      description: "Próximamente disponible para jugar.",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-5 pb-8 pt-2"
    >
      <FanStatsHero onLoginClick={() => setAuthOpen(true)} />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <RankingCard
          className="lg:col-span-3"
          user={user}
          onLoginClick={() => setAuthOpen(true)}
        />
        <PrizesCarouselCard
          className="lg:col-span-2"
          showFooterLink={false}
        />
      </div>

      <div className="flex items-center gap-2 px-1">
        <Gamepad2 className="w-4 h-4 text-primary" />
        <h2 className="text-sm font-extrabold uppercase tracking-wider text-foreground">
          Minijuegos
        </h2>
        <div className="flex-1 h-px bg-border" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          {GAMES.length} juegos
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
        {GAMES.map((game, i) => (
          <MiniGameCard key={game.id} game={game} index={i} onClick={handleGameClick} />
        ))}
      </div>

      <Dialog open={authOpen} onOpenChange={setAuthOpen}>
        <DialogContent className="bg-card border-border max-w-sm">
          <DialogHeader>
            <DialogTitle>Únete a Fan Zone</DialogTitle>
          </DialogHeader>
          <AuthModal onSuccess={() => setAuthOpen(false)} />
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default FanZone;
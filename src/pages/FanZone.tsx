import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Gamepad2, LogIn } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FanCard } from "@/components/fan-zone/FanCard";
import { MiniGameCard } from "@/components/fan-zone/MiniGameCard";
import { iconFor, type MiniGame } from "@/components/fan-zone/games";
import { AuthModal } from "@/components/auth/AuthModal";
import { RankingCard } from "@/components/fan-zone/RankingCard";
import { PrizesCarouselCard } from "@/components/fan-zone/PrizesCarouselCard";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const FanZone = () => {
  const [authOpen, setAuthOpen] = useState(false);
  const { user } = useAuth();
  const [games, setGames] = useState<MiniGame[]>([]);

  useEffect(() => {
    supabase
      .from("games")
      .select("id,name,subtitle,icon,status,tier,xp_reward,cc_reward")
      .eq("active", true)
      .order("sort_order", { ascending: true })
      .then(({ data }) => {
        if (!data) return;
        setGames(
        data.map((g: any) => ({
            id: g.id,
            name: g.name,
            subtitle: g.subtitle ?? "",
            icon: iconFor(g.icon),
            status: "soon" as MiniGame["status"],
            tier: g.tier as MiniGame["tier"],
            reward: "Próximamente",
          })),
        );
      });
  }, []);

  const handleGameClick = (game: MiniGame) => {
    if (!user) {
      setAuthOpen(true);
      return;
    }
    // Los minijuegos aún no están implementados. Las recompensas se otorgarán
    // cuando el usuario complete (y en su caso gane) la partida real.
    toast(`${game.name}`, {
      description: "Próximamente. Las recompensas se otorgarán al jugar.",
    });
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8 md:space-y-12 pb-32 md:pb-8 pt-2"
      >
        {/* 1. FanCard unificado */}
        <FanCard />

        {/* 2. CTA principal — desktop only (mobile uses sticky bottom) */}
        {!user && (
          <button
            onClick={() => setAuthOpen(true)}
            className="hidden md:inline-flex w-full items-center justify-center gap-2 font-bold rounded-full transition-opacity hover:opacity-90 h-12"
            style={{
              background: "hsl(var(--brand-primary))",
              color: "hsl(0 0% 8%)",
              boxShadow: "0 6px 20px -4px hsl(var(--brand-primary) / 0.55)",
              fontSize: 14,
            }}
          >
            <LogIn className="w-4 h-4" />
            Inicia sesión para competir
          </button>
        )}

        {/* 3. MINIJUEGOS — producto principal, arriba del fold */}
        <section>
          <div className="flex items-center gap-2 px-1 mb-4">
            <Gamepad2 className="w-4 h-4 text-brand-primary" />
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-foreground">
              Minijuegos
            </h2>
            <div className="flex-1 h-px bg-border" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              {games.length} juegos
            </span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {games.map((game, i) => (
              <MiniGameCard key={game.id} game={game} index={i} onClick={handleGameClick} />
            ))}
          </div>
        </section>

        {/* 4. Ranking + Premios */}
        <section className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <RankingCard className="lg:col-span-3" />
          <PrizesCarouselCard className="lg:col-span-2" showFooterLink={false} />
        </section>
      </motion.div>

      {/* Mobile sticky CTA */}
      {!user && (
        <div
          className="md:hidden fixed left-0 right-0 z-30 px-4 pb-3"
          style={{
            bottom: "calc(env(safe-area-inset-bottom, 0px) + 70px)",
          }}
        >
          <button
            onClick={() => setAuthOpen(true)}
            className="w-full inline-flex items-center justify-center gap-2 font-extrabold rounded-full h-12 backdrop-blur-xl"
            style={{
              background: "hsl(var(--brand-primary))",
              color: "hsl(0 0% 8%)",
              boxShadow:
                "0 10px 30px -6px hsl(var(--brand-primary) / 0.55), 0 0 0 1px hsl(0 0% 100% / 0.05)",
              fontSize: 14,
            }}
          >
            <LogIn className="w-4 h-4" />
            Inicia sesión para competir
          </button>
        </div>
      )}

      <Dialog open={authOpen} onOpenChange={setAuthOpen}>
        <DialogContent className="bg-card border-border max-w-sm">
          <DialogHeader>
            <DialogTitle>Únete a Fan Zone</DialogTitle>
          </DialogHeader>
          <AuthModal onSuccess={() => setAuthOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FanZone;
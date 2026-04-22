import { useState } from "react";
import { motion } from "framer-motion";
import { Gamepad2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FanStatsHero } from "@/components/fan-zone/FanStatsHero";
import { AuthModal } from "@/components/auth/AuthModal";
import { QuinielaCard } from "@/components/fan-zone/cards/QuinielaCard";
import { MarcadorCard } from "@/components/fan-zone/cards/MarcadorCard";
import { ArmaTu11Card } from "@/components/fan-zone/cards/ArmaTu11Card";
import { VisitasCard } from "@/components/fan-zone/cards/VisitasCard";
import { LigaCard } from "@/components/fan-zone/cards/LigaCard";
import { TriviaCard } from "@/components/fan-zone/cards/TriviaCard";
import { AmoPartidoCard } from "@/components/fan-zone/cards/AmoPartidoCard";

const FanZone = () => {
  const [authOpen, setAuthOpen] = useState(false);

  const open = (name: string) =>
    toast(name, { description: "Próximamente disponible para jugar." });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-5 pb-8 pt-2"
    >
      <FanStatsHero onLoginClick={() => setAuthOpen(true)} />

      <div className="flex items-center gap-2 px-1">
        <Gamepad2 className="w-4 h-4 text-primary" />
        <h2 className="text-sm font-extrabold uppercase tracking-wider text-foreground">
          Minijuegos
        </h2>
        <div className="flex-1 h-px bg-border" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          7 juegos
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        <QuinielaCard index={0} onClick={() => open("Quiniela del Paraíso")} />
        <MarcadorCard index={1} onClick={() => open("Marcador Exacto")} />
        <ArmaTu11Card index={2} onClick={() => open("Arma tu 11")} />
        <VisitasCard index={3} onClick={() => open("Visitas al Paraíso")} />
        <LigaCard index={4} onClick={() => open("Liga de Amos")} />
        <TriviaCard index={5} onClick={() => open("Trivia del Paraíso")} />
        <AmoPartidoCard index={6} />
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
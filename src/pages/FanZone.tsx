import { useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Users, Target, Brain, MapPin, Star, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { GameCard, GameStatus } from "@/components/fan-zone/GameCard";
import { GameModal } from "@/components/fan-zone/GameModal";
import { UserPointsChip } from "@/components/fan-zone/UserPointsChip";
import { WeeklyMatchStrip } from "@/components/fan-zone/WeeklyMatchStrip";
import { MiniLeaderboard } from "@/components/fan-zone/MiniLeaderboard";
import { QuinielaGame } from "@/components/fan-zone/games/QuinielaGame";
import { ArmaTu11Game } from "@/components/fan-zone/games/ArmaTu11Game";
import { MarcadorExactoGame } from "@/components/fan-zone/games/MarcadorExactoGame";
import { TriviaGame } from "@/components/fan-zone/games/TriviaGame";
import { VisitasGame } from "@/components/fan-zone/games/VisitasGame";
import { AmoDelPartidoGame } from "@/components/fan-zone/games/AmoDelPartidoGame";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { AuthModal } from "@/components/auth/AuthModal";

type GameId = "quiniela" | "fantasy" | "marcador" | "trivia" | "visitas" | "amo";

interface GameDef {
  id: GameId;
  title: string;
  description: string;
  icon: typeof Trophy;
  status: GameStatus;
  statusLabel: string;
  pointsLabel: string;
  accent: string;
  modalTitle: string;
  modalDescription: string;
}

const GAMES: GameDef[] = [
  {
    id: "quiniela",
    title: "Quiniela del Paraíso",
    description: "Predice el ganador de 3 partidos clave de la jornada.",
    icon: Trophy,
    status: "available",
    statusLabel: "Disponible",
    pointsLabel: "+10 acierto",
    accent: "hsl(180 100% 50%)",
    modalTitle: "Quiniela del Paraíso",
    modalDescription: "Jornada 12 · Cierra el sábado 18:00",
  },
  {
    id: "fantasy",
    title: "Arma tu 11",
    description: "Forma tu alineación ideal para el partido de la semana.",
    icon: Users,
    status: "available",
    statusLabel: "Disponible",
    pointsLabel: "+5 gol · +3 asist",
    accent: "hsl(142 76% 50%)",
    modalTitle: "Arma tu 11",
    modalDescription: "Tu alineación titular · Formación 4-3-3",
  },
  {
    id: "marcador",
    title: "Marcador Exacto",
    description: "¿Cuántos goles hará LCU? Aciertas exacto y ganas grande.",
    icon: Target,
    status: "available",
    statusLabel: "Disponible",
    pointsLabel: "+25 exacto",
    accent: "hsl(45 100% 60%)",
    modalTitle: "Marcador Exacto",
    modalDescription: "Predice el resultado final del partido",
  },
  {
    id: "trivia",
    title: "Trivia del Paraíso",
    description: "5 preguntas semanales sobre el club y Los Cabos.",
    icon: Brain,
    status: "available",
    statusLabel: "Disponible",
    pointsLabel: "+5 c/acierto",
    accent: "hsl(280 90% 70%)",
    modalTitle: "Trivia del Paraíso",
    modalDescription: "Demuestra cuánto sabes del club",
  },
  {
    id: "visitas",
    title: "Visitas al Paraíso",
    description: "Escanea QRs en lugares emblemáticos de Los Cabos.",
    icon: MapPin,
    status: "qr",
    statusLabel: "QR Activo",
    pointsLabel: "+15 lugar",
    accent: "hsl(336 80% 77%)",
    modalTitle: "Visitas al Paraíso",
    modalDescription: "Explora y verifica con código QR",
  },
  {
    id: "amo",
    title: "Amo del Partido",
    description: "Vota al mejor jugador. Se activa al minuto 70.",
    icon: Star,
    status: "locked",
    statusLabel: "Min 70",
    pointsLabel: "+5 voto",
    accent: "hsl(0 84% 65%)",
    modalTitle: "Amo del Partido",
    modalDescription: "Tu voto cuenta",
  },
];

const FanZone = () => {
  const { user } = useAuth();
  const [openGame, setOpenGame] = useState<GameId | null>(null);
  const [authOpen, setAuthOpen] = useState(false);

  const handleCardClick = (id: GameId) => {
    if (!user) {
      setAuthOpen(true);
      return;
    }
    setOpenGame(id);
  };

  const close = () => setOpenGame(null);

  const renderGame = () => {
    switch (openGame) {
      case "quiniela":
        return <QuinielaGame onClose={close} />;
      case "fantasy":
        return <ArmaTu11Game onClose={close} />;
      case "marcador":
        return <MarcadorExactoGame onClose={close} />;
      case "trivia":
        return <TriviaGame onClose={close} />;
      case "visitas":
        return <VisitasGame onClose={close} />;
      case "amo":
        return <AmoDelPartidoGame onClose={close} />;
      default:
        return null;
    }
  };

  const activeGame = GAMES.find((g) => g.id === openGame);

  return (
    <div className="py-6 space-y-6 max-w-3xl mx-auto">
      {/* HERO */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-3"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 mb-2 text-[10px] uppercase tracking-widest text-primary font-bold">
              <Sparkles className="w-3 h-3" />
              Fan Zone
            </div>
            <h1 className="text-3xl font-extrabold leading-tight tracking-tight">
              Juega, predice<br />y gana puntos.
            </h1>
            <p className="text-sm text-muted-foreground mt-1.5">
              Compite con la afición cabeña cada semana.
            </p>
          </div>
          <UserPointsChip points={240} />
        </div>
      </motion.section>

      {/* WEEKLY MATCH STRIP */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <WeeklyMatchStrip />
      </motion.section>

      {/* GAMES GRID */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="space-y-3"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold tracking-tight">Mini-juegos</h2>
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">6 disponibles</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {GAMES.map((g, i) => (
            <motion.div
              key={g.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i }}
            >
              <GameCard
                icon={g.icon}
                title={g.title}
                description={g.description}
                pointsLabel={g.pointsLabel}
                status={g.status}
                statusLabel={g.statusLabel}
                accentColor={g.accent}
                onClick={() => handleCardClick(g.id)}
              />
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* LEADERBOARD */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.25 }}
      >
        <MiniLeaderboard />
      </motion.section>

      {/* GAME MODAL */}
      {activeGame && (
        <GameModal
          open={!!openGame}
          onOpenChange={(o) => !o && close()}
          title={activeGame.modalTitle}
          description={activeGame.modalDescription}
        >
          {renderGame()}
        </GameModal>
      )}

      {/* AUTH GATE */}
      <Dialog open={authOpen} onOpenChange={setAuthOpen}>
        <DialogContent className="max-w-md p-6" style={{ backgroundColor: "hsl(0 0% 4%)" }}>
          <AuthModal onSuccess={() => setAuthOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FanZone;

import { Ticket, Users, Target, MapPin, Brain, Crown, type LucideIcon } from "lucide-react";

export type GameStatus = "play" | "available" | "soon";

export interface MiniGame {
  id: string;
  name: string;
  subtitle: string;
  icon: LucideIcon;
  /** HSL color string for accents */
  color: string;
  /** HSL secondary color for gradient */
  colorAlt: string;
  status: GameStatus;
  reward: string;
}

export const GAMES: MiniGame[] = [
  {
    id: "quiniela",
    name: "Quiniela del Paraíso",
    subtitle: "Predice la jornada completa",
    icon: Ticket,
    color: "hsl(189 100% 45%)",
    colorAlt: "hsl(189 100% 60%)",
    status: "play",
    reward: "+150 pts",
  },
  {
    id: "arma-tu-11",
    name: "Arma tu 11",
    subtitle: "Tu alineación ideal",
    icon: Users,
    color: "hsl(336 80% 70%)",
    colorAlt: "hsl(336 90% 80%)",
    status: "available",
    reward: "+100 pts",
  },
  {
    id: "marcador-exacto",
    name: "Marcador Exacto",
    subtitle: "Acierta el resultado",
    icon: Target,
    color: "hsl(38 95% 55%)",
    colorAlt: "hsl(45 100% 65%)",
    status: "play",
    reward: "+200 pts",
  },
  {
    id: "visitas-paraiso",
    name: "Visitas al Paraíso",
    subtitle: "Check-in en el estadio",
    icon: MapPin,
    color: "hsl(142 76% 45%)",
    colorAlt: "hsl(160 80% 55%)",
    status: "available",
    reward: "+50 pts",
  },
  {
    id: "trivia",
    name: "Trivia",
    subtitle: "Pon a prueba tu fanatismo",
    icon: Brain,
    color: "hsl(270 80% 65%)",
    colorAlt: "hsl(290 85% 75%)",
    status: "soon",
    reward: "Próximamente",
  },
  {
    id: "amo-del-partido",
    name: "Amo del Partido",
    subtitle: "Vota al MVP del juego",
    icon: Crown,
    color: "hsl(45 100% 55%)",
    colorAlt: "hsl(38 100% 65%)",
    status: "soon",
    reward: "Próximamente",
  },
];
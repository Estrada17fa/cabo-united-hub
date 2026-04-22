import { Ticket, Users, Target, MapPin, Brain, Crown, type LucideIcon } from "lucide-react";

/** Game lifecycle status (badge top-right) */
export type GameStatus = "open" | "closed" | "played" | "live" | "active";

export interface MiniGame {
  id: string;
  name: string;
  subtitle: string;
  icon: LucideIcon;
  /** Permanent brand color for icon + CTA */
  color: string;
  /** Secondary color for icon background gradient */
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
    // Cyan / teal
    color: "hsl(189 100% 45%)",
    colorAlt: "hsl(189 100% 60%)",
    status: "open",
    reward: "+150 pts",
  },
  {
    id: "arma-tu-11",
    name: "Arma tu 11",
    subtitle: "Tu alineación ideal",
    icon: Users,
    // Team green
    color: "hsl(150 100% 50%)",
    colorAlt: "hsl(160 100% 60%)",
    status: "open",
    reward: "+100 pts",
  },
  {
    id: "marcador-exacto",
    name: "Marcador Exacto",
    subtitle: "Acierta el resultado",
    icon: Target,
    // Amber / gold
    color: "hsl(38 95% 55%)",
    colorAlt: "hsl(45 100% 65%)",
    status: "played",
    reward: "+200 pts",
  },
  {
    id: "visitas-paraiso",
    name: "Visitas al Paraíso",
    subtitle: "Check-in en el estadio",
    icon: MapPin,
    // Pin green
    color: "hsl(142 76% 45%)",
    colorAlt: "hsl(160 80% 55%)",
    status: "active",
    reward: "+50 pts",
  },
  {
    id: "trivia",
    name: "Trivia del Paraíso",
    subtitle: "Pon a prueba tu fanatismo",
    icon: Brain,
    // Purple / violet
    color: "hsl(270 85% 65%)",
    colorAlt: "hsl(285 90% 75%)",
    status: "closed",
    reward: "+120 pts",
  },
  {
    id: "amo-del-partido",
    name: "Amo del Partido",
    subtitle: "Vota al MVP del juego",
    icon: Crown,
    // Coral / red — urgency, live
    color: "hsl(8 90% 60%)",
    colorAlt: "hsl(15 95% 68%)",
    status: "live",
    reward: "+80 pts",
  },
];
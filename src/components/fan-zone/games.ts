import { Ticket, Users, Target, MapPin, Brain, Crown, type LucideIcon } from "lucide-react";

export type GameStatus = "play" | "available" | "soon";

export interface MiniGame {
  id: string;
  name: string;
  subtitle: string;
  icon: LucideIcon;
  status: GameStatus;
  reward: string;
  /** "premium" reserves the amber accent (only +200 pts rewards). */
  tier: "standard" | "premium";
}

export const GAMES: MiniGame[] = [
  {
    id: "quiniela",
    name: "Quiniela del Paraíso",
    subtitle: "Predice la jornada completa",
    icon: Ticket,
    status: "play",
    reward: "+150 PTS",
    tier: "standard",
  },
  {
    id: "arma-tu-11",
    name: "Arma tu 11",
    subtitle: "Tu alineación ideal",
    icon: Users,
    status: "available",
    reward: "+100 PTS",
    tier: "standard",
  },
  {
    id: "marcador-exacto",
    name: "Marcador Exacto",
    subtitle: "Acierta el resultado",
    icon: Target,
    status: "play",
    reward: "+200 PTS",
    tier: "premium",
  },
  {
    id: "visitas-paraiso",
    name: "Visitas al Paraíso",
    subtitle: "Check-in en el estadio",
    icon: MapPin,
    status: "available",
    reward: "+50 PTS",
    tier: "standard",
  },
  {
    id: "trivia",
    name: "Trivia",
    subtitle: "Pon a prueba tu fanatismo",
    icon: Brain,
    status: "soon",
    reward: "Próximamente",
    tier: "standard",
  },
  {
    id: "amo-del-partido",
    name: "Amo del Partido",
    subtitle: "Vota al MVP del juego",
    icon: Crown,
    status: "soon",
    reward: "Próximamente",
    tier: "standard",
  },
];
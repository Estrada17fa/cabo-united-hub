import kitFan from "@/assets/accesos-kit-fan.jpg";
import kitGold from "@/assets/accesos-kit-gold.jpg";
import kitPremium from "@/assets/accesos-kit-premium.jpg";
import kitPlatino from "@/assets/accesos-kit-platino.jpg";

export type TierId = "fan" | "gold" | "premium" | "platino";

export type SignupTier = {
  id: TierId;
  badge: string;
  price: string;
  priceNote: string;
  tagline: string;
  accent: string;
  image: string;
  /** Los niveles de pago aún no se cobran: se registran como lista de espera */
  comingSoon: boolean;
  highlights: string[];
  kitName: string;
};

export const SIGNUP_TIERS: SignupTier[] = [
  {
    id: "fan",
    badge: "FAN",
    price: "$0",
    priceNote: "Gratis para siempre",
    tagline: "Empieza a vivir el paraíso, sin costo.",
    accent: "#FFFFFF",
    image: kitFan,
    comingSoon: false,
    kitName: "Kit Digital",
    highlights: [
      "Pase digital de aficionado",
      "10% de descuento en boletos",
      "Sorteos mensuales y newsletter",
    ],
  },
  {
    id: "gold",
    badge: "GOLD",
    price: "$1,499",
    priceNote: "por temporada",
    tagline: "Tu lugar en la grada y el kit que te identifica.",
    accent: "#F59E0B",
    image: kitGold,
    comingSoon: true,
    kitName: "Kit Gold",
    highlights: [
      "Entrada a todos los partidos en casa",
      "Kit Gold: gorra, bufanda, pin y playera",
      "Preventa anticipada de boletos",
    ],
  },
  {
    id: "premium",
    badge: "PREMIUM",
    price: "$2,499",
    priceNote: "por temporada",
    tagline: "Vive el partido desde adentro, con foto incluida.",
    accent: "#00abc4",
    image: kitPremium,
    comingSoon: true,
    kitName: "Kit Premium",
    highlights: [
      "Acceso VIP a área preferencial",
      "Kit Premium con jersey oficial",
      "1.5× XP y Cabo Coins en Fan Zone",
    ],
  },
  {
    id: "platino",
    badge: "PLATINO",
    price: "$4,999",
    priceNote: "por temporada · Socio Fundador",
    tagline: "Tu nombre, tu asiento, tu temporada inolvidable.",
    accent: "#E2E8F0",
    image: kitPlatino,
    comingSoon: true,
    kitName: "Kit Platino",
    highlights: [
      "Asiento personalizado con placa",
      "Meet & greet y tour del estadio",
      "Certificado de Socio Fundador numerado",
    ],
  },
];

export const TIER_ACCENT: Record<TierId, string> = {
  fan: "#FFFFFF",
  gold: "#F59E0B",
  premium: "#00abc4",
  platino: "#E2E8F0",
};

export function tierLabel(id: string) {
  return (SIGNUP_TIERS.find((t) => t.id === id)?.badge ?? "FAN") as string;
}

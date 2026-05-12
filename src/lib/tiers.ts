export type TierId = "fan" | "gold" | "premium" | "platino";

export const TIER_META: Record<TierId, { label: string; price: string; accent: string; gradient: string; }> = {
  fan: { label: "Fan", price: "Gratis", accent: "#FFFFFF", gradient: "linear-gradient(135deg,#1a1a1a,#2a2a2a)" },
  gold: { label: "Gold", price: "$1,499", accent: "#F59E0B", gradient: "linear-gradient(135deg,#7a4a00,#f59e0b)" },
  premium: { label: "Premium", price: "$2,999", accent: "#00FFFF", gradient: "linear-gradient(135deg,#003d4a,#00FFFF)" },
  platino: { label: "Platino", price: "$5,499", accent: "#f298c0", gradient: "linear-gradient(135deg,#3a0a2a,#f298c0)" },
};

export const TIER_IDS: TierId[] = ["fan", "gold", "premium", "platino"];
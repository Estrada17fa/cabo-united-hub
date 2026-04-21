import { motion } from "framer-motion";
import { LucideIcon, Lock } from "lucide-react";

export type GameStatus = "available" | "locked" | "active" | "qr";

interface GameCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  pointsLabel: string;
  status: GameStatus;
  statusLabel: string;
  accentColor?: string;
  onClick: () => void;
}

const STATUS_STYLES: Record<GameStatus, { bg: string; color: string; border: string }> = {
  available: {
    bg: "hsl(142 76% 50% / 0.12)",
    color: "hsl(142 76% 60%)",
    border: "hsl(142 76% 50% / 0.3)",
  },
  locked: {
    bg: "hsl(0 0% 100% / 0.05)",
    color: "hsl(0 0% 60%)",
    border: "hsl(0 0% 100% / 0.1)",
  },
  active: {
    bg: "hsl(0 84% 60% / 0.15)",
    color: "hsl(0 84% 70%)",
    border: "hsl(0 84% 60% / 0.4)",
  },
  qr: {
    bg: "hsl(336 80% 77% / 0.12)",
    color: "hsl(336 80% 80%)",
    border: "hsl(336 80% 77% / 0.3)",
  },
};

export function GameCard({
  icon: Icon,
  title,
  description,
  pointsLabel,
  status,
  statusLabel,
  accentColor = "hsl(180 100% 50%)",
  onClick,
}: GameCardProps) {
  const statusStyle = STATUS_STYLES[status];
  const isLocked = status === "locked";

  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      whileHover={{ y: -2 }}
      className="relative rounded-2xl border p-4 text-left flex flex-col gap-3 overflow-hidden group"
      style={{
        backgroundColor: "hsl(0 0% 7%)",
        borderColor: "hsl(0 0% 100% / 0.08)",
        minHeight: "180px",
      }}
    >
      {/* accent glow */}
      <div
        className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-20 blur-2xl pointer-events-none"
        style={{ backgroundColor: accentColor }}
      />

      <div className="flex items-start justify-between relative">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{
            backgroundColor: `${accentColor.replace(")", " / 0.15)")}`,
            border: `1px solid ${accentColor.replace(")", " / 0.3)")}`,
          }}
        >
          {isLocked ? (
            <Lock className="w-5 h-5" style={{ color: accentColor }} />
          ) : (
            <Icon className="w-5 h-5" style={{ color: accentColor }} />
          )}
        </div>
        <span
          className="text-[9px] uppercase tracking-widest font-bold px-2 py-1 rounded-full border"
          style={{
            backgroundColor: statusStyle.bg,
            color: statusStyle.color,
            borderColor: statusStyle.border,
          }}
        >
          {statusLabel}
        </span>
      </div>

      <div className="relative flex-1">
        <h3 className="text-sm font-extrabold leading-tight mb-1">{title}</h3>
        <p className="text-xs text-muted-foreground leading-snug line-clamp-2">{description}</p>
      </div>

      <div
        className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest w-fit px-2 py-1 rounded-md"
        style={{
          backgroundColor: "hsl(0 0% 0% / 0.5)",
          color: accentColor,
          border: `1px solid ${accentColor.replace(")", " / 0.3)")}`,
        }}
      >
        {pointsLabel}
      </div>
    </motion.button>
  );
}
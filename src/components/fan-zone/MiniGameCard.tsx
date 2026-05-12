import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import type { MiniGame } from "./games";

interface Props {
  game: MiniGame;
  index: number;
  onClick: (game: MiniGame) => void;
}

const STATUS_LABEL: Record<MiniGame["status"], string> = {
  play: "JUGAR AHORA",
  available: "DISPONIBLE",
  soon: "PRÓXIMAMENTE",
};

export function MiniGameCard({ game, index, onClick }: Props) {
  const Icon = game.icon;
  const isSoon = game.status === "soon";
  const isLive = game.status === "play";
  const isPremium = game.tier === "premium" && !isSoon;

  // Unified token-based palette
  const accentVar = isPremium ? "--brand-accent" : "--brand-primary";
  const accent = `hsl(var(${accentVar}))`;
  const accentSoft = `hsl(var(${accentVar}) / 0.18)`;
  const accentBorder = `hsl(var(${accentVar}) / 0.35)`;
  const accentGlow = `hsl(var(${accentVar}) / 0.45)`;

  const stateColor = isSoon ? "hsl(var(--state-coming-soon))" : accent;

  return (
    <motion.button
      type="button"
      onClick={() => onClick(game)}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      whileHover={{ scale: isSoon ? 1.0 : 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`group relative text-left rounded-2xl border border-border bg-card overflow-hidden p-4 md:p-6 min-h-[180px] md:min-h-[210px] flex flex-col justify-between transition-colors duration-300 ${
        isSoon ? "opacity-70" : ""
      }`}
    >
      {/* Subtle accent glow only for active state */}
      {isLive && (
        <div
          className="pointer-events-none absolute -top-12 -right-12 w-40 h-40 rounded-full blur-3xl opacity-25"
          style={{ background: accent }}
        />
      )}

      {/* Top: icon + reward */}
      <div className="relative flex items-start justify-between gap-3">
        <div
          className="w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center border"
          style={{
            background: isSoon ? "hsl(0 0% 100% / 0.04)" : accentSoft,
            borderColor: isSoon ? "hsl(0 0% 100% / 0.06)" : accentBorder,
            boxShadow: isLive ? `0 0 24px -8px ${accentGlow}` : "none",
          }}
        >
          <Icon
            className="w-6 h-6 md:w-7 md:h-7"
            style={{ color: isSoon ? "hsl(var(--state-coming-soon))" : accent, opacity: isSoon ? 0.7 : 1 }}
          />
        </div>

        <span
          className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md"
          style={{
            color: isSoon ? "hsl(var(--state-coming-soon))" : "hsl(0 0% 100% / 0.85)",
            background: "hsl(0 0% 100% / 0.04)",
            border: "1px solid hsl(0 0% 100% / 0.06)",
          }}
        >
          {game.reward}
        </span>
      </div>

      {/* Title */}
      <div className="relative space-y-1 mt-3">
        <h3 className="text-base md:text-lg font-extrabold tracking-tight leading-tight text-foreground">
          {game.name}
        </h3>
        <p className="text-[11px] md:text-xs text-muted-foreground leading-snug">
          {game.subtitle}
        </p>
      </div>

      {/* Status pill */}
      <div className="relative flex items-center justify-between mt-3 pt-3 border-t border-border/60">
        <div className="flex items-center gap-1.5">
          {isLive && (
            <span className="relative flex w-2 h-2">
              <span
                className="absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping"
                style={{ background: accent }}
              />
              <span
                className="relative inline-flex rounded-full h-2 w-2"
                style={{ background: accent }}
              />
            </span>
          )}
          <span
            className="text-[10px] md:text-[11px] font-bold uppercase tracking-wider"
            style={{ color: stateColor }}
          >
            {STATUS_LABEL[game.status]}
          </span>
        </div>
        <ChevronRight
          className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5"
          style={{ color: stateColor, opacity: isSoon ? 0.6 : 1 }}
        />
      </div>
    </motion.button>
  );
}
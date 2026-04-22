import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import type { MiniGame } from "./games";

interface Props {
  game: MiniGame;
  index: number;
  onClick: (game: MiniGame) => void;
}

const STATUS_LABEL: Record<MiniGame["status"], string> = {
  play: "Jugar ahora",
  available: "Disponible",
  soon: "Próximamente",
};

export function MiniGameCard({ game, index, onClick }: Props) {
  const Icon = game.icon;
  const isSoon = game.status === "soon";
  const isLive = game.status === "play";

  return (
    <motion.button
      type="button"
      onClick={() => onClick(game)}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
      whileHover={{ scale: isSoon ? 1.0 : 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`group relative text-left rounded-2xl border border-border bg-card overflow-hidden p-4 md:p-5 min-h-[170px] md:min-h-[200px] flex flex-col justify-between transition-colors duration-300 ${
        isSoon ? "opacity-80" : ""
      }`}
      style={{
        boxShadow: `inset 0 0 0 1px hsl(0 0% 100% / 0.02)`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = game.color.replace(")", " / 0.55)");
        e.currentTarget.style.boxShadow = `0 0 28px -6px ${game.color.replace(")", " / 0.45)")}, inset 0 0 0 1px ${game.color.replace(")", " / 0.2)")}`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "";
        e.currentTarget.style.boxShadow = "inset 0 0 0 1px hsl(0 0% 100% / 0.02)";
      }}
    >
      {/* Color glow corner */}
      <div
        className="pointer-events-none absolute -top-12 -right-12 w-40 h-40 rounded-full blur-3xl opacity-30 transition-opacity duration-300 group-hover:opacity-50"
        style={{ background: game.color }}
      />
      {/* Bottom accent gradient */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px"
        style={{
          background: `linear-gradient(90deg, transparent, ${game.color}, transparent)`,
          opacity: 0.6,
        }}
      />
      {/* Top: icon + reward */}
      <div className="relative flex items-start justify-between">
        <div
          className="w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center border"
          style={{
            background: `linear-gradient(135deg, ${game.color.replace(")", " / 0.18)")}, ${game.colorAlt.replace(")", " / 0.08)")})`,
            borderColor: game.color.replace(")", " / 0.35)"),
            boxShadow: `0 0 24px -6px ${game.color.replace(")", " / 0.6)")}`,
          }}
        >
          <Icon className="w-6 h-6 md:w-7 md:h-7" style={{ color: game.color }} />
        </div>

        <span
          className="text-[9px] md:text-[10px] font-extrabold uppercase tracking-wider px-2 py-1 rounded-full border"
          style={{
            color: game.color,
            borderColor: game.color.replace(")", " / 0.35)"),
            backgroundColor: "hsl(0 0% 0% / 0.5)",
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
                style={{ background: game.color }}
              />
              <span
                className="relative inline-flex rounded-full h-2 w-2"
                style={{ background: game.color }}
              />
            </span>
          )}
          <span
            className="text-[10px] md:text-[11px] font-bold uppercase tracking-wider"
            style={{ color: isSoon ? "hsl(0 0% 55%)" : game.color }}
          >
            {STATUS_LABEL[game.status]}
          </span>
        </div>
        <ChevronRight
          className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5"
          style={{ color: game.color }}
        />
      </div>
    </motion.button>
  );
}
import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import type { MiniGame, GameStatus } from "./games";

interface Props {
  game: MiniGame;
  index: number;
  onClick: (game: MiniGame) => void;
}

const STATUS_BADGE: Record<
  GameStatus,
  { label: string; color: string; pulse?: boolean }
> = {
  open:   { label: "🟢 ABIERTA",  color: "hsl(142 76% 50%)" },
  closed: { label: "🔴 CERRADA",  color: "hsl(0 80% 60%)" },
  played: { label: "✅ JUGADA",   color: "hsl(0 0% 55%)" },
  live:   { label: "🔴 EN VIVO",  color: "hsl(0 90% 60%)", pulse: true },
  active: { label: "📍 ACTIVA",   color: "hsl(142 76% 50%)" },
};

interface CtaConfig {
  label: string;
  /** Use game color | "muted" | "cyan" | "live" */
  tone: "game" | "muted" | "cyan" | "live";
  disabled?: boolean;
  pulse?: boolean;
}

function getCta(status: GameStatus): CtaConfig {
  switch (status) {
    case "open":
    case "active":
      return { label: "Jugar ahora", tone: "game" };
    case "played":
      return { label: "Ya jugaste", tone: "muted", disabled: true };
    case "closed":
      return { label: "Ver resultados", tone: "cyan" };
    case "live":
      return { label: "Votar ahora", tone: "live", pulse: true };
  }
}

export function MiniGameCard({ game, index, onClick }: Props) {
  const Icon = game.icon;
  const badge = STATUS_BADGE[game.status];
  const cta = getCta(game.status);

  const ctaColor =
    cta.tone === "muted"
      ? "hsl(0 0% 55%)"
      : cta.tone === "cyan"
      ? "hsl(189 100% 55%)"
      : cta.tone === "live"
      ? "hsl(142 76% 55%)"
      : game.color;

  return (
    <motion.button
      type="button"
      onClick={() => onClick(game)}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
      whileHover={{ scale: cta.disabled ? 1.0 : 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`group relative text-left rounded-2xl border border-border bg-card overflow-hidden p-4 md:p-5 min-h-[180px] md:min-h-[210px] flex flex-col justify-between transition-colors duration-300 ${
        cta.disabled ? "opacity-75" : ""
      }`}
      style={{
        boxShadow: `inset 0 0 0 1px hsl(0 0% 100% / 0.02)`,
      }}
      onMouseEnter={(e) => {
        if (cta.disabled) return;
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
        className="pointer-events-none absolute -top-12 -right-12 w-40 h-40 rounded-full blur-3xl opacity-25 transition-opacity duration-300 group-hover:opacity-40"
        style={{ background: game.color }}
      />
      {/* Bottom accent gradient */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px"
        style={{
          background: `linear-gradient(90deg, transparent, ${game.color}, transparent)`,
          opacity: 0.5,
        }}
      />

      {/* Top row: icon + status badge */}
      <div className="relative flex items-start justify-between gap-2">
        <div
          className="w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center border shrink-0"
          style={{
            background: `linear-gradient(135deg, ${game.color.replace(")", " / 0.18)")}, ${game.colorAlt.replace(")", " / 0.08)")})`,
            borderColor: game.color.replace(")", " / 0.35)"),
            boxShadow: `0 0 24px -6px ${game.color.replace(")", " / 0.6)")}`,
          }}
        >
          <Icon className="w-6 h-6 md:w-7 md:h-7" style={{ color: game.color }} />
        </div>

        {/* Status badge top-right */}
        <span
          className="relative inline-flex items-center gap-1 text-[9px] md:text-[10px] font-extrabold uppercase tracking-wider px-2 py-1 rounded-full border whitespace-nowrap"
          style={{
            color: badge.color,
            borderColor: badge.color.replace(")", " / 0.4)"),
            backgroundColor: "hsl(0 0% 0% / 0.55)",
          }}
        >
          {badge.pulse && (
            <span className="absolute -left-0.5 -top-0.5 w-2 h-2">
              <span
                className="absolute inset-0 rounded-full opacity-75 animate-ping"
                style={{ background: badge.color }}
              />
            </span>
          )}
          {badge.label}
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

      {/* Footer: reward (left) + CTA (right) */}
      <div className="relative flex items-center justify-between mt-3 pt-3 border-t border-border/60 gap-2">
        <span
          className="text-[10px] md:text-[11px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border"
          style={{
            color: game.color,
            borderColor: game.color.replace(")", " / 0.3)"),
            backgroundColor: "hsl(0 0% 0% / 0.4)",
          }}
        >
          {game.reward}
        </span>

        <span
          className={`inline-flex items-center gap-1 text-[11px] md:text-xs font-extrabold tracking-tight ${
            cta.pulse ? "animate-pulse" : ""
          }`}
          style={{ color: ctaColor }}
        >
          {cta.label}
          {cta.disabled ? (
            <Check className="w-3.5 h-3.5" />
          ) : (
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
          )}
        </span>
      </div>
    </motion.button>
  );
}

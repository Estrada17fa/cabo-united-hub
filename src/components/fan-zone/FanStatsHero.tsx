import { motion } from "framer-motion";
import { LogIn, Trophy, Crown, Flame, TrendingUp, Gift } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const CYAN = "hsl(189 100% 45%)";
const GREEN = "hsl(152 76% 50%)";
const AMBER = "hsl(42 95% 58%)";
const ORANGE = "hsl(20 95% 58%)";

interface FanStats {
  rank: number;
  totalFans: number;
  points: number;
  streak: number;
  level: number;
  pointsToNext: number;
  levelTotal: number;
  trend: "up" | "down" | "flat";
}

const MOCK_STATS: FanStats = {
  rank: 42,
  totalFans: 1250,
  points: 12450,
  streak: 5,
  level: 3,
  pointsToNext: 1550,
  levelTotal: 2000,
  trend: "up",
};

const LEVEL_NAME = "Amo";
const NEXT_LEVEL_NAME = "Amo Élite";
const NEXT_REWARD = "Pase del Amo · 20% descuento";
const SEASON = "Apertura 2026";

export function FanStatsHero({ onLoginClick }: { onLoginClick?: () => void }) {
  const { user, profile } = useAuth();
  const stats = MOCK_STATS;
  const progressPct = ((stats.levelTotal - stats.pointsToNext) / stats.levelTotal) * 100;

  const displayName = profile?.display_name ?? user?.email?.split("@")[0] ?? "Invitado";
  const longName = displayName.length > 16;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-3"
    >
      {/* Premium loyalty card */}
      <div
        className="relative rounded-2xl border border-border bg-card p-5 overflow-hidden"
        style={{ borderTop: `1px solid ${GREEN.replace(")", " / 0.4)")}` }}
      >
        {/* ZONE 1 — identity + stat pills */}
        <div className="flex items-start gap-3">
          {/* Identity */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Avatar className="w-10 h-10 shrink-0 ring-1 ring-border">
              <AvatarImage src={profile?.avatar_url ?? undefined} />
              <AvatarFallback className="bg-muted text-xs font-bold text-foreground">
                {displayName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p
                className={`font-bold text-foreground leading-tight ${
                  longName ? "text-[13px]" : "text-base"
                }`}
              >
                {displayName}
              </p>
              <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">
                FAN ZONE · {SEASON}
              </p>
            </div>
          </div>

          {/* Stat pills */}
          <div className="flex items-stretch gap-2 shrink-0">
            <div
              className="rounded-lg border border-border px-2.5 py-1.5 text-right"
              style={{ backgroundColor: "hsl(0 0% 0% / 0.45)" }}
            >
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold leading-none">
                Ranking
              </p>
              <p
                className="font-extrabold tabular-nums tracking-tight leading-none mt-1 flex items-center justify-end gap-1"
                style={{ color: GREEN, fontSize: "20px" }}
              >
                <Trophy className="w-3.5 h-3.5" />
                #{stats.rank}
              </p>
            </div>
            <div
              className="rounded-lg border border-border px-2.5 py-1.5 text-right"
              style={{ backgroundColor: "hsl(0 0% 0% / 0.45)" }}
            >
              <p
                className="text-[10px] uppercase tracking-wider font-semibold leading-none"
                style={{ color: CYAN }}
              >
                Puntos
              </p>
              <p
                className="font-extrabold tabular-nums tracking-tight leading-none mt-1 text-foreground"
                style={{ fontSize: "24px" }}
              >
                {stats.points.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* ZONE 2 — level + streak + trend */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Crown className="w-4 h-4 shrink-0" style={{ color: AMBER }} />
            <div className="min-w-0">
              <p className="text-[12px] font-bold text-foreground leading-tight">
                NIVEL {stats.level}
              </p>
              <p
                className="text-[10px] leading-tight truncate"
                style={{ color: AMBER }}
              >
                {LEVEL_NAME}
              </p>
            </div>
          </div>
          <div
            className="flex items-center gap-2 min-w-0 px-2"
            style={{
              borderLeft: "1px solid hsl(0 0% 100% / 0.08)",
              borderRight: "1px solid hsl(0 0% 100% / 0.08)",
            }}
          >
            <Flame className="w-4 h-4 shrink-0" style={{ color: ORANGE }} />
            <div className="min-w-0">
              <p className="text-[12px] font-bold text-foreground leading-tight">
                RACHA {stats.streak}
              </p>
              <p className="text-[10px] text-muted-foreground leading-tight truncate">
                partidos activo
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 min-w-0">
            <TrendingUp className="w-4 h-4 shrink-0" style={{ color: GREEN }} />
            <div className="min-w-0">
              <p className="text-[12px] font-bold text-foreground leading-tight">
                ▲ +3
              </p>
              <p className="text-[10px] text-muted-foreground leading-tight truncate">
                esta semana
              </p>
            </div>
          </div>
        </div>

        {/* ZONE 3 — progress */}
        <div className="mt-4">
          <div className="flex items-baseline justify-between gap-2 mb-1.5">
            <span className="text-[11px] font-semibold text-foreground truncate">
              Nivel {stats.level} · {LEVEL_NAME}
            </span>
            <span className="text-[11px] text-muted-foreground truncate">
              {stats.pointsToNext.toLocaleString()} pts a Nivel {stats.level + 1} · {NEXT_LEVEL_NAME}
            </span>
          </div>
          <div
            className="relative h-2 w-full overflow-hidden"
            style={{
              borderRadius: "4px",
              backgroundColor: "hsl(0 0% 100% / 0.08)",
            }}
          >
            <div
              className="h-full transition-all"
              style={{
                width: `${progressPct}%`,
                borderRadius: "4px",
                background: `linear-gradient(90deg, ${CYAN}, ${GREEN})`,
                boxShadow: "0 0 8px hsl(160 100% 50% / 0.4)",
              }}
            />
          </div>
          <div className="flex items-center justify-end gap-1 mt-1.5">
            <Gift className="w-3 h-3 text-muted-foreground" />
            <span className="text-[11px] text-muted-foreground">
              Al llegar: {NEXT_REWARD}
            </span>
          </div>
        </div>
      </div>

      {!user && (
        <Button
          onClick={onLoginClick}
          className="w-full font-bold"
          style={{
            backgroundColor: CYAN,
            color: "hsl(0 0% 8%)",
            boxShadow: "0 6px 20px -4px hsl(189 100% 45% / 0.55)",
          }}
        >
          <LogIn className="w-4 h-4 mr-1" />
          Inicia sesión para competir
        </Button>
      )}
    </motion.div>
  );
}
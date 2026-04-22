import { motion } from "framer-motion";
import { Sparkles, Trophy, Flame, Star, TrendingUp, LogIn } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const PRIMARY = "hsl(189 100% 45%)";
const SECONDARY = "hsl(336 80% 75%)";

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

export function FanStatsHero({ onLoginClick }: { onLoginClick?: () => void }) {
  const { user, profile } = useAuth();
  const stats = MOCK_STATS;
  const progressPct = ((stats.levelTotal - stats.pointsToNext) / stats.levelTotal) * 100;

  const displayName = profile?.display_name ?? user?.email?.split("@")[0] ?? "Invitado";

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative rounded-2xl border border-border bg-card overflow-hidden"
    >
      {/* Radial color glows */}
      <div
        className="pointer-events-none absolute -top-24 -left-16 w-72 h-72 rounded-full blur-3xl opacity-30"
        style={{ background: PRIMARY }}
      />
      <div
        className="pointer-events-none absolute -bottom-24 -right-16 w-72 h-72 rounded-full blur-3xl opacity-25"
        style={{ background: SECONDARY }}
      />
      {/* subtle grid pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(0 0% 100%) 1px, transparent 1px), linear-gradient(90deg, hsl(0 0% 100%) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <div className="relative p-5 md:p-7 space-y-5">
        {/* Top row: chip + avatar */}
        <div className="flex items-center justify-between gap-3">
          <span
            className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border"
            style={{
              color: PRIMARY,
              borderColor: "hsl(189 100% 45% / 0.4)",
              backgroundColor: "hsl(0 0% 0% / 0.5)",
            }}
          >
            Fan Zone
          </span>

          <div className="flex items-center gap-2.5">
            <div className="text-right leading-tight">
              <p className="text-xs text-muted-foreground">Hola,</p>
              <p className="text-sm font-bold text-foreground truncate max-w-[140px]">
                {displayName}
              </p>
            </div>
            <Avatar className="w-10 h-10 ring-2 ring-[hsl(189_100%_45%/0.4)]">
              <AvatarImage src={profile?.avatar_url ?? undefined} />
              <AvatarFallback className="bg-muted text-xs font-bold">
                {displayName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Two big metrics */}
        <div className="grid grid-cols-2 gap-3">
          {/* Ranking */}
          <div className="rounded-xl border border-border bg-[hsl(0_0%_0%/0.4)] p-3.5 md:p-4">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Trophy className="w-3.5 h-3.5" style={{ color: SECONDARY }} />
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Ranking
              </span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span
                className="text-3xl md:text-4xl font-extrabold tabular-nums tracking-tight leading-none"
                style={{ color: SECONDARY }}
              >
                #{stats.rank}
              </span>
              <span className="text-[10px] text-muted-foreground">
                de {stats.totalFans.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Points */}
          <div className="rounded-xl border border-border bg-[hsl(0_0%_0%/0.4)] p-3.5 md:p-4">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Sparkles className="w-3.5 h-3.5" style={{ color: PRIMARY }} />
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Puntos
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span
                className="text-3xl md:text-4xl font-extrabold tabular-nums tracking-tight leading-none"
                style={{
                  color: PRIMARY,
                  textShadow: "0 0 18px hsl(189 100% 45% / 0.45)",
                }}
              >
                {stats.points.toLocaleString()}
              </span>
              <span className="text-[10px] font-bold text-muted-foreground">PTS</span>
            </div>
          </div>
        </div>

        {/* Progress to next level */}
        <div>
          <div className="flex items-center justify-between text-[11px] mb-1.5">
            <span className="font-bold text-foreground">Nivel {stats.level}</span>
            <span className="text-muted-foreground">
              {stats.pointsToNext.toLocaleString()} pts al Nivel {stats.level + 1}
            </span>
          </div>
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-[hsl(0_0%_100%/0.06)]">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${progressPct}%`,
                background: `linear-gradient(90deg, ${PRIMARY}, ${SECONDARY})`,
                boxShadow: "0 0 12px hsl(189 100% 45% / 0.6)",
              }}
            />
          </div>
        </div>

        {/* Stats strip */}
        <div className="flex items-center justify-between gap-2 pt-1 text-[11px]">
          <div className="flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5" style={{ color: "hsl(20 95% 55%)" }} />
            <span className="text-muted-foreground">Racha</span>
            <span className="font-bold text-foreground">{stats.streak}</span>
          </div>
          <div className="w-px h-3 bg-border" />
          <div className="flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5" style={{ color: "hsl(45 100% 55%)" }} />
            <span className="text-muted-foreground">Nivel</span>
            <span className="font-bold text-foreground">{stats.level}</span>
          </div>
          <div className="w-px h-3 bg-border" />
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5" style={{ color: "hsl(142 76% 50%)" }} />
            <span className="text-muted-foreground">Posición</span>
            <span className="font-bold" style={{ color: "hsl(142 76% 55%)" }}>
              ▲ 3
            </span>
          </div>
        </div>

        {!user && (
          <Button
            onClick={onLoginClick}
            className="w-full font-bold"
            style={{
              backgroundColor: PRIMARY,
              color: "hsl(0 0% 8%)",
              boxShadow: "0 6px 20px -4px hsl(189 100% 45% / 0.55)",
            }}
          >
            <LogIn className="w-4 h-4 mr-1" />
            Inicia sesión para competir
          </Button>
        )}
      </div>
    </motion.div>
  );
}
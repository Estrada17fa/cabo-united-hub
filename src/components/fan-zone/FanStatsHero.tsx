import { motion } from "framer-motion";
import { LogIn, Crown, Trophy } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";

const PRIMARY = "hsl(var(--primary))";
const ACCENT = "hsl(var(--accent))";

interface FanStats {
  rank: number;
  totalFans: number;
  points: number;
  level: number;
  pointsToNext: number;
  levelTotal: number;
}

const MOCK_STATS: FanStats = {
  rank: 42,
  totalFans: 1250,
  points: 12450,
  level: 3,
  pointsToNext: 1550,
  levelTotal: 2000,
};

const LEVEL_NAME = "Amo";
const NEXT_LEVEL_NAME = "Amo Élite";

export function FanStatsHero({ onLoginClick }: { onLoginClick?: () => void }) {
  const { user, profile } = useAuth();
  const isMobile = useIsMobile();
  const stats = MOCK_STATS;
  const earned = stats.levelTotal - stats.pointsToNext;
  const progressPct = Math.max(0, Math.min(100, (earned / stats.levelTotal) * 100));

  const displayName = profile?.display_name ?? user?.email?.split("@")[0] ?? "Invitado";

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-3"
    >
      <div
        className={isMobile ? "flex flex-col gap-3" : "grid gap-3"}
        style={isMobile ? undefined : { gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)" }}
      >
        <div className="rounded-2xl border border-border bg-card p-4 flex items-center gap-3 min-w-0 h-full">
          <Avatar className="w-12 h-12 md:w-14 md:h-14 shrink-0 ring-1 ring-border">
            <AvatarImage src={profile?.avatar_url ?? undefined} />
            <AvatarFallback className="bg-muted text-xs font-bold text-foreground">
              {displayName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-extrabold text-foreground truncate leading-none">
              {displayName}
            </p>
            <div className="flex items-center gap-1.5 mt-2 min-w-0">
              <Crown className="w-4 h-4 shrink-0" style={{ color: "hsl(var(--accent))" }} />
              <div className="min-w-0">
                <p className="text-[28px] md:text-[30px] font-black truncate leading-none" style={{ color: "hsl(var(--accent))" }}>
                  {LEVEL_NAME}
                </p>
                <p className="text-[12px] uppercase tracking-[0.16em] text-muted-foreground font-semibold mt-1 leading-none">
                  Nivel {stats.level}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card overflow-hidden h-full">
          <div className="grid grid-cols-2 h-full">
            <div
              className="p-4 flex flex-col justify-center min-w-0"
              style={{
                backgroundColor: "hsl(0 0% 0% / 0.28)",
                borderTop: "2px solid hsl(var(--accent))",
                borderRight: "1px solid hsl(var(--border))",
              }}
            >
              <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-semibold leading-none">
                Ranking
              </p>
              <p className="text-[28px] md:text-[30px] font-black tabular-nums leading-none mt-2 flex items-center gap-1.5" style={{ color: ACCENT }}>
                <Trophy className="w-4 h-4" />#{stats.rank}
              </p>
              <p className="text-[11px] text-muted-foreground mt-1.5 leading-none truncate">
                de {stats.totalFans.toLocaleString()}
              </p>
            </div>

            <div
              className="p-4 flex flex-col justify-center min-w-0"
              style={{
                backgroundColor: "hsl(0 0% 0% / 0.28)",
                borderTop: "2px solid hsl(var(--primary))",
              }}
            >
              <p className="text-[10px] uppercase tracking-[0.14em] font-semibold leading-none" style={{ color: PRIMARY }}>
                Puntos
              </p>
              <p
                className="text-[28px] md:text-[30px] font-black tabular-nums leading-none mt-2 text-foreground truncate"
              >
                {stats.points.toLocaleString()}
              </p>
              <p className="text-[11px] text-muted-foreground mt-1.5 leading-none">
                acumulados
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-1.5 min-w-0">
            <Crown className="w-4 h-4 shrink-0" style={{ color: "hsl(var(--accent))" }} />
            <span className="text-sm font-extrabold text-foreground truncate">
              Nivel {stats.level} · {LEVEL_NAME}
            </span>
          </div>
          <span className="text-[12px] tabular-nums text-muted-foreground shrink-0">
            {earned.toLocaleString()} / {stats.levelTotal.toLocaleString()} pts
          </span>
        </div>

        <div
          className="relative h-3 w-full overflow-visible rounded-full"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={stats.levelTotal}
          aria-valuenow={earned}
          aria-label="Progreso al siguiente nivel"
          style={{ backgroundColor: "hsl(0 0% 100% / 0.08)" }}
        >
          <div
            className="h-full relative transition-all duration-500 ease-out"
            style={{
              width: `${progressPct}%`,
              background: `linear-gradient(90deg, ${PRIMARY}, ${ACCENT})`,
              boxShadow: "0 0 14px hsl(var(--primary) / 0.4)",
            }}
          >
            <span
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 right-0 w-2.5 h-2.5 rounded-full"
              style={{
                backgroundColor: "hsl(var(--background))",
                boxShadow: "0 0 0 3px hsl(var(--primary) / 0.25), 0 0 10px hsl(var(--primary) / 0.45)",
              }}
            />
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-1.5 mt-2.5">
          <span className="text-[11px] text-muted-foreground">
            Próximo: Nivel {stats.level + 1} · {NEXT_LEVEL_NAME}
          </span>
          <span className="text-[11px] text-muted-foreground">
            Faltan <span className="font-semibold text-foreground">{stats.pointsToNext.toLocaleString()} pts</span>
          </span>
        </div>
      </div>

      {!user && (
        <Button
          onClick={onLoginClick}
          className="w-full font-bold"
          style={{
            backgroundColor: PRIMARY,
            color: "hsl(var(--primary-foreground))",
            boxShadow: "0 6px 20px -4px hsl(var(--primary) / 0.55)",
          }}
        >
          <LogIn className="w-4 h-4 mr-1" />
          Inicia sesión para competir
        </Button>
      )}
    </motion.div>
  );
}
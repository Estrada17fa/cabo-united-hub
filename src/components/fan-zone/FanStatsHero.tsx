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
        <div className="rounded-2xl border border-border bg-card p-4 md:p-5 flex items-center gap-3 min-w-0 h-full">
          <Avatar className="w-12 h-12 md:w-14 md:h-14 shrink-0 ring-1 ring-border">
            <AvatarImage src={profile?.avatar_url ?? undefined} />
            <AvatarFallback className="bg-muted text-xs font-bold text-foreground">
              {displayName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground leading-none">
              Perfil
            </p>
            <p className="text-sm md:text-base font-extrabold text-foreground truncate mt-2 leading-none">
              {displayName}
            </p>
            <div className="flex items-center gap-2 mt-3 min-w-0">
              <Crown className="w-4 h-4 shrink-0 text-primary" />
              <div className="min-w-0">
                <p className="text-lg md:text-xl font-extrabold text-foreground truncate leading-none">
                  {LEVEL_NAME}
                </p>
                <p className="text-[11px] md:text-xs uppercase tracking-[0.16em] text-muted-foreground font-semibold mt-1 leading-none">
                  Nivel {stats.level}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 md:p-5 h-full flex flex-col justify-between">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground leading-none">
              Ranking
            </p>
            <Trophy className="w-4 h-4 text-accent" />
          </div>

          <div className="grid grid-cols-2 divide-x divide-border mt-3">
            <div className="pr-3 min-w-0">
              <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-semibold leading-none">
                Posición
              </p>
              <p
                className="text-[28px] md:text-[30px] font-black tabular-nums leading-none mt-2"
                style={{ color: ACCENT }}
              >
                #{stats.rank}
              </p>
              <p className="text-[11px] text-muted-foreground mt-2 leading-none truncate">
                de {stats.totalFans.toLocaleString()} fans
              </p>
            </div>

            <div className="pl-3 min-w-0">
              <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-semibold leading-none">
                Puntos
              </p>
              <p
                className="text-[28px] md:text-[30px] font-black tabular-nums leading-none mt-2 truncate"
                style={{ color: PRIMARY }}
              >
                {stats.points.toLocaleString()}
              </p>
              <p className="text-[11px] text-muted-foreground mt-2 leading-none">
                acumulados
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4 md:p-5">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <Crown className="w-4 h-4 shrink-0 text-primary" />
              <p className="text-sm md:text-base font-extrabold text-foreground truncate leading-none">
                {LEVEL_NAME}
              </p>
            </div>
            <p className="text-[11px] md:text-xs uppercase tracking-[0.16em] text-muted-foreground font-semibold mt-2 leading-none">
              Nivel {stats.level}
            </p>
          </div>
          <div className="shrink-0 rounded-xl border border-border bg-muted/40 px-3 py-2">
            <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-semibold leading-none">
              Faltan
            </p>
            <p className="text-lg md:text-xl font-black tabular-nums text-foreground mt-1 leading-none">
              {stats.pointsToNext.toLocaleString()} pts
            </p>
          </div>
        </div>

        <div
          className="relative h-3 w-full overflow-hidden rounded-full"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={stats.levelTotal}
          aria-valuenow={earned}
          aria-label="Progreso al siguiente nivel"
          style={{ backgroundColor: "hsl(var(--muted))" }}
        >
          <div
            className="h-full relative transition-all duration-500 ease-out"
            style={{
              width: `${progressPct}%`,
              background: `linear-gradient(90deg, ${PRIMARY}, ${ACCENT})`,
              boxShadow: "0 0 20px hsl(var(--primary) / 0.35)",
            }}
          >
            <span
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 right-0 w-2.5 h-2.5 rounded-full"
              style={{
                backgroundColor: "hsl(var(--background))",
                boxShadow: "0 0 0 3px hsl(var(--primary) / 0.35)",
              }}
            />
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mt-3">
          <span className="text-[11px] md:text-xs text-muted-foreground">
            {earned.toLocaleString()} de {stats.levelTotal.toLocaleString()} pts completados en este nivel
          </span>
          <span className="text-[11px] md:text-xs text-muted-foreground">
            Siguiente nivel: <span className="font-semibold text-foreground">{NEXT_LEVEL_NAME}</span>
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
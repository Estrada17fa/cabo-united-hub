import { motion } from "framer-motion";
import { LogIn } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
      className="space-y-3"
    >
      {/* Card unificada: identidad + stats + nivel */}
      <div className="rounded-2xl border border-border bg-card p-5">
        {/* Fila 1: avatar + nombre + stats */}
        <div className="flex items-center gap-4">
          <Avatar className="w-14 h-14 shrink-0 ring-1 ring-border">
            <AvatarImage src={profile?.avatar_url ?? undefined} />
            <AvatarFallback className="bg-muted text-sm font-bold text-foreground">
              {displayName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-semibold">
              Fan Zone
            </p>
            <p className="text-base font-bold text-foreground truncate leading-tight">
              {displayName}
            </p>
          </div>

          <div className="flex items-center gap-5 shrink-0">
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                Puntos
              </p>
              <p className="text-xl font-extrabold tabular-nums tracking-tight text-foreground leading-tight">
                {stats.points.toLocaleString()}
              </p>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                Ranking
              </p>
              <p className="text-xl font-extrabold tabular-nums tracking-tight text-foreground leading-tight">
                #{stats.rank}
              </p>
            </div>
          </div>
        </div>

        {/* Separador */}
        <div className="h-px bg-border my-4" />

        {/* Fila 2: progreso de nivel */}
        <div>
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-xs font-semibold text-foreground">
              Nivel <span className="font-extrabold">{stats.level}</span>
            </span>
            <span className="text-[11px] text-muted-foreground">
              {stats.pointsToNext.toLocaleString()} pts al Nivel {stats.level + 1}
            </span>
          </div>
          <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-[hsl(0_0%_100%/0.06)]">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${progressPct}%`,
                background: `linear-gradient(90deg, ${PRIMARY}, ${SECONDARY})`,
              }}
            />
          </div>
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
    </motion.div>
  );
}
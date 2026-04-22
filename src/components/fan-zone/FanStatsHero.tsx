import { motion } from "framer-motion";
import { Sparkles, Trophy, LogIn } from "lucide-react";
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
      {/* Mini card: avatar + puntos + ranking */}
      <div className="relative rounded-2xl border border-border bg-card overflow-hidden">
        <div
          className="pointer-events-none absolute -top-16 -left-10 w-48 h-48 rounded-full blur-3xl opacity-25"
          style={{ background: PRIMARY }}
        />
        <div
          className="pointer-events-none absolute -bottom-16 -right-10 w-48 h-48 rounded-full blur-3xl opacity-20"
          style={{ background: SECONDARY }}
        />
        <div className="relative flex items-center gap-3 p-3.5">
          <Avatar className="w-12 h-12 ring-2 ring-[hsl(189_100%_45%/0.4)] shrink-0">
            <AvatarImage src={profile?.avatar_url ?? undefined} />
            <AvatarFallback className="bg-muted text-xs font-bold">
              {displayName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
              Fan Zone
            </p>
            <p className="text-sm font-bold text-foreground truncate">{displayName}</p>
          </div>

          <div className="flex items-center gap-3 pr-1">
            <div className="text-right leading-tight">
              <div className="flex items-center justify-end gap-1">
                <Sparkles className="w-3 h-3" style={{ color: PRIMARY }} />
                <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                  Puntos
                </span>
              </div>
              <span
                className="text-lg font-extrabold tabular-nums tracking-tight"
                style={{ color: PRIMARY, textShadow: "0 0 12px hsl(189 100% 45% / 0.45)" }}
              >
                {stats.points.toLocaleString()}
              </span>
            </div>
            <div className="w-px h-9 bg-border" />
            <div className="text-right leading-tight">
              <div className="flex items-center justify-end gap-1">
                <Trophy className="w-3 h-3" style={{ color: SECONDARY }} />
                <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                  Rank
                </span>
              </div>
              <span
                className="text-lg font-extrabold tabular-nums tracking-tight"
                style={{ color: SECONDARY }}
              >
                #{stats.rank}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de progreso de nivel */}
      <div className="relative rounded-2xl border border-border bg-card p-3.5">
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
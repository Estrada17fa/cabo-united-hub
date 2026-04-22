import { motion } from "framer-motion";
import { LogIn, Crown, Trophy, Gift } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const CYAN = "hsl(189 100% 45%)";
const GREEN = "hsl(152 76% 50%)";
const AMBER = "hsl(42 95% 58%)";

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
      {/* Top row — 2 mini cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* CARD 1 — Profile + Level */}
        <div className="rounded-2xl border border-border bg-card p-4 flex items-center gap-3 min-w-0">
          <Avatar className="w-12 h-12 shrink-0 ring-1 ring-border">
            <AvatarImage src={profile?.avatar_url ?? undefined} />
            <AvatarFallback className="bg-muted text-xs font-bold text-foreground">
              {displayName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <Crown className="w-4 h-4 shrink-0" style={{ color: AMBER }} />
              <span
                className="font-extrabold leading-none truncate"
                style={{ color: AMBER, fontSize: "18px" }}
              >
                {LEVEL_NAME}
              </span>
            </div>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mt-1 leading-none">
              Nivel {stats.level}
            </p>
            <p className="text-[11px] text-muted-foreground mt-2 truncate leading-none">
              {displayName}
            </p>
          </div>
        </div>

        {/* CARD 2 — Ranking + Points */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="grid grid-cols-2 h-full">
            {/* Ranking */}
            <div
              className="p-3 flex flex-col justify-center min-w-0"
              style={{
                backgroundColor: "hsl(0 0% 0% / 0.35)",
                borderTop: `2px solid ${GREEN}`,
                borderRight: "1px solid hsl(0 0% 100% / 0.06)",
              }}
            >
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold leading-none">
                Ranking
              </p>
              <p
                className="font-extrabold tabular-nums tracking-tight leading-none mt-1.5 flex items-center gap-1"
                style={{ color: GREEN, fontSize: "22px" }}
              >
                <Trophy className="w-3.5 h-3.5" />
                #{stats.rank}
              </p>
              <p className="text-[10px] text-muted-foreground mt-1 leading-none">
                de {stats.totalFans.toLocaleString()}
              </p>
            </div>
            {/* Points */}
            <div
              className="p-3 flex flex-col justify-center min-w-0"
              style={{
                backgroundColor: "hsl(0 0% 0% / 0.35)",
                borderTop: `2px solid ${CYAN}`,
              }}
            >
              <p
                className="text-[10px] uppercase tracking-wider font-semibold leading-none"
                style={{ color: CYAN }}
              >
                Puntos
              </p>
              <p
                className="font-extrabold tabular-nums tracking-tight leading-none mt-1.5 text-foreground"
                style={{ fontSize: "22px" }}
              >
                {stats.points.toLocaleString()}
              </p>
              <p className="text-[10px] text-muted-foreground mt-1 leading-none">
                acumulados
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CARD 3 — Progress bar */}
      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <Crown className="w-3.5 h-3.5 shrink-0" style={{ color: AMBER }} />
            <span className="text-[12px] font-bold text-foreground truncate">
              Nivel {stats.level} · {LEVEL_NAME}
            </span>
          </div>
          <span className="text-[12px] tabular-nums text-muted-foreground shrink-0">
            {earned.toLocaleString()} / {stats.levelTotal.toLocaleString()} pts
          </span>
        </div>

        <div
          className="relative h-2.5 w-full overflow-visible"
          style={{
            borderRadius: "9999px",
            backgroundColor: "hsl(0 0% 100% / 0.08)",
          }}
        >
          <div
            className="h-full relative transition-all"
            style={{
              width: `${progressPct}%`,
              borderRadius: "9999px",
              background: `linear-gradient(90deg, ${CYAN}, ${GREEN})`,
              boxShadow: "0 0 10px hsl(160 100% 50% / 0.45)",
            }}
          >
            {/* Tick at end */}
            <span
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 right-0 w-2.5 h-2.5 rounded-full"
              style={{
                backgroundColor: "hsl(0 0% 100%)",
                boxShadow: "0 0 6px hsl(0 0% 100% / 0.85)",
              }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 mt-2.5">
          <span className="text-[11px] text-muted-foreground truncate">
            Próximo: Nivel {stats.level + 1} · {NEXT_LEVEL_NAME}
          </span>
          <span className="text-[11px] text-muted-foreground flex items-center gap-1 shrink-0">
            <Gift className="w-3 h-3" />
            Pase del Amo · 20% descuento
          </span>
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
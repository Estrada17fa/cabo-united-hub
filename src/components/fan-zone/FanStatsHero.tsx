import { motion } from "framer-motion";
import { LogIn, Crown, Flame, TrendingUp, Gift, ArrowUp } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import lcuCrest from "@/assets/lcu-crest.png";

const CYAN = "hsl(189 100% 45%)";
const GREEN = "hsl(152 76% 50%)";
const AMBER = "hsl(42 95% 58%)";
const ORANGE = "hsl(20 95% 58%)";

interface FanStats {
  rank: number;
  totalFans: number;
  points: number;
  pointsToday: number;
  streak: number;
  level: number;
  levelMax: number;
  pointsToNext: number;
  levelTotal: number;
  weeklyDelta: number;
}

const MOCK_STATS: FanStats = {
  rank: 42,
  totalFans: 1250,
  points: 12450,
  pointsToday: 320,
  streak: 5,
  level: 3,
  levelMax: 5,
  pointsToNext: 1550,
  levelTotal: 2000,
  weeklyDelta: 3,
};

const LEVEL_NAME = "Amo";
const NEXT_LEVEL_NAME = "Amo Élite";
const NEXT_REWARD = "Pase del Amo 20% off";
const SEASON = "Apertura 2026";

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
      <div
        className="relative rounded-2xl border border-border bg-card overflow-hidden"
        style={{
          borderTop: "2px solid transparent",
          backgroundImage: `linear-gradient(hsl(var(--card)), hsl(var(--card))), linear-gradient(90deg, ${GREEN}, ${CYAN})`,
          backgroundOrigin: "border-box",
          backgroundClip: "padding-box, border-box",
        }}
      >
        {/* Watermark crest */}
        <img
          src={lcuCrest}
          alt=""
          aria-hidden
          className="hidden md:block absolute pointer-events-none select-none"
          style={{ right: -10, top: "50%", transform: "translateY(-50%)", width: 140, opacity: 0.05 }}
        />

        {/* ───── DESKTOP ───── */}
        <div className="hidden md:grid relative" style={{ gridTemplateColumns: "25% 40% 35%" }}>
          {/* LEFT — identity */}
          <div className="p-5 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12 shrink-0 ring-1 ring-border">
                <AvatarImage src={profile?.avatar_url ?? undefined} />
                <AvatarFallback className="bg-muted text-xs font-bold text-foreground">
                  {displayName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-base font-bold text-foreground leading-tight">{displayName}</p>
                <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">
                  FAN ZONE · {SEASON}
                </p>
              </div>
            </div>
            <div className="h-px bg-white/10" />
            <div className="flex items-center gap-2">
              <Crown className="w-4 h-4 shrink-0" style={{ color: AMBER }} />
              <div className="min-w-0">
                <p className="italic font-bold text-[13px] leading-tight" style={{ color: AMBER }}>
                  {LEVEL_NAME.toUpperCase()}
                </p>
                <p className="text-[11px] text-muted-foreground leading-tight">
                  Nivel {stats.level} de {stats.levelMax}
                </p>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="absolute top-4 bottom-4 left-[25%] w-px" style={{ backgroundColor: "hsl(0 0% 100% / 0.08)" }} />

          {/* CENTER — hero points */}
          <div
            className="p-5 flex flex-col items-center justify-center text-center"
            style={{
              backgroundImage: "radial-gradient(ellipse at center, hsl(152 100% 50% / 0.04) 0%, transparent 70%)",
            }}
          >
            <p
              className="text-[10px] uppercase font-semibold"
              style={{ color: CYAN, letterSpacing: "0.1em" }}
            >
              Tus Puntos
            </p>
            <p
              className="font-extrabold text-foreground tabular-nums mt-1"
              style={{
                fontSize: "48px",
                letterSpacing: "-0.03em",
                lineHeight: 1.05,
                textShadow: "0 0 30px hsl(160 100% 50% / 0.25)",
              }}
            >
              {stats.points.toLocaleString()}
            </p>
            <p className="text-[12px] font-semibold flex items-center gap-1 mt-1" style={{ color: GREEN }}>
              <ArrowUp className="w-3 h-3" />
              +{stats.pointsToday} pts hoy
            </p>

            <div className="w-full mt-3">
              <div
                className="relative h-1.5 w-full overflow-hidden"
                style={{ borderRadius: 4, backgroundColor: "hsl(0 0% 100% / 0.08)" }}
              >
                <div
                  className="h-full transition-all"
                  style={{
                    width: `${progressPct}%`,
                    borderRadius: 4,
                    background: `linear-gradient(90deg, ${CYAN}, ${GREEN})`,
                    boxShadow: "0 0 8px hsl(160 100% 50% / 0.4)",
                  }}
                />
              </div>
              <p className="text-[11px] text-muted-foreground mt-1.5">
                {stats.pointsToNext.toLocaleString()} pts para {NEXT_LEVEL_NAME}
              </p>
              <p className="text-[11px] mt-0.5 flex items-center justify-center gap-1" style={{ color: AMBER }}>
                <Gift className="w-3 h-3" />
                Premio: {NEXT_REWARD}
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="absolute top-4 bottom-4 left-[65%] w-px" style={{ backgroundColor: "hsl(0 0% 100% / 0.08)" }} />

          {/* RIGHT — stats */}
          <div className="p-5 flex flex-col justify-center gap-2.5 relative z-10">
            <div>
              <p className="font-extrabold tabular-nums leading-none" style={{ color: GREEN, fontSize: 32 }}>
                #{stats.rank}
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">de {stats.totalFans.toLocaleString()} jugadores</p>
            </div>
            <div className="h-px bg-white/8" style={{ backgroundColor: "hsl(0 0% 100% / 0.08)" }} />
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5" style={{ color: ORANGE }} />
              <div>
                <p className="font-bold text-foreground leading-none" style={{ fontSize: 20 }}>
                  {stats.streak} partidos
                </p>
                <p className="text-[10px] uppercase mt-1" style={{ color: ORANGE, opacity: 0.8 }}>
                  Racha activa
                </p>
              </div>
            </div>
            <div style={{ height: 1, backgroundColor: "hsl(0 0% 100% / 0.08)" }} />
            <div>
              <p className="font-bold leading-none" style={{ color: GREEN, fontSize: 18 }}>
                ▲ +{stats.weeklyDelta}
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">posiciones esta semana</p>
            </div>
          </div>
        </div>

        {/* ───── MOBILE ───── */}
        <div className="md:hidden p-4 space-y-3">
          {/* Row 1 */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <Avatar className="w-9 h-9 shrink-0 ring-1 ring-border">
                <AvatarImage src={profile?.avatar_url ?? undefined} />
                <AvatarFallback className="bg-muted text-[10px] font-bold text-foreground">
                  {displayName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <p className="text-[13px] font-bold text-foreground leading-tight truncate">
                {displayName}
              </p>
            </div>
            <div className="text-center shrink-0">
              <p className="text-[9px] uppercase font-semibold leading-none" style={{ color: CYAN, letterSpacing: "0.08em" }}>
                Puntos
              </p>
              <p
                className="font-extrabold text-foreground tabular-nums leading-none mt-1"
                style={{ fontSize: 32, letterSpacing: "-0.02em", textShadow: "0 0 20px hsl(160 100% 50% / 0.25)" }}
              >
                {stats.points.toLocaleString()}
              </p>
            </div>
            <div className="text-right shrink-0 min-w-[3rem]">
              <p className="text-[9px] uppercase text-muted-foreground leading-none">Rank</p>
              <p className="font-extrabold tabular-nums leading-none mt-1" style={{ color: GREEN, fontSize: 24 }}>
                #{stats.rank}
              </p>
            </div>
          </div>
          {/* Row 2 */}
          <div>
            <div
              className="relative h-1.5 w-full overflow-hidden"
              style={{ borderRadius: 4, backgroundColor: "hsl(0 0% 100% / 0.08)" }}
            >
              <div
                className="h-full transition-all"
                style={{
                  width: `${progressPct}%`,
                  borderRadius: 4,
                  background: `linear-gradient(90deg, ${CYAN}, ${GREEN})`,
                  boxShadow: "0 0 8px hsl(160 100% 50% / 0.4)",
                }}
              />
            </div>
            <p className="text-[11px] text-muted-foreground mt-1.5 leading-tight">
              <span style={{ color: ORANGE }}>🔥 Racha {stats.streak}</span>
              <span className="mx-1.5 opacity-40">·</span>
              <span style={{ color: GREEN }}>▲ +{stats.weeklyDelta} esta semana</span>
              <span className="mx-1.5 opacity-40">·</span>
              {stats.pointsToNext.toLocaleString()} pts para {NEXT_LEVEL_NAME}
            </p>
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

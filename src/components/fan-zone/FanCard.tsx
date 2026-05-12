import { motion } from "framer-motion";
import { Crown, Trophy, Info } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { useFanProfile } from "@/hooks/useFanProfile";
import { progressToNext } from "@/lib/levels";

const LEVELS_TOOLTIP = (
  <div className="space-y-1.5 text-[11px] leading-snug">
    <p className="font-bold text-foreground uppercase tracking-wider text-[10px]">
      Niveles del Paraíso
    </p>
    <p><span className="text-foreground font-semibold">Visitante</span> — 0 XP</p>
    <p><span className="text-foreground font-semibold">Local</span> — 500 XP</p>
    <p><span className="text-foreground font-semibold">Cabeño</span> — 2,000 XP</p>
    <p><span className="text-foreground font-semibold">Amo</span> — 5,000 XP</p>
    <p><span className="text-foreground font-semibold">Amo del Paraíso</span> — 12,000 XP</p>
    <p><span className="text-foreground font-semibold">Leyenda</span> — 25,000 XP</p>
    <p className="text-muted-foreground pt-1">
      Sube de nivel jugando minijuegos y asistiendo al estadio.
    </p>
  </div>
);

export function FanCard() {
  const { user, profile } = useAuth();
  useFanProfile();
  const xp = profile?.xp ?? 0;
  const cc = profile?.cc ?? 0;
  const { current, next, earned, span, pct } = progressToNext(xp);

  const displayName = profile?.display_name ?? user?.email?.split("@")[0] ?? "Invitado";
  const initials = user
    ? displayName.slice(0, 2).toUpperCase()
    : "LCU";

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl border border-border bg-card p-4 md:p-6"
    >
      {/* Top row */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
        {/* Identity (left) */}
        <div className="flex items-center gap-3 min-w-0 md:flex-1">
          <Avatar className="w-12 h-12 md:w-14 md:h-14 shrink-0 ring-1 ring-border">
            <AvatarImage src={profile?.avatar_url ?? undefined} />
            <AvatarFallback className="bg-muted text-[11px] font-extrabold tracking-wider text-muted-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="text-sm md:text-base font-bold text-foreground truncate leading-tight">
              {displayName}
            </p>
            <div className="flex items-center gap-1.5 mt-1">
              <Crown className="w-3.5 h-3.5 shrink-0 text-brand-accent" />
              <span className="text-[13px] font-extrabold leading-none text-brand-accent">
                {current.name}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold ml-1">
                Nivel {current.level}
              </span>
              <TooltipProvider delayDuration={150}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      aria-label="Cómo funcionan los niveles"
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Info className="w-3 h-3" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-xs bg-card border-border">
                    {LEVELS_TOOLTIP}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>

        {/* Divider on desktop */}
        <div className="hidden md:block h-12 w-px bg-border" />

        {/* Ranking (center) */}
        <div className="flex md:flex-col md:items-center justify-between md:justify-center gap-2 md:min-w-[120px]">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
            Cabo Coins
          </span>
          <div className="flex items-baseline gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-brand-accent self-center" />
            <span className="text-xl md:text-2xl font-extrabold tabular-nums tracking-tight text-brand-accent">
              {cc.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Divider on desktop */}
        <div className="hidden md:block h-12 w-px bg-border" />

        {/* Points (right) */}
        <div className="flex md:flex-col md:items-end justify-between md:justify-center gap-2 md:min-w-[140px]">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
            XP
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl md:text-2xl font-extrabold tabular-nums tracking-tight text-brand-primary">
              {xp.toLocaleString()}
            </span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
              xp
            </span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-5 md:mt-6">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-[11px] font-semibold text-muted-foreground">
            Nivel {current.level} · {current.name}
            {next && (
              <>
                <span className="mx-1.5 text-muted-foreground/50">→</span>
                Nivel {next.level} · {next.name}
              </>
            )}
          </span>
          {next && (
            <span className="text-[11px] tabular-nums text-muted-foreground shrink-0">
              {earned.toLocaleString()} / {span.toLocaleString()}
            </span>
          )}
        </div>
        <div
          className="relative h-2 w-full overflow-hidden rounded-full"
          style={{ backgroundColor: "hsl(0 0% 100% / 0.06)" }}
        >
          <div
            className="h-full transition-all"
            style={{
              width: `${pct}%`,
              borderRadius: "9999px",
              background: "hsl(var(--brand-primary))",
              boxShadow: "0 0 10px hsl(var(--brand-primary) / 0.45)",
            }}
          />
        </div>
      </div>
    </motion.div>
  );
}
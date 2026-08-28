import { motion } from "framer-motion";
import { Shield, Calendar, Ticket, Radio, PlayCircle, Trophy } from "lucide-react";
import { CountdownTimer } from "./CountdownTimer";
import { ResponsiveMatchTimeline } from "./ResponsiveMatchTimeline";
import { useLiveMatch } from "@/hooks/useLiveMatch";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Link } from "react-router-dom";
import type { Tables } from "@/integrations/supabase/types";
import stadiumHero from "@/assets/stadium-hero.jpg";

interface MatchHeroCardProps {
  match: Tables<"matches"> | null;
}

export function MatchHeroCard({ match }: MatchHeroCardProps) {
  const { isLive, isFinished, clock, events } = useLiveMatch(match);
  const showLiveLayout = isLive || isFinished;

  if (!match) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-2xl border border-border overflow-hidden"
        style={{ background: "#1a1a1a" }}
      >
        <div className="p-8 text-center">
          <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground font-medium">No hay partidos programados</p>
        </div>
      </motion.div>
    );
  }

  const matchDate = new Date(`${match.match_date}T${match.match_time || "19:00:00"}`);
  const formattedDate = format(matchDate, "EEE, dd MMM | h:mm a", { locale: es });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative rounded-2xl border border-border overflow-hidden"
      style={showLiveLayout ? { borderColor: "hsl(142 76% 45% / 0.5)" } : undefined}
    >
      {/* Background image */}
      <img
        src={stadiumHero}
        alt="Estadio"
        className="absolute inset-0 w-full h-full object-cover [object-position:20%_40%] sm:[object-position:center_40%]"
        width={1280}
        height={720}
      />
      {/* Multi-stop dark gradient for readability */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.7) 50%, rgba(0,0,0,0.95) 100%)",
        }}
      />
      {/* Subtle black tint */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.25)" }}
      />
      {/* Mesh gradient glow */}
      <div
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          background: showLiveLayout
            ? "radial-gradient(ellipse at 30% 20%, rgba(0,0,0,0.5) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(0,0,0,0.4) 0%, transparent 50%)"
            : "radial-gradient(ellipse at 30% 20%, rgba(0,0,0,0.5) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(0,0,0,0.4) 0%, transparent 50%)",
        }}
      />

      <div className="relative z-10 px-5 py-8 flex flex-col items-center gap-5">
        {/* Jornada + Live badge */}
        <div className="flex items-center gap-2">
          {match.jornada != null && (
            <span className="px-3 py-1 rounded-full bg-black/40 border border-border text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
              Jornada {match.jornada}
            </span>
          )}
          {isLive && (
            <motion.span
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full"
              style={{
                backgroundColor: "hsl(142 76% 45% / 0.15)",
                border: "1px solid hsl(142 76% 45% / 0.4)",
              }}
            >
              <span className="relative flex h-2 w-2">
                <span
                  className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                  style={{ backgroundColor: "hsl(142 76% 45%)" }}
                />
                <span
                  className="relative inline-flex rounded-full h-2 w-2"
                  style={{ backgroundColor: "hsl(142 76% 45%)" }}
                />
              </span>
              <span
                className="text-[10px] font-extrabold tracking-widest"
                style={{ color: "hsl(142 76% 55%)" }}
              >
                EN VIVO {clock ?? ""}
              </span>
            </motion.span>
          )}
          {isFinished && (
            <span
              className="flex items-center gap-1.5 px-3 py-1 rounded-full"
              style={{
                backgroundColor: "hsl(142 76% 45% / 0.1)",
                border: "1px solid hsl(142 76% 45% / 0.3)",
              }}
            >
              <span
                className="text-[10px] font-extrabold tracking-widest"
                style={{ color: "hsl(142 76% 55%)" }}
              >
                FINALIZADO
              </span>
            </span>
          )}
        </div>

        {/* Teams + score (when live) */}
        <div className="flex items-center justify-center gap-3 sm:gap-4 w-full">
          {/* Home */}
          <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center border border-border shrink-0">
              <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-foreground text-center leading-tight truncate max-w-full">
              {match.home_team}
            </span>
          </div>

          {/* Center: score-VS-score (live or finished) or just VS */}
          {showLiveLayout ? (
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <ScoreNumber value={match.home_score ?? 0} />
              <span className="text-base sm:text-lg font-extrabold text-muted-foreground tracking-wider">
                VS
              </span>
              <ScoreNumber value={match.away_score ?? 0} />
            </div>
          ) : (
            <span className="text-lg font-extrabold text-muted-foreground tracking-wider shrink-0">
              VS
            </span>
          )}

          {/* Away */}
          <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center border border-border shrink-0">
              <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-muted-foreground" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-foreground text-center leading-tight truncate max-w-full">
              {match.away_team}
            </span>
          </div>
        </div>

        {/* Countdown only when match has not started yet */}
        {!showLiveLayout && <CountdownTimer targetDate={matchDate} />}

        {/* Details */}
        <div className="flex flex-col items-center gap-1.5 text-center">
          <div className="flex items-center gap-1.5 text-sm text-foreground font-semibold">
            <MapPin className="w-3.5 h-3.5 text-primary" />
            {match.venue || "Estadio Don Koll"} · Cabo San Lucas, BCS
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground font-medium capitalize">
            <Calendar className="w-3.5 h-3.5" />
            {formattedDate}
          </div>
        </div>

        {/* Timeline (live or recently finished) */}
        {showLiveLayout && (
          <div className="w-full pt-2 border-t border-border/50">
            <ResponsiveMatchTimeline events={events} homeTeam={match.home_team} />
          </div>
        )}

        {/* CTAs */}
        {showLiveLayout ? (
          <div className="w-full flex flex-col gap-2">
            {/* Row 1: Ver en Vivo / Resumen */}
            <div className="grid grid-cols-1 gap-2">

              {isLive ? (
                <a
                  href={match.live_stream_url || "#"}
                  target={match.live_stream_url ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    if (!match.live_stream_url) e.preventDefault();
                  }}
                  title={match.live_stream_url ? "Abrir transmisión" : "Transmisión no disponible"}
                  className={`h-11 flex items-center justify-center gap-2 rounded-xl text-xs sm:text-sm font-medium text-white transition-colors ${
                    !match.live_stream_url ? "opacity-50 cursor-not-allowed" : "hover:bg-white/[0.15]"
                  }`}
                  style={{
                    backgroundColor: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.30)",
                  }}
                >
                  <Radio className="w-4 h-4" />
                  Ver en Vivo
                </a>
              ) : (
                <a
                  href={(match as any).match_summary_url || "#"}
                  target={(match as any).match_summary_url ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    if (!(match as any).match_summary_url) e.preventDefault();
                  }}
                  title={(match as any).match_summary_url ? "Ver resumen" : "Resumen no disponible"}
                  className={`h-11 flex items-center justify-center gap-2 rounded-xl text-xs sm:text-sm font-medium text-white transition-colors ${
                    !(match as any).match_summary_url ? "opacity-50 cursor-not-allowed" : "hover:bg-white/[0.15]"
                  }`}
                  style={{
                    backgroundColor: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.30)",
                  }}
                >
                  <PlayCircle className="w-4 h-4" />
                  Resumen
                </a>
              )}
            </div>


            {/* Row 2: Vota por el Amo del Partido (primary, full width) */}
            <Link to="/fan-zone" className="w-full">
              <motion.button
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                whileTap={{ scale: 0.98 }}
                className="w-full h-[52px] flex items-center justify-center gap-2 rounded-xl font-bold text-[13px] sm:text-[15px]"
                style={{
                  backgroundColor: "hsl(142 76% 50%)",
                  color: "hsl(0 0% 6%)",
                  boxShadow: "0 8px 24px -6px hsl(142 76% 50% / 0.55)",
                }}
              >
                <Trophy className="w-5 h-5" />
                Vota por el Amo del Partido
              </motion.button>
            </Link>
          </div>
        ) : (
          <div className="flex flex-row gap-3 items-center justify-center flex-wrap">
            <Link to="/abonos">
              <motion.button
                whileTap={{ scale: 0.96 }}
                className="flex items-center gap-1 px-3 py-2 rounded-full font-extrabold text-[10px] tracking-wide whitespace-nowrap"
                style={{
                  backgroundColor: "hsl(189 100% 55%)",
                  color: "hsl(0 0% 8%)",
                  boxShadow: "0 0 0 1px hsl(189 100% 70%), 0 6px 20px -4px hsl(189 100% 50% / 0.65)",
                }}
              >
                <Ticket className="w-4 h-4" />
                COMPRAR BOLETOS
              </motion.button>
            </Link>

          </div>
        )}
      </div>
    </motion.div>
  );
}

function ScoreNumber({ value }: { value: number }) {
  return (
    <motion.span
      key={value}
      initial={{ scale: 1.4, color: "hsl(142 76% 55%)" }}
      animate={{ scale: 1, color: "hsl(var(--foreground))" }}
      transition={{ duration: 0.6 }}
      className="text-4xl sm:text-5xl font-extrabold tabular-nums leading-none"
      style={{ textShadow: "0 0 18px hsl(142 76% 45% / 0.5)" }}
    >
      {value}
    </motion.span>
  );
}

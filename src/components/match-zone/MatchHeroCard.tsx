import { motion } from "framer-motion";
import { Shield, MapPin, Calendar, Ticket, Radio, PlayCircle, Trophy } from "lucide-react";
import { CountdownTimer } from "./CountdownTimer";
import { MatchTimeline } from "./MatchTimeline";
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
  const { isLive, isFinished, currentMinute, events } = useLiveMatch(match);
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
        className="absolute inset-0 w-full h-full object-cover"
        width={1280}
        height={720}
      />
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/70" />
      {/* Mesh gradient glow */}
      <div
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          background: showLiveLayout
            ? "radial-gradient(ellipse at 30% 20%, hsl(142 76% 45% / 0.35) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, hsl(189 100% 38% / 0.2) 0%, transparent 50%)"
            : "radial-gradient(ellipse at 30% 20%, hsl(189 100% 38% / 0.3) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, hsl(189 100% 38% / 0.2) 0%, transparent 50%)",
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
                EN VIVO {currentMinute}'
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
            <MatchTimeline events={events} homeTeam={match.home_team} />
          </div>
        )}

        {/* CTAs */}
        <div className="flex flex-row gap-3 items-center justify-center flex-wrap">
          {isLive && (
            <motion.a
              href={match.live_stream_url || "#"}
              target={match.live_stream_url ? "_blank" : undefined}
              rel="noopener noreferrer"
              whileTap={{ scale: match.live_stream_url ? 0.96 : 1 }}
              animate={
                match.live_stream_url
                  ? {
                      boxShadow: [
                        "0 0 16px -2px hsl(142 76% 45% / 0.5), inset 0 0 8px hsl(142 76% 45% / 0.05)",
                        "0 0 24px 0px hsl(142 76% 45% / 0.7), inset 0 0 12px hsl(142 76% 45% / 0.1)",
                        "0 0 16px -2px hsl(142 76% 45% / 0.5), inset 0 0 8px hsl(142 76% 45% / 0.05)",
                      ],
                    }
                  : undefined
              }
              transition={{ duration: 1.8, repeat: Infinity }}
              onClick={(e) => {
                if (!match.live_stream_url) e.preventDefault();
              }}
              title={match.live_stream_url ? "Abrir transmisión" : "Transmisión no disponible"}
              className={`flex items-center gap-1 px-3 py-2 rounded-full font-bold text-[10px] tracking-wide whitespace-nowrap ${
                !match.live_stream_url ? "opacity-50 cursor-not-allowed" : ""
              }`}
              style={{
                backgroundColor: "hsl(142 76% 45% / 0.20)",
                border: "2px solid hsl(142 76% 45%)",
                color: "hsl(142 76% 70%)",
                boxShadow: "0 4px 14px -2px hsl(142 76% 45% / 0.55)",
              }}
            >
              <Radio className="w-4 h-4" />
              VER EN VIVO
            </motion.a>
          )}
          {isFinished && (
            <motion.a
              href={(match as any).match_summary_url || "#"}
              target={(match as any).match_summary_url ? "_blank" : undefined}
              rel="noopener noreferrer"
              whileTap={{ scale: (match as any).match_summary_url ? 0.96 : 1 }}
              onClick={(e) => {
                if (!(match as any).match_summary_url) e.preventDefault();
              }}
              title={(match as any).match_summary_url ? "Ver resumen" : "Resumen no disponible"}
              className={`flex items-center gap-1 px-3 py-2 rounded-full font-bold text-[10px] tracking-wide whitespace-nowrap ${
                !(match as any).match_summary_url ? "opacity-50 cursor-not-allowed" : ""
              }`}
              style={{
                backgroundColor: "hsl(142 76% 45% / 0.20)",
                border: "2px solid hsl(142 76% 45%)",
                color: "hsl(142 76% 70%)",
                boxShadow: "0 4px 14px -2px hsl(142 76% 45% / 0.55)",
              }}
            >
              <PlayCircle className="w-4 h-4" />
              RESUMEN
            </motion.a>
          )}
          {!showLiveLayout && (
            <Link to="/tickets">
              <motion.button
                whileTap={{ scale: 0.96 }}
                className="flex items-center gap-1 px-3 py-2 rounded-full font-bold text-[10px] tracking-wide whitespace-nowrap"
                style={{
                  backgroundColor: "rgba(0, 0, 0, 0.3)",
                  border: "1.5px solid hsl(189 100% 50%)",
                  color: "hsl(189 100% 60%)",
                  boxShadow: "0 0 16px -2px hsl(189 100% 50% / 0.4), inset 0 0 8px hsl(189 100% 50% / 0.05)",
                }}
              >
                <Ticket className="w-4 h-4 sm:w-4 sm:h-4" />
                COMPRAR BOLETOS
              </motion.button>
            </Link>
          )}
          <Link to="/conoce-los-cabos">
            <motion.button
              whileTap={{ scale: 0.96 }}
              className="flex items-center gap-1 px-3 py-2 rounded-full font-bold text-[10px] tracking-wide whitespace-nowrap"
              style={{
                backgroundColor: "rgba(0, 0, 0, 0.3)",
                border: "1.5px solid hsl(336 80% 77%)",
                color: "hsl(336 80% 80%)",
                boxShadow: "0 0 16px -2px hsl(336 80% 77% / 0.4), inset 0 0 8px hsl(336 80% 77% / 0.05)",
              }}
            >
              <MapPin className="w-4 h-4 sm:w-4 sm:h-4" />
              VISITA LOS CABOS
            </motion.button>
          </Link>
          {showLiveLayout && isLive && currentMinute >= 70 && (
            <Link to="/fan-zone" className="w-full md:w-auto flex justify-center">
              <motion.button
                whileTap={{ scale: 0.96 }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-1 px-3 py-2 rounded-full font-bold text-[10px] tracking-wide whitespace-nowrap"
                style={{
                  backgroundColor: "rgba(0, 0, 0, 0.3)",
                  border: "1.5px solid hsl(189 100% 50%)",
                  color: "hsl(189 100% 60%)",
                  boxShadow: "0 0 16px -2px hsl(189 100% 50% / 0.5), inset 0 0 8px hsl(189 100% 50% / 0.05)",
                }}
              >
                <Trophy className="w-4 h-4" />
                VOTA POR EL AMO DEL PARTIDO
              </motion.button>
            </Link>
          )}
        </div>
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

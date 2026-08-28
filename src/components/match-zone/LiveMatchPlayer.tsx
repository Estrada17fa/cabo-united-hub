import { motion } from "framer-motion";
import { Trophy, MapPin, Radio, Instagram, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { useLiveMatch } from "@/hooks/useLiveMatch";
import { useTeamLogos } from "@/hooks/useTeamLogos";
import { useAuth } from "@/hooks/useAuth";
import { TeamCrest } from "./TeamCrest";
import { ResponsiveMatchTimeline } from "./ResponsiveMatchTimeline";
import { getEmbedUrl } from "@/lib/streamUrl";
import stadiumHero from "@/assets/stadium-hero.jpg";
import type { Tables } from "@/integrations/supabase/types";

interface LiveMatchPlayerProps {
  match: Tables<"matches">;
  /** Abre el flujo de login/registro cuando el visitante no tiene sesión. */
  onRequestLogin?: () => void;
}

export function LiveMatchPlayer({ match, onRequestLogin }: LiveMatchPlayerProps) {
  const { clock, events } = useLiveMatch(match);
  const logos = useTeamLogos();
  const { user, loading: authLoading } = useAuth();
  const embed = getEmbedUrl(match.live_stream_url);


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-3"
    >
      {/* PLAYER CARD */}
      <div
        className="relative rounded-2xl overflow-hidden border"
        style={{
          backgroundColor: "#121212",
          borderColor: "hsl(142 76% 45% / 0.5)",
          boxShadow: "0 0 30px -10px hsl(142 76% 45% / 0.4)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/60">
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

          {match.jornada != null && (
            <span className="px-3 py-1 rounded-full bg-black/40 border border-border text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
              Jornada {match.jornada}
            </span>
          )}
        </div>

        {/* Video / login gate / fallback */}
        <div className="relative w-full aspect-video bg-black">
          {!user && !authLoading ? (
            <>
              <img
                src={stadiumHero}
                alt=""
                aria-hidden
                className="absolute inset-0 w-full h-full object-cover blur-md scale-110 opacity-40"
              />
              <div className="absolute inset-0 bg-black/70" />
              <div className="relative z-10 h-full flex flex-col items-center justify-center gap-3 text-center p-6">
                <div className="w-11 h-11 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-primary" />
                </div>
                <p className="text-xs text-muted-foreground max-w-xs">
                  La transmisión es exclusiva para la afición registrada.
                </p>
                <button
                  onClick={onRequestLogin}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold"
                  style={{
                    backgroundColor: "hsl(142 76% 50%)",
                    color: "hsl(0 0% 6%)",
                    boxShadow: "0 8px 24px -6px hsl(142 76% 50% / 0.55)",
                  }}
                >
                  <Lock className="w-3.5 h-3.5" />
                  Inicia sesión para ver el partido en vivo
                </button>
              </div>
            </>
          ) : embed ? (
            <iframe
              key={embed.embedUrl}
              src={embed.embedUrl}
              title={`Transmisión en vivo: ${match.home_team} vs ${match.away_team}`}
              className="absolute inset-0 w-full h-full"
              frameBorder={0}
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center p-6">
              <Radio className="w-10 h-10 text-muted-foreground" />
              <p className="text-sm font-semibold text-foreground">
                Transmisión próximamente
              </p>
              <p className="text-xs text-muted-foreground max-w-xs">
                Síguenos en redes sociales para no perderte el inicio del stream.
              </p>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-white transition-colors hover:bg-white/[0.15]"
                style={{
                  backgroundColor: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.30)",
                }}
              >
                <Instagram className="w-3.5 h-3.5" />
                Ir a Instagram
              </a>
            </div>
          )}
        </div>

      </div>

      {/* COMPACT MATCH CARD */}
      <div
        className="w-full rounded-2xl border border-border overflow-hidden"
        style={{ backgroundColor: "#121212" }}
      >
        <div className="px-4 py-4 flex flex-col gap-4">
          {/* Teams + score row */}
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
            {/* Home */}
            <div className="flex items-center gap-2 min-w-0 justify-end sm:justify-center">
              <span className="text-xs sm:text-sm font-bold text-foreground truncate text-right sm:text-center order-1 sm:order-2">
                {match.home_team}
              </span>
              <TeamCrest
                teamName={match.home_team}
                logoUrl={logos[match.home_team]}
                size={28}
                className="order-2 sm:order-1"
              />
            </div>

            {/* Score */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <ScoreNumber value={match.home_score ?? 0} />
              <span className="text-sm font-extrabold text-muted-foreground tracking-wider">
                VS
              </span>
              <ScoreNumber value={match.away_score ?? 0} />
            </div>

            {/* Away */}
            <div className="flex items-center gap-2 min-w-0 justify-start sm:justify-center">
              <TeamCrest
                teamName={match.away_team}
                logoUrl={logos[match.away_team]}
                size={28}
              />
              <span className="text-xs sm:text-sm font-bold text-foreground truncate">
                {match.away_team}
              </span>
            </div>
          </div>

          {/* Timeline (vertical on mobile, horizontal on tablet/desktop) */}
          <div className="w-full pt-3 border-t border-border/50">
            <ResponsiveMatchTimeline events={events} homeTeam={match.home_team} />
          </div>

          {/* CTAs */}
          <div className="grid grid-cols-[3fr_2fr] gap-2 pt-1">
            <Link to="/fan-zone" className="w-full">
              <motion.button
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                whileTap={{ scale: 0.98 }}
                className="w-full h-11 flex items-center justify-center gap-2 rounded-xl font-bold text-[12px] sm:text-[14px]"
                style={{
                  backgroundColor: "hsl(142 76% 50%)",
                  color: "hsl(0 0% 6%)",
                  boxShadow: "0 8px 24px -6px hsl(142 76% 50% / 0.55)",
                }}
              >
                <Trophy className="w-4 h-4" />
                Vota por el Amo
              </motion.button>
            </Link>

            <Link
              to="/conoce-los-cabos"
              className="h-11 flex items-center justify-center gap-2 rounded-xl text-xs sm:text-sm font-medium text-white transition-colors hover:bg-white/[0.15]"
              style={{
                backgroundColor: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.30)",
              }}
            >
              <MapPin className="w-4 h-4" />
              Visita Los Cabos
            </Link>
          </div>
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
      className="text-3xl sm:text-4xl font-extrabold tabular-nums leading-none"
      style={{ textShadow: "0 0 18px hsl(142 76% 45% / 0.5)" }}
    >
      {value}
    </motion.span>
  );
}
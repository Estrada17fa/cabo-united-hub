import { motion } from "framer-motion";
import { Shield, MapPin, Calendar, Ticket } from "lucide-react";
import { CountdownTimer } from "./CountdownTimer";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Link } from "react-router-dom";
import type { Tables } from "@/integrations/supabase/types";
import stadiumHero from "@/assets/stadium-hero.jpg";

interface MatchHeroCardProps {
  match: Tables<"matches"> | null;
}

export function MatchHeroCard({ match }: MatchHeroCardProps) {
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
          background: "radial-gradient(ellipse at 30% 20%, hsl(189 100% 38% / 0.3) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, hsl(189 100% 38% / 0.2) 0%, transparent 50%)",
        }}
      />

      <div className="relative z-10 px-5 py-8 flex flex-col items-center gap-5">
        {/* Teams */}
        <div className="flex items-center justify-center gap-6 w-full">
          {/* Home */}
          <div className="flex flex-col items-center gap-2 flex-1">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center border border-border">
              <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-foreground text-center leading-tight">
              {match.home_team}
            </span>
          </div>

          {/* VS */}
          <span className="text-lg font-extrabold text-muted-foreground tracking-wider">VS</span>

          {/* Away */}
          <div className="flex flex-col items-center gap-2 flex-1">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center border border-border">
              <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-muted-foreground" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-foreground text-center leading-tight">
              {match.away_team}
            </span>
          </div>
        </div>

        {/* Countdown */}
        <CountdownTimer targetDate={matchDate} />

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

        {/* CTAs */}
        <div className="flex flex-row gap-3 items-center justify-center">
          <Link to="/tickets">
            <motion.button
              whileTap={{ scale: 0.96 }}
              className="flex items-center justify-center gap-1 px-4 py-2.5 rounded-full font-bold text-xs tracking-wide"
              style={{
                backgroundColor: "rgba(0, 0, 0, 0.3)",
                border: "1.5px solid hsl(189 100% 50%)",
                color: "hsl(189 100% 60%)",
                boxShadow: "0 0 16px -2px hsl(189 100% 50% / 0.4), inset 0 0 8px hsl(189 100% 50% / 0.05)",
              }}
            >
              <Ticket className="w-6 h-6 sm:w-4 sm:h-4" />
              COMPRAR BOLETOS
            </motion.button>
          </Link>
          <Link to="/conoce-los-cabos">
            <motion.button
              whileTap={{ scale: 0.96 }}
              className="flex items-center justify-center gap-1 px-4 py-2.5 rounded-full font-bold text-xs tracking-wide"
              style={{
                backgroundColor: "rgba(0, 0, 0, 0.3)",
                border: "1.5px solid hsl(336 80% 77%)",
                color: "hsl(336 80% 80%)",
                boxShadow: "0 0 16px -2px hsl(336 80% 77% / 0.4), inset 0 0 8px hsl(336 80% 77% / 0.05)",
              }}
            >
              <MapPin className="w-6 h-6 sm:w-4 sm:h-4" />
              VISITA LOS CABOS
            </motion.button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

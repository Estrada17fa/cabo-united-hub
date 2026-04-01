import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, MapPin, Clock } from "lucide-react";
import type { Match } from "./mockData";

interface CountdownCardProps {
  match: Match;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function getTimeLeft(dateStr: string, timeStr: string): TimeLeft {
  const target = new Date(`${dateStr}T${timeStr}:00`);
  const now = new Date();
  const diff = Math.max(0, target.getTime() - now.getTime());
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function TimeUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <motion.div
        key={value}
        initial={{ y: -8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-muted border border-border flex items-center justify-center"
      >
        <span className="text-xl sm:text-2xl font-bold text-foreground tabular-nums">
          {String(value).padStart(2, "0")}
        </span>
      </motion.div>
      <span className="text-[10px] sm:text-xs text-muted-foreground mt-1.5 uppercase tracking-wider font-medium">
        {label}
      </span>
    </div>
  );
}

export function CountdownCard({ match }: CountdownCardProps) {
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(match.date, match.time));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeLeft(match.date, match.time));
    }, 1000);
    return () => clearInterval(timer);
  }, [match.date, match.time]);

  const matchDate = new Date(`${match.date}T${match.time}:00`);
  const formattedDate = matchDate.toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bento-card relative overflow-hidden"
    >
      {/* Glow accent */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />

      <p className="text-label text-primary mb-4 text-center">Próximo Partido</p>

      {/* Teams */}
      <div className="flex items-center justify-center gap-4 sm:gap-8 mb-6">
        <div className="text-center flex-1">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-muted border border-border mx-auto mb-2 flex items-center justify-center">
            <span className="text-xs font-bold text-muted-foreground">LCU</span>
          </div>
          <p className="text-xs sm:text-sm font-semibold truncate">{match.homeTeam}</p>
        </div>
        <span className="text-2xl font-bold text-muted-foreground">VS</span>
        <div className="text-center flex-1">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-muted border border-border mx-auto mb-2 flex items-center justify-center">
            <span className="text-xs font-bold text-muted-foreground">
              {match.awayTeam.substring(0, 3).toUpperCase()}
            </span>
          </div>
          <p className="text-xs sm:text-sm font-semibold truncate">{match.awayTeam}</p>
        </div>
      </div>

      {/* Countdown */}
      <div className="flex justify-center gap-3 sm:gap-4 mb-6">
        <TimeUnit value={timeLeft.days} label="Días" />
        <TimeUnit value={timeLeft.hours} label="Hrs" />
        <TimeUnit value={timeLeft.minutes} label="Min" />
        <TimeUnit value={timeLeft.seconds} label="Seg" />
      </div>

      {/* Meta */}
      <div className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" />
          {formattedDate}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          {match.time} hrs
        </span>
        <span className="flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5" />
          {match.venue}
        </span>
      </div>
    </motion.div>
  );
}

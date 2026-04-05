import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin, Calendar, Clock } from "lucide-react";
import { LCU, RIVAL, NEXT_MATCH_DATE, MATCH_VENUE } from "./mockData";

const CountdownUnit = ({ value, label }: { value: number; label: string }) => (
  <div className="flex flex-col items-center">
    <div className="bg-muted rounded-lg w-14 h-14 md:w-16 md:h-16 flex items-center justify-center border border-border">
      <span className="text-2xl md:text-3xl font-bold tabular-nums">{String(value).padStart(2, "0")}</span>
    </div>
    <span className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1.5">{label}</span>
  </div>
);

const TeamBadge = ({ team, side }: { team: typeof LCU; side: "left" | "right" }) => (
  <motion.div
    initial={{ opacity: 0, x: side === "left" ? -20 : 20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: 0.2, duration: 0.5 }}
    className="flex flex-col items-center gap-2"
  >
    <div
      className="w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center text-xl md:text-2xl font-extrabold border border-border"
      style={{ backgroundColor: `${team.color}20`, color: team.color }}
    >
      {team.initials}
    </div>
    <span className="text-xs md:text-sm font-semibold text-center max-w-[80px] leading-tight">{team.shortName}</span>
  </motion.div>
);

export default function MatchHero() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calc = () => {
      const diff = Math.max(0, NEXT_MATCH_DATE.getTime() - Date.now());
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, []);

  const localTime = NEXT_MATCH_DATE.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const localDate = NEXT_MATCH_DATE.toLocaleDateString([], { weekday: "long", day: "numeric", month: "long" });

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bento-card relative overflow-hidden"
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 gradient-primary opacity-[0.04] pointer-events-none" />

      <div className="relative z-10">
        {/* Matchday label */}
        <div className="flex justify-center mb-5">
          <span className="text-label text-primary bg-primary/10 px-3 py-1 rounded-full">
            {MATCH_VENUE.matchday}
          </span>
        </div>

        {/* Teams */}
        <div className="flex items-center justify-center gap-6 md:gap-10 mb-6">
          <TeamBadge team={LCU} side="left" />
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
            className="text-2xl font-bold text-muted-foreground"
          >
            VS
          </motion.span>
          <TeamBadge team={RIVAL} side="right" />
        </div>

        {/* Countdown */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex justify-center gap-3 mb-6"
        >
          <CountdownUnit value={timeLeft.days} label="Días" />
          <CountdownUnit value={timeLeft.hours} label="Hrs" />
          <CountdownUnit value={timeLeft.minutes} label="Min" />
          <CountdownUnit value={timeLeft.seconds} label="Seg" />
        </motion.div>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col items-center gap-2 text-sm text-muted-foreground"
        >
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span className="capitalize">{localDate}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>{localTime} (hora local)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" />
            <span>{MATCH_VENUE.stadium} · {MATCH_VENUE.address}</span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

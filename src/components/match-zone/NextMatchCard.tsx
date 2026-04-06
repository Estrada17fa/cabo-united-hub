import { useNextMatch } from "@/hooks/useMatches";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, MapPin, Clock } from "lucide-react";
import { useState, useEffect } from "react";

function Countdown({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculate = () => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const diff = target - now;
      if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      };
    };
    setTimeLeft(calculate());
    const timer = setInterval(() => setTimeLeft(calculate()), 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  const units = [
    { label: "Días", value: timeLeft.days },
    { label: "Hrs", value: timeLeft.hours },
    { label: "Min", value: timeLeft.minutes },
    { label: "Seg", value: timeLeft.seconds },
  ];

  return (
    <div className="flex gap-3 justify-center">
      {units.map((u) => (
        <div key={u.label} className="flex flex-col items-center">
          <span className="text-2xl md:text-3xl font-bold text-primary tabular-nums">
            {String(u.value).padStart(2, "0")}
          </span>
          <span className="text-xs text-muted-foreground uppercase tracking-wider">{u.label}</span>
        </div>
      ))}
    </div>
  );
}

export function NextMatchCard() {
  const { data: match, isLoading } = useNextMatch();

  if (isLoading) {
    return (
      <Card className="p-6 bg-card border-border animate-pulse">
        <div className="h-40" />
      </Card>
    );
  }

  if (!match) {
    return (
      <Card className="p-6 bg-card border-border text-center">
        <p className="text-muted-foreground">No hay partidos programados</p>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-card border-border overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
      <div className="relative space-y-4">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-xs">
            {match.season} · Jornada {match.jornada || "—"}
          </Badge>
          <Badge className="bg-primary/20 text-primary border-primary/30">Próximo</Badge>
        </div>

        <div className="flex items-center justify-center gap-6 py-4">
          <div className="text-center flex-1">
            <div className="w-12 h-12 mx-auto rounded-full bg-muted flex items-center justify-center mb-2 text-lg font-bold">
              {match.home_team.charAt(0)}
            </div>
            <p className="font-semibold text-sm">{match.home_team}</p>
          </div>
          <span className="text-2xl font-bold text-muted-foreground">VS</span>
          <div className="text-center flex-1">
            <div className="w-12 h-12 mx-auto rounded-full bg-muted flex items-center justify-center mb-2 text-lg font-bold">
              {match.away_team.charAt(0)}
            </div>
            <p className="font-semibold text-sm">{match.away_team}</p>
          </div>
        </div>

        <Countdown targetDate={match.match_date} />

        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground pt-2">
          <span className="flex items-center gap-1">
            <CalendarDays className="w-3 h-3" />
            {new Date(match.match_date + "T00:00:00").toLocaleDateString("es-MX", { day: "numeric", month: "short" })}
          </span>
          {match.match_time && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {match.match_time.slice(0, 5)}
            </span>
          )}
          {match.venue && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {match.venue}
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}

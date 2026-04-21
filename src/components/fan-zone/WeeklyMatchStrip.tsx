import { useEffect, useState } from "react";
import { Calendar, Clock } from "lucide-react";
import lcuCrest from "@/assets/lcu-crest.png";

const MOCK_NEXT_MATCH = {
  rival: "Real Cabos",
  date: "Sábado 26 Abr",
  time: "18:00",
  venue: "Estadio Don Koll",
  jornada: 12,
  // 4 days from now mock
  kickoff: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).getTime(),
};

function useCountdown(target: number) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const diff = Math.max(0, target - now);
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return { d, h, m, s };
}

export function WeeklyMatchStrip() {
  const { d, h, m, s } = useCountdown(MOCK_NEXT_MATCH.kickoff);
  return (
    <div
      className="rounded-2xl border p-4 overflow-hidden relative"
      style={{
        backgroundColor: "hsl(0 0% 7%)",
        borderColor: "hsl(180 100% 50% / 0.2)",
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: "hsl(0 0% 100% / 0.05)" }}
          >
            <img src={lcuCrest} alt="LCU" className="w-9 h-9 object-contain" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground mb-0.5">
              <Calendar className="w-3 h-3" />
              Jornada {MOCK_NEXT_MATCH.jornada}
            </div>
            <div className="text-sm font-extrabold truncate">LCU vs {MOCK_NEXT_MATCH.rival}</div>
            <div className="text-xs text-muted-foreground truncate">
              {MOCK_NEXT_MATCH.date} · {MOCK_NEXT_MATCH.time}
            </div>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="flex items-center justify-end gap-1 text-[10px] uppercase tracking-widest text-primary mb-1">
            <Clock className="w-3 h-3" />
            Falta
          </div>
          <div className="font-mono font-bold text-sm tabular-nums">
            {d}d {String(h).padStart(2, "0")}:{String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}
          </div>
        </div>
      </div>
    </div>
  );
}

export { MOCK_NEXT_MATCH };
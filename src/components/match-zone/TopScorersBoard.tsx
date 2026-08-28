import { motion } from "framer-motion";
import { Crest as TeamCrest } from "@/components/ui-lcu";

interface Scorer {
  player_name: string;
  team: string;
  goals: number;
}

interface Props {
  scorers: Scorer[];
  logoMap?: Record<string, string>;
  ourTeam?: string;
}

const PODIUM_ORDER = [1, 0, 2];

export function TopScorersBoard({ scorers, logoMap = {}, ourTeam = "Los Cabos United" }: Props) {
  if (scorers.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-muted-foreground">
        No hay datos de goleadores disponibles
      </div>
    );
  }

  const podium = scorers.slice(0, 3);
  const rest = scorers.slice(3);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="grid grid-cols-3 gap-2 items-end">
        {PODIUM_ORDER.filter((i) => podium[i]).map((i) => {
          const s = podium[i];
          const isFirst = i === 0;
          const isOurs = s.team === ourTeam;
          return (
            <div
              key={`${s.player_name}-${i}`}
              className={`rounded-2xl border p-2.5 text-center ${
                isFirst ? "border-primary/60" : "border-border"
              }`}
              style={{
                background: isFirst ? "hsl(var(--primary) / 0.12)" : "hsl(var(--surface-2))",
                paddingTop: isFirst ? 18 : 12,
              }}
            >
              <div className="flex justify-center mb-1.5">
                <span
                  className={`grid place-items-center rounded-full text-[10px] font-extrabold ${
                    isFirst ? "bg-primary text-primary-foreground w-6 h-6" : "bg-muted/40 text-foreground w-5 h-5"
                  }`}
                >
                  {i + 1}
                </span>
              </div>
              <div className={`text-[19px] font-extrabold leading-none tabular-nums ${isFirst ? "text-primary" : "text-foreground"}`}>
                {s.goals}
              </div>
              <div className="text-[9px] uppercase tracking-wider text-muted-foreground mb-1.5">goles</div>
              <div className={`text-[11px] font-bold leading-tight line-clamp-2 ${isOurs ? "text-primary" : "text-foreground"}`}>
                {s.player_name}
              </div>
              <div className="flex items-center justify-center gap-1 mt-1">
                <TeamCrest teamName={s.team} logoUrl={logoMap[s.team]} size={12} />
                <span className="text-[9px] text-muted-foreground truncate">{s.team}</span>
              </div>
            </div>
          );
        })}
      </div>

      {rest.length > 0 && (
        <div className="rounded-card border border-white/[0.07] bg-surface-1 overflow-hidden">
          {rest.map((s, i) => {
            const isOurs = s.team === ourTeam;
            return (
              <div
                key={`${s.player_name}-${i}`}
                className={`flex items-center gap-2 px-3 py-2.5 border-b border-border/40 last:border-b-0 ${
                  isOurs ? "bg-primary/10" : ""
                }`}
              >
                <span className="w-5 text-[11px] font-bold tabular-nums text-muted-foreground">{i + 4}</span>
                <TeamCrest teamName={s.team} logoUrl={logoMap[s.team]} size={16} />
                <span className="flex-1 min-w-0">
                  <span className={`block truncate text-[12px] font-semibold ${isOurs ? "text-primary" : "text-foreground"}`}>
                    {s.player_name}
                  </span>
                  <span className="block truncate text-[10px] text-muted-foreground">{s.team}</span>
                </span>
                <span className={`text-[13px] font-extrabold tabular-nums ${isOurs ? "text-primary" : "text-foreground"}`}>
                  {s.goals}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}

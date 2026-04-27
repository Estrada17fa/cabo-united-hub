import { Trophy } from "lucide-react";

const ACCENT = "#00abc4";

export const RANKING = [
  { name: "Mariana López", points: 18920, badge: "Amo Élite" },
  { name: "Rafa SJC", points: 17450, badge: "Amo Élite" },
  { name: "Cabeño 4ever", points: 15280, badge: "Amo" },
  { name: "Ana P.", points: 14110, badge: "Amo" },
  { name: "Baja Pride", points: 13560, badge: "Amo" },
];

interface RankingCardProps {
  className?: string;
  user?: unknown;
  onLoginClick?: () => void;
  topLabel?: string;
}

export function RankingCard({
  className = "",
  user,
  onLoginClick,
  topLabel = "Top 5 de la semana",
}: RankingCardProps) {
  return (
    <div
      className={`rounded-2xl border overflow-hidden flex flex-col ${className}`}
      style={{
        background: "linear-gradient(135deg, #0d0d12 0%, #0a0a0a 100%)",
        borderColor: "rgba(255,255,255,0.07)",
      }}
    >
      <div className="px-5 pt-5 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4" style={{ color: ACCENT }} />
          <h3
            className="font-extrabold text-white uppercase"
            style={{ fontSize: 12, letterSpacing: "0.16em" }}
          >
            Ranking general
          </h3>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">
          {topLabel}
        </span>
      </div>

      <div className="flex-1 px-3 pb-4 flex flex-col gap-1">
        {RANKING.map((r, i) => {
          const medalColor =
            i === 0
              ? "#F59E0B"
              : i === 1
              ? "#CBD5E1"
              : i === 2
              ? "#D97706"
              : "rgba(255,255,255,0.4)";
          return (
            <div
              key={r.name}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
              style={{
                background: i < 3 ? "rgba(255,255,255,0.03)" : "transparent",
              }}
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center font-extrabold text-[12px] tabular-nums shrink-0"
                style={{
                  background:
                    i < 3 ? `${medalColor}22` : "rgba(255,255,255,0.06)",
                  color: i < 3 ? medalColor : "rgba(255,255,255,0.65)",
                  border: `1px solid ${
                    i < 3 ? medalColor + "55" : "rgba(255,255,255,0.08)"
                  }`,
                }}
              >
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-bold text-white truncate">
                  {r.name}
                </div>
                <div className="text-[11px] text-white/50">{r.badge}</div>
              </div>
              <div className="text-right shrink-0">
                <div
                  className="text-[14px] font-extrabold tabular-nums"
                  style={{ color: ACCENT }}
                >
                  {r.points.toLocaleString()}
                </div>
                <div className="text-[10px] text-white/40 uppercase tracking-wider">
                  pts
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {!user && onLoginClick && (
        <div className="px-5 pb-5">
          <button
            onClick={onLoginClick}
            className="w-full inline-flex items-center justify-center gap-2 font-bold rounded-full transition-opacity hover:opacity-90 h-10"
            style={{ background: ACCENT, color: "#000", fontSize: 13 }}
          >
            Inicia sesión para competir
          </button>
        </div>
      )}
    </div>
  );
}
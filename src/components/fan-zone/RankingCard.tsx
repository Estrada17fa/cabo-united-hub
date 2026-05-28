import { useEffect, useState } from "react";
import { Trophy, ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { LEVEL_NAMES } from "@/lib/levels";

const ACCENT = "hsl(var(--brand-primary))";

interface RankingRow {
  name: string;
  points: number;
  badge: string;
}

interface RankingCardProps {
  className?: string;
  user?: unknown;
  onLoginClick?: () => void;
  topLabel?: string;
  /** Mobile: collapse to top 3 with "Ver todos" toggle. */
  collapsibleOnMobile?: boolean;
}

export function RankingCard({
  className = "",
  topLabel = "Top 5 de la semana",
  collapsibleOnMobile = true,
}: RankingCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [rows, setRows] = useState<RankingRow[]>([]);

  useEffect(() => {
    supabase
      .from("profiles")
      .select("display_name,username,xp,level")
      .order("xp", { ascending: false })
      .limit(10)
      .then(({ data }) => {
        if (!data) return;
        setRows(
          data
            .filter((p: any) => (p.xp ?? 0) > 0)
            .map((p: any) => ({
              name: p.display_name || p.username || "Fan anónimo",
              points: p.xp ?? 0,
              badge: LEVEL_NAMES[p.level ?? 0] ?? "Visitante",
            })),
        );
      });
  }, []);

  return (
    <div
      className={`rounded-2xl border overflow-hidden flex flex-col ${className}`}
      style={{
        background: "linear-gradient(135deg, #0d0d12 0%, #0a0a0a 100%)",
        borderColor: "rgba(255,255,255,0.07)",
      }}
    >
      <div className="px-5 md:px-6 pt-5 md:pt-6 pb-3 flex items-center justify-between">
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

      <div className="flex-1 px-3 md:px-4 pb-4 flex flex-col gap-1">
        {rows.length === 0 && (
          <div className="px-3 py-6 text-center text-[12px] text-white/40">
            Aún no hay aficionados rankeados. ¡Sé el primero en sumar puntos!
          </div>
        )}
        {rows.map((r, i) => {
          const hideOnMobile =
            collapsibleOnMobile && !expanded && i >= 3;
          const medalColor =
            i === 0
              ? "hsl(var(--brand-accent))"
              : i === 1
              ? "#CBD5E1"
              : i === 2
              ? "hsl(var(--brand-accent) / 0.7)"
              : "rgba(255,255,255,0.4)";
          return (
            <div
              key={r.name}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl ${
                hideOnMobile ? "hidden md:flex" : ""
              }`}
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

        {collapsibleOnMobile && !expanded && rows.length > 3 && (
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="md:hidden mt-1 mx-3 inline-flex items-center justify-center gap-1 rounded-lg py-2 text-[12px] font-bold transition-colors hover:bg-white/5"
            style={{ color: ACCENT }}
          >
            Ver todos <ChevronDown className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
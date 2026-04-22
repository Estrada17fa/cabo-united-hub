import { useState } from "react";
import { Star } from "lucide-react";
import { CardShell } from "./CardShell";

const GREEN = "hsl(152 76% 50%)";

type Pick = "1" | "X" | "2" | null;

const MATCHES = [
  { home: "Los Cabos United", away: "Rival FC", required: true },
  { home: "Real San José", away: "Cabo Bravo" },
  { home: "Pericúes FC", away: "Marlins SJD" },
];

export function QuinielaCard({ index, onClick }: { index: number; onClick: () => void }) {
  const [picks, setPicks] = useState<Pick[]>([null, null, null]);

  const setPick = (i: number, val: Pick) => {
    setPicks((p) => p.map((x, idx) => (idx === i ? val : x)));
  };

  return (
    <CardShell index={index} onClick={onClick} className="md:col-span-7 min-h-[220px]">
      {/* TOP */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider">
          <span className="relative flex w-1.5 h-1.5">
            <span className="absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping" style={{ background: GREEN }} />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ background: GREEN }} />
          </span>
          <span style={{ color: GREEN }}>ABIERTA</span>
          <span className="text-muted-foreground">· Cierra Dom 20 Abr</span>
        </div>
        <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ color: GREEN, background: "hsl(152 76% 50% / 0.12)" }}>
          +150 PTS
        </span>
      </div>

      <h3 className="text-base md:text-lg font-extrabold tracking-tight text-foreground mb-3">
        Quiniela del Paraíso
      </h3>

      {/* MIDDLE — match rows */}
      <div className="flex-1 space-y-2 mb-3" onClick={(e) => e.stopPropagation()}>
        {MATCHES.map((m, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="flex-1 min-w-0 flex items-center gap-1.5">
              <span className="text-[11px] md:text-xs font-semibold text-foreground truncate">{m.home}</span>
              {m.required && (
                <span className="hidden md:inline-flex items-center gap-0.5 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full text-amber-400 border border-amber-400/30">
                  <Star className="w-2.5 h-2.5 fill-current" /> Obligatorio
                </span>
              )}
            </div>
            <div className="flex gap-1">
              {(["1", "X", "2"] as const).map((opt) => {
                const active = picks[i] === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setPick(i, active ? null : opt)}
                    className={`w-7 h-7 md:w-8 md:h-8 rounded-md text-[11px] font-extrabold transition-all ${
                      active ? "text-white" : "text-muted-foreground hover:text-foreground"
                    }`}
                    style={{
                      background: active ? GREEN : "hsl(0 0% 100% / 0.04)",
                      border: active ? `1px solid ${GREEN}` : "1px solid hsl(0 0% 100% / 0.08)",
                    }}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
            <div className="flex-1 min-w-0 text-right">
              <span className="text-[11px] md:text-xs font-semibold text-foreground truncate">{m.away}</span>
            </div>
          </div>
        ))}
      </div>

      {/* BOTTOM */}
      <div className="flex items-center justify-between gap-2 pt-3 border-t border-white/5">
        <span className="text-[10px] md:text-[11px] text-muted-foreground">
          Acierto exacto +50 · Ganador +20
        </span>
        <span className="text-[11px] md:text-xs font-bold" style={{ color: GREEN }}>
          Guardar Quiniela →
        </span>
      </div>
    </CardShell>
  );
}

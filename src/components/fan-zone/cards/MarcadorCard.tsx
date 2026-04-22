import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { CardShell } from "./CardShell";

const AMBER = "hsl(38 95% 55%)";

function ScoreBox({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className="w-[60px] h-10 rounded-md flex items-center justify-center text-2xl font-extrabold text-foreground"
        style={{
          background: "hsl(0 0% 100% / 0.04)",
          border: "1px solid hsl(0 0% 100% / 0.1)",
        }}
      >
        {value}
      </div>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onChange(Math.max(0, value - 1))}
          className="w-6 h-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          style={{ background: "hsl(0 0% 100% / 0.04)", border: "1px solid hsl(0 0% 100% / 0.08)" }}
        >
          <Minus className="w-3 h-3" />
        </button>
        <button
          type="button"
          onClick={() => onChange(Math.min(20, value + 1))}
          className="w-6 h-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          style={{ background: "hsl(0 0% 100% / 0.04)", border: "1px solid hsl(0 0% 100% / 0.08)" }}
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

export function MarcadorCard({ index, onClick }: { index: number; onClick: () => void }) {
  const [home, setHome] = useState(2);
  const [away, setAway] = useState(1);

  return (
    <CardShell index={index} onClick={onClick} className="md:col-span-5 min-h-[220px]">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base md:text-lg font-extrabold tracking-tight text-foreground">
          Marcador Exacto
        </h3>
        <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ color: AMBER, background: "hsl(38 95% 55% / 0.12)" }}>
          +200 PTS
        </span>
      </div>

      {/* MIDDLE */}
      <div className="flex-1 flex items-center justify-center gap-4 md:gap-6 my-2" onClick={(e) => e.stopPropagation()}>
        <div className="flex flex-col items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">LCU</span>
          <ScoreBox value={home} onChange={setHome} />
        </div>
        <span className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground self-start mt-6">VS</span>
        <div className="flex flex-col items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">RIVAL</span>
          <ScoreBox value={away} onChange={setAway} />
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 pt-3 border-t border-white/5">
        <span className="text-[10px] md:text-[11px] text-muted-foreground">
          247 usuarios han predicho este marcador
        </span>
        <span className="text-[11px] md:text-xs font-bold" style={{ color: AMBER }}>
          Apostar →
        </span>
      </div>
    </CardShell>
  );
}
